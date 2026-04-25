import { router } from '../trpc.js';
import { authRouter } from './auth.js';
import { studyRouter } from './study/router.js';
import { adminRouter } from './admin/router.js';

export const appRouter = router({
  auth: authRouter,
  study: studyRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
