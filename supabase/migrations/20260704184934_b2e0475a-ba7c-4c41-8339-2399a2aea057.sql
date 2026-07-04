-- 1. REGISTRATIONS: add container/targeting fields
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS user_role text,
  ADD COLUMN IF NOT EXISTS professional_experience text,
  ADD COLUMN IF NOT EXISTS verification_fee_paid boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_login timestamptz;

-- Backfill user_role from existing role column
UPDATE public.registrations SET user_role = role WHERE user_role IS NULL;

-- Derive professional_experience from role for existing pro rows
UPDATE public.registrations
  SET professional_experience = CASE
    WHEN role = 'professional_young' THEN 'young'
    WHEN role = 'professional_exp' THEN 'experienced'
    ELSE NULL END
  WHERE professional_experience IS NULL;

ALTER TABLE public.registrations
  ADD CONSTRAINT registrations_user_role_check
  CHECK (user_role IS NULL OR user_role IN
    ('individual','professional_young','professional_exp','artisan','corporate'));

ALTER TABLE public.registrations
  ADD CONSTRAINT registrations_artisan_type_check
  CHECK (artisan_type IS NULL OR artisan_type IN
    ('plumber','electrician','mason','carpenter','painter','welder','tiler','gypsum_installer','other'));

-- 2. ROLE_CONTAINERS
CREATE TABLE public.role_containers (
  container_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  container_type text NOT NULL UNIQUE,
  display_name text NOT NULL,
  member_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.role_containers TO authenticated;
GRANT ALL ON public.role_containers TO service_role;
ALTER TABLE public.role_containers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all containers" ON public.role_containers
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed the 12 containers
INSERT INTO public.role_containers (container_type, display_name) VALUES
  ('individual', 'Individuals'),
  ('professional_young', 'Young Professionals'),
  ('professional_exp', 'Experienced Professionals'),
  ('artisan_plumber', 'Plumbers'),
  ('artisan_electrician', 'Electricians'),
  ('artisan_mason', 'Masons'),
  ('artisan_carpenter', 'Carpenters'),
  ('artisan_painter', 'Painters'),
  ('artisan_welder', 'Welders'),
  ('artisan_tiler', 'Tilers'),
  ('artisan_gypsum_installer', 'Gypsum Installers'),
  ('corporate', 'Corporate & NGO Partners');

-- 3. USER_CONTAINER_MEMBERSHIPS
CREATE TABLE public.user_container_memberships (
  membership_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  container_id uuid NOT NULL REFERENCES public.role_containers(container_id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, container_id)
);
GRANT SELECT, INSERT ON public.user_container_memberships TO authenticated;
GRANT ALL ON public.user_container_memberships TO service_role;
ALTER TABLE public.user_container_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own memberships" ON public.user_container_memberships
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all memberships" ON public.user_container_memberships
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. Map a registration to its container_type
CREATE OR REPLACE FUNCTION public.container_type_for(_user_role text, _artisan_type text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN _user_role = 'artisan' AND _artisan_type IN
      ('plumber','electrician','mason','carpenter','painter','welder','tiler','gypsum_installer')
      THEN 'artisan_' || _artisan_type
    WHEN _user_role IN ('individual','professional_young','professional_exp','corporate')
      THEN _user_role
    ELSE NULL
  END
$$;

-- 5. Auto-join container on registration insert
CREATE OR REPLACE FUNCTION public.handle_registration_container()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _ctype text;
  _cid uuid;
BEGIN
  _ctype := public.container_type_for(NEW.user_role, NEW.artisan_type);
  IF _ctype IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT container_id INTO _cid FROM public.role_containers WHERE container_type = _ctype;
  IF _cid IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.user_container_memberships (user_id, container_id)
  VALUES (NEW.user_id, _cid)
  ON CONFLICT (user_id, container_id) DO NOTHING;

  UPDATE public.role_containers rc
    SET member_count = (
      SELECT count(*) FROM public.user_container_memberships m
      WHERE m.container_id = rc.container_id
    )
    WHERE rc.container_id = _cid;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_registration_container
  AFTER INSERT ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.handle_registration_container();