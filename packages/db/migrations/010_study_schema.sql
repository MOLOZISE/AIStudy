-- Study domain: Excel workbook import + mobile-first question practice
-- Drizzle schema (packages/db/src/schema/study.ts) 기준으로 정렬

CREATE TABLE IF NOT EXISTS study_subjects (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        VARCHAR(120) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  exam_name   VARCHAR(255),
  description TEXT,
  metadata    JSONB        DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_study_subjects_slug ON study_subjects (slug);

-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS study_workbooks (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id        UUID         REFERENCES study_subjects (id) ON DELETE SET NULL,
  uploaded_by       UUID,
  original_filename VARCHAR(500) NOT NULL,
  storage_bucket    VARCHAR(120) NOT NULL DEFAULT 'study-workbooks',
  storage_path      TEXT         NOT NULL,
  file_hash         VARCHAR(128),
  status            VARCHAR(40)  NOT NULL DEFAULT 'uploaded',
  metadata          JSONB        DEFAULT '{}'::jsonb,
  uploaded_at       TIMESTAMPTZ  DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_study_workbooks_storage_path ON study_workbooks (storage_path);
CREATE        INDEX IF NOT EXISTS idx_study_workbooks_subject_id   ON study_workbooks (subject_id);
CREATE        INDEX IF NOT EXISTS idx_study_workbooks_uploaded_by  ON study_workbooks (uploaded_by);
CREATE        INDEX IF NOT EXISTS idx_study_workbooks_status       ON study_workbooks (status);

-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS study_import_jobs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workbook_id   UUID        NOT NULL REFERENCES study_workbooks (id) ON DELETE CASCADE,
  requested_by  UUID,
  status        VARCHAR(40) NOT NULL DEFAULT 'pending',
  source_hash   VARCHAR(128),
  total_rows    INTEGER     DEFAULT 0,
  imported_rows INTEGER     DEFAULT 0,
  failed_rows   INTEGER     DEFAULT 0,
  errors        JSONB       DEFAULT '[]'::jsonb,
  metadata      JSONB       DEFAULT '{}'::jsonb,
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_study_import_jobs_workbook_id ON study_import_jobs (workbook_id);
CREATE INDEX IF NOT EXISTS idx_study_import_jobs_status      ON study_import_jobs (status);
CREATE INDEX IF NOT EXISTS idx_study_import_jobs_source_hash ON study_import_jobs (source_hash);

-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS study_concepts (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  workbook_id UUID         NOT NULL REFERENCES study_workbooks (id) ON DELETE CASCADE,
  external_id VARCHAR(120),
  parent_id   UUID         REFERENCES study_concepts (id) ON DELETE SET NULL,
  title       VARCHAR(500) NOT NULL,
  body        TEXT,
  metadata    JSONB        DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_study_concepts_workbook_external
  ON study_concepts (workbook_id, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_study_concepts_workbook_id ON study_concepts (workbook_id);
CREATE INDEX IF NOT EXISTS idx_study_concepts_parent_id  ON study_concepts (parent_id);

-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS study_seeds (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  workbook_id UUID         NOT NULL REFERENCES study_workbooks (id) ON DELETE CASCADE,
  concept_id  UUID         REFERENCES study_concepts (id) ON DELETE SET NULL,
  external_id VARCHAR(120),
  title       VARCHAR(500),
  body        TEXT,
  metadata    JSONB        DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_study_seeds_workbook_external
  ON study_seeds (workbook_id, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_study_seeds_workbook_id ON study_seeds (workbook_id);
CREATE INDEX IF NOT EXISTS idx_study_seeds_concept_id  ON study_seeds (concept_id);

-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS study_questions (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  workbook_id    UUID         NOT NULL REFERENCES study_workbooks (id) ON DELETE CASCADE,
  seed_id        UUID         REFERENCES study_seeds (id) ON DELETE SET NULL,
  external_id    VARCHAR(120),
  question_no    INTEGER,
  source_sheet   VARCHAR(120) DEFAULT '05_정식문제은행',
  question_type  VARCHAR(60)  NOT NULL DEFAULT 'multiple_choice',
  prompt         TEXT         NOT NULL,
  choices        JSONB        DEFAULT '[]'::jsonb,
  answer         TEXT         NOT NULL,
  explanation    TEXT,
  difficulty     VARCHAR(40),
  points         NUMERIC(6,2) DEFAULT 1,
  tags           TEXT[]       DEFAULT '{}',
  review_status  VARCHAR(60)  DEFAULT 'approved',
  is_active      BOOLEAN      DEFAULT TRUE,
  is_hidden      BOOLEAN      DEFAULT FALSE,
  row_hash       VARCHAR(128),
  raw            JSONB        DEFAULT '{}'::jsonb,
  metadata       JSONB        DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ  DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_study_questions_workbook_external
  ON study_questions (workbook_id, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_study_questions_workbook_id
  ON study_questions (workbook_id, is_active, is_hidden);
CREATE INDEX IF NOT EXISTS idx_study_questions_seed_id    ON study_questions (seed_id);
CREATE INDEX IF NOT EXISTS idx_study_questions_type       ON study_questions (question_type);
CREATE INDEX IF NOT EXISTS idx_study_questions_difficulty ON study_questions (difficulty);

-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS study_exam_sets (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  workbook_id     UUID         NOT NULL REFERENCES study_workbooks (id) ON DELETE CASCADE,
  external_id     VARCHAR(120),
  title           VARCHAR(500) NOT NULL,
  description     TEXT,
  total_questions INTEGER      DEFAULT 0,
  time_limit_min  INTEGER,
  metadata        JSONB        DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ  DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_study_exam_sets_workbook_external
  ON study_exam_sets (workbook_id, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_study_exam_sets_workbook_id ON study_exam_sets (workbook_id);

-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS study_exam_set_items (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_set_id UUID         NOT NULL REFERENCES study_exam_sets (id) ON DELETE CASCADE,
  question_id UUID         NOT NULL REFERENCES study_questions (id) ON DELETE CASCADE,
  position    INTEGER      NOT NULL DEFAULT 0,
  points      NUMERIC(6,2) DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_study_exam_set_items_set_question
  ON study_exam_set_items (exam_set_id, question_id);
CREATE INDEX IF NOT EXISTS idx_study_exam_set_items_set_id ON study_exam_set_items (exam_set_id);

-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS study_attempts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL,
  workbook_id     UUID        NOT NULL REFERENCES study_workbooks (id) ON DELETE CASCADE,
  question_id     UUID        NOT NULL REFERENCES study_questions (id) ON DELETE CASCADE,
  selected_answer TEXT,
  is_correct      BOOLEAN     NOT NULL DEFAULT FALSE,
  elapsed_seconds INTEGER     DEFAULT 0,
  metadata        JSONB       DEFAULT '{}'::jsonb,
  attempted_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_study_attempts_user_id     ON study_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_study_attempts_question_id ON study_attempts (question_id);
CREATE INDEX IF NOT EXISTS idx_study_attempts_workbook_id ON study_attempts (workbook_id);
CREATE INDEX IF NOT EXISTS idx_study_attempts_user_correct
  ON study_attempts (user_id, is_correct, attempted_at);

-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS study_wrong_notes (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL,
  workbook_id   UUID        NOT NULL REFERENCES study_workbooks (id) ON DELETE CASCADE,
  question_id   UUID        NOT NULL REFERENCES study_questions (id) ON DELETE CASCADE,
  attempt_id    UUID        REFERENCES study_attempts (id) ON DELETE SET NULL,
  status        VARCHAR(40) NOT NULL DEFAULT 'open',
  wrong_count   INTEGER     NOT NULL DEFAULT 1,
  last_wrong_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at   TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_study_wrong_notes_user_question
  ON study_wrong_notes (user_id, question_id);
CREATE INDEX IF NOT EXISTS idx_study_wrong_notes_user_id     ON study_wrong_notes (user_id);
CREATE INDEX IF NOT EXISTS idx_study_wrong_notes_workbook_id ON study_wrong_notes (workbook_id);
CREATE INDEX IF NOT EXISTS idx_study_wrong_notes_status      ON study_wrong_notes (status);
