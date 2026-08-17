-- Allow the first-login SELF-VERIFICATION transition through the guards.
-- Guards were added live (not in repo migrations): a BEFORE UPDATE trigger
-- (guard_registration_admin_fields) + a WITH CHECK policy function
-- (private.registration_privileged_unchanged) that revert/block changes to
-- verified / status / verification_fee_paid by non-admins.
--
-- We keep the guards for everything EXCEPT the exact self-confirm transition:
--   OLD.first_login = true AND NEW.first_login = false
--   AND verified flips false -> true
--   AND verification_method = 'self_confirm'
--   AND verified_by = auth.uid()  (the member confirms their own identity)

CREATE OR REPLACE FUNCTION public.guard_registration_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF private.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  -- Self-verification at first login (member confirms their own identity).
  IF OLD.first_login = true AND NEW.first_login = false
     AND OLD.verified = false AND NEW.verified = true
     AND NEW.verification_method = 'self_confirm'
     AND NEW.verified_by = auth.uid()
     AND NEW.verified_at IS NOT NULL THEN
    NEW.user_id := OLD.user_id;
    NEW.verification_fee_paid := OLD.verification_fee_paid;
    NEW.status := OLD.status;
    RETURN NEW;
  END IF;
  NEW.user_id := OLD.user_id;
  NEW.verified := OLD.verified;
  NEW.verification_fee_paid := OLD.verification_fee_paid;
  NEW.status := OLD.status;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION private.registration_privileged_unchanged(_id uuid, _user_id uuid, _verified boolean, _status text, _fee_paid boolean)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.registrations r
    WHERE r.id = _id
      AND r.user_id IS NOT DISTINCT FROM _user_id
      AND (
        -- Normal case: privileged columns are unchanged.
        (r.verified IS NOT DISTINCT FROM _verified
         AND r.status IS NOT DISTINCT FROM _status
         AND r.verification_fee_paid IS NOT DISTINCT FROM _fee_paid)
        OR
        -- Self-verification at first login: verified flips false -> true,
        -- status and fee stay unchanged, and the member is still in their
        -- first-login (provisional) state.
        (r.first_login = true AND r.verified = false AND _verified = true
         AND r.status IS NOT DISTINCT FROM _status
         AND r.verification_fee_paid IS NOT DISTINCT FROM _fee_paid)
      )
  )
$function$;
