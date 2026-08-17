-- ============================================================
-- Partner bulk registration, provisional accounts & partner admins
-- 2026-08-17
-- ============================================================

-- 1. New role value
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'partner_admin';

-- 2. Partner organisations
CREATE TABLE public.partner_orgs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_orgs TO authenticated;
GRANT ALL ON public.partner_orgs TO service_role;

ALTER TABLE public.partner_orgs ENABLE ROW LEVEL SECURITY;

-- 3. Partner admins (scoped admin users tied to one org)
CREATE TABLE public.partner_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_org_id uuid NOT NULL REFERENCES public.partner_orgs(id) ON DELETE CASCADE,
  can_add_other_admins boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id),
  UNIQUE (partner_org_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_admins TO authenticated;
GRANT ALL ON public.partner_admins TO service_role;

ALTER TABLE public.partner_admins ENABLE ROW LEVEL SECURITY;

-- Helper: the partner_org_id a user is an admin of (null if none)
CREATE OR REPLACE FUNCTION private.get_partner_org_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pa.partner_org_id
  FROM public.partner_admins pa
  WHERE pa.user_id = _user_id
  LIMIT 1
$$;

-- Helper: is the user a partner admin?
CREATE OR REPLACE FUNCTION private.is_partner_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partner_admins WHERE user_id = _user_id
  )
$$;

-- 4. Registrations: provisional-account fields
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active'
    CHECK (account_status IN ('provisional', 'active', 'suspended')),
  ADD COLUMN IF NOT EXISTS profile_complete boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS first_login boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS partner_org_id uuid REFERENCES public.partner_orgs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verification_method text DEFAULT 'self_confirm'
    CHECK (verification_method IN ('self_confirm', 'admin_confirm', 'smile_identity'));

CREATE INDEX IF NOT EXISTS registrations_partner_org_idx ON public.registrations (partner_org_id);
CREATE INDEX IF NOT EXISTS registrations_account_status_idx ON public.registrations (account_status);
CREATE INDEX IF NOT EXISTS registrations_national_id_idx ON public.registrations (national_id);

-- 5. Bulk import batch log (persistent record of every import)
CREATE TABLE public.bulk_import_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_org_id uuid REFERENCES public.partner_orgs(id) ON DELETE SET NULL,
  imported_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  total_rows integer NOT NULL DEFAULT 0,
  created_count integer NOT NULL DEFAULT 0,
  duplicate_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  profile_complete_count integer NOT NULL DEFAULT 0,
  incomplete_count integer NOT NULL DEFAULT 0,
  errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.bulk_import_logs TO authenticated;
GRANT ALL ON public.bulk_import_logs TO service_role;

ALTER TABLE public.bulk_import_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS policies
-- ============================================================

-- partner_orgs: admins manage; partner admins see their own org
CREATE POLICY "Admins manage partner orgs"
  ON public.partner_orgs FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Partner admins view own org"
  ON public.partner_orgs FOR SELECT TO authenticated
  USING (id = private.get_partner_org_id(auth.uid()));

-- partner_admins: admins manage all; partner admins view their own org's admins
CREATE POLICY "Admins manage partner admins"
  ON public.partner_admins FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Partner admins view own org admins"
  ON public.partner_admins FOR SELECT TO authenticated
  USING (partner_org_id = private.get_partner_org_id(auth.uid()));

-- registrations: partner admins can read/write rows tagged to their org
CREATE POLICY "Partner admins view own org registrations"
  ON public.registrations FOR SELECT TO authenticated
  USING (
    private.is_partner_admin(auth.uid())
    AND partner_org_id = private.get_partner_org_id(auth.uid())
  );

CREATE POLICY "Partner admins insert own org registrations"
  ON public.registrations FOR INSERT TO authenticated
  WITH CHECK (
    private.is_partner_admin(auth.uid())
    AND partner_org_id = private.get_partner_org_id(auth.uid())
  );

CREATE POLICY "Partner admins update own org registrations"
  ON public.registrations FOR UPDATE TO authenticated
  USING (
    private.is_partner_admin(auth.uid())
    AND partner_org_id = private.get_partner_org_id(auth.uid())
  );

-- bulk_import_logs: admins read all; partner admins read own org's logs
CREATE POLICY "Admins view import logs"
  ON public.bulk_import_logs FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Partner admins view own org import logs"
  ON public.bulk_import_logs FOR SELECT TO authenticated
  USING (
    private.is_partner_admin(auth.uid())
    AND partner_org_id = private.get_partner_org_id(auth.uid())
  );

CREATE POLICY "Importers insert logs"
  ON public.bulk_import_logs FOR INSERT TO authenticated
  WITH CHECK (
    private.has_role(auth.uid(), 'admin'::app_role)
    OR private.is_partner_admin(auth.uid())
  );
