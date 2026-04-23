'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { ActiveChannelsCard } from './ActiveChannelsCard';
import { CommunityStatsCard } from './CommunityStatsCard';
import { TrendingTopicsCard } from './TrendingTopicsCard';

type CommunityStats = {
  totalMembers: number;
  monthlyPosts: number;
  monthlyReactions: number;
  monthlySaves: number;
};

type TrendingTopic = { topic: string; count: number };
type ActiveChannel = { id: string; slug: string; name: string; postCount: number };

interface RightSidebarProps {
  stats?: CommunityStats | null;
  topics?: TrendingTopic[] | null;
  channels?: ActiveChannel[] | null;
}

export function RightSidebar({ stats, topics, channels }: RightSidebarProps) {
  const [loadInsights, setLoadInsights] = useState(false);

  const { data: liveStats } = trpc.trending.getCommunityStats.useQuery(undefined, {
    enabled: loadInsights && stats === undefined,
  });
  const { data: liveTopics } = trpc.trending.getTrendingTopics.useQuery(undefined, {
    enabled: loadInsights && topics === undefined,
  });
  const { data: liveChannels } = trpc.trending.getActiveChannels.useQuery(undefined, {
    enabled: loadInsights && channels === undefined,
  });

  const finalStats = stats ?? liveStats;
  const finalTopics = topics ?? liveTopics;
  const finalChannels = channels ?? liveChannels;

  return (
    <aside className="hidden xl:block xl:w-72 xl:shrink-0">
      <div className="sticky top-6 space-y-3">
        {!loadInsights ? (
          <section className="rounded-[var(--cc-radius-card)] border border-slate-200 bg-white p-4 shadow-[var(--cc-shadow-soft)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Insights</p>
            <h2 className="mt-1 text-sm font-semibold text-slate-950">Load insights on demand</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              We keep the first screen light and fetch stats only when you ask for them.
            </p>
            <button
              type="button"
              onClick={() => setLoadInsights(true)}
              className="mt-3 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Load stats
            </button>
          </section>
        ) : (
          <>
            <CommunityStatsCard stats={finalStats} />
            <TrendingTopicsCard topics={finalTopics} />
            <ActiveChannelsCard channels={finalChannels} />
          </>
        )}
      </div>
    </aside>
  );
}
