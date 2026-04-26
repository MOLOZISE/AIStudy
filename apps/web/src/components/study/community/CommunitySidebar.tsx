import { SectionCard } from '@/components/study/shared';

const mockRecentComments = [
  { id: '1', author: '학습자123', text: '좋은 팁 감사합니다!' },
  { id: '2', author: '수학강사', text: '더 자세히 설명해주실 수...' },
  { id: '3', author: 'AI학습중', text: '정말 도움이 되네요' },
];

const mockPopularTags = [
  { tag: '수능', count: 245 },
  { tag: '기출', count: 189 },
  { tag: '1등급', count: 156 },
  { tag: '수학', count: 142 },
  { tag: '영어', count: 138 },
  { tag: '팁', count: 125 },
];

export function CommunitySidebar() {
  return (
    <div className="space-y-6">
      {/* Recent Comments */}
      <SectionCard>
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">최신 댓글</h3>
          <div className="space-y-3">
            {mockRecentComments.map((comment) => (
              <div key={comment.id} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                <p className="text-xs font-medium text-gray-900">{comment.author}</p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Popular Tags */}
      <SectionCard>
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">인기 태그</h3>
          <div className="flex flex-wrap gap-2">
            {mockPopularTags.map((item) => (
              <button
                key={item.tag}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
              >
                <span>#{item.tag}</span>
                <span className="text-gray-500">({item.count})</span>
              </button>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
