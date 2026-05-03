-- ============================================================
-- 0005 — Optimize RLS init plan + add missing FK indexes
-- Addresses Supabase advisors:
--   - 6 auth_rls_initplan WARN (auth.uid() re-evaluated per row)
--   - 8 unindexed_foreign_keys INFO
-- ============================================================

-- Wrap auth.uid() with (SELECT ...) so PG evaluates once per query, not per row.

DROP POLICY workspaces_insert_owner ON workspaces;
CREATE POLICY workspaces_insert_owner ON workspaces FOR INSERT
  WITH CHECK (owner_user_id = (SELECT auth.uid()));

DROP POLICY students_select_self ON students;
CREATE POLICY students_select_self ON students FOR SELECT
  USING (user_id = (SELECT auth.uid()));

DROP POLICY students_insert_self ON students;
CREATE POLICY students_insert_self ON students FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY students_update_self ON students;
CREATE POLICY students_update_self ON students FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY ent_self_select ON entitlements;
CREATE POLICY ent_self_select ON entitlements FOR SELECT
  USING (user_id = (SELECT auth.uid()));

DROP POLICY subs_self_select ON subscriptions;
CREATE POLICY subs_self_select ON subscriptions FOR SELECT
  USING (user_id = (SELECT auth.uid()));

-- Add missing FK indexes (8)

CREATE INDEX idx_workspaces_owner ON workspaces(owner_user_id);
CREATE INDEX idx_workspace_members_invited_by ON workspace_members(invited_by)
  WHERE invited_by IS NOT NULL;
CREATE INDEX idx_cohorts_created_by ON cohorts(created_by);
CREATE INDEX idx_company_members_student ON company_members(student_id);
CREATE INDEX idx_entitlements_workspace ON entitlements(workspace_id)
  WHERE workspace_id IS NOT NULL;
CREATE INDEX idx_subscriptions_product ON subscriptions(product_id);
CREATE INDEX idx_content_items_source ON content_items(source_module_data_id)
  WHERE source_module_data_id IS NOT NULL;
CREATE INDEX idx_student_module_access_workspace ON student_module_access(workspace_id);
