-- ============================================================
-- 0008 — Owner can SELECT their own workspace immediately
--
-- Bug: Onboarding INSERT into workspaces uses RETURNING. Postgres
-- evaluates the SELECT RLS policy on the RETURNING result. The
-- bootstrap_workspace_owner trigger fires AFTER row insert but the
-- SELECT visibility check during RETURNING beat the trigger →
-- is_workspace_member() returned false → INSERT failed with RLS
-- error "new row violates row-level security policy for table
-- workspaces".
--
-- Fix: extend the SELECT policy to also allow the owner.
-- ============================================================

DROP POLICY workspaces_select_member ON workspaces;

CREATE POLICY workspaces_select_member ON workspaces FOR SELECT
  USING (
    owner_user_id = (SELECT auth.uid())
    OR public.is_workspace_member(id)
  );
