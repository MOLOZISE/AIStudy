import { SectionCard } from '@/components/study/shared';
import { BadgeCard } from './BadgeCard';
import type { Badge } from '@/lib/study/study-types';

interface BadgeGridProps {
  badges: Badge[];
  earnedBadgeIds: string[];
  title?: string;
}

export function BadgeGrid({ badges, earnedBadgeIds, title = '뱃지' }: BadgeGridProps) {
  const earnedBadges = badges.filter((b) => earnedBadgeIds.includes(b.id));
  const unearnedBadges = badges.filter((b) => !earnedBadgeIds.includes(b.id));

  return (
    <SectionCard>
      <div className="space-y-6">
        <h3 className="font-semibold text-gray-900">{title}</h3>

        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">획득한 뱃지</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {earnedBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} isEarned={true} />
              ))}
            </div>
          </div>
        )}

        {/* Unearned Badges */}
        {unearnedBadges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">미획득 뱃지</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {unearnedBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} isEarned={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
