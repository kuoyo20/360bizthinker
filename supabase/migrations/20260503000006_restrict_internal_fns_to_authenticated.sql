-- ============================================================
-- 0006 — Restrict internal RLS helpers to authenticated only
-- Previous 0004 only revoked from anon, but PUBLIC default still
-- granted EXECUTE. Now: revoke from PUBLIC, grant to authenticated.
-- The 2 remaining advisor WARNs (authenticated can call these)
-- are accepted: RLS policies depend on them returning correct
-- workspace membership and current_student_id.
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.is_workspace_member(UUID, TEXT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_workspace_member(UUID, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.current_student_id() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.current_student_id() TO authenticated;
