-- Prevent row-ownership reassignment on self-service updates
DROP POLICY IF EXISTS "Users can update their own registrations" ON public.registrations;
CREATE POLICY "Users can update their own registrations"
ON public.registrations FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own applications" ON public.opportunity_applications;
CREATE POLICY "Users can update their own applications"
ON public.opportunity_applications FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Freeze admin-controlled columns for non-admin updates
CREATE OR REPLACE FUNCTION public.guard_registration_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF private.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  NEW.user_id := OLD.user_id;
  NEW.verified := OLD.verified;
  NEW.verification_fee_paid := OLD.verification_fee_paid;
  NEW.status := OLD.status;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_registration_admin_fields ON public.registrations;
CREATE TRIGGER trg_guard_registration_admin_fields
BEFORE UPDATE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.guard_registration_admin_fields();

CREATE OR REPLACE FUNCTION public.guard_application_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF private.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  NEW.user_id := OLD.user_id;
  NEW.status := OLD.status;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_application_admin_fields ON public.opportunity_applications;
CREATE TRIGGER trg_guard_application_admin_fields
BEFORE UPDATE ON public.opportunity_applications
FOR EACH ROW EXECUTE FUNCTION public.guard_application_admin_fields();

REVOKE EXECUTE ON FUNCTION public.guard_registration_admin_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_application_admin_fields() FROM PUBLIC, anon, authenticated;