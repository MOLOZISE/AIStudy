'use client';

import { useState } from 'react';
import { ProfileForm } from '@/components/ProfileForm';
import { ActivityTab } from '@/components/ActivityTab';

type Tab = 'edit' | 'activity';

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>('edit');

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-4">내 프로필</h2>

      {/* Tab nav */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {([['edit', '프로필 수정'], ['activity', '내 활동']] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'edit' ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <ProfileForm />
        </div>
      ) : (
        <ActivityTab />
      )}
    </div>
  );
}
