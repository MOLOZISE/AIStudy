import { SectionCard } from '@/components/study/shared';

interface LevelProgressCardProps {
  currentLevel: number;
  currentXp: number;
  xpForNextLevel: number;
  totalXp: number;
}

export function LevelProgressCard({
  currentLevel,
  currentXp,
  xpForNextLevel,
  totalXp,
}: LevelProgressCardProps) {
  const progressPercent = (currentXp / xpForNextLevel) * 100;
  const xpRemaining = xpForNextLevel - currentXp;

  return (
    <SectionCard>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">현재 레벨</p>
            <h3 className="text-4xl font-bold text-blue-600">Lv {currentLevel}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 mb-1">총 경험치</p>
            <p className="text-lg font-semibold text-gray-900">{totalXp.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">다음 레벨까지</p>
            <p className="text-xs font-medium text-gray-900">
              {currentXp.toLocaleString()} / {xpForNextLevel.toLocaleString()}
            </p>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-right">
            {xpRemaining.toLocaleString()} XP 남음
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
