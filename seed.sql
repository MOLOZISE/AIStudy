BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- Backfill schema differences for older databases
-- =========================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'member';

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS post_id UUID REFERENCES posts(id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'reactions_target_check'
  ) THEN
    ALTER TABLE reactions
      ADD CONSTRAINT reactions_target_check
      CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL)
        OR
        (post_id IS NULL AND comment_id IS NOT NULL)
      );
  END IF;
END $$;

-- =========================================================
-- Auth users
-- Note: these rows satisfy the FK from public.profiles -> auth.users.
-- If you also want to sign in with them, you may need to create matching
-- auth identities in Supabase Auth as well.
-- =========================================================
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'mina.admin@company.demo',
    crypt('Demo1234!', gen_salt('bf')),
    NOW() - INTERVAL '30 days',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Mina Admin"}'::jsonb,
    NOW() - INTERVAL '30 days',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'seo.yun@company.demo',
    crypt('Demo1234!', gen_salt('bf')),
    NOW() - INTERVAL '28 days',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Seo Yun"}'::jsonb,
    NOW() - INTERVAL '28 days',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'authenticated',
    'authenticated',
    'junho.kim@company.demo',
    crypt('Demo1234!', gen_salt('bf')),
    NOW() - INTERVAL '26 days',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Junho Kim"}'::jsonb,
    NOW() - INTERVAL '26 days',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-4444-444444444444',
    'authenticated',
    'authenticated',
    'hayeon.lee@company.demo',
    crypt('Demo1234!', gen_salt('bf')),
    NOW() - INTERVAL '24 days',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Hayeon Lee"}'::jsonb,
    NOW() - INTERVAL '24 days',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '55555555-5555-5555-5555-555555555555',
    'authenticated',
    'authenticated',
    'taeho.park@company.demo',
    crypt('Demo1234!', gen_salt('bf')),
    NOW() - INTERVAL '22 days',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Taeho Park"}'::jsonb,
    NOW() - INTERVAL '22 days',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '66666666-6666-6666-6666-666666666666',
    'authenticated',
    'authenticated',
    'sujin.choi@company.demo',
    crypt('Demo1234!', gen_salt('bf')),
    NOW() - INTERVAL '20 days',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Sujin Choi"}'::jsonb,
    NOW() - INTERVAL '20 days',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = EXCLUDED.updated_at;

-- =========================================================
-- Profiles
-- =========================================================
INSERT INTO profiles (
  id,
  email,
  display_name,
  role,
  department,
  job_title,
  avatar_url,
  trust_score,
  is_verified,
  anonymous_seed,
  created_at,
  updated_at
) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'mina.admin@company.demo',
    '???遺븍き??????',
    'admin',
    'Platform',
    'Engineering Manager',
    'https://i.pravatar.cc/150?img=12',
    98,
    TRUE,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    NOW() - INTERVAL '30 days',
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'seo.yun@company.demo',
    '??癲ル슢???썬럸?',
    'moderator',
    'People Ops',
    'Community Manager',
    'https://i.pravatar.cc/150?img=32',
    92,
    TRUE,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    NOW() - INTERVAL '28 days',
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'junho.kim@company.demo',
    '?μ떝?띄몭?吏녶젆?빧??',
    'member',
    'Backend',
    'Software Engineer',
    'https://i.pravatar.cc/150?img=14',
    84,
    TRUE,
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    NOW() - INTERVAL '26 days',
    NOW()
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'hayeon.lee@company.demo',
    '??癲ル슢???援?',
    'member',
    'Design',
    'Product Designer',
    'https://i.pravatar.cc/150?img=47',
    76,
    FALSE,
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    NOW() - INTERVAL '24 days',
    NOW()
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'taeho.park@company.demo',
    '??????',
    'member',
    'Sales',
    'Account Executive',
    'https://i.pravatar.cc/150?img=21',
    69,
    FALSE,
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    NOW() - INTERVAL '22 days',
    NOW()
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'sujin.choi@company.demo',
    '????蹂κ텥??',
    'member',
    'Product',
    'Product Manager',
    'https://i.pravatar.cc/150?img=5',
    88,
    TRUE,
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    NOW() - INTERVAL '20 days',
    NOW()
  )
