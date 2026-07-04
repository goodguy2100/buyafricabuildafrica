REVOKE EXECUTE ON FUNCTION public.handle_registration_container() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.container_type_for(text, text) FROM PUBLIC, anon, authenticated;