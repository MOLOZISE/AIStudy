'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, clear } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        localStorage.setItem('supabase_token', session.access_token);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        localStorage.setItem('supabase_token', session.access_token);
      } else {
        clear();
        localStorage.removeItem('supabase_token');
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading, clear]);

  return <>{children}</>;
}