ON CONFLICT (email) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  job_title = EXCLUDED.job_title,
  avatar_url = EXCLUDED.avatar_url,
  trust_score = EXCLUDED.trust_score,
  is_verified = EXCLUDED.is_verified,
  anonymous_seed = EXCLUDED.anonymous_seed,
  updated_at = EXCLUDED.updated_at;

-- =========================================================
-- Channels
-- =========================================================
INSERT INTO channels (
  id,
  slug,
  name,
  description,
  icon_url,
  is_private,
  member_count,
  post_count,
  created_by,
  created_at
) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'general',
    '?????밸븶???????곷쿀?',
    '??????????밸븶???????곷쿀??? ?????곷뉴???????욱룏????轅붽틓??熬곥끇釉??ㅒ???????????????嶺??????뽯쨦??',
    NULL,
    FALSE,
    0,
    0,
    '11111111-1111-1111-1111-111111111111',
    NOW() - INTERVAL '30 days'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'engineering',
    '???ル봿??誘⑸쿋???',
    '???ル봿??誘⑸쿋???????댁삩????轅붽틓????ш내??쭩? ?????????????곷쿀??, ???沃섃뫖???????癲??????????嶺??????뽯쨦??',
    NULL,
    FALSE,
    0,
    0,
    '11111111-1111-1111-1111-111111111111',
    NOW() - INTERVAL '29 days'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'people',
    '?????',
    '???곗뒭??壤굿??뽧렑???ㅿ폍??됤뵾?????? ???ㅼ뒧?戮ル탶?, ?????? ??꿔꺂?????????댁삩???????????????紐꾩죩??????嶺??????뽯쨦??',
    NULL,
    FALSE,
    0,
    0,
    '22222222-2222-2222-2222-222222222222',
    NOW() - INTERVAL '28 days'
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'random',
    '????',
    '???ル봿?????ㅼ뒧?????됀????怨뚮뼺??ъ┿????롪퍓肉????嚥싲갭횧?蹂잜맪??????욱룕???????? ???棺堉?댆洹잆궘??????嶺??????뽯쨦??',
    NULL,
    FALSE,
    0,
    0,
    '22222222-2222-2222-2222-222222222222',
    NOW() - INTERVAL '27 days'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_url = EXCLUDED.icon_url,
  is_private = EXCLUDED.is_private,
  created_by = EXCLUDED.created_by;

-- =========================================================
-- Channel members
-- =========================================================
INSERT INTO channel_members (
  channel_id,
  user_id,
  role,
  joined_at
) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'admin', NOW() - INTERVAL '30 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'moderator', NOW() - INTERVAL '29 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'member', NOW() - INTERVAL '28 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'member', NOW() - INTERVAL '28 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 'member', NOW() - INTERVAL '27 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', 'member', NOW() - INTERVAL '27 days'),

  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'admin', NOW() - INTERVAL '29 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'moderator', NOW() - INTERVAL '29 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'member', NOW() - INTERVAL '28 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', 'member', NOW() - INTERVAL '27 days'),

  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'admin', NOW() - INTERVAL '28 days'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'moderator', NOW() - INTERVAL '28 days'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'member', NOW() - INTERVAL '27 days'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '66666666-6666-6666-6666-666666666666', 'member', NOW() - INTERVAL '27 days'),

  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'admin', NOW() - INTERVAL '27 days'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'moderator', NOW() - INTERVAL '27 days'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'member', NOW() - INTERVAL '26 days'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 'member', NOW() - INTERVAL '26 days'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', 'member', NOW() - INTERVAL '26 days'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '66666666-6666-6666-6666-666666666666', 'member', NOW() - INTERVAL '26 days')
