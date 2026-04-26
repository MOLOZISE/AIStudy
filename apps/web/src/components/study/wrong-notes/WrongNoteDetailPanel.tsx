import { SectionCard } from '@/components/study/shared';
import type { WrongNote } from '@/lib/study/study-types';
import { RotateCcw, Flag } from 'lucide-react';

interface WrongNoteDetailPanelProps {
  note: WrongNote;
}

export function WrongNoteDetailPanel({ note }: WrongNoteDetailPanelProps) {
  return (
    <SectionCard>
      <div className="space-y-6">
        {/* Title & Meta */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Q{note.questionId}</p>
          <h3 className="text-lg font-semibold text-gray-900">{note.questionTitle}</h3>
          <p className="text-sm text-gray-600 mt-2">과목: {note.subject}</p>
        </div>

        {/* Answer Comparison */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">내가 선택한 답</p>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{note.userAnswer || '(답변 없음)'}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">정답</p>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">아직 공개되지 않음</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">오답 횟수</p>
            <p className="text-2xl font-bold text-red-600">{note.wrongCount}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">마지막 시도</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(note.lastAttemptedAt).toLocaleDateString('ko-KR')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors">
            <RotateCcw className="w-4 h-4" />
            다시 풀기
          </button>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">
            <Flag className="w-4 h-4" />
            표시
          </button>
        </div>
      </div>
    </SectionCard>
  );
}
