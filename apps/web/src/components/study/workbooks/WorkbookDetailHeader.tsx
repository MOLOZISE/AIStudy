import type { WorkbookDetail } from '@/lib/study/study-types';
import { Copy, Play } from 'lucide-react';
import Link from 'next/link';

export function WorkbookDetailHeader({ workbook }: { workbook: WorkbookDetail }) {
  return (
    <div className="border-b border-gray-200 bg-white p-6 space-y-4">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{workbook.title}</h1>
        <p className="text-sm text-gray-600 mt-1">출제자: {workbook.authorInfo.name}</p>
      </div>

      {/* Info Chips */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">
          {workbook.subject}
        </span>
        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-lg">
          {workbook.difficulty === 'easy' ? '쉬움' : workbook.difficulty === 'medium' ? '중간' : '어려움'}
        </span>
        {workbook.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg">
            #{tag}
          </span>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">
          <Copy className="w-4 h-4" />
          복사
        </button>
        <Link href={`/study/workbooks/${workbook.id}/solve`} className="flex-1">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors">
            <Play className="w-4 h-4" />
            풀이 시작
          </button>
        </Link>
      </div>
    </div>
  );
}
