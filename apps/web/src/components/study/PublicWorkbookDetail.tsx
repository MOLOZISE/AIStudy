'use client';

import Link from 'next/link';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';

export function PublicWorkbookDetail({ publicationId }: { publicationId: string }) {
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetail, setReportDetail] = useState('');

  const { data, isLoading } = trpc.study.getPublicWorkbookDetail.useQuery({ publicationId });

  const addToLibrary = trpc.study.addPublicWorkbookToMyLibrary.useMutation({
    onSuccess: () => {
      refetchStatus();
    },
  });

  const removeFromLibrary = trpc.study.removePublicWorkbookFromMyLibrary.useMutation({
    onSuccess: () => {
      refetchStatus();
    },
  });

  const likeWorkbook = trpc.study.likeWorkbook.useMutation({
    onSuccess: () => {
      refetchStatus();
    },
  });

  const submitReview = trpc.study.reviewWorkbook.useMutation({
    onSuccess: () => {
      refetchStatus();
    },
  });

  const reportWorkbook = trpc.study.reportWorkbook.useMutation({
    onSuccess: () => {
      setShowReportForm(false);
      setReportReason('');
      setReportDetail('');
    },
  });

  const { refetch: refetchStatus } = trpc.study.checkLibraryStatus.useQuery({ publicationId });

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  if (isLoading) {
    return <div className="text-center text-sm text-slate-500">문제집을 불러오는 중입니다...</div>;
  }

  if (!data) {
    return <div className="text-center text-sm text-red-600">문제집을 찾을 수 없습니다.</div>;
  }

  const { publication, questionCount, avgRating, reviewCount, likeCount, recentReviews, isLiked, isInLibrary, myReview } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{publication.title}</h1>
        {publication.description && (
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">{publication.description}</p>
        )}

        {/* Metadata */}
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
          {publication.category && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
              {publication.category}
            </span>
          )}
          {publication.difficulty && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
              {publication.difficulty}
            </span>
          )}
          {publication.publishedAt && (
            <span className="text-slate-500">
              공개됨 {new Date(publication.publishedAt).toLocaleDateString('ko-KR')}
            </span>
          )}
        </div>

        {/* Tags */}
        {publication.tags && publication.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {publication.tags.map((tag) => (
              <span key={tag} className="text-xs bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
          <p className="text-xs text-slate-500">문항</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{questionCount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
          <p className="text-xs text-slate-500">평점</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {avgRating ? (Number(avgRating) ?? 0).toFixed(1) : '-'}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
          <p className="text-xs text-slate-500">리뷰</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{reviewCount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
          <p className="text-xs text-slate-500">좋아요</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{likeCount}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <button
          onClick={() => {
            if (isInLibrary) {
              removeFromLibrary.mutate({ publicationId });
            } else {
              addToLibrary.mutate({ publicationId });
            }
          }}
          disabled={addToLibrary.isPending || removeFromLibrary.isPending}
          className={`rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
            isInLibrary
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:bg-slate-300`}
        >
          {isInLibrary ? '✓ 라이브러리에 있음' : '라이브러리에 추가'}
        </button>

        <button
          onClick={() => likeWorkbook.mutate({ publicationId })}
          disabled={likeWorkbook.isPending}
          className={`rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
            isLiked ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
          } disabled:bg-slate-300`}
        >
          {isLiked ? '❤️ 좋아요 취소' : '🤍 좋아요'}
        </button>

        <button
          onClick={() => setShowReportForm(!showReportForm)}
          className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          신고
        </button>
      </div>

      {/* Practice Button */}
      <Link
        href={`/study/practice?workbookId=${publication.workbookId}`}
        className="block rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-center font-semibold text-white hover:from-blue-600 hover:to-blue-700 transition-colors"
      >
        문제 풀기 →
      </Link>

      {/* Report Form */}
      {showReportForm && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
          <h3 className="font-semibold text-red-900">신고 이유</h3>
          <select
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="w-full rounded-md border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
          >
            <option value="">선택해주세요</option>
            <option value="inappropriate">부적절한 내용</option>
            <option value="spam">스팸</option>
            <option value="copyright">저작권 침해</option>
            <option value="other">기타</option>
          </select>

          <textarea
            value={reportDetail}
            onChange={(e) => setReportDetail(e.target.value)}
            placeholder="상세 내용 (선택사항)"
            rows={3}
            className="w-full rounded-md border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
          />

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (reportReason) {
                  reportWorkbook.mutate({ publicationId, reason: reportReason, detail: reportDetail || undefined });
                }
              }}
              disabled={!reportReason || reportWorkbook.isPending}
              className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-slate-300 transition-colors"
            >
              신고하기
            </button>
            <button
              onClick={() => {
                setShowReportForm(false);
                setReportReason('');
                setReportDetail('');
              }}
              className="flex-1 rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">리뷰</h2>

        {/* Review Form */}
        <div className="space-y-3 border-b border-slate-100 pb-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">별점</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className={`text-2xl transition-colors ${
                    star <= reviewRating ? 'text-amber-400' : 'text-slate-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="리뷰를 작성해보세요... (선택사항)"
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />

          <button
            onClick={() => {
              if (reviewRating > 0) {
                submitReview.mutate({
                  publicationId,
                  rating: reviewRating,
                  comment: reviewComment || undefined,
                });
                setReviewRating(0);
                setReviewComment('');
              }
            }}
            disabled={reviewRating === 0 || submitReview.isPending}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
          >
            {myReview ? '리뷰 수정' : '리뷰 작성'}
          </button>
        </div>

        {/* Recent Reviews */}
        <div className="space-y-3">
          {recentReviews && recentReviews.length > 0 ? (
            recentReviews.map((review) => (
              <div key={review.id} className="border-b border-slate-100 pb-3 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-200" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">사용자</p>
                      <p className="text-xs text-slate-500">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString('ko-KR') : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-amber-400 text-sm">{'★'.repeat(review.rating)}</div>
                </div>
                {review.comment && (
                  <p className="text-sm text-slate-700">{review.comment}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-slate-500 py-4">아직 리뷰가 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  );
}