ON CONFLICT (channel_id, user_id) DO UPDATE SET
  role = EXCLUDED.role,
  joined_at = EXCLUDED.joined_at;

-- =========================================================
-- Posts
-- =========================================================
INSERT INTO posts (
  id,
  channel_id,
  author_id,
  is_anonymous,
  anon_alias,
  title,
  content,
  content_type,
  media_urls,
  link_url,
  link_preview,
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
) VALUES
  (
    'e1111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    FALSE,
    NULL,
    '?????????ш끽維뽳쭩??????? ?????',
    '???沅걔?????18:00~19:00????ш끽維뽳쭩????????????????????낆젵. ???沅걔?????????욱룏???#???ル봿??誘⑸쿋???????嶺????鶯ㅺ동????껊븕????용츧????ロ뒌??',
    'text',
    ARRAY[]::text[],
    NULL,
    NULL,
    24,
    0,
    0,
    220,
    'notice',
    TRUE,
    FALSE,
    12.5000,
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days'
  ),
  (
    'e2222222-2222-2222-2222-222222222222',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '33333333-3333-3333-3333-333333333333',
    FALSE,
    NULL,
    '??ш끽維뽳쭩???????????2??鶯ㅺ동????????????棺堉?댆洹잆궘??⑸돗????????逾?????',
    '?????癒꺜?????쇨덫????????밸븶?ⓥ뮧???꿔꺂??틝?????ш끽維뽳쭩????諛몄????좉눼????怨쀫뮝力??????????沃섃뫖??????????????????????ル봿?????????낆젵.',
    'text',
    ARRAY[]::text[],
    NULL,
    NULL,
    11,
    1,
    0,
    95,
    'discussion',
    FALSE,
    FALSE,
    9.2000,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    'e3333333-3333-3333-3333-333333333333',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '66666666-6666-6666-6666-666666666666',
    FALSE,
    NULL,
    '????VPN ??????猷⑤뇲??????욱룏?',
    '?????밸븶筌믩뀈瑗?????????????VPN????????????썼キ?Β????거??????ル봿??? ?轅붽틓?節됰쑏???몡??寃????濚밸Ŧ寃㎩쳞?????',
    'text',
    ARRAY[]::text[],
    NULL,
    NULL,
    8,
    0,
    0,
    64,
    'question',
    FALSE,
    FALSE,
    6.3000,
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days'
  ),
  (
    'e4444444-4444-4444-4444-444444444444',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '22222222-2222-2222-2222-222222222222',
    FALSE,
    NULL,
    '???????????????뮻????轅붽틓??????????',
    '????鸚룹꼳??????? ????????뮻????轅붽틓???????癲ル슢??????ル봿?? ?????癲??????? ?????댟??????癲?? ??꿔꺂?????? ??β뼯援?????????轅붽틓???곌램鍮??????觀????꿔꺂?????',
    'text',
    ARRAY[]::text[],
    NULL,
    NULL,
    18,
    0,
    0,
    143,
    'info',
    FALSE,
    FALSE,
    11.0000,
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days'
  ),
  (
    'e5555555-5555-5555-5555-555555555555',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '44444444-4444-4444-4444-444444444444',
    TRUE,
    '?????????숈????2',
    '??????轅붽틓??????????살퓢癲??',
    '????筌뤾쑵????轅붽틓??????????숈??????20???怨쀫뮝力????嚥싲갭큔????????낆젵. ???????щ쭢???????渦????囹??雅???????????뀀땽 ??????살퓢癲??????뉖??????깅즽????濚밸Ŧ援?.',
    'text',
    ARRAY['https://picsum.photos/seed/lunch/1200/800']::text[],
    NULL,
    NULL,
    5,
    0,
    0,
    72,
    'daily',
    FALSE,
    FALSE,
    4.1000,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    'e6666666-6666-6666-6666-666666666666',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '55555555-5555-5555-5555-555555555555',
    FALSE,
    NULL,
    '????????????щ쭢??????곷쿀?? ?轅붽틓??????믨퀡?????숆강???녿펾筌??',
    '?????ㅼ뒧?????????살퓢癲???轅붽틓??????믨퀡????????轅붽틓??熬곥끇釉??ㅒ???????????????????????? ????????癲??????????밸븶???????ル봿?????????⑤뜤???ル쐠???????',
    'text',
    ARRAY[]::text[],
    NULL,
    NULL,
    13,
    0,
    0,
    88,
    'discussion',
    FALSE,
    FALSE,
    7.8000,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    'e7777777-7777-7777-7777-777777777777',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '66666666-6666-6666-6666-666666666666',
    FALSE,
    NULL,
    '????????怨쀫뮝力??OKR ?逆???????????곷쿀??',
    '?逆?????????筌?????쑩??낆땡???????怨뚮뼺??щ쨦?? ??????留????濚밸Ŧ寃㎩쳞???????썹땟???????鶯ㅺ동????껊븕????용츧????ロ뒌??',
    'text',
    ARRAY[]::text[],
    'https://docs.company.demo/okr-q2',
    jsonb_build_object(
      'title', 'Q2 OKR ?逆??????',
      'description', '????????怨쀫뮝力???轅붽틓??熬곥끇釉??룸????逆???????????뽯쨦??',
      'url', 'https://docs.company.demo/okr-q2'
    ),
    6,
    0,
    0,
    41,
    'info',
    FALSE,
    FALSE,
    3.4000,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'e8888888-8888-8888-8888-888888888888',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    FALSE,
    NULL,
    'API rate limit ????釉뚯뺏??',
    '??? API rate limit??????釉뚯뺏?????곗뒭??????????????낆젵. ????댁삩?????ш끽維뽳쭩?????????? ??꿔꺂??틝???놁떴?????繹먭퍗爰??μ떝?띄몭??袁㏉떋???????낆젵.',
    'text',
    ARRAY[]::text[],
    NULL,
    NULL,
    9,
    0,
    0,
    57,
    'info',
    FALSE,
    FALSE,
    5.9000,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO UPDATE SET
  channel_id = EXCLUDED.channel_id,
  author_id = EXCLUDED.author_id,
  is_anonymous = EXCLUDED.is_anonymous,
  anon_alias = EXCLUDED.anon_alias,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_type = EXCLUDED.content_type,
  media_urls = EXCLUDED.media_urls,
  link_url = EXCLUDED.link_url,
  link_preview = EXCLUDED.link_preview,
  upvote_count = EXCLUDED.upvote_count,
  downvote_count = EXCLUDED.downvote_count,
  comment_count = EXCLUDED.comment_count,
  view_count = EXCLUDED.view_count,
  flair = EXCLUDED.flair,
  is_pinned = EXCLUDED.is_pinned,
  is_deleted = EXCLUDED.is_deleted,
  hot_score = EXCLUDED.hot_score,
  updated_at = EXCLUDED.updated_at;

-- =========================================================
-- Comments
-- =========================================================
INSERT INTO comments (
  id,
  post_id,
  author_id,
  parent_id,
  is_anonymous,
  anon_number,
  content,
  upvote_count,
  is_deleted,
  depth,
  created_at
) VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'e1111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    NULL,
    FALSE,
    NULL,
    '???ル봿???甕??癲ル슢????? ??? ????????????????癲???鶯ㅺ동???醫듽렒 ?????곷쿀??????繹먮굛???????',
    4,
    FALSE,
    0,
    NOW() - INTERVAL '5 days 23 hours'
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'e1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    FALSE,
    NULL,
    '?????????????낆젵. ??ш끽維뽳쭩??????????살퓢?? ?????곷쿀????????貫爾?????????????낆젵.',
    3,
    FALSE,
    1,
    NOW() - INTERVAL '5 days 22 hours'
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'e2222222-2222-2222-2222-222222222222',
    '66666666-6666-6666-6666-666666666666',
    NULL,
    FALSE,
    NULL,
    '?????轅붽틓????ш끽維???癲ル슢????? ?????怨뚯댅 ???黎앸럽???????????????ル봿?? ??逆???轅붽틓??筌뚮챶夷??????쇨덫???????ル봿???縕????',
    5,
    FALSE,
    0,
    NOW() - INTERVAL '4 days 20 hours'
  ),
  (
    'c4444444-4444-4444-4444-444444444444',
    'e2222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    'c3333333-3333-3333-3333-333333333333',
    FALSE,
    NULL,
    '?轅붽틓???嶺뚮∥????? ??鶯ㅺ동??????棺堉곁땟???????醫딇돮??????살퓢?????????????노듋??㉱ ????뉖???????μ떝?띄몭??←솒??????????ル봿?????????낆젵.',
    2,
    FALSE,
    1,
    NOW() - INTERVAL '4 days 18 hours'
  ),
  (
    'c5555555-5555-5555-5555-555555555555',
    'e5555555-5555-5555-5555-555555555555',
    '55555555-5555-5555-5555-555555555555',
    NULL,
    TRUE,
    1,
    '????????筌뤾쑵??? ????節떷?????沃섃뫖???룸???? ??????濚밸Ŧ援?. ?????????癲ル슢?????轅붽틓????????ш끽維뽳쭩????????????????ル뒇???????낆젵.',
    1,
    FALSE,
    0,
    NOW() - INTERVAL '2 days 12 hours'
  ),
  (
    'c6666666-6666-6666-6666-666666666666',
    'e6666666-6666-6666-6666-666666666666',
    '44444444-4444-4444-4444-444444444444',
    NULL,
    FALSE,
    NULL,
    '???轅붽틓???寃멸섶? ???????癲ル슢?ο㎖?꾨쇀?????ル봿?????????????????낆젵. ?????μ쪚?????ル봿????????????ル봿???????ㅼ뒧?????????????',
    2,
    FALSE,
    0,
    NOW() - INTERVAL '2 days 8 hours'
  ),
  (
    'c7777777-7777-7777-7777-777777777777',
    'e7777777-7777-7777-7777-777777777777',
    '22222222-2222-2222-2222-222222222222',
    NULL,
    FALSE,
    NULL,
    '???筌??????癲ル슢흮?룰쑤援???ㅼ뒧?????轅붽틓??熬곥끇釉??룸???????蹂μ삏????ル봿?? ?雅?퍔瑗ⓩ뤃?? ???ㅼ뒧??????ы꺍???????????????ル봿?????????낆젵.',
    4,
    FALSE,
    0,
    NOW() - INTERVAL '1 day 18 hours'
  ),
  (
    'c8888888-8888-8888-8888-888888888888',
    'e8888888-8888-8888-8888-888888888888',
    '66666666-6666-6666-6666-666666666666',
    NULL,
    FALSE,
    NULL,
    'rate limit ????釉뚯뺏?????ル봿???甕??癲ル슢????? ??ш끽維뽳쭩???????????????濚밸Ŧ?????ル봿????????룰퀬?????濚밸Ŧ援?.',
    2,
    FALSE,
    0,
    NOW() - INTERVAL '12 hours'
  )
