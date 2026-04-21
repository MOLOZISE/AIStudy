import { router } from '../trpc.js';
import { postsRouter } from './posts.js';
import { authRouter } from './auth.js';
import { channelsRouter } from './channels.js';

export const appRouter = router({
  auth: authRouter,
  channels: channelsRouter,
  posts: postsRouter,
});

export type AppRouter = typeof appRouter;
