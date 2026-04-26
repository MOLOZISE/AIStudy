import { SectionCard } from '@/components/study/shared';
import type { LeaderboardEntry } from '@/lib/study/study-types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const medalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  return (
    <SectionCard>
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">학습자 랭킹</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-gray-900 w-12">순위</th>
                <th className="text-left px-3 py-2 font-medium text-gray-900">이름</th>
                <th className="text-right px-3 py-2 font-medium text-gray-900">XP</th>
                <th className="text-right px-3 py-2 font-medium text-gray-900">풀이</th>
                <th className="text-right px-3 py-2 font-medium text-gray-900 hidden lg:table-cell">연속</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.map((entry) => (
                <tr
                  key={entry.userId}
                  className={`hover:bg-gray-50 ${entry.isCurrentUser ? 'bg-blue-50 font-semibold' : ''}`}
                >
                  <td className="px-3 py-3 text-center">
                    {medalEmoji(entry.rank) || `#${entry.rank}`}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
                        {entry.initials}
                      </div>
                      <span className={entry.isCurrentUser ? 'text-blue-600' : 'text-gray-900'}>
                        {entry.userName}
                        {entry.isCurrentUser && ' (나)'}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right text-gray-900 font-medium">{entry.xp}</td>
                  <td className="px-3 py-3 text-right text-gray-600">{entry.solvedCount}</td>
                  <td className="px-3 py-3 text-right text-gray-600 hidden lg:table-cell">
                    {entry.streakDays}일
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
}
