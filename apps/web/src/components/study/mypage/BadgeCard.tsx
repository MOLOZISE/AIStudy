import type { Badge } from '@/lib/study/study-types';

interface BadgeCardProps {
  badge: Badge;
  isEarned?: boolean;
}

export function BadgeCard({ badge, isEarned = false }: BadgeCardProps) {
  const progressPercent = badge.progress && badge.target ? (badge.progress / badge.target) * 100 : 0;

  return (
    <div
      className={`rounded-lg border p-5 text-center transition-colors ${
        isEarned
          ? 'border-yellow-200 bg-yellow-50'
          : 'border-gray-200 bg-gray-50 opacity-60'
      }`}
    >
      <div className="text-4xl mb-2">{badge.icon}</div>
      <h4 className="font-semibold text-gray-900 text-sm mb-1">{badge.name}</h4>
      <p className="text-xs text-gray-600 mb-2">{badge.description}</p>

      {isEarned && badge.earnedAt ? (
        <p className="text-xs text-yellow-700 font-medium">
          획득: {new Date(badge.earnedAt).toLocaleDateString('ko-KR')}
        </p>
      ) : badge.progress !== undefined && badge.target !== undefined ? (
        <div className="space-y-1">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-600">
            {badge.progress} / {badge.target}
          </p>
        </div>
      ) : (
        <p className="text-xs text-gray-500">잠금</p>
      )}
    </div>
  );
}
