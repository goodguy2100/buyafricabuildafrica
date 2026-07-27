
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS area text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS area text;

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS area text;

ALTER TABLE public.opportunity_applications
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS area text;

CREATE INDEX IF NOT EXISTS registrations_country_city_idx
  ON public.registrations (country, city);
CREATE INDEX IF NOT EXISTS profiles_country_city_idx
  ON public.profiles (country, city);
