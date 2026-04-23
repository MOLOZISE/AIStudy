'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { uploadPostImage } from '@/lib/storage';
import { toast } from '@/store/toast';
import { FLAIRS } from '@/lib/flair';

const MAX_TITLE = 300;
const MAX_CONTENT = 10000;
const MAX_POLL_OPTIONS = 5;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

type PostingMode = 'real_only' | 'anonymous_allowed' | 'anonymous_only';
type PostingIntent = 'real' | 'anonymous';

interface PostCreateModalProps {
  onClose: () => void;
  onCreated: () => void;
  defaultChannelId?: string;
  initialPostingIntent?: PostingIntent;
}

function supportsIntent(postingMode: PostingMode | null | undefined, intent: PostingIntent) {
  if (intent === 'anonymous') {
    return postingMode !== 'real_only';
  }
  return postingMode !== 'anonymous_only';
}

function derivePostingHint(postingMode: PostingMode | null | undefined, intent: PostingIntent) {
  if (postingMode === 'real_only') return '실명 전용 게시판';
  if (postingMode === 'anonymous_only') return '익명 전용 게시판';
  return intent === 'anonymous' ? '익명으로 게시' : '실명으로 게시';
}

function privacyTone(intent: PostingIntent) {
  return intent === 'anonymous'
    ? {
        accent: 'amber',
        label: '익명 글쓰기',
        description: '작성자는 익명으로 표시되고, 게시판 규칙에 따라 별칭으로 보입니다.',
      }
    : {
        accent: 'blue',
        label: '실명 글쓰기',
        description: '작성자 정보가 노출되며, 실명 게시판의 흐름에 맞게 보여집니다.',
      };
}

