
CREATE OR REPLACE FUNCTION private.registration_privileged_unchanged(_id uuid, _user_id uuid, _verified boolean, _status text, _fee_paid boolean)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.registrations r
    WHERE r.id = _id
      AND r.user_id IS NOT DISTINCT FROM _user_id
      AND r.verified IS NOT DISTINCT FROM _verified
      AND r.status IS NOT DISTINCT FROM _status
      AND r.verification_fee_paid IS NOT DISTINCT FROM _fee_paid
  )
$$;

REVOKE ALL ON FUNCTION private.registration_privileged_unchanged(uuid, uuid, boolean, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.registration_privileged_unchanged(uuid, uuid, boolean, text, boolean) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.application_privileged_unchanged(_id uuid, _user_id uuid, _status text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.opportunity_applications a
    WHERE a.id = _id
      AND a.user_id IS NOT DISTINCT FROM _user_id
      AND a.status IS NOT DISTINCT FROM _status
  )
$$;

REVOKE ALL ON FUNCTION private.application_privileged_unchanged(uuid, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.application_privileged_unchanged(uuid, uuid, text) TO authenticated, service_role;

DROP POLICY IF EXISTS "Users can update their own registrations" ON public.registrations;
CREATE POLICY "Users can update their own registrations"
ON public.registrations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND private.registration_privileged_unchanged(id, user_id, verified, status, verification_fee_paid)
);

DROP POLICY IF EXISTS "Users can update their own applications" ON public.opportunity_applications;
CREATE POLICY "Users can update their own applications"
ON public.opportunity_applications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND private.application_privileged_unchanged(id, user_id, status)
);