ON CONFLICT (id) DO UPDATE SET
  post_id = EXCLUDED.post_id,
  author_id = EXCLUDED.author_id,
  parent_id = EXCLUDED.parent_id,
  is_anonymous = EXCLUDED.is_anonymous,
  anon_number = EXCLUDED.anon_number,
  content = EXCLUDED.content,
  upvote_count = EXCLUDED.upvote_count,
  is_deleted = EXCLUDED.is_deleted,
  depth = EXCLUDED.depth,
  created_at = EXCLUDED.created_at;

-- =========================================================
-- Notifications
-- =========================================================
INSERT INTO notifications (
  id,
  recipient_id,
  actor_id,
  post_id,
  type,
  target_type,
  target_id,
  message,
  is_read,
  created_at
) VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'e1111111-1111-1111-1111-111111111111',
    'comment',
    'post',
    'e1111111-1111-1111-1111-111111111111',
    '????????????????',
    FALSE,
    NOW() - INTERVAL '5 days 23 hours'
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'e1111111-1111-1111-1111-111111111111',
    'reply',
    'comment',
    'c1111111-1111-1111-1111-111111111111',
    '??????????????',
    FALSE,
    NOW() - INTERVAL '5 days 22 hours'
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    '66666666-6666-6666-6666-666666666666',
    'e2222222-2222-2222-2222-222222222222',
    'comment',
    'post',
    'e2222222-2222-2222-2222-222222222222',
    '????????????????',
    FALSE,
    NOW() - INTERVAL '4 days 20 hours'
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    '66666666-6666-6666-6666-666666666666',
    '33333333-3333-3333-3333-333333333333',
    'e2222222-2222-2222-2222-222222222222',
    'reply',
    'comment',
    'c3333333-3333-3333-3333-333333333333',
    '??????????????',
    FALSE,
    NOW() - INTERVAL '4 days 18 hours'
  )