export function PostCreateModal({
  onClose,
  onCreated,
  defaultChannelId,
  initialPostingIntent = 'real',
}: PostCreateModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<'text' | 'poll'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [channelId, setChannelId] = useState(defaultChannelId ?? '');
  const [flair, setFlair] = useState('');
  const [postingIntent, setPostingIntent] = useState<PostingIntent>(initialPostingIntent);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  const { data: channelsData } = trpc.channels.getDirectory.useQuery(undefined);
  const createPost = trpc.posts.create.useMutation();

  const selectedChannel = useMemo(
    () => channelsData?.items.find((channel) => channel.id === channelId) ?? null,
    [channelsData, channelId]
  );

  const channelPostingMode = selectedChannel?.postingMode as PostingMode | null | undefined;
  const intentLockedByChannel = channelPostingMode === 'real_only' || channelPostingMode === 'anonymous_only';
  const effectiveIntent: PostingIntent = intentLockedByChannel
    ? channelPostingMode === 'anonymous_only'
      ? 'anonymous'
      : 'real'
    : postingIntent;

  const availableChannels = useMemo(() => {
    const items = channelsData?.items ?? [];
    return items.filter((channel) => supportsIntent(channel.postingMode as PostingMode | null, effectiveIntent));
  }, [channelsData, effectiveIntent]);

  const visiblePollOptions = useMemo(() => pollOptions.slice(0, MAX_POLL_OPTIONS), [pollOptions]);
  const intentTone = privacyTone(effectiveIntent);

  useEffect(() => {
    if (intentLockedByChannel && channelPostingMode) {
      setPostingIntent(channelPostingMode === 'anonymous_only' ? 'anonymous' : 'real');
    }
  }, [channelPostingMode, intentLockedByChannel]);

  useEffect(() => {
    if (availableChannels.length === 0) {
      setChannelId('');
      return;
    }

    const currentStillAvailable = availableChannels.some((channel) => channel.id === channelId);
    if (currentStillAvailable) return;

    const fallback =
      (defaultChannelId && availableChannels.find((channel) => channel.id === defaultChannelId)?.id) ??
      availableChannels[0]?.id ??
      '';
    setChannelId(fallback);
  }, [availableChannels, channelId, defaultChannelId]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
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

  function openFilePicker() {
    fileInputRef.current?.click();
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

    if (!channelId) {
      setError('게시판을 선택해 주세요.');
      return;
    }

    if (!content.trim()) {
      setError('내용을 입력해 주세요.');
      return;
    }

    const normalizedPollOptions =
      kind === 'poll' ? pollOptions.map((option) => option.trim()).filter(Boolean) : [];

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

      await createPost.mutateAsync({
        channelId,
        title: title.trim() || undefined,
        content: content.trim(),
        kind,
        pollOptions: kind === 'poll' ? normalizedPollOptions : undefined,
        isAnonymous:
          selectedChannel?.postingMode === 'anonymous_only'
            ? true
            : selectedChannel?.postingMode === 'real_only'
              ? false
              : effectiveIntent === 'anonymous',
        mediaUrls,
        flair: flair || undefined,
      });

      toast.success('게시글이 작성됐어요.');
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '게시글 작성에 실패했어요.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/20 bg-white shadow-[0_40px_120px_rgba(15,23,42,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-700 px-5 py-5 text-white sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">Write</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">새 글 작성</h2>
              <p className="mt-2 text-sm leading-6 text-white/75">
                익명과 실명을 같은 화면에 섞지 않고, 처음 의도에 맞는 작성 흐름으로 시작합니다.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
              aria-label="닫기"
            >
              닫기
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5 sm:px-6">
          <section className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPostingIntent('anonymous')}
              disabled={intentLockedByChannel}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                effectiveIntent === 'anonymous'
                  ? 'border-amber-300 bg-amber-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/50'
              } ${intentLockedByChannel ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-950">익명으로 쓰기</p>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                  Anonymous
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                민감한 의견, 고민, 제안처럼 공개 노출보다 보호가 더 중요한 글에 적합합니다.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPostingIntent('real')}
              disabled={intentLockedByChannel}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                effectiveIntent === 'real'
                  ? 'border-blue-300 bg-blue-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/50'
              } ${intentLockedByChannel ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-950">실명으로 쓰기</p>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                  Real name
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                소개, 공지, 피드백, 정보 공유처럼 작성자를 드러내는 글에 어울립니다.
              </p>
            </button>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">게시판 선택</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {effectiveIntent === 'anonymous'
                    ? '익명으로 게시 가능한 게시판만 보여요.'
                    : '실명으로 게시 가능한 게시판만 보여요.'}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                {intentTone.label}
              </span>
            </div>

            <div className="mt-4">
              <select
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">게시판을 선택해 주세요</option>
                {availableChannels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>

              {availableChannels.length === 0 && (
                <p className="mt-2 text-xs text-red-500">
                  현재 선택한 글쓰기 방식으로는 쓸 수 있는 게시판이 없어요.
                </p>
              )}

              {selectedChannel && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-600 ring-1 ring-slate-200">
                    {selectedChannel.name}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-500 ring-1 ring-slate-200">
                    {derivePostingHint(channelPostingMode, effectiveIntent)}
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
                placeholder="제목이 있으면 더 쉽게 읽혀요"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-right text-xs text-slate-400">
                {title.length}/{MAX_TITLE}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                글 유형
              </label>
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
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                내용
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT))}
                rows={8}
                placeholder={kind === 'poll' ? '투표 주제와 상황을 자세히 적어주세요.' : '무슨 이야기를 나누고 싶으신가요?'}
                className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p
                className={`mt-1 text-right text-xs ${
                  content.length > MAX_CONTENT * 0.9 ? 'text-red-500' : 'text-slate-400'
                }`}
              >
                {content.length}/{MAX_CONTENT}
              </p>
            </div>
          </section>

          {kind === 'poll' && (
            <section className="space-y-3 rounded-3xl border border-blue-100 bg-blue-50/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">투표 옵션</p>
                  <p className="mt-1 text-xs text-slate-500">최소 2개, 최대 5개까지 입력할 수 있어요.</p>
                </div>
                <span className="text-xs text-slate-400">
                  {visiblePollOptions.length}/{MAX_POLL_OPTIONS}
                </span>
              </div>

              <div className="space-y-2">
                {visiblePollOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updatePollOption(index, e.target.value)}
                      placeholder={`옵션 ${index + 1}`}
                      className="flex-1 rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {visiblePollOptions.length > 2 && (
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

              {visiblePollOptions.length < MAX_POLL_OPTIONS && (
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
                  <p className="text-sm font-semibold text-slate-950">이미지 첨부</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    일반 글에는 이미지를 한 장까지 붙일 수 있어요.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openFilePicker}
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
                  onClick={openFilePicker}
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
                      <p className="mt-2 text-xs text-slate-400">다른 이미지로 바꾸려면 아래 버튼을 눌러주세요.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => clearImage()}
                      className="rounded-full px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
                    >
                      삭제
                    </button>
                  </div>
                  <div className="border-t border-slate-100 bg-slate-50 px-3 py-2">
                    <button
                      type="button"
                      onClick={openFilePicker}
                      className="text-sm font-medium text-blue-700 hover:text-blue-800"
                    >
                      이미지 변경
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          <section
            className={`rounded-3xl border p-4 ${
              effectiveIntent === 'anonymous'
                ? 'border-amber-100 bg-amber-50/60'
                : 'border-blue-100 bg-blue-50/60'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{intentTone.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{intentTone.description}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  effectiveIntent === 'anonymous'
                    ? 'bg-white text-amber-700 ring-1 ring-amber-200'
                    : 'bg-white text-blue-700 ring-1 ring-blue-200'
                }`}
              >
                {channelPostingMode ? derivePostingHint(channelPostingMode, effectiveIntent) : '게시 방식 선택'}
              </span>
            </div>

            {selectedChannel?.postingMode === 'anonymous_allowed' && (
              <p className="mt-3 text-xs leading-5 text-slate-500">
                이 게시판은 익명과 실명 모두 가능합니다. 글을 쓰기 전에 공개 범위를 다시 한 번 확인해 보세요.
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">추가 옵션</p>
                <p className="mt-1 text-xs text-slate-500">분류 태그를 함께 붙이면 나중에 찾기 쉬워요.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
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
                      : 'bg-slate-50 text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100'
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
              onClick={onClose}
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
      </div>
    </div>
  );
}
