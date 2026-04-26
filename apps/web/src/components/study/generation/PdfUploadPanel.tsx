'use client';

import { SectionCard, StatusBadge } from '@/components/study/shared';
import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';

export function PdfUploadPanel() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'complete' | 'error'>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf') {
      setFileName(file.name);
      setStatus('uploading');
      // 임시: 2초 후 완료
      setTimeout(() => setStatus('complete'), 2000);
    } else {
      setStatus('error');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <SectionCard>
      <div className="space-y-6">
        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
          className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-lg font-medium text-gray-900">PDF 파일을 드래그하세요</p>
          <p className="text-sm text-gray-600 mt-1">또는 클릭하여 파일 선택</p>
          <p className="text-xs text-gray-500 mt-3">PDF 형식, 최대 50MB</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileSelect(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        {/* Status Display */}
        {status !== 'idle' && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-900">{fileName}</p>
              {status === 'uploading' && <StatusBadge label="업로드 중..." variant="info" />}
              {status === 'complete' && <StatusBadge label="완료" variant="success" />}
              {status === 'error' && <StatusBadge label="실패" variant="danger" />}
            </div>

            {status === 'uploading' && (
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-full w-[60%] rounded-full bg-blue-600 animate-pulse" />
              </div>
            )}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex gap-3">
          <button
            className="flex-1 rounded-lg bg-blue-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            disabled={status !== 'complete'}
          >
            AI 문제 생성 시작
          </button>
          {status === 'error' && (
            <button
              onClick={() => setStatus('idle')}
              className="px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              재시도
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium mb-2">📌 팁</p>
          <ul className="space-y-1 text-xs list-disc list-inside">
            <li>텍스트 기반 PDF가 최적입니다</li>
            <li>이미지 위주 PDF는 인식이 어려울 수 있습니다</li>
            <li>처리 시간은 파일 크기에 따라 2-10분 소요됩니다</li>
          </ul>
        </div>
      </div>
    </SectionCard>
  );
}
