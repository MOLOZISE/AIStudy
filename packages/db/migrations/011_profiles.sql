-- Supabase Auth 사용자와 연동되는 프로필 테이블
-- auth.users 트리거로 자동 생성되거나 회원가입 시 수동 insert

CREATE TABLE IF NOT EXISTS profiles (
  id             UUID        PRIMARY KEY,
  email          VARCHAR(255) NOT NULL UNIQUE,
  display_name   VARCHAR(255) NOT NULL,
  role           VARCHAR(50)  DEFAULT 'member',
  department     VARCHAR(255),
  job_title      VARCHAR(255),
  avatar_url     TEXT,
  trust_score    INTEGER      DEFAULT 36,
  is_verified    BOOLEAN      DEFAULT FALSE,
  anonymous_seed UUID         DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ  DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email      ON profiles (email);
CREATE        INDEX IF NOT EXISTS idx_profiles_created_at ON profiles (created_at);
