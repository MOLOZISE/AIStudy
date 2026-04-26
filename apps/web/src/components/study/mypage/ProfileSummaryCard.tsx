import { SectionCard } from '@/components/study/shared';
import { Edit2 } from 'lucide-react';

interface ProfileSummaryCardProps {
  name: string;
  email: string;
}

export function ProfileSummaryCard({ name, email }: ProfileSummaryCardProps) {
  return (
    <SectionCard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-600 mt-1">{email}</p>
          </div>
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-lg font-semibold text-blue-600">
              {name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </span>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">
          <Edit2 className="w-4 h-4" />
          프로필 수정
        </button>
      </div>
    </SectionCard>
  );
}
