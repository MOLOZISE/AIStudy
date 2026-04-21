import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase credentials are missing');
}

export async function createContext(opts?: FetchCreateContextFnOptions) {
  const authHeader = opts?.req.headers.get('authorization');
  let userId: string | null = null;
  let user = null;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser(token);

    if (authUser) {
      userId = authUser.id;
      user = authUser;
    }
  }

  return {
    userId,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
