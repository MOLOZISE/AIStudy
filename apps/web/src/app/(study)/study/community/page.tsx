'use client';

import { StudyShell } from '@/components/study/StudyShell';
import { SegmentTabs, SectionCard } from '@/components/study/shared';
import { CommunityPostCard } from '@/components/study/community/CommunityPostCard';
import { CommunitySidebar } from '@/components/study/community/CommunitySidebar';
import { useState } from 'react';
import { mockCommunityPosts } from '@/lib/study/mock-data';
import { PlusCircle } from 'lucide-react';

export default function CommunityPage() {
  const [category, setCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'question', label: '질문' },
    { value: 'review', label: '후기' },
    { value: 'workbook', label: '추천 문제집' },
    { value: 'tip', label: '학습 팁' },
    { value: 'discussion', label: '토론' },
  ];

  const filteredPosts =
    category === 'all'
      ? mockCommunityPosts
      : mockCommunityPosts.filter((post) => post.category === category);

  return (
    <StudyShell
      title="커뮤니티"
      description="다른 학습자들과 경험을 공유하고 문제집을 추천받으세요"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post Button */}
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors">
            <PlusCircle className="w-5 h-5" />
            게시글 작성
          </button>

          {/* Category Filter */}
          <SegmentTabs
            items={categories}
            value={category}
            onChange={(value) => setCategory(value)}
          />

          {/* Posts List */}
          <SectionCard>
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <CommunityPostCard key={post.id} post={post} />
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-gray-500">게시글이 없습니다</p>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <CommunitySidebar />
        </div>
      </div>
    </StudyShell>
  );
}
