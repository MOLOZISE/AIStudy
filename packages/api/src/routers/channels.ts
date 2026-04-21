import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc.js';
import { db, channels, channelMembers } from '@repo/db';
import { eq, desc, and } from 'drizzle-orm';

export const channelsRouter = router({
  /**
   * List all channels ordered by member count
   */
  getList: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const items = await db
        .select()
        .from(channels)
        .orderBy(desc(channels.memberCount))
        .limit(input.limit)
        .offset(input.offset);
      return { items, hasMore: items.length === input.limit };
    }),

  /**
   * Get single channel by id
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [channel] = await db
        .select()
        .from(channels)
        .where(eq(channels.id, input.id))
        .limit(1);
      if (!channel) throw new TRPCError({ code: 'NOT_FOUND', message: 'Channel not found' });
      return channel;
    }),

  /**
   * Create a new channel
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        slug: z
          .string()
          .min(1)
          .max(100)
          .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, or hyphens'),
        description: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [created] = await db
        .insert(channels)
        .values({ ...input, createdBy: ctx.userId })
        .returning();
      await db
        .insert(channelMembers)
        .values({ channelId: created.id, userId: ctx.userId, role: 'admin' });
      return created;
    }),

  /**
   * Join a channel
   */
  join: protectedProcedure
    .input(z.object({ channelId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .insert(channelMembers)
        .values({ channelId: input.channelId, userId: ctx.userId })
        .onConflictDoNothing();
      return { success: true };
    }),

  /**
   * Leave a channel
   */
  leave: protectedProcedure
    .input(z.object({ channelId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .delete(channelMembers)
        .where(
          and(
            eq(channelMembers.channelId, input.channelId),
            eq(channelMembers.userId, ctx.userId)
          )
        );
      return { success: true };
    }),

  /**
   * Get channel IDs the current user has joined
   */
  getMyMemberships: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await db
      .select({ channelId: channelMembers.channelId })
      .from(channelMembers)
      .where(eq(channelMembers.userId, ctx.userId));
    return memberships.map((m) => m.channelId);
  }),
});
