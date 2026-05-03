-- ============================================================
-- 0007 — Auto-bootstrap triggers (W1)
--   1. New auth.users → auto-create students profile
--   2. New workspaces → auto-create owner as admin member
-- These solve the chicken-and-egg of "first member must be admin
-- but admin policy requires existing membership" without an edge fn.
-- ============================================================

-- ── Trigger 1: every new auth user gets a students profile ──
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO students (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM PUBLIC;

CREATE TRIGGER trg_create_student_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ── Trigger 2: every new workspace auto-adds owner as admin member ──
CREATE OR REPLACE FUNCTION public.bootstrap_workspace_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.owner_user_id, 'admin')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.bootstrap_workspace_owner() FROM PUBLIC;

CREATE TRIGGER trg_bootstrap_workspace_owner
  AFTER INSERT ON workspaces
  FOR EACH ROW EXECUTE FUNCTION public.bootstrap_workspace_owner();
