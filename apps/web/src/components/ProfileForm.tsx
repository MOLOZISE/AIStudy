'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

export function ProfileForm() {
  const { data: profile, isLoading } = trpc.auth.getMe.useQuery();
  const updateProfile = trpc.auth.updateProfile.useMutation();

  const [displayName, setDisplayName] = useState('');
  const [department, setDepartment] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? '');
      setDepartment(profile.department ?? '');
      setJobTitle(profile.jobTitle ?? '');
    }
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile.mutateAsync({
      displayName: displayName || undefined,
      department: department || undefined,
      jobTitle: jobTitle || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (isLoading) {
    return <div className="text-slate-500 text-sm">프로필 불러오는 중...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-1">
          이름 (닉네임)
        </label>
        <input
          id="displayName"
          type="text"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1">
          부서
        </label>
        <input
          id="department"
          type="text"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="예: 개발팀"
        />
      </div>

      <div>
        <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 mb-1">
          직책
        </label>
        <input
          id="jobTitle"
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="예: 시니어 개발자"
        />
      </div>

      {updateProfile.error && (
        <p className="text-sm text-red-600">{updateProfile.error.message}</p>
      )}

      <button
        type="submit"
        disabled={updateProfile.isPending}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {updateProfile.isPending ? '저장 중...' : saved ? '저장됨 ✓' : '저장'}
      </button>
    </form>
  );
}
