import { SectionCard } from '@/components/study/shared';

interface PointTransaction {
  date: string;
  type: 'earn' | 'spend';
  description: string;
  amount: number;
  balance: number;
}

interface PointHistoryTableProps {
  transactions: PointTransaction[];
}

export function PointHistoryTable({ transactions }: PointHistoryTableProps) {
  return (
    <SectionCard>
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">포인트 변동 내역</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-gray-900">날짜</th>
                <th className="text-left px-3 py-2 font-medium text-gray-900">내용</th>
                <th className="text-right px-3 py-2 font-medium text-gray-900">변동</th>
                <th className="text-right px-3 py-2 font-medium text-gray-900">잔액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((tx, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                    {new Date(tx.date).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-3 py-3 text-gray-900">{tx.description}</td>
                  <td className={`px-3 py-3 text-right font-medium ${
                    tx.type === 'earn' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                  </td>
                  <td className="px-3 py-3 text-right text-gray-900 font-medium">{tx.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
}
