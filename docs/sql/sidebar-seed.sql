-- Sidebar demo seed
-- Purpose: make /feed sidebar cards show non-empty data without running the full seed.
-- Safe to re-run: all inserts use upsert-style conflict handling.

begin;

create extension if not exists pgcrypto;

-- Demo users used by the sidebar seed.
insert into profiles (
  id,
  email,
  display_name,
  role,
  department,
  job_title,
  trust_score,
  is_verified,
  anonymous_seed,
  created_at,
  updated_at
)
values
  ('11111111-1111-1111-1111-111111111111', 'demo01@company.local', '김민준', 'member', '선박설계팀', '과장', 72, true, gen_random_uuid(), now() - interval '20 days', now()),
  ('22222222-2222-2222-2222-222222222222', 'demo02@company.local', '이서연', 'member', 'IT전략팀', '대리', 58, true, gen_random_uuid(), now() - interval '18 days', now()),
  ('33333333-3333-3333-3333-333333333333', 'demo03@company.local', '박지훈', 'member', '생산기술팀', '차장', 85, true, gen_random_uuid(), now() - interval '16 days', now()),
  ('44444444-4444-4444-4444-444444444444', 'demo04@company.local', '최유진', 'member', 'HR팀', '대리', 64, true, gen_random_uuid(), now() - interval '14 days', now()),
  ('55555555-5555-5555-5555-555555555555', 'demo05@company.local', '정현우', 'member', '경영기획팀', '부장', 91, true, gen_random_uuid(), now() - interval '12 days', now())
on conflict (id) do update set
  email = excluded.email,
  display_name = excluded.display_name,
  role = excluded.role,
  department = excluded.department,
  job_title = excluded.job_title,
  trust_score = excluded.trust_score,
  is_verified = excluded.is_verified,
  anonymous_seed = excluded.anonymous_seed,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

-- Demo channels used by the active channels card.
insert into channels (
  slug,
  name,
  description,
  type,
  scope,
  posting_mode,
  membership_type,
  is_listed,
  is_private,
  default_sort,
  purpose,
  display_order,
  member_count,
  post_count,
  created_by,
  created_at
)
values
  ('free', '자유게시판', '가볍게 이야기하는 회사 커뮤니티 공간', 'board', 'company', 'anonymous_allowed', 'open', true, false, 'latest', 'social', 1, 5, 2, '11111111-1111-1111-1111-111111111111', now() - interval '30 days'),
  ('tech', '기술토론', '개발, 인프라, 데이터 이야기를 나누는 공간', 'board', 'company', 'real_only', 'open', true, false, 'latest', 'discussion', 2, 5, 2, '11111111-1111-1111-1111-111111111111', now() - interval '30 days'),
  ('qna', 'Q&A / 질문', '업무, 제도, 시스템 관련 질문을 모아보는 곳', 'board', 'company', 'anonymous_allowed', 'open', true, false, 'latest', 'discussion', 3, 5, 1, '11111111-1111-1111-1111-111111111111', now() - interval '30 days'),
  ('culture', '문화 / 소통', '사내 문화, 소소한 이야기, 공감 글 모음', 'board', 'company', 'anonymous_allowed', 'open', true, false, 'latest', 'social', 4, 5, 1, '11111111-1111-1111-1111-111111111111', now() - interval '30 days')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  type = excluded.type,
  scope = excluded.scope,
  posting_mode = excluded.posting_mode,
  membership_type = excluded.membership_type,
  is_listed = excluded.is_listed,
  is_private = excluded.is_private,
  default_sort = excluded.default_sort,
  purpose = excluded.purpose,
  display_order = excluded.display_order,
  member_count = excluded.member_count,
  post_count = excluded.post_count,
  created_by = excluded.created_by,
  created_at = excluded.created_at;

