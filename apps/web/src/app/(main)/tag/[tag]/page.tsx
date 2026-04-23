'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { InfinitePostList } from '@/components/InfinitePostList';

export default function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const router = useRouter();
  const { tag: rawTag } = use(params);
  const tag = useMemo(() => normalizeTag(rawTag), [rawTag]);

  if (!tag) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-lg font-semibold text-slate-900">잘못된 태그예요</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">태그 이름을 확인한 뒤 다시 시도해 주세요.</p>
        <Link href="/popular" className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
          인기 글로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Hashtag</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">#{tag}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              이 태그가 붙은 글들을 모아볼 수 있어요. 바로 새 글을 쓰려면 작성 페이지로 이동하세요.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/popular" className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              전체 인기글
            </Link>
            <button
              onClick={() => router.push(`/compose?intent=anonymous`)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              글쓰기
            </button>
          </div>
        </div>
      </section>

      <InfinitePostList key={tag} tag={tag} onStartPost={() => router.push('/compose?intent=anonymous')} />
    </div>
  );
}

function normalizeTag(value: string) {
  const cleaned = value.replace(/^#/, '').trim();
  if (!cleaned) return '';

  try {
    return decodeURIComponent(cleaned).toLowerCase();
  } catch {
    return cleaned.toLowerCase();
  }
}
