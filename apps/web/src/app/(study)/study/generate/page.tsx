'use client';

import Link from 'next/link';
import { useState } from 'react';
import { StudyShell } from '@/components/study/StudyShell';
import { trpc } from '@/lib/trpc';
import { AiGenerationForm } from '@/components/study/AiGenerationForm';
import { AiGenerationPreview } from '@/components/study/AiGenerationPreview';
import { AiGenerationJobsList } from '@/components/study/AiGenerationJobsList';

export default function AiGeneratePage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'jobs'>('upload');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const { data: selectedJob } = trpc.study.getAiGenerationJob.useQuery(
    { jobId: selectedJobId! },
    { enabled: !!selectedJobId }
  );

  const { data: previewData } = trpc.study.getGeneratedWorkbookPreview.useQuery(
    { jobId: selectedJobId! },
    { enabled: !!selectedJobId }
  );

  const preview = previewData ? {
    status: previewData.status,
    progress: previewData.progress || null,
    payload: (previewData as any).payload || undefined,
    error: (previewData as any).error || undefined,
  } : undefined;

  return (
    <StudyShell
      title="AI로 문제 생성하기"
      description="PDF 또는 텍스트 자료를 업로드하면 AI가 AIStudy 형식의 문제은행을 생성해줍니다."
    >
      <div className="space-y-6">
        {/* Warning Alert */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">
            <strong>⚠️ 중요:</strong> AI 생성 결과는 초안이며, 반드시 검수 후 사용해야 합니다. 정답/해설 오류 가능성이 있으니 신중히 검토해주세요.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => {
              setActiveTab('upload');
              setSelectedJobId(null);
            }}
            className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            📤 PDF 업로드
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'jobs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 생성 목록
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <AiGenerationForm
            onJobCreated={(jobId) => {
              setSelectedJobId(jobId);
              setActiveTab('jobs');
            }}
          />
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <>
            <AiGenerationJobsList
              onJobSelect={(jobId) => setSelectedJobId(jobId)}
              selectedJobId={selectedJobId}
            />

            {/* Preview */}
            {selectedJobId && selectedJob && preview && (
              <AiGenerationPreview job={selectedJob} preview={preview} />
            )}
          </>
        )}

        {/* Info Section */}
        <section className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">AI 생성 프로세스</h2>

          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                1
              </span>
              <div>
                <p className="font-semibold text-slate-900">PDF 업로드</p>
                <p className="text-sm text-slate-600">학습 자료, 교과서 PDF를 업로드합니다. (최대 10MB)</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                2
              </span>
              <div>
                <p className="font-semibold text-slate-900">텍스트 추출</p>
                <p className="text-sm text-slate-600">PDF에서 텍스트를 자동 추출합니다. OCR은 지원하지 않습니다.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                3
              </span>
              <div>
                <p className="font-semibold text-slate-900">AI 생성</p>
                <p className="text-sm text-slate-600">추출된 자료를 바탕으로 문제, 해설, 개념을 생성합니다.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                4
              </span>
              <div>
                <p className="font-semibold text-slate-900">검수 및 조정</p>
                <p className="text-sm text-slate-600">생성된 초안을 미리보고, 필요시 웹 에디터로 수정합니다.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                5
              </span>
              <div>
                <p className="font-semibold text-slate-900">Import</p>
                <p className="text-sm text-slate-600">Excel로 다운로드하거나 직접 import하여 학습을 시작합니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="grid grid-cols-2 gap-3">
          <Link
            href="/study/templates"
            className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
          >
            <p className="font-semibold text-slate-900">📋 템플릿 센터</p>
            <p className="text-xs text-slate-600 mt-1">Excel 템플릿 및 AI 프롬프트</p>
          </Link>

          <Link
            href="/study/library"
            className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
          >
            <p className="font-semibold text-slate-900">📚 문제집</p>
            <p className="text-xs text-slate-600 mt-1">업로드한 문제집 관리</p>
          </Link>
        </section>

        {/* Copyright Notice */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs text-slate-600">
            <strong>📝 저작권 안내:</strong> PDF 업로드 시 저작권을 소유하고 있거나 사용 권한이 있는지 확인해주세요.
            업로드된 PDF는 개인의 AI 생성 목적으로만 사용되며 공개되지 않습니다.
          </p>
        </div>
      </div>
    </StudyShell>
  );
}
