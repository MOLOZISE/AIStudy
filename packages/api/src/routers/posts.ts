import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc.js';
import { db, posts } from '@repo/db';
import { eq, desc, and } from 'drizzle-orm';

export const postsRouter = router({
  /**
   * Get paginated feed with sorting options
   */
  getFeed: publicProcedure
    .input(
      z.object({
        channelId: z.string().optional(),
        sort: z.enum(['hot', 'new', 'top']).default('hot'),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const whereClause = input.channelId
        ? and(eq(posts.isDeleted, false), eq(posts.channelId, input.channelId))
        : eq(posts.isDeleted, false);

      const orderCol =
        input.sort === 'new'
          ? desc(posts.createdAt)
          : input.sort === 'top'
            ? desc(posts.upvoteCount)
            : desc(posts.hotScore);

      const items = await db
        .select()
        .from(posts)
        .where(whereClause)
        .orderBy(orderCol)
        .limit(input.limit)
        .offset(input.offset);

      return {
        items,
        hasMore: items.length === input.limit,
      };
    }),

  /**
   * Get single post by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, input.id),
      });

      if (!post || post.isDeleted) {
        throw new Error('Post not found');
      }

      return post;
    }),

  /**
   * Create new post (authenticated)
   */
  create: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        title: z.string().max(300).optional(),
        content: z.string().min(1).max(10000),
        isAnonymous: z.boolean().default(false),
        mediaUrls: z.array(z.string()).max(10).default([]),
        flair: z.string().max(100).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const post = await db
        .insert(posts)
        .values({
          channelId: input.channelId,
          authorId: ctx.userId!,
          title: input.title,
          content: input.content,
          isAnonymous: input.isAnonymous,
          mediaUrls: input.mediaUrls,
          flair: input.flair,
        })
        .returning();

      return post[0];
    }),

  /**
   * Delete post (owner only)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, input.id),
      });

      if (!post) {
        throw new Error('Post not found');
      }

      if (post.authorId !== ctx.userId) {
        throw new Error('Unauthorized');
      }

      await db.update(posts).set({ isDeleted: true }).where(eq(posts.id, input.id));

      return { success: true };
    }),
});
