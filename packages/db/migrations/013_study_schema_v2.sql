-- Study schema v2: bring existing tables in line with Drizzle schema (study.ts)
-- Run this in Supabase SQL Editor

-- ── study_concepts ─────────────────────────────────────────────────────────
ALTER TABLE study_concepts
  ADD COLUMN IF NOT EXISTS subject_id          UUID        REFERENCES study_subjects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS parent_external_id  VARCHAR(120),
  ADD COLUMN IF NOT EXISTS description         TEXT,
  ADD COLUMN IF NOT EXISTS order_index         INTEGER     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at          TIMESTAMPTZ DEFAULT NOW();

-- external_id 가 NOT NULL 이어야 함 (기존 partial index 대체)
DROP INDEX IF EXISTS idx_study_concepts_workbook_external;
ALTER TABLE study_concepts ALTER COLUMN external_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_study_concepts_workbook_external
  ON study_concepts (workbook_id, external_id);
CREATE INDEX IF NOT EXISTS idx_study_concepts_subject_id ON study_concepts (subject_id);

-- ── study_seeds ────────────────────────────────────────────────────────────
ALTER TABLE study_seeds
  ADD COLUMN IF NOT EXISTS subject_id  UUID        REFERENCES study_subjects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS content     TEXT,
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ DEFAULT NOW();

-- body → content 데이터 복사 후 body 유지(하위 호환)
UPDATE study_seeds SET content = body WHERE content IS NULL AND body IS NOT NULL;

DROP INDEX IF EXISTS idx_study_seeds_workbook_external;
ALTER TABLE study_seeds ALTER COLUMN external_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_study_seeds_workbook_external
  ON study_seeds (workbook_id, external_id);
CREATE INDEX IF NOT EXISTS idx_study_seeds_subject_id ON study_seeds (subject_id);

-- ── study_questions ────────────────────────────────────────────────────────
ALTER TABLE study_questions
  ADD COLUMN IF NOT EXISTS subject_id   UUID        REFERENCES study_subjects(id)  ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS concept_id   UUID        REFERENCES study_concepts(id)  ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS type         VARCHAR(60);

-- question_type → type 데이터 복사
UPDATE study_questions SET type = question_type WHERE type IS NULL;
ALTER TABLE study_questions ALTER COLUMN type SET DEFAULT 'multiple_choice';
ALTER TABLE study_questions ALTER COLUMN type SET NOT NULL;

-- question_no: INTEGER → VARCHAR(80)
ALTER TABLE study_questions ALTER COLUMN question_no TYPE VARCHAR(80) USING question_no::VARCHAR;

DROP INDEX IF EXISTS idx_study_questions_workbook_external;
ALTER TABLE study_questions ALTER COLUMN external_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_study_questions_workbook_external
  ON study_questions (workbook_id, external_id);

DROP INDEX IF EXISTS idx_study_questions_workbook_id;
CREATE INDEX IF NOT EXISTS idx_study_questions_workbook_active
  ON study_questions (workbook_id, is_active, is_hidden);
CREATE INDEX IF NOT EXISTS idx_study_questions_concept_id ON study_questions (concept_id);
CREATE INDEX IF NOT EXISTS idx_study_questions_subject_id ON study_questions (subject_id);

-- ── study_exam_sets ────────────────────────────────────────────────────────
ALTER TABLE study_exam_sets
  ADD COLUMN IF NOT EXISTS subject_id  UUID        REFERENCES study_subjects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ DEFAULT NOW();

DROP INDEX IF EXISTS idx_study_exam_sets_workbook_external;
ALTER TABLE study_exam_sets ALTER COLUMN external_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_study_exam_sets_workbook_external
  ON study_exam_sets (workbook_id, external_id);
CREATE INDEX IF NOT EXISTS idx_study_exam_sets_workbook_id ON study_exam_sets (workbook_id);

-- ── study_exam_set_items ───────────────────────────────────────────────────
-- exam_set_id → set_id 컬럼명 변경
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'study_exam_set_items' AND column_name = 'exam_set_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'study_exam_set_items' AND column_name = 'set_id'
  ) THEN
    ALTER TABLE study_exam_set_items RENAME COLUMN exam_set_id TO set_id;
  END IF;
END $$;

ALTER TABLE study_exam_set_items
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

DROP INDEX IF EXISTS idx_study_exam_set_items_set_question;
CREATE UNIQUE INDEX IF NOT EXISTS idx_study_exam_set_items_set_position
  ON study_exam_set_items (set_id, position);
CREATE UNIQUE INDEX IF NOT EXISTS idx_study_exam_set_items_set_question
  ON study_exam_set_items (set_id, question_id);
CREATE INDEX IF NOT EXISTS idx_study_exam_set_items_question_id
  ON study_exam_set_items (question_id);

-- ── study_attempts ─────────────────────────────────────────────────────────
-- selected_answer NOT NULL 보장
ALTER TABLE study_attempts ALTER COLUMN selected_answer SET NOT NULL;

-- submitted_at 컬럼명 통일 (attempted_at → submitted_at)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'study_attempts' AND column_name = 'attempted_at'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'study_attempts' AND column_name = 'submitted_at'
  ) THEN
    ALTER TABLE study_attempts RENAME COLUMN attempted_at TO submitted_at;
  END IF;
END $$;

DROP INDEX IF EXISTS idx_study_attempts_user_correct;
CREATE INDEX IF NOT EXISTS idx_study_attempts_user_submitted
  ON study_attempts (user_id, submitted_at);

-- ── study_wrong_notes ──────────────────────────────────────────────────────
ALTER TABLE study_wrong_notes
  ADD COLUMN IF NOT EXISTS note         TEXT,
  ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ DEFAULT NOW();
