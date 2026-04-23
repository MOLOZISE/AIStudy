import { router, publicProcedure } from '../trpc.js';
import { db, profiles, posts, reactions, channels, saves, postTags } from '@repo/db';
import { and, desc, eq, sql } from 'drizzle-orm';

export const trendingRouter = router({
  /**
   * Get high-level community stats for the feed sidebar.
   */
  getCommunityStats: publicProcedure.query(async () => {
    const [stats] = await db
      .select({
        totalMembers: sql<number>`(select count(*)::int from ${profiles})`,
        monthlyPosts: sql<number>`(
        select count(*)::int
        from ${posts}
        where ${posts.isDeleted} = false
          and ${posts.createdAt} >= date_trunc('month', now())
      )`,
        monthlyReactions: sql<number>`(
        select count(*)::int
        from ${reactions}
        where ${reactions.createdAt} >= date_trunc('month', now())
      )`,
        monthlySaves: sql<number>`(
        select count(*)::int
        from ${saves}
        where ${saves.createdAt} >= date_trunc('month', now())
      )`,
      })
      .from(sql`(select 1) as stats`);

    return {
      totalMembers: stats?.totalMembers ?? 0,
      monthlyPosts: stats?.monthlyPosts ?? 0,
      monthlyReactions: stats?.monthlyReactions ?? 0,
      monthlySaves: stats?.monthlySaves ?? 0,
    };
  }),

  /**
   * Get the most used hashtags from the last 24 hours.
   */
  getTrendingTopics: publicProcedure.query(async () => {
    const rows = await db
      .select({
        topic: postTags.tag,
        count: sql<number>`count(*)::int`,
      })
      .from(postTags)
      .innerJoin(posts, eq(postTags.postId, posts.id))
      .where(
        and(
          eq(posts.isDeleted, false),
          sql`${postTags.createdAt} >= now() - interval '24 hours'`,
          sql`btrim(${postTags.tag}) <> ''`
        )
      )
      .groupBy(postTags.tag)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    return rows
      .filter((row) => Boolean(row.topic?.trim()))
      .map((row) => ({
        topic: row.topic?.trim() ?? '',
        count: row.count,
      }));
  }),

  /**
   * Get the most active channels from posts created in the last 24 hours.
   */
  getActiveChannels: publicProcedure.query(async () => {
    const rows = await db
      .select({
        id: channels.id,
        slug: channels.slug,
        name: channels.name,
        postCount: sql<number>`count(*)::int`,
      })
      .from(posts)
      .innerJoin(channels, eq(posts.channelId, channels.id))
      .where(and(eq(posts.isDeleted, false), sql`${posts.createdAt} >= now() - interval '24 hours'`))
      .groupBy(channels.id, channels.slug, channels.name)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    return rows;
  }),
});
