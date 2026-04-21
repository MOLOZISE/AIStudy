import { router } from '../trpc.js';
import { postsRouter } from './posts.js';

export const appRouter = router({
  posts: postsRouter,
  // channels, comments, votes, notifications, etc. will be added in Phase 1
});

export type AppRouter = typeof appRouter;
