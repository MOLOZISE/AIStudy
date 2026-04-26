'use client';

import { SectionCard } from '@/components/study/shared';
import { Star, Flag, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import type { WorkbookRating } from '@/lib/study/study-types';

interface WorkbookRatingSummaryProps {
  rating: WorkbookRating;
  liked?: boolean;
  userRating?: number;
}

export function WorkbookRatingSummary({
  rating,
  liked = false,
  userRating,
}: WorkbookRatingSummaryProps) {
  const [isLiked, setIsLiked] = useState(liked);
  const [selectedRating, setSelectedRating] = useState<number | undefined>(userRating);

  const maxCount = Math.max(...Object.values(rating.distribution));

  return (
    <SectionCard>
      <div className="space-y-6">
        <h3 className="font-semibold text-gray-900">평가 및 리뷰</h3>

        {/* Rating Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="space-y-2">
            <p className="text-xs text-gray-600">평균 평점</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">{rating.averageRating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">총 {rating.totalRatings}명이 평가함</p>
          </div>

          {/* Distribution */}
          <div className="space-y-2">
            <p className="text-xs text-gray-600 mb-3">별점 분포</p>
            {['5', '4', '3', '2', '1'].map((stars) => {
              const count = rating.distribution[stars as keyof typeof rating.distribution];
              const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-6 text-right">{stars}★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Actions */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          {/* Like Button */}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              isLiked
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            {isLiked ? '좋아요 해제' : '좋아요'}
          </button>

          {/* Rate Button */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">별점 남기기</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (selectedRating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {selectedRating && (
              <button className="w-full mt-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                {selectedRating}점 평가하기
              </button>
            )}
          </div>

          {/* Report Button */}
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors">
            <Flag className="w-4 h-4" />
            신고하기
          </button>
        </div>
      </div>
    </SectionCard>
  );
}
