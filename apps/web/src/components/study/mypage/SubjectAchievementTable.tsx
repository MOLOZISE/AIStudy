import { SectionCard } from '@/components/study/shared';

interface SubjectAchievement {
  subject: string;
  accuracy: number;
  solved: number;
}

interface SubjectAchievementTableProps {
  data: SubjectAchievement[];
}

export function SubjectAchievementTable({ data }: SubjectAchievementTableProps) {
  return (
    <SectionCard>
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">과목별 성취도</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-900">과목</th>
                <th className="text-left px-4 py-2 font-medium text-gray-900">정답률</th>
                <th className="text-left px-4 py-2 font-medium text-gray-900">풀이 수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((achievement) => (
                <tr key={achievement.subject} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{achievement.subject}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${achievement.accuracy}%` }}
                        />
                      </div>
                      <span className="text-gray-900 font-medium">{achievement.accuracy}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{achievement.solved}개</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
}
