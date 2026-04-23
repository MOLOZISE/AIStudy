'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

interface ImportSummary {
  workbookId: string;
  summary: {
    concepts: number;
    seeds: number;
    questions: number;
    examSets: number;
    examSetItems: number;
  };
  failedRows: number;
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

      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
      {summary ? (
        <div className="grid grid-cols-3 gap-2 rounded-md bg-slate-50 p-3 text-center text-xs">
          <div>
            <p className="font-semibold text-slate-950">{summary.summary.concepts}</p>
            <p className="text-slate-500">개념</p>
          </div>
          <div>
            <p className="font-semibold text-slate-950">{summary.summary.questions}</p>
            <p className="text-slate-500">문항</p>
          </div>
          <div>
            <p className="font-semibold text-slate-950">{summary.failedRows}</p>
            <p className="text-slate-500">실패 row</p>
          </div>
        </div>
      ) : null}
    </form>
  );
}
