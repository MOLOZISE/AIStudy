'use client';

import { SectionCard } from '@/components/study/shared';
import type { GeneratedQuestion } from '@/lib/study/study-types';
import { useState } from 'react';

export function QuestionEditorForm({
  question,
}: {
  question?: GeneratedQuestion;
}) {
  const [formData] = useState<GeneratedQuestion>(
    question || {
      id: '',
      order: 0,
      type: 'multiple_choice',
      title: '',
      body: '',
      answer: '',
      choices: ['', '', '', ''],
    }
  );

  if (!question) {
    return (
      <SectionCard>
        <div className="text-center py-12">
          <p className="text-gray-600">문제를 선택하면 여기에 편집 폼이 표시됩니다</p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard>
      <div className="space-y-4">
        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">문제 유형</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>객관식</option>
            <option>단답형</option>
            <option>서술형</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">제목</label>
          <input
            type="text"
            placeholder="문제의 제목을 입력하세요"
            defaultValue={formData.title}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">문제 내용</label>
          <textarea
            placeholder="문제의 내용을 입력하세요"
            defaultValue={formData.body}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Choices */}
        {formData.type === 'multiple_choice' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">선택지</label>
            <div className="space-y-2">
              {(formData.choices || []).map((choice, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`보기 ${i + 1}`}
                  defaultValue={choice}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ))}
            </div>
          </div>
        )}

        {/* Answer */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">정답</label>
          <input
            type="text"
            placeholder="정답을 입력하세요"
            defaultValue={formData.answer}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">해설</label>
          <textarea
            placeholder="해설을 입력하세요"
            defaultValue={formData.explanation}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Difficulty & Subject */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">난이도</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>쉬움</option>
              <option>중간</option>
              <option>어려움</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">과목</label>
            <input
              type="text"
              placeholder="과목"
              defaultValue={formData.subject}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Save Button */}
        <button className="w-full rounded-lg bg-blue-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-blue-700">
          저장
        </button>
      </div>
    </SectionCard>
  );
}
