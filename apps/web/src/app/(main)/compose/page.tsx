'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { uploadPostImage } from '@/lib/storage';
import { toast } from '@/store/toast';
import { FLAIRS } from '@/lib/flair';

const MAX_TITLE = 300;
const MAX_CONTENT = 10000;
const MAX_POLL_OPTIONS = 5;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

type PostingMode = 'real_only' | 'anonymous_allowed' | 'anonymous_only';
type BoardFilter = 'all' | 'real' | 'anonymous';

type ChannelItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  postingMode: string | null;
  type: string | null;
};

const FILTER_LABELS: Record<BoardFilter, string> = {
  all: '전체',
  real: '실명 가능',
  anonymous: '익명 가능',
};

const POSTING_MODE_LABELS: Record<PostingMode, string> = {
  real_only: '실명 전용',
  anonymous_allowed: '익명/실명 가능',
  anonymous_only: '익명 전용',
};

function isCompatibleBoard(mode: string | null, filter: BoardFilter) {
  if (filter === 'real') return mode !== 'anonymous_only';
  if (filter === 'anonymous') return mode !== 'real_only';
  return true;
}

export default function ComposePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [boardFilter, setBoardFilter] = useState<BoardFilter>(
    searchParams.get('intent') === 'anonymous' ? 'anonymous' : searchParams.get('intent') === 'real' ? 'real' : 'all'
  );
  const [selectedChannelId, setSelectedChannelId] = useState(searchParams.get('channel') ?? '');
  const [isAnonymous, setIsAnonymous] = useState(searchParams.get('intent') === 'anonymous');
  const [kind, setKind] = useState<'text' | 'poll'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [flair, setFlair] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data: channelsData } = trpc.channels.getDirectory.useQuery(undefined);
  const createPost = trpc.posts.create.useMutation();

  const boards = useMemo(() => {
    const items = ((channelsData?.items ?? []) as ChannelItem[]).filter((channel) => channel.type === 'board');
    return items.filter((channel) => isCompatibleBoard(channel.postingMode, boardFilter));
  }, [boardFilter, channelsData?.items]);

  const selectedChannel = useMemo(
    () => ((channelsData?.items ?? []) as ChannelItem[]).find((channel) => channel.id === selectedChannelId) ?? null,
    [channelsData?.items, selectedChannelId]
  );

  const postingMode = selectedChannel?.postingMode as PostingMode | null | undefined;
  const postingModeLabel = postingMode ? POSTING_MODE_LABELS[postingMode] : '게시판을 선택해 주세요';
  const effectiveIsAnonymous = postingMode === 'anonymous_only' ? true : postingMode === 'real_only' ? false : isAnonymous;

  useEffect(() => {
    if (!selectedChannelId) return;
    const current = ((channelsData?.items ?? []) as ChannelItem[]).find((channel) => channel.id === selectedChannelId);
    if (!current) {
      setSelectedChannelId('');
      return;
    }
    if (!isCompatibleBoard(current.postingMode, boardFilter)) {
      setSelectedChannelId('');
    }
  }, [boardFilter, channelsData?.items, selectedChannelId]);

  useEffect(() => {
    if (postingMode === 'anonymous_only') setIsAnonymous(true);
    if (postingMode === 'real_only') setIsAnonymous(false);
    if (postingMode === 'anonymous_allowed' && searchParams.get('intent') === 'anonymous') setIsAnonymous(true);
  }, [postingMode, searchParams]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function clearImage() {
    setImageFile(null);
    setImagePreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  }

  function handleFile(file: File | null) {
    if (!file) {
      clearImage();
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 첨부할 수 있어요.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError('이미지는 10MB 이하로 첨부해 주세요.');
      return;
    }

    setError('');
    setImageFile(file);
    setImagePreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  function switchKind(nextKind: 'text' | 'poll') {
    setKind(nextKind);
    setError('');
    if (nextKind === 'poll') {
      clearImage();
      setPollOptions((current) => {
        const next = [...current];
        while (next.length < 2) next.push('');
        return next.slice(0, MAX_POLL_OPTIONS);
      });
    }
  }

  function updatePollOption(index: number, value: string) {
    setPollOptions((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  }

  function addPollOption() {
    setPollOptions((current) => (current.length >= MAX_POLL_OPTIONS ? current : [...current, '']));
  }

  function removePollOption(index: number) {
    setPollOptions((current) => (current.length <= 2 ? current : current.filter((_, i) => i !== index)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedChannel) {
      setError('게시판을 먼저 선택해 주세요.');
      return;
    }

    if (!content.trim()) {
      setError('내용을 입력해 주세요.');
      return;
    }

    const normalizedPollOptions = kind === 'poll' ? pollOptions.map((option) => option.trim()).filter(Boolean) : [];
    if (kind === 'poll' && (normalizedPollOptions.length < 2 || normalizedPollOptions.length > 5)) {
      setError('투표 옵션은 최소 2개, 최대 5개까지 입력해 주세요.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      let mediaUrls: string[] = [];
      if (kind === 'text' && imageFile) {
        const url = await uploadPostImage(imageFile, crypto.randomUUID());
        mediaUrls = [url];
      }

      const created = await createPost.mutateAsync({
        channelId: selectedChannel.id,
        title: title.trim() || undefined,
        content: content.trim(),
        kind,
        pollOptions: kind === 'poll' ? normalizedPollOptions : undefined,
        isAnonymous: effectiveIsAnonymous,
        mediaUrls,
        flair: flair || undefined,
      });

      toast.success('게시글이 작성됐어요.');
      router.push(`/posts/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '게시글 작성에 실패했어요.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Write</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">글쓰기</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              팝업 없이 한 화면에서 게시판을 고르고, 그 게시판의 규칙에 맞춰 바로 작성합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            돌아가기
          </button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <div>
            <p className="text-sm font-semibold text-slate-950">게시판 필터</p>
            <p className="mt-1 text-xs text-slate-500">선택한 작성 방식에 맞는 게시판만 보여요.</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['all', 'real', 'anonymous'] as BoardFilter[]).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setBoardFilter(filter);
                  if (filter === 'real') setIsAnonymous(false);
                  if (filter === 'anonymous') setIsAnonymous(true);
                }}
                className={`rounded-2xl px-3 py-2 text-sm font-semibold transition-colors ${
                  boardFilter === filter ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {FILTER_LABELS[filter]}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {boards.map((board) => {
              const active = board.id === selectedChannelId;
              const mode = (board.postingMode as PostingMode | null | undefined) ?? 'anonymous_allowed';
              return (
                <button
                  key={board.id}
                  type="button"
                  onClick={() => {
                    setSelectedChannelId(board.id);
                    if (mode === 'anonymous_only') setIsAnonymous(true);
                    if (mode === 'real_only') setIsAnonymous(false);
                  }}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                    active ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">{board.name}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {board.description ?? '설명이 없는 게시판이에요.'}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {POSTING_MODE_LABELS[mode] ?? mode}
                    </span>
                  </div>
                </button>
              );
            })}

            {boards.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                현재 필터에 맞는 게시판이 없어요.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">작성 정보</p>
              <p className="mt-1 text-xs text-slate-500">선택한 게시판의 규칙이 그대로 적용됩니다.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {postingModeLabel}
            </span>
          </div>

          {selectedChannel ? (
            <>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{selectedChannel.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedChannel.description ?? '설명이 없는 게시판이에요.'}
                    </p>
                  </div>
                  <Link
                    href={`/boards/${selectedChannel.slug}`}
                    prefetch={false}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    게시판 보기
                  </Link>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => switchKind('text')}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                      kind === 'text' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    일반 글
                  </button>
                  <button
                    type="button"
                    onClick={() => switchKind('poll')}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                      kind === 'poll' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    투표 글
                  </button>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">제목</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
                    placeholder="제목이 있으면 더 잘 보여요"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-right text-xs text-slate-400">
                    {title.length}/{MAX_TITLE}
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">내용</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT))}
                    rows={9}
                    placeholder={kind === 'poll' ? '투표할 내용을 구체적으로 적어주세요.' : '무슨 이야기를 나누고 싶으신가요?'}
                    className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className={`mt-1 text-right text-xs ${content.length > MAX_CONTENT * 0.9 ? 'text-red-500' : 'text-slate-400'}`}>
                    {content.length}/{MAX_CONTENT}
                  </p>
                </div>

                {kind === 'poll' && (
                  <section className="space-y-3 rounded-3xl border border-blue-100 bg-blue-50/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">투표 옵션</p>
                        <p className="mt-1 text-xs text-slate-500">최소 2개, 최대 5개까지 입력할 수 있어요.</p>
                      </div>
                      <span className="text-xs text-slate-400">
                        {pollOptions.length}/{MAX_POLL_OPTIONS}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {pollOptions.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updatePollOption(index, e.target.value)}
                            placeholder={`옵션 ${index + 1}`}
                            className="flex-1 rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {pollOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removePollOption(index)}
                              className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-500 hover:bg-slate-50"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {pollOptions.length < MAX_POLL_OPTIONS && (
                      <button
                        type="button"
                        onClick={addPollOption}
                        className="w-full rounded-2xl border border-dashed border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                      >
                        옵션 추가
                      </button>
                    )}
                  </section>
                )}

                {kind === 'text' && (
                  <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">이미지</p>
                        <p className="mt-1 text-xs text-slate-500">일반 글에는 이미지 한 장을 첨부할 수 있어요.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                      >
                        이미지 선택
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                    />

                    {!imagePreview ? (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-7 text-center transition-colors hover:border-slate-400"
                      >
                        <span className="text-sm font-medium text-slate-700">클릭하거나 드래그해서 첨부</span>
                        <span className="mt-1 text-xs text-slate-400">PNG, JPG, WebP / 최대 10MB</span>
                      </button>
                    ) : (
                      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <div className="flex items-start gap-3 p-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imagePreview} alt="첨부 이미지 미리보기" className="h-20 w-20 rounded-xl object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900">선택한 이미지</p>
                            <p className="mt-1 truncate text-xs text-slate-500">{imageFile?.name}</p>
                          </div>
                          <button
                            type="button"
                            onClick={clearImage}
                            className="rounded-full px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    )}
                  </section>
                )}

                <section className="rounded-3xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">익명 설정</p>
                      <p className="mt-1 text-xs text-slate-500">게시판 규칙에 따라 선택 가능 여부가 달라집니다.</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {postingMode === 'real_only' || postingMode === 'anonymous_only' ? '고정' : '선택 가능'}
                    </span>
                  </div>

                  {postingMode === 'anonymous_allowed' ? (
                    <label className="mt-3 flex cursor-pointer items-start gap-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700 ring-1 ring-slate-200">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300"
                      />
                      <span>
                        <span className="block font-medium text-slate-800">익명으로 작성</span>
                        <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                          이 게시판은 실명/익명 모두 허용합니다.
                        </span>
                      </span>
                    </label>
                  ) : (
                    <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700 ring-1 ring-slate-200">
                      {postingMode === 'real_only'
                        ? '이 게시판은 실명으로만 작성할 수 있어요.'
                        : '이 게시판은 항상 익명으로 작성돼요.'}
                    </div>
                  )}
                </section>

                <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">추가 옵션</p>
                      <p className="mt-1 text-xs text-slate-500">분류 태그를 함께 붙이면 나중에 찾기 쉬워요.</p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                      선택 사항
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {FLAIRS.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setFlair(flair === item.value ? '' : item.value)}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                          flair === item.value
                            ? item.color
                            : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </section>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 rounded-2xl border border-slate-300 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || createPost.isLoading}
                    className="flex-1 rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? '업로드 중...' : createPost.isLoading ? '게시 중...' : '게시하기'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
              왼쪽에서 게시판을 먼저 선택해 주세요.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
