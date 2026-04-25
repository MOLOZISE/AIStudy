'use client';

import Link from 'next/link';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';

export function WorkbookPublishSection({ workbookId }: { workbookId: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [tags, setTags] = useState('');
  const [licenseType, setLicenseType] = useState('all-rights-reserved');
  const [agreed, setAgreed] = useState(false);

  const { data: publication } = trpc.study.getMyWorkbookPublication.useQuery({ workbookId });
  const publish = trpc.study.publishWorkbook.useMutation({
    onSuccess: () => {
      setIsExpanded(false);
      setTitle('');
      setDescription('');
      setCategory('');
      setDifficulty('');
      setTags('');
      setAgreed(false);
    },
  });

  const unpublish = trpc.study.unpublishWorkbook.useMutation();

  if (!publication) {
    // Not yet published
    return (
      <section className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left font-semibold text-blue-900 hover:text-blue-700"
        >
          {isExpanded ? '▼' : '▶'} 공개하기
        </button>

        {isExpanded && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (title && agreed) {
                publish.mutate({
                  workbookId,
                  title,
                  description: description || undefined,
                  category: category || undefined,
                  difficulty: difficulty || undefined,
                  tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
                  licenseType,
                  agreed,
                });
              }
            }}
            className="space-y-3"
          >
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-blue-900 mb-1">
                제목 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="공개 문제집 제목"
                maxLength={200}
                required
                className="w-full rounded-md border border-blue-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-blue-900 mb-1">설명</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="문제집에 대한 설명 (선택)"
                rows={2}
                className="w-full rounded-md border border-blue-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-blue-900 mb-1">카테고리</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-blue-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">선택</option>
                  <option value="exam">시험</option>
                  <option value="practice">연습</option>
                  <option value="tutorial">강좌</option>
                  <option value="other">기타</option>
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-semibold text-blue-900 mb-1">난이도</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full rounded-md border border-blue-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">선택</option>
                  <option value="easy">쉬움</option>
                  <option value="medium">중간</option>
                  <option value="hard">어려움</option>
                  <option value="expert">전문가</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-blue-900 mb-1">태그 (쉼표로 구분)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="예: 수능, 영어, 문법"
                className="w-full rounded-md border border-blue-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* License */}
            <div>
              <label className="block text-xs font-semibold text-blue-900 mb-1">라이선스</label>
              <select
                value={licenseType}
                onChange={(e) => setLicenseType(e.target.value)}
                className="w-full rounded-md border border-blue-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="all-rights-reserved">모든 권리 보유</option>
                <option value="cc-by">CC 저작자표시</option>
                <option value="cc-by-sa">CC 저작자표시-동일조건변경허락</option>
                <option value="public-domain">공개 도메인</option>
              </select>
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-2 text-xs">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded"
                required
              />
              <span className="text-blue-900">
                직접 제작했거나 공유 권한이 있는 문제집입니다. <span className="text-red-600">*</span>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={!title || !agreed || publish.isPending}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
            >
              {publish.isPending ? '공개 중...' : '공개하기'}
            </button>
          </form>
        )}
      </section>
    );
  }

  // Already published
  return (
    <section className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-emerald-900">공개 중</h3>
            <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              공개
            </span>
          </div>
          <p className="text-xs text-emerald-700">
            {new Date(publication.publishedAt || new Date()).toLocaleDateString('ko-KR')}에 공개됨
          </p>
        </div>
        <Link
          href={`/study/discover/${publication.id}`}
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          보기 →
        </Link>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
        >
          {isExpanded ? '▼' : '▶'} 설정 수정
        </button>

        {isExpanded && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (title) {
                publish.mutate({
                  workbookId,
                  title,
                  description: description || undefined,
                  category: category || undefined,
                  difficulty: difficulty || undefined,
                  tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
                  licenseType,
                  agreed: true,
                });
              }
            }}
            className="space-y-2"
          >
            <div>
              <input
                type="text"
                value={title || publication.title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-emerald-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <textarea
              value={description || publication.description || ''}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-emerald-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />

            <div className="grid grid-cols-2 gap-2">
              <select
                value={category || publication.category || ''}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-md border border-emerald-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="">카테고리</option>
                <option value="exam">시험</option>
                <option value="practice">연습</option>
                <option value="tutorial">강좌</option>
                <option value="other">기타</option>
              </select>

              <select
                value={difficulty || publication.difficulty || ''}
                onChange={(e) => setDifficulty(e.target.value)}
                className="rounded-md border border-emerald-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="">난이도</option>
                <option value="easy">쉬움</option>
                <option value="medium">중간</option>
                <option value="hard">어려움</option>
                <option value="expert">전문가</option>
              </select>
            </div>

            <input
              type="text"
              value={tags || (publication.tags ? publication.tags.join(', ') : '')}
              onChange={(e) => setTags(e.target.value)}
              placeholder="태그"
              className="w-full rounded-md border border-emerald-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={publish.isPending}
              className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-300 transition-colors"
            >
              {publish.isPending ? '수정 중...' : '수정하기'}
            </button>
          </form>
        )}
      </div>

      {/* Unpublish Button */}
      <button
        onClick={() => {
          if (confirm('공개를 취소하시겠어요?')) {
            unpublish.mutate({ workbookId });
          }
        }}
        disabled={unpublish.isPending}
        className="w-full rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:bg-slate-300 disabled:text-slate-600 transition-colors"
      >
        {unpublish.isPending ? '취소 중...' : '공개 취소'}
      </button>
    </section>
  );
}
