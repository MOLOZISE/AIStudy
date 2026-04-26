'use client';

import { use, useState } from 'react';
import { StudyShell } from '@/components/study/StudyShell';
import { SectionCard } from '@/components/study/shared';
import { SolveQuestionList } from '@/components/study/solving/SolveQuestionList';
import { mockSolveQuestions, mockWrongNotes } from '@/lib/study/mock-data';
import Link from 'next/link';

export default function SolvePage({ params }: { params: Promise<{ workbookId: string }> }) {
  const { workbookId } = use(params);
  const [answeredIds] = useState<string[]>([]);

  return (
    <StudyShell
      title="문제 풀이"
      description="문제집의 문제들을 풀어보세요"
    >
      <div className="space-y-6">
        {/* Questions List */}
        <SectionCard>
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">풀이 목록</h3>
            <SolveQuestionList
              questions={mockSolveQuestions}
              workbookId={workbookId}
              answeredIds={answeredIds}
            />
          </div>
        </SectionCard>

        {/* Recent Wrong Notes Section */}
        {mockWrongNotes.length > 0 && (
          <SectionCard>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">최근 오답</h3>
                <Link href="/study/wrong-notes">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    전체 보기 →
                  </button>
                </Link>
              </div>

              <div className="space-y-2">
                {mockWrongNotes.slice(0, 3).map((note) => (
                  <div key={note.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          Q{note.questionId}. {note.questionTitle}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {note.subject} • 오답 {note.wrongCount}회
                        </p>
                      </div>
                      <Link href="/study/wrong-notes">
                        <button className="px-3 py-1.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-medium whitespace-nowrap transition-colors">
                          복습
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/study/wrong-notes">
                <button className="w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors">
                  오답노트로 이동
                </button>
              </Link>
            </div>
          </SectionCard>
        )}
      </div>
    </StudyShell>
  );
}
