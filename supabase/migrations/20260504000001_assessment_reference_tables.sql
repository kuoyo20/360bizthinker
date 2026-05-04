-- ============================================================
-- 0009 — Assessment reference tables (60 questions + 12 challenges)
-- Ported from MX_影響力密碼 (worktree practical-mendel-02b72a)
-- Public read; service role manages writes via migrations.
-- ============================================================

CREATE TABLE assessment_questions (
  id TEXT PRIMARY KEY,
  section TEXT NOT NULL CHECK (section IN ('strategy', 'brand', 'ops', 'sales', 'mgmt')),
  text TEXT NOT NULL,
  stages JSONB NOT NULL DEFAULT '["early","mid","late"]'::jsonb,
  models JSONB NOT NULL DEFAULT '["B2B","B2C"]'::jsonb,
  industries JSONB NOT NULL DEFAULT '["all"]'::jsonb,
  is_reverse BOOLEAN NOT NULL DEFAULT FALSE,
  weight FLOAT NOT NULL DEFAULT 1.0,
  display_order INT NOT NULL
);

CREATE INDEX idx_assessment_questions_section ON assessment_questions(section);
CREATE INDEX idx_assessment_questions_display ON assessment_questions(display_order);

CREATE TABLE assessment_challenges (
  key TEXT PRIMARY KEY,
  display_text TEXT NOT NULL,
  display_order INT NOT NULL
);

ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY q_select_all ON assessment_questions FOR SELECT USING (true);
CREATE POLICY c_select_all ON assessment_challenges FOR SELECT USING (true);

-- (60 question + 12 challenge inserts applied directly via MCP — see commit message.
-- For schema reproducibility from a clean DB, this file should also include those
-- inserts; ported from practical-mendel-02b72a/db/seed.sql.)
