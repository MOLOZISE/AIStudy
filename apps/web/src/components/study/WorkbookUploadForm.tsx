'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

interface ImportError {
  sheet: string;
  row: number;
  field?: string;
  errorCode?: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ImportSummary {
  workbookId: string;
  jobId: string;
  status: 'completed' | 'failed';
  totalRows: number;
  importedRows: number;
  failedRows: number;
  summary: {
    concepts: number;
    seeds: number;
    questions: number;
    examSets: number;
    examSetItems: number;
  };
  errors?: ImportError[];
  preview?: {
    totalRows: number;
    successRows: number;
    errorRows: number;
    warningRows: number;
    sheets: Array<{ name: string; status: string; found: boolean }>;
  };
}

export function WorkbookUploadForm() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [subjectName, setSubjectName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setMessage('xlsx 파일을 선택해 주세요.');
      return;
    }

    setIsUploading(true);
    setMessage(null);
    setSummary(null);

    const formData = new FormData();
    formData.append('file', file);
    if (subjectName.trim()) formData.append('subjectName', subjectName.trim());

    try {
      const token = localStorage.getItem('supabase_token') ?? '';
      const response = await fetch('/api/study/workbooks/import', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json() as { ok: boolean; message?: string; result?: ImportSummary };
      if (!response.ok || !data.ok || !data.result) {
        throw new Error(data.message ?? '업로드에 실패했습니다.');
      }

      setSummary(data.result);
      setMessage('업로드와 import가 완료되었습니다.');
      await utils.study.listWorkbooks.invalidate();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <label htmlFor="subjectName" className="text-sm font-semibold text-slate-800">
          과목명
        </label>
        <input
          id="subjectName"
          value={subjectName}
          onChange={(event) => setSubjectName(event.target.value)}
          placeholder="예: 컴퓨터활용능력 1급"
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label htmlFor="workbookFile" className="text-sm font-semibold text-slate-800">
          Excel workbook
        </label>
        <input
          id="workbookFile"
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="mt-2 w-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isUploading}
        className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isUploading ? '업로드 및 import 중' : '업로드 후 import'}
      </button>

      {message ? (
        <p className={`text-sm ${summary?.status === 'failed' ? 'text-red-700' : 'text-green-700'}`}>
          {message}
        </p>
      ) : null}

      {summary && summary.status === 'completed' ? (
        <div className="space-y-3 rounded-md border border-green-200 bg-green-50 p-4">
          <h3 className="font-semibold text-green-900">✓ Import 완료</h3>

          {/* Summary Grid */}
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            <div>
              <p className="font-semibold text-slate-950">{summary.summary.concepts}</p>
              <p className="text-xs text-slate-500">개념</p>
            </div>
            <div>
              <p className="font-semibold text-slate-950">{summary.summary.seeds}</p>
              <p className="text-xs text-slate-500">포인트</p>
            </div>
            <div>
              <p className="font-semibold text-slate-950">{summary.summary.questions}</p>
              <p className="text-xs text-slate-500">문항</p>
            </div>
            <div>
              <p className="font-semibold text-slate-950">{summary.summary.examSets}</p>
              <p className="text-xs text-slate-500">세트</p>
            </div>
          </div>

          {/* Preview Info */}
          {summary.preview && (
            <div className="space-y-2 border-t border-green-200 pt-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-green-700">
                    <span className="font-semibold">{summary.preview.successRows}</span> 성공
                  </p>
                </div>
                {summary.preview.errorRows > 0 && (
                  <div>
                    <p className="text-red-700">
                      <span className="font-semibold">{summary.preview.errorRows}</span> 오류
                    </p>
                  </div>
                )}
                {summary.preview.warningRows > 0 && (
                  <div>
                    <p className="text-amber-700">
                      <span className="font-semibold">{summary.preview.warningRows}</span> 경고
                    </p>
                  </div>
                )}
              </div>

              {/* Sheets Status */}
              <div className="border-t border-green-200 pt-2">
                <p className="text-xs font-semibold text-slate-700 mb-1">시트 상태:</p>
                <div className="space-y-1 text-xs">
                  {summary.preview.sheets
                    .filter((s) => s.status === 'required')
                    .map((sheet) => (
                      <div key={sheet.name} className="flex items-center gap-2">
                        <span className={sheet.found ? '✓' : '✗'}>{sheet.name}</span>
                        <span className="text-slate-400">{sheet.found ? '발견됨' : '누락됨'}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Error Details */}
          {summary.errors && summary.errors.length > 0 && (
            <details className="border-t border-green-200 pt-3">
              <summary className="cursor-pointer text-xs font-semibold text-red-700">
                오류 세부 ({summary.errors.filter((e) => e.severity === 'error').length}건)
              </summary>
              <div className="mt-2 space-y-1 text-xs">
                {summary.errors
                  .filter((e) => e.severity === 'error')
                  .slice(0, 10)
                  .map((err, idx) => (
                    <div key={idx} className="rounded bg-red-100 px-2 py-1 text-red-800">
                      <span className="font-semibold">{err.sheet}</span>
                      {err.row > 0 && <span> (행 {err.row})</span>}
                      {err.field && <span> [{err.field}]</span>}
                      : {err.message}
                    </div>
                  ))}
                {summary.errors.filter((e) => e.severity === 'error').length > 10 && (
                  <p className="text-slate-500">... 외 {summary.errors.length - 10}건</p>
                )}
              </div>
            </details>
          )}

          {/* Warning Details */}
          {summary.errors && summary.errors.some((e) => e.severity === 'warning') && (
            <details className="border-t border-green-200 pt-3">
              <summary className="cursor-pointer text-xs font-semibold text-amber-700">
                경고 ({summary.errors.filter((e) => e.severity === 'warning').length}건)
              </summary>
              <div className="mt-2 space-y-1 text-xs">
                {summary.errors
                  .filter((e) => e.severity === 'warning')
                  .slice(0, 5)
                  .map((err, idx) => (
                    <div key={idx} className="rounded bg-amber-100 px-2 py-1 text-amber-800">
                      <span className="font-semibold">{err.sheet}</span>
                      {err.row > 0 && <span> (행 {err.row})</span>}
                      : {err.message}
                    </div>
                  ))}
                {summary.errors.filter((e) => e.severity === 'warning').length > 5 && (
                  <p className="text-slate-500">... 외 {summary.errors.filter((e) => e.severity === 'warning').length - 5}건</p>
                )}
              </div>
            </details>
          )}
        </div>
      ) : null}

      {summary && summary.status === 'failed' ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-900">✗ Import 실패</p>
          {summary.errors && summary.errors.length > 0 && (
            <div className="mt-2 space-y-1 text-xs">
              {summary.errors.slice(0, 5).map((err, idx) => (
                <p key={idx} className="text-red-700">
                  {err.sheet} (행 {err.row}): {err.message}
                </p>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </form>
  );
}
