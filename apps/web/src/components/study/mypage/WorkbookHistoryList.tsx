import { SectionCard } from '@/components/study/shared';

interface WorkbookHistoryEvent {
  id: string;
  workbookTitle: string;
  eventType: 'created' | 'modified' | 'solved';
  date: string;
}

interface WorkbookHistoryListProps {
  events: WorkbookHistoryEvent[];
}

const eventLabel: Record<string, string> = {
  created: '생성',
  modified: '수정',
  solved: '풀이 완료',
};

const eventIcon: Record<string, string> = {
  created: '✏️',
  modified: '🔄',
  solved: '✅',
};

export function WorkbookHistoryList({ events }: WorkbookHistoryListProps) {
  return (
    <SectionCard>
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">문제집 활동 이력</h3>

        <div className="space-y-2">
          {events.length === 0 ? (
            <p className="text-center py-6 text-gray-500">활동 이력이 없습니다</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{eventIcon[event.eventType]}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 line-clamp-1">
                      {event.workbookTitle}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                        {eventLabel[event.eventType]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </SectionCard>
  );
}
