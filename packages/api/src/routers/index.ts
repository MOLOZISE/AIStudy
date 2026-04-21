import { router } from '../trpc.js';
import { postsRouter } from './posts.js';
import { authRouter } from './auth.js';

export const appRouter = router({
  auth: authRouter,
  posts: postsRouter,
  // channels, comments, votes, notifications, etc. will be added in Phase 1
});

export type AppRouter = typeof appRouter;