-- Recent posts within 24h so the sidebar has data to show.
insert into posts (
  id,
  channel_id,
  author_id,
  is_anonymous,
  title,
  content,
  kind,
  upvote_count,
  downvote_count,
  comment_count,
  view_count,
  flair,
  is_pinned,
  is_deleted,
  hot_score,
  created_at,
  updated_at
)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', (select id from channels where slug = 'free'), '11111111-1111-1111-1111-111111111111', false, '오늘 점심 뭐 먹을까요?', '사내 근처 맛집 추천 부탁해요.', 'text', 12, 0, 4, 128, '일상', false, false, 70.0, now() - interval '2 hours', now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', (select id from channels where slug = 'free'), '22222222-2222-2222-2222-222222222222', false, '재택근무 집중 팁', '회의 많은 날 생산성 올리는 방법을 공유해요.', 'text', 8, 0, 2, 93, '업무', false, false, 55.0, now() - interval '6 hours', now()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', (select id from channels where slug = 'tech'), '33333333-3333-3333-3333-333333333333', false, '사내 AI 도입 아이디어', '문서 요약과 회의록 자동화부터 시작하면 좋을 듯합니다.', 'text', 18, 0, 6, 210, '기술', false, false, 88.0, now() - interval '4 hours', now()),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', (select id from channels where slug = 'tech'), '44444444-4444-4444-4444-444444444444', false, '배포 체크리스트 공유', '실수 줄이려고 배포 전 체크리스트를 정리했어요.', 'text', 14, 0, 3, 144, '개발', false, false, 76.0, now() - interval '9 hours', now()),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', (select id from channels where slug = 'qna'), '55555555-5555-5555-5555-555555555555', false, '연차 신청 팁 있나요?', '상사 설득할 때 좋은 포인트가 궁금합니다.', 'text', 10, 0, 5, 177, '질문', false, false, 61.0, now() - interval '12 hours', now()),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', (select id from channels where slug = 'culture'), '11111111-1111-1111-1111-111111111111', false, '주말에 볼만한 전시 추천', '문화생활 소식도 함께 모아봐요.', 'text', 7, 0, 1, 66, '일상', false, false, 48.0, now() - interval '15 hours', now())
on conflict (id) do update set
  channel_id = excluded.channel_id,
  author_id = excluded.author_id,
  is_anonymous = excluded.is_anonymous,
  title = excluded.title,
  content = excluded.content,
  kind = excluded.kind,
  upvote_count = excluded.upvote_count,
  downvote_count = excluded.downvote_count,
  comment_count = excluded.comment_count,
  view_count = excluded.view_count,
  flair = excluded.flair,
  is_pinned = excluded.is_pinned,
  is_deleted = excluded.is_deleted,
  hot_score = excluded.hot_score,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

-- Trending topics: tag frequency from the last 24 hours.
insert into post_tags (post_id, tag, created_at) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '일상', now() - interval '2 hours'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '점심', now() - interval '2 hours'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '업무', now() - interval '6 hours'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '일상', now() - interval '6 hours'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '기술', now() - interval '4 hours'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'AI', now() - interval '4 hours'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '기술', now() - interval '9 hours'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'DevOps', now() - interval '9 hours'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '질문', now() - interval '12 hours'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '업무', now() - interval '12 hours'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '일상', now() - interval '15 hours'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '문화', now() - interval '15 hours')
on conflict (post_id, tag) do update set
  created_at = excluded.created_at;

-- Monthly stats: reactions.
insert into reactions (id, user_id, post_id, comment_id, emoji, created_at) values
  ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, '👍', now() - interval '2 hours'),
  ('11111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, '❤️', now() - interval '2 hours'),
  ('11111111-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', null, '🔥', now() - interval '4 hours'),
  ('11111111-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', null, '👏', now() - interval '4 hours'),
  ('11111111-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', null, '👍', now() - interval '12 hours'),
  ('11111111-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'ffffffff-ffff-ffff-ffff-ffffffffffff', null, '✨', now() - interval '15 hours')
on conflict (id) do update set
  user_id = excluded.user_id,
  post_id = excluded.post_id,
  comment_id = excluded.comment_id,
  emoji = excluded.emoji,
  created_at = excluded.created_at;

-- Monthly stats: saves.
insert into saves (user_id, post_id, created_at) values
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now() - interval '2 hours'),
  ('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', now() - interval '4 hours'),
  ('33333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', now() - interval '12 hours'),
  ('44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', now() - interval '9 hours'),
  ('55555555-5555-5555-5555-555555555555', 'ffffffff-ffff-ffff-ffff-ffffffffffff', now() - interval '15 hours')
on conflict (user_id, post_id) do update set
  created_at = excluded.created_at;

commit;
