'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { StudyShell } from '@/components/study/StudyShell';
import { QuestionEditor } from '@/components/study/QuestionEditor';
import { trpc } from '@/lib/trpc';

export default function EditorPage({ params }: { params: Promise<{ workbookId: string }> }) {
  const { workbookId } = use(params);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const workbook = trpc.study.getWorkbook.useQuery({ workbookId });
  const questions = trpc.study.listQuestions.useQuery({
    workbookId,
    limit: 100,
    offset: 0,
  });

  const selectedQuestion = selectedQuestionId
    ? questions.data?.items.find((q) => q.id === selectedQuestionId)
    : null;

  const filteredQuestions = questions.data?.items.filter((q) =>
    q.prompt?.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  if (workbook.isLoading || questions.isLoading) {
    return (
      <StudyShell title="문제 편집" description="loading...">
        <div className="text-sm text-slate-500">로딩 중...</div>
      </StudyShell>
    );
  }

  if (workbook.error || !workbook.data) {
    return (
      <StudyShell title="문제 편집" description="오류 발생">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {workbook.error?.message ?? '문제집을 찾을 수 없습니다.'}
        </div>
      </StudyShell>
    );
  }

  return (
    <StudyShell title="문제 편집" description={`${workbook.data.originalFilename} - 문제 ${filteredQuestions.length}개`}>
      <div className="grid gap-4 lg:grid-cols-2">
        {/* 좌측: 문제 목록 */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">문제 목록</h2>

          {/* 검색 */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="문제 본문으로 검색..."
            className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {/* 문제 목록 */}
          <div className="max-h-[600px] space-y-2 overflow-y-auto">
            {filteredQuestions.length === 0 ? (
              <p className="text-xs text-slate-500">문제가 없습니다.</p>
            ) : (
              filteredQuestions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => setSelectedQuestionId(question.id)}
                  className={`w-full rounded-md border p-3 text-left text-xs transition-colors ${
                    selectedQuestionId === question.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {question.questionNo && <p className="font-semibold text-slate-900">문제 {question.questionNo}</p>}
                      <p className="mt-1 line-clamp-2 text-slate-600">{question.prompt}</p>
                    </div>
                    {question.difficulty && (
                      <span
                        className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                          question.difficulty === '상'
                            ? 'bg-red-50 text-red-600'
                            : question.difficulty === '중'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        {question.difficulty}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* 돌아가기 버튼 */}
          <Link
            href={`/study/workbooks/${workbookId}`}
            className="mt-3 block w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            돌아가기
          </Link>
        </div>

        {/* 우측: 문제 편집 */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {selectedQuestion ? (
            <QuestionEditor
              questionId={selectedQuestion.id}
              onClose={() => setSelectedQuestionId(null)}
              onSaveSuccess={() => {
                questions.refetch();
                setSelectedQuestionId(null);
              }}
            />
          ) : (
            <div className="flex h-96 items-center justify-center text-center text-slate-500">
              <p>문제를 선택하여 편집합니다</p>
            </div>
          )}
        </div>
      </div>
    </StudyShell>
  );
}
