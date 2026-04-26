'use client';

import { StudyShell } from '@/components/study/StudyShell';
import { QuestionListPanel } from '@/components/study/editor/QuestionListPanel';
import { QuestionEditorForm } from '@/components/study/editor/QuestionEditorForm';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { mockGeneratedQuestions } from '@/lib/study/mock-data';
import type { GeneratedQuestion } from '@/lib/study/study-types';

export default function WorkbookEditorPage() {
  const params = useParams();
  const workbookId = params.workbookId as string;
  const [questions, setQuestions] = useState<GeneratedQuestion[]>(mockGeneratedQuestions);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const selectedQuestion = questions.find((q) => q.id === selectedId);

  const handleDelete = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    if (selectedId === id) {
      setSelectedId(undefined);
    }
  };

  const handleAdd = () => {
    const newQuestion: GeneratedQuestion = {
      id: `q_${Date.now()}`,
      order: questions.length + 1,
      type: 'multiple_choice',
      title: '',
      body: '',
      answer: '',
      choices: ['', '', '', ''],
    };
    setQuestions([...questions, newQuestion]);
    setSelectedId(newQuestion.id);
  };

  return (
    <StudyShell
      title="문제 편집"
      description={`문제집 ID: ${workbookId} — 생성된 문제를 검토하고 필요시 수정하세요`}
    >
      <div className="max-w-full mx-auto space-y-6">

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Question List */}
          <div className="lg:col-span-1">
            <QuestionListPanel
              questions={questions}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={handleDelete}
              onAdd={handleAdd}
            />
          </div>

          {/* Right: Editor Form */}
          <div className="lg:col-span-2">
            <QuestionEditorForm question={selectedQuestion} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 sticky bottom-6">
          <button className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium">
            ← 뒤로 가기
          </button>
          <button className="flex-1 px-4 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 text-sm font-medium">
            저장 및 완료
          </button>
        </div>
      </div>
    </StudyShell>
  );
}
