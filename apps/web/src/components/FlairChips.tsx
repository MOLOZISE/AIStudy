'use client';

import { FLAIRS } from '@/lib/flair';

interface FlairChipsProps {
  activeFlair?: string;
  onChange: (flair: string | undefined) => void;
}

export function FlairChips({ activeFlair, onChange }: FlairChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        onClick={() => onChange(undefined)}
        className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
          !activeFlair
            ? 'bg-slate-800 text-white border-transparent'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
        }`}
      >
        전체
      </button>
      {FLAIRS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(activeFlair === f.value ? undefined : f.value)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
            activeFlair === f.value
              ? f.color + ' border-transparent'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
