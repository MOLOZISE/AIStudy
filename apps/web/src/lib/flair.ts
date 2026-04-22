export const FLAIRS = [
  { value: 'general', label: '일반글', color: 'bg-slate-50 text-slate-700 ring-1 ring-slate-200' },
  { value: 'notice', label: '공지', color: 'bg-red-50 text-red-700 ring-1 ring-red-100' },
  { value: 'question', label: '질문', color: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100' },
  { value: 'info', label: '정보공유', color: 'bg-violet-50 text-violet-700 ring-1 ring-violet-100' },
  { value: 'recruit', label: '팀모집', color: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' },
  { value: 'anon_concern', label: '익명고민', color: 'bg-pink-50 text-pink-700 ring-1 ring-pink-100' },
  { value: 'discussion', label: '토론', color: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' },
] as const;

export type FlairValue = (typeof FLAIRS)[number]['value'];

export function getFlairStyle(value: string | null): string {
  return FLAIRS.find((f) => f.value === value)?.color ?? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
}
