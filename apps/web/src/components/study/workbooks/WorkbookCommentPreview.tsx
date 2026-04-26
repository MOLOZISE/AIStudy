import { SectionCard } from '@/components/study/shared';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface Comment {
  id: string;
  author: string;
  text: string;
  rating?: number;
  createdAt: string;
}

const mockComments: Comment[] = [
  {
    id: 'c1',
    author: '학습자123',
    text: '정말 체계적으로 잘 정리된 문제집입니다. 수능 대비에 정말 도움이 됩니다!',
    rating: 5,
    createdAt: '2024-04-24',
  },
  {
    id: 'c2',
    author: '수학강사',
    text: '기출 문제 분석이 정확하고 설명이 명확합니다. 강력 추천!',
    rating: 5,
    createdAt: '2024-04-22',
  },
  {
    id: 'c3',
    author: 'AI학습중',
    text: '어려운 편이지만 1등급을 노린다면 필수 문제집입니다.',
    rating: 4,
    createdAt: '2024-04-20',
  },
];

export function WorkbookCommentPreview({ workbookId }: { workbookId: string }) {
  return (
    <SectionCard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">리뷰</h3>
          <Link href={`/study/workbooks/${workbookId}/reviews`}>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              전체 보기 →
            </button>
          </Link>
        </div>

        <div className="space-y-3">
          {mockComments.slice(0, 3).map((comment) => (
            <div key={comment.id} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-1">
                <p className="font-medium text-sm text-gray-900">{comment.author}</p>
                <p className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
              {comment.rating && (
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < comment.rating! ? '⭐' : '☆'} />
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-600">{comment.text}</p>
            </div>
          ))}
        </div>

        {mockComments.length === 0 && (
          <div className="py-8 text-center">
            <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">아직 리뷰가 없습니다</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
