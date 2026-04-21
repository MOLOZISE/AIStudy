import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import type { AppRouter } from '@repo/api';

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/trpc`,
          async headers() {
            return {
              authorization: `Bearer ${localStorage.getItem('supabase_token') || ''}`,
            };
          },
        }),
      ],
    };
  },
  ssr: false,
});
