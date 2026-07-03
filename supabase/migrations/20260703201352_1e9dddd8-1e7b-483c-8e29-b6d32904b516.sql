-- Restore EXECUTE on has_role so RLS policies that call it work again.
-- RLS policy expressions are evaluated as the querying role, which therefore
-- needs EXECUTE on the function even though it is SECURITY DEFINER.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;