import type { WrongNote } from '@/lib/study/study-types';

interface WrongNoteListProps {
  notes: WrongNote[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

const statusColor: Record<string, { bg: string; text: string }> = {
  open: { bg: 'bg-red-50', text: 'text-red-700' },
  reviewing: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  mastered: { bg: 'bg-green-50', text: 'text-green-700' },
  ignored: { bg: 'bg-gray-50', text: 'text-gray-700' },
};

const statusLabel: Record<string, string> = {
  open: '복습 필요',
  reviewing: '복습 중',
  mastered: '마스터',
  ignored: '제외',
};

export function WrongNoteList({
  notes,
  selectedId,
  onSelect,
}: WrongNoteListProps) {
  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto">
      {notes.map((note) => {
        const colors = statusColor[note.status] || statusColor.open;
        return (
          <button
            key={note.id}
            onClick={() => onSelect(note.id)}
            className={`w-full text-left border rounded-lg p-3 transition-colors ${
              selectedId === note.id
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500">Q{note.questionId}</p>
                <p className="font-medium text-gray-900 line-clamp-2 text-sm">
                  {note.questionTitle}
                </p>
              </div>
              <span className={`flex-shrink-0 text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${colors.bg} ${colors.text}`}>
                {statusLabel[note.status]}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600">{note.subject}</p>
              <p className="text-xs font-medium text-red-600">오답 {note.wrongCount}회</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
