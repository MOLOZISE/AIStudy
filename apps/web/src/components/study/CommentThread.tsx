'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import type { CommentTargetType } from '@repo/types';

interface CommentThreadProps {
  targetType: CommentTargetType;
  targetId: string;
}

export function CommentThread({ targetType, targetId }: CommentThreadProps) {
  const [newCommentBody, setNewCommentBody] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBodies, setReplyBodies] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  const { data, isLoading, refetch } = trpc.study.listCommentsByTarget.useQuery({
    targetType,
    targetId,
    limit: 50,
    offset: 0,
  });

  const createComment = trpc.study.createComment.useMutation({
    onSuccess: () => {
      setNewCommentBody('');
      refetch();
    },
  });

  const updateComment = trpc.study.updateMyComment.useMutation({
    onSuccess: () => {
      setEditingId(null);
      setEditBody('');
      refetch();
    },
  });

  const deleteComment = trpc.study.deleteMyComment.useMutation({
    onSuccess: () => refetch(),
  });

  const toggleLike = trpc.study.toggleCommentLike.useMutation({
    onSuccess: () => refetch(),
  });

  const reportComment = trpc.study.reportComment.useMutation({
    onSuccess: () => {
      setReportingId(null);
      setReportReason('');
    },
  });

  const handleCreateComment = async () => {
    if (!newCommentBody.trim()) return;
    if (newCommentBody.length > 2000) {
      alert('댓글은 2000자 이하여야 합니다.');
      return;
    }
    await createComment.mutateAsync({
      targetType,
      targetId,
      body: newCommentBody,
    });
  };

  const handleCreateReply = async (parentCommentId: string) => {
    const body = replyBodies[parentCommentId];
    if (!body?.trim()) return;
    if (body.length > 2000) {
      alert('댓글은 2000자 이하여야 합니다.');
      return;
    }
    await createComment.mutateAsync({
      targetType,
      targetId,
      body,
      parentCommentId,
    });
    setReplyBodies((prev) => {
      const updated = { ...prev };
      delete updated[parentCommentId];
      return updated;
    });
    setReplyingTo(null);
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editBody.trim()) return;
    if (editBody.length > 2000) {
      alert('댓글은 2000자 이하여야 합니다.');
      return;
    }
    await updateComment.mutateAsync({
      commentId,
      body: editBody,
    });
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm('댓글을 삭제하시겠습니까?')) {
      await deleteComment.mutateAsync({ commentId });
    }
  };

  const handleToggleLike = async (commentId: string) => {
    await toggleLike.mutateAsync({ commentId });
  };

  const handleReportComment = async (commentId: string) => {
    if (!reportReason.trim()) {
      alert('신고 사유를 입력해주세요.');
      return;
    }
    await reportComment.mutateAsync({
      commentId,
      reason: reportReason,
    });
  };

  const comments = data?.items || [];
  const topLevelComments = comments.filter((c) => !c.parentCommentId);
  const replies: Record<string, typeof comments> = {};
  comments.forEach((c) => {
    if (c.parentCommentId) {
      if (!replies[c.parentCommentId]) {
        replies[c.parentCommentId] = [];
      }
      replies[c.parentCommentId].push(c);
    }
  });

  return (
    <div className="space-y-6">
      {/* Comment Count */}
      <div className="text-sm font-semibold text-slate-700">
        댓글 {data?.total || 0}
      </div>

      {/* New Comment Form */}
      <div className="space-y-2">
        <textarea
          value={newCommentBody}
          onChange={(e) => setNewCommentBody(e.target.value)}
          placeholder="댓글을 입력하세요..."
          maxLength={2000}
          className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          rows={3}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {newCommentBody.length}/2000
          </span>
          <button
            onClick={handleCreateComment}
            disabled={!newCommentBody.trim() || createComment.isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-slate-300"
          >
            {createComment.isPending ? '작성 중...' : '댓글 작성'}
          </button>
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center text-sm text-slate-500">댓글을 불러오는 중입니다...</div>
      ) : comments.length === 0 ? (
        <div className="text-center text-sm text-slate-500">아직 댓글이 없습니다.</div>
      ) : (
        <div className="space-y-4">
          {topLevelComments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              {/* Parent Comment */}
              <CommentItem
                comment={comment}
                isAuthor={comment.isAuthor}
                isEditing={editingId === comment.id}
                editBody={editBody}
                onEditBodyChange={setEditBody}
                onEditStart={() => {
                  setEditingId(comment.id);
                  setEditBody(comment.body);
                }}
                onEditCancel={() => {
                  setEditingId(null);
                  setEditBody('');
                }}
                onEditSave={() => handleUpdateComment(comment.id)}
                onDelete={() => handleDeleteComment(comment.id)}
                onLike={() => handleToggleLike(comment.id)}
                onReport={() => setReportingId(comment.id)}
                onReply={() => setReplyingTo(comment.id)}
              />

              {/* Report Form */}
              {reportingId === comment.id && (
                <div className="ml-6 space-y-2 rounded-lg bg-slate-50 p-3">
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="신고 사유를 입력하세요..."
                    maxLength={500}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs text-slate-900 placeholder-slate-500 focus:border-red-500 focus:outline-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReportComment(comment.id)}
                      disabled={reportComment.isPending}
                      className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:bg-slate-300"
                    >
                      {reportComment.isPending ? '신고 중...' : '신고'}
                    </button>
                    <button
                      onClick={() => {
                        setReportingId(null);
                        setReportReason('');
                      }}
                      className="rounded-md bg-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-400"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="ml-6 space-y-2">
                  <textarea
                    value={replyBodies[comment.id] || ''}
                    onChange={(e) =>
                      setReplyBodies((prev) => ({
                        ...prev,
                        [comment.id]: e.target.value,
                      }))
                    }
                    placeholder="대댓글을 입력하세요..."
                    maxLength={2000}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    rows={2}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {(replyBodies[comment.id] || '').length}/2000
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCreateReply(comment.id)}
                        disabled={
                          !(replyBodies[comment.id]?.trim()) ||
                          createComment.isPending
                        }
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-slate-300"
                      >
                        {createComment.isPending ? '작성 중...' : '대댓글 작성'}
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyBodies((prev) => {
                            const updated = { ...prev };
                            delete updated[comment.id];
                            return updated;
                          });
                        }}
                        className="rounded-md bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-400"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Replies */}
              {replies[comment.id] && replies[comment.id].length > 0 && (
                <div className="ml-6 space-y-2 border-l-2 border-slate-200 pl-4">
                  {replies[comment.id].map((reply) => (
                    <div key={reply.id}>
                      <CommentItem
                        comment={reply}
                        isAuthor={reply.isAuthor}
                        isEditing={editingId === reply.id}
                        editBody={editBody}
                        onEditBodyChange={setEditBody}
                        onEditStart={() => {
                          setEditingId(reply.id);
                          setEditBody(reply.body);
                        }}
                        onEditCancel={() => {
                          setEditingId(null);
                          setEditBody('');
                        }}
                        onEditSave={() => handleUpdateComment(reply.id)}
                        onDelete={() => handleDeleteComment(reply.id)}
                        onLike={() => handleToggleLike(reply.id)}
                        onReport={() => setReportingId(reply.id)}
                        isReply
                      />

                      {/* Report Form for Reply */}
                      {reportingId === reply.id && (
                        <div className="mt-2 space-y-2 rounded-lg bg-slate-50 p-3">
                          <textarea
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            placeholder="신고 사유를 입력하세요..."
                            maxLength={500}
                            className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs text-slate-900 placeholder-slate-500 focus:border-red-500 focus:outline-none"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReportComment(reply.id)}
                              disabled={reportComment.isPending}
                              className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:bg-slate-300"
                            >
                              {reportComment.isPending ? '신고 중...' : '신고'}
                            </button>
                            <button
                              onClick={() => {
                                setReportingId(null);
                                setReportReason('');
                              }}
                              className="rounded-md bg-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-400"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: any;
  isAuthor: boolean;
  isEditing: boolean;
  editBody: string;
  onEditBodyChange: (body: string) => void;
  onEditStart: () => void;
  onEditCancel: () => void;
  onEditSave: () => void;
  onDelete: () => void;
  onLike: () => void;
  onReport: () => void;
  onReply?: () => void;
  isReply?: boolean;
}

function CommentItem({
  comment,
  isAuthor,
  isEditing,
  editBody,
  onEditBodyChange,
  onEditStart,
  onEditCancel,
  onEditSave,
  onDelete,
  onLike,
  onReport,
  onReply,
  isReply,
}: CommentItemProps) {
  const isDeleted = comment.status === 'deleted';

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      {/* Author Info */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-600">
          {comment.authorDisplayName || '익명 사용자'}
        </span>
        <span className="text-xs text-slate-500">
          {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
        </span>
      </div>

      {/* Comment Body */}
      {isEditing ? (
        <div className="space-y-2 mb-3">
          <textarea
            value={editBody}
            onChange={(e) => onEditBodyChange(e.target.value)}
            maxLength={2000}
            className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            rows={2}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {editBody.length}/2000
            </span>
            <div className="flex gap-2">
              <button
                onClick={onEditSave}
                className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
              >
                저장
              </button>
              <button
                onClick={onEditCancel}
                className="rounded-md bg-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p
          className="mb-3 text-sm text-slate-700 whitespace-pre-wrap"
          style={{ wordBreak: 'break-word' }}
        >
          {isDeleted ? '삭제된 댓글입니다.' : comment.body}
        </p>
      )}

      {/* Controls */}
      {!isDeleted && !isEditing && (
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <button
            onClick={onLike}
            className="flex items-center gap-1 transition-colors hover:text-blue-600"
          >
            ❤️ {comment.likeCount}
          </button>

          {!isReply && onReply && (
            <button
              onClick={onReply}
              className="transition-colors hover:text-blue-600"
            >
              💬 답글
            </button>
          )}

          {isAuthor && (
            <>
              <button
                onClick={onEditStart}
                className="transition-colors hover:text-blue-600"
              >
                ✏️ 수정
              </button>
              <button
                onClick={onDelete}
                className="transition-colors hover:text-red-600"
              >
                🗑️ 삭제
              </button>
            </>
          )}

          <button
            onClick={onReport}
            className="transition-colors hover:text-red-600"
          >
            🚩 신고
          </button>
        </div>
      )}
    </div>
  );
}
