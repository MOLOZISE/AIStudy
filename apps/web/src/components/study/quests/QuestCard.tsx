import { ProgressCard, StatusBadge } from '@/components/study/shared';
import type { QuestItem } from '@/lib/study/study-types';
import Link from 'next/link';

export function QuestCard({ quest, href }: { quest: QuestItem; href?: string }) {
  const content = (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{quest.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{quest.description}</p>
        </div>
        {quest.completed && <StatusBadge label="완료" variant="success" />}
      </div>

      <ProgressCard
        label={`${quest.currentValue}/${quest.targetValue}`}
        current={quest.currentValue}
        target={quest.targetValue}
      />

      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="text-sm">
          <span className="font-semibold text-gray-900">보상: </span>
          <span className="text-blue-600">+{quest.reward.xp} XP</span>
          <span className="text-gray-400 mx-1">·</span>
          <span className="text-green-600">+{quest.reward.points} 포인트</span>
        </div>
        {!quest.completed && (
          <button className="rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-blue-700">
            시작
          </button>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
