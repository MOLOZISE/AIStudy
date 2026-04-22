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

const TYPE_OPTIONS = [
  { value: 'board', label: '게시판', hint: '누구나 글을 올리고 읽는 공개 게시판' },
  { value: 'space', label: '공간', hint: '목적 중심 팀/모임 공간 (프로젝트, 스터디 등)' },
] as const;

const SCOPE_OPTIONS = [
  { value: 'company', label: '회사 전체' },
  { value: 'subsidiary', label: '그룹사/계열사' },
  { value: 'department', label: '부서/팀' },
  { value: 'project', label: '프로젝트' },
  { value: 'interest', label: '관심사 모임' },
] as const;

const POSTING_MODE_OPTIONS = [
  { value: 'anonymous_allowed', label: '익명 허용 (기본)', hint: '실명/익명 선택 가능' },
  { value: 'real_only', label: '실명 전용', hint: '익명 게시 불가' },
  { value: 'anonymous_only', label: '익명 전용', hint: '항상 익명으로 게시' },
] as const;

const MEMBERSHIP_OPTIONS = [
  { value: 'open', label: '자유 참여', hint: '누구나 바로 참여 가능' },
  { value: 'request', label: '승인 후 참여', hint: '관리자 승인 필요' },
  { value: 'invite', label: '초대 전용', hint: '초대받은 사람만 참여 가능' },
] as const;

export function ChannelRequestModal({ onClose }: ChannelRequestModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [requestedType, setRequestedType] = useState<'board' | 'space'>('board');
  const [requestedScope, setRequestedScope] = useState<string>('company');
  const [requestedPostingMode, setRequestedPostingMode] = useState<string>('anonymous_allowed');
  const [requestedMembershipType, setRequestedMembershipType] = useState<string>('open');
  const [error, setError] = useState('');
  const utils = trpc.useContext();

  const generatedSlug = useMemo(() => makeSlug(slug || name), [name, slug]);
  const requestCreate = trpc.channels.requestCreate.useMutation({
    onSuccess: () => {
      utils.channels.getRequests.invalidate();
      toast.success('개설 신청을 보냈습니다.');
      onClose();
    },
    onError: (err) => setError(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (!generatedSlug) {
      setError('주소를 입력해주세요.');
      return;
    }
    setError('');
    requestCreate.mutate({
      name: name.trim(),
      slug: generatedSlug,
      description: description.trim() || undefined,
      reason: reason.trim() || undefined,
      requestedType,
      requestedScope: requestedScope as any,
      requestedPostingMode: requestedPostingMode as any,
      requestedMembershipType: requestedMembershipType as any,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">게시판 / 공간 개설 신청</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              신청이 승인되면 즉시 생성되고 신청자가 관리자가 됩니다.
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 유형 선택 */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              유형
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRequestedType(opt.value)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    requestedType === opt.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className={`text-sm font-semibold ${requestedType === opt.value ? 'text-blue-700' : 'text-slate-800'}`}>
                    {opt.label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{opt.hint}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 이름 */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              {requestedType === 'space' ? '공간 이름' : '게시판 이름'}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={requestedType === 'space' ? '예: 프론트엔드 스터디' : '예: 점심 추천, 개발 질문'}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 주소 */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              주소
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={generatedSlug || 'url-slug'}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-slate-400">
              미입력 시 &ldquo;{generatedSlug || '이름 기반 주소'}&rdquo;로 신청됩니다.
            </p>
          </div>

          {/* 설명 */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="어떤 이야기를 나누는 공간인지 간단히 설명해주세요."
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 세부 설정 */}
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">세부 설정</p>

            <SelectField
              label="범위"
              value={requestedScope}
              onChange={setRequestedScope}
              options={SCOPE_OPTIONS}
            />
            <SelectField
              label="익명 설정"
              value={requestedPostingMode}
              onChange={setRequestedPostingMode}
              options={POSTING_MODE_OPTIONS}
            />
            <SelectField
              label="참여 방식"
              value={requestedMembershipType}
              onChange={setRequestedMembershipType}
              options={MEMBERSHIP_OPTIONS}
            />
          </div>

          {/* 신청 이유 */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              신청 이유 (선택)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="왜 이 게시판/공간이 필요한지 간단히 알려주세요."
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

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string; hint?: string }[];
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="w-20 shrink-0 text-xs font-medium text-slate-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}{opt.hint ? ` — ${opt.hint}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
