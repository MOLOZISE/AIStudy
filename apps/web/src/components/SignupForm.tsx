'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { trpc } from '@/lib/trpc';

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const createProfile = trpc.auth.createProfile.useMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      localStorage.setItem('supabase_token', data.session.access_token);
      await createProfile.mutateAsync({ email, displayName });
      router.push('/profile');
    } else {
      setEmailSent(true);
    }

    setLoading(false);
  }

  if (emailSent) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-4">📧</div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">이메일을 확인하세요</h3>
        <p className="text-slate-600 text-sm">
          <strong>{email}</strong>로 인증 링크를 보냈습니다.
          <br />
          링크를 클릭하면 자동으로 로그인됩니다.
        </p>
      </div>
    );
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
          placeholder="홍길동"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
          이메일
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="you@company.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="6자 이상"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? '가입 중...' : '회원가입'}
      </button>
    </form>
  );
}
