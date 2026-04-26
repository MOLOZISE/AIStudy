import type { WorkbookDetail } from '@/lib/study/study-types';
import { SectionCard } from '@/components/study/shared';
import { CheckCircle } from 'lucide-react';

export function WorkbookInfoPanel({ workbook }: { workbook: WorkbookDetail }) {
  return (
    <SectionCard>
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">문제집 정보</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">출제자</p>
            <p className="font-medium text-gray-900">{workbook.authorInfo.name}</p>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-1">문제 수</p>
            <p className="font-medium text-gray-900">{workbook.questionCount}개</p>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-1">난이도</p>
            <p className="font-medium text-gray-900">
              {workbook.difficulty === 'easy' ? '쉬움' : workbook.difficulty === 'medium' ? '중간' : '어려움'}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-1">최근 업데이트</p>
            <p className="font-medium text-gray-900">
              {new Date(workbook.updatedAt).toLocaleDateString('ko-KR')}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-1">풀이 수</p>
            <p className="font-medium text-gray-900">{workbook.solveCount.toLocaleString()}</p>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-1">검수 상태</p>
            <div className="flex items-center gap-1">
              {workbook.verified ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-600">검증됨</span>
                </>
              ) : (
                <span className="font-medium text-gray-600">미검증</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-900 mb-2">문제집 설명</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{workbook.description}</p>
        </div>
      </div>
    </SectionCard>
  );
}
