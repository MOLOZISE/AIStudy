import { router } from '../trpc.js';
import { authRouter } from './auth.js';
import { studyRouter } from './study/router.js';

export const appRouter = router({
  auth: authRouter,
  study: studyRouter,
});

export type AppRouter = typeof appRouter;
