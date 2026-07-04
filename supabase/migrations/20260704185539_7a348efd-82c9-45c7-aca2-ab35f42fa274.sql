-- OPPORTUNITIES
CREATE TABLE public.opportunities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  kind text NOT NULL DEFAULT 'event',
  status text NOT NULL DEFAULT 'draft',
  target_containers text[] NOT NULL DEFAULT '{}'::text[],
  event_date timestamptz,
  location text,
  deadline timestamptz,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  completed boolean NOT NULL DEFAULT false,
  applicants_count integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT opportunities_kind_check CHECK (kind IN ('event','job','course')),
  CONSTRAINT opportunities_status_check CHECK (status IN ('open','closed','upcoming','expired','paused','draft'))
);
GRANT SELECT ON public.opportunities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunities TO authenticated;
GRANT ALL ON public.opportunities TO service_role;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published opportunities" ON public.opportunities
  FOR SELECT USING (status <> 'draft');
CREATE POLICY "Admins can view all opportunities" ON public.opportunities
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert opportunities" ON public.opportunities
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update opportunities" ON public.opportunities
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete opportunities" ON public.opportunities
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- NOTIFICATIONS_SENT
CREATE TABLE public.notifications_sent (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  body text,
  recipient_type text NOT NULL DEFAULT 'all',
  recipient_container text,
  opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE SET NULL,
  message_type text NOT NULL DEFAULT 'text',
  scheduled_for timestamptz,
  sent_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'delivered',
  is_popup boolean NOT NULL DEFAULT false,
  banner_url text,
  link_url text,
  active boolean NOT NULL DEFAULT true,
  show_from timestamptz,
  show_until timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notifications_recipient_type_check CHECK (recipient_type IN ('container','all','applicants')),
  CONSTRAINT notifications_message_type_check CHECK (message_type IN ('text','popup','email','all')),
  CONSTRAINT notifications_status_check CHECK (status IN ('delivered','scheduled'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications_sent TO authenticated;
GRANT ALL ON public.notifications_sent TO service_role;
ALTER TABLE public.notifications_sent ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage notifications" ON public.notifications_sent
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- GALLERY_MEDIA
CREATE TABLE public.gallery_media (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE CASCADE,
  title text,
  caption text,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  date_taken date,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT gallery_media_type_check CHECK (media_type IN ('image','video'))
);
GRANT SELECT ON public.gallery_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_media TO authenticated;
GRANT ALL ON public.gallery_media TO service_role;
ALTER TABLE public.gallery_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published media" ON public.gallery_media
  FOR SELECT USING (published = true);
CREATE POLICY "Admins manage gallery media" ON public.gallery_media
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));