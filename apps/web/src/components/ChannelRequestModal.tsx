'use client';

import { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from '@/store/toast';

interface ChannelRequestModalProps {
  onClose: () => void;
}

function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

export function ChannelRequestModal({ onClose }: ChannelRequestModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const utils = trpc.useContext();

  const generatedSlug = useMemo(() => makeSlug(slug || name), [name, slug]);
  const requestCreate = trpc.channels.requestCreate.useMutation({
    onSuccess: () => {
      utils.channels.getRequests.invalidate();
      toast.success('채널 개설 신청을 보냈습니다.');
      onClose();
    },
    onError: (err) => setError(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('채널 이름을 입력해주세요.');
      return;
    }
    if (!generatedSlug) {
      setError('채널 주소를 입력해주세요.');
      return;
    }
    setError('');
    requestCreate.mutate({
      name: name.trim(),
      slug: generatedSlug,
      description: description.trim() || undefined,
      reason: reason.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">채널 개설 신청</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              신청이 승인되면 채널이 생성되고 신청자가 채널 관리자가 됩니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="닫기"
          >
            닫기
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              채널 이름
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 점심 추천, 개발 질문, 사내 장터"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              채널 주소
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={generatedSlug || 'channel-url'}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-slate-400">미입력 시 `{generatedSlug || '채널 이름 기반 주소'}`로 신청됩니다.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              채널 설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="이 채널에서 어떤 이야기를 나누면 좋을지 적어주세요."
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              신청 이유
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="왜 이 채널이 필요한지 간단히 알려주세요."
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={requestCreate.isLoading}
              className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {requestCreate.isLoading ? '신청 중...' : '신청하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
