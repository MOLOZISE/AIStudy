import { SectionCard } from '@/components/study/shared';
import Link from 'next/link';

export function DashboardCommunityPanel() {
  return (
    <SectionCard>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">커뮤니티</h3>
          <p className="text-sm text-gray-600 mt-1">
            다른 학습자들과 경험을 공유하고 인기 문제집을 발견하세요
          </p>
        </div>
        <Link href="/study/community">
          <button className="flex-shrink-0 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            커뮤니티 방문
          </button>
        </Link>
      </div>

      {/* Featured Workbooks */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { title: '수능 기출 수학 1등급', author: '김대홍', rating: 4.8 },
          { title: '토익 900점 달성', author: '이영희', rating: 4.6 },
        ].map((item, i) => (
          <Link key={i} href="/study/discover">
            <div className="rounded-lg bg-gray-50 p-3 cursor-pointer hover:bg-gray-100 transition-colors">
              <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-600">{item.author}</p>
                <span className="text-xs font-semibold text-yellow-600">⭐ {item.rating}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}