ON CONFLICT (id) DO UPDATE SET
  recipient_id = EXCLUDED.recipient_id,
  actor_id = EXCLUDED.actor_id,
  post_id = EXCLUDED.post_id,
  type = EXCLUDED.type,
  target_type = EXCLUDED.target_type,
  target_id = EXCLUDED.target_id,
  message = EXCLUDED.message,
  is_read = EXCLUDED.is_read,
  created_at = EXCLUDED.created_at;

-- =========================================================
-- Reports
-- =========================================================
INSERT INTO reports (
  id,
  reporter_id,
  target_type,
  target_id,
  reason,
  description,
  status,
  created_at
) VALUES
  (
    'b1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'post',
    'e5555555-5555-5555-5555-555555555555',
    'inappropriate',
    '????????嶺?壤?泳?뿀?????筌먲퐣苑????????쇨덧?????ш끽維뽳쭩????癲ル슢????????ㅼ뒧???????',
    'pending',
    NOW() - INTERVAL '2 days'
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'comment',
    'c3333333-3333-3333-3333-333333333333',
    'spam',
    '???ル봿??? ?????쇨덧??????????????????꿔꺂??틝???????????밸븶???癲ル슢?????',
    'dismissed',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO UPDATE SET
  reporter_id = EXCLUDED.reporter_id,
  target_type = EXCLUDED.target_type,
  target_id = EXCLUDED.target_id,
  reason = EXCLUDED.reason,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  created_at = EXCLUDED.created_at;

-- =========================================================
-- Recalculate counters
-- =========================================================
UPDATE channels c
SET member_count = COALESCE(m.member_count, 0)
FROM (
  SELECT channel_id, COUNT(*)::int AS member_count
  FROM channel_members
  GROUP BY channel_id
) m
WHERE c.id = m.channel_id;

UPDATE channels c
SET member_count = 0
WHERE NOT EXISTS (
  SELECT 1
  FROM channel_members cm
  WHERE cm.channel_id = c.id
);

UPDATE channels c
SET post_count = COALESCE(p.post_count, 0)
FROM (
  SELECT channel_id, COUNT(*)::int AS post_count
  FROM posts
  WHERE NOT is_deleted
  GROUP BY channel_id
) p
WHERE c.id = p.channel_id;

UPDATE channels c
SET post_count = 0
WHERE NOT EXISTS (
  SELECT 1
  FROM posts p
  WHERE p.channel_id = c.id AND NOT p.is_deleted
);

UPDATE posts p
SET comment_count = COALESCE(cmt.comment_count, 0)
FROM (
  SELECT post_id, COUNT(*)::int AS comment_count
  FROM comments
  WHERE NOT is_deleted
  GROUP BY post_id
) cmt
WHERE p.id = cmt.post_id;

UPDATE posts p
SET comment_count = 0
WHERE NOT EXISTS (
  SELECT 1
  FROM comments c
  WHERE c.post_id = p.id AND NOT c.is_deleted
);

COMMIT;
