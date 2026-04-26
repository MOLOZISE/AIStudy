import type { GeneratedQuestion } from '@/lib/study/study-types';

export function QuestionListPanel({
  questions,
  selectedId,
  onSelect,
  onDelete,
  onAdd,
}: {
  questions: GeneratedQuestion[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-3 border border-gray-200 rounded-xl p-6 bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">문제 목록</h3>
        <span className="text-sm font-semibold text-gray-600">{questions.length}개</span>
      </div>

      <div className="space-y-1 max-h-[600px] overflow-y-auto">
        {questions.map((q) => (
          <div
            key={q.id}
            onClick={() => onSelect(q.id)}
            className={`flex items-center justify-between gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
              selectedId === q.id
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">#{q.order}</p>
              <p className="text-xs text-gray-600 truncate">{q.title}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(q.id);
              }}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              삭제
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onAdd}
        className="w-full rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 px-4 py-2.5 text-sm font-medium transition-colors"
      >
        + 문제 추가
      </button>
    </div>
  );
}
