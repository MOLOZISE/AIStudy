/**
 * Default board/space taxonomy seed.
 * Run: npx tsx packages/db/src/seed.ts
 * Requires DATABASE_URL in environment.
 * Safe to re-run — uses onConflictDoNothing on slug.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { channels } from './schema/index.js';
import { sql } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

// ── Default Boards ─────────────────────────────────────────────────────────────
const DEFAULT_BOARDS = [
  {
    slug: 'notice',
    name: '공지사항',
    description: '회사 공식 공지 및 필독 사항',
    type: 'board',
    scope: 'company',
    postingMode: 'real_only',
    membershipType: 'open',
    isListed: true,
    defaultSort: 'pinned',
    purpose: 'announcement',
    displayOrder: 1,
  },
  {
    slug: 'free',
    name: '자유게시판',
    description: '자유롭게 이야기 나누는 공간',
    type: 'board',
    scope: 'company',
    postingMode: 'anonymous_allowed',
    membershipType: 'open',
    isListed: true,
    defaultSort: 'hot',
    purpose: 'social',
    displayOrder: 2,
  },
  {
    slug: 'qna',
    name: 'Q&A / 도움요청',
    description: '업무, 제도, 복지 관련 궁금한 점을 질문해보세요',
    type: 'board',
    scope: 'company',
    postingMode: 'anonymous_allowed',
    membershipType: 'open',
    isListed: true,
    defaultSort: 'latest',
    purpose: 'discussion',
    displayOrder: 3,
  },
  {
    slug: 'knowledge',
    name: '정보공유',
    description: '업무 팁, 도구, 아티클 등 유용한 정보 공유',
    type: 'board',
    scope: 'company',
    postingMode: 'real_only',
    membershipType: 'open',
    isListed: true,
    defaultSort: 'hot',
    purpose: 'knowledge',
    displayOrder: 4,
  },
  {
    slug: 'tech',
    name: '기술토의',
    description: '개발, 인프라, 데이터 등 기술 관련 토론',
    type: 'board',
    scope: 'company',
    postingMode: 'real_only',
    membershipType: 'open',
    isListed: true,
    defaultSort: 'hot',
    purpose: 'discussion',
    displayOrder: 5,
  },
  {
    slug: 'culture',
    name: '복지 / 문화',
    description: '사내 복지, 이벤트, 동호회 소식',
    type: 'board',
    scope: 'company',
    postingMode: 'anonymous_allowed',
    membershipType: 'open',
    isListed: true,
    defaultSort: 'latest',
    purpose: 'social',
    displayOrder: 6,
  },
  {
    slug: 'anon-suggest',
    name: '익명 제안',
    description: '회사나 팀에 하고 싶은 말을 익명으로 남겨보세요',
    type: 'board',
    scope: 'company',
    postingMode: 'anonymous_only',
    membershipType: 'open',
    isListed: true,
    defaultSort: 'latest',
    purpose: 'discussion',
    displayOrder: 7,
  },
  {
    slug: 'anon-concern',
    name: '익명 고민',
    description: '털어놓고 싶은 고민을 익명으로 공유하고 조언을 구하세요',
    type: 'board',
    scope: 'company',
    postingMode: 'anonymous_only',
    membershipType: 'open',
    isListed: true,
    defaultSort: 'latest',
    purpose: 'social',
    displayOrder: 8,
  },
] as const;

// ── Default Spaces ─────────────────────────────────────────────────────────────
const DEFAULT_SPACES = [
  {
    slug: 'space-projects',
    name: '프로젝트 공간',
    description: '프로젝트별 팀 논의, 공유, 공지 공간',
    type: 'space',
    scope: 'project',
    postingMode: 'real_only',
    membershipType: 'invite',
    isListed: true,
    defaultSort: 'latest',
    purpose: 'discussion',
    displayOrder: 20,
  },
  {
    slug: 'space-study',
    name: '스터디 공간',
    description: '사내 스터디 그룹 — 함께 배우고 성장해요',
    type: 'space',
    scope: 'interest',
    postingMode: 'real_only',
    membershipType: 'open',
    isListed: true,
    defaultSort: 'latest',
    purpose: 'knowledge',
    displayOrder: 21,
  },
  {
    slug: 'space-tf',
    name: 'TF 공간',
    description: '태스크포스 팀별 임시 공간',
    type: 'space',
    scope: 'project',
    postingMode: 'real_only',
    membershipType: 'invite',
    isListed: false,
    defaultSort: 'latest',
    purpose: 'discussion',
    displayOrder: 22,
  },
  {
    slug: 'space-hobby',
    name: '관심사 모임',
    description: '독서, 운동, 사이드 프로젝트 등 관심사 기반 모임',
    type: 'space',
    scope: 'interest',
    postingMode: 'anonymous_allowed',
    membershipType: 'open',
    isListed: true,
    defaultSort: 'latest',
    purpose: 'social',
    displayOrder: 23,
  },
] as const;

async function seed() {
  const allItems = [...DEFAULT_BOARDS, ...DEFAULT_SPACES];

  await db
    .insert(channels)
    .values(
      allItems.map((item) => ({
        ...item,
        isPrivate: false,
        memberCount: 0,
        postCount: 0,
      }))
    )
    .onConflictDoUpdate({
      target: channels.slug,
      set: {
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        type: sql`excluded.type`,
        scope: sql`excluded.scope`,
        postingMode: sql`excluded.posting_mode`,
        membershipType: sql`excluded.membership_type`,
        isListed: sql`excluded.is_listed`,
        defaultSort: sql`excluded.default_sort`,
        purpose: sql`excluded.purpose`,
        displayOrder: sql`excluded.display_order`,
      },
    });

  console.log(`Seeded ${allItems.length} boards/spaces (${DEFAULT_BOARDS.length} boards, ${DEFAULT_SPACES.length} spaces).`);
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
