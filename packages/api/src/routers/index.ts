import { router } from '../trpc.js';
import { postsRouter } from './posts.js';
import { authRouter } from './auth.js';
import { channelsRouter } from './channels.js';
import { commentsRouter } from './comments.js';
import { votesRouter } from './votes.js';

export const appRouter = router({
  auth: authRouter,
  channels: channelsRouter,
  posts: postsRouter,
  comments: commentsRouter,
  votes: votesRouter,
});

export type AppRouter = typeof appRouter;
