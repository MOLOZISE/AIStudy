'use client';

import Link from 'next/link';
import { StudyShell } from '@/components/study/StudyShell';

export default function AdminWorkbooksPage() {
  return (
    <StudyShell title="문제집 관리" description="공개 문제집의 품질과 상태를 관리합니다.">
      <div className="space-y-4">
        <Link
          href="/study/admin"
          className="inline-block rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          ← 돌아가기
        </Link>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-center">
          <p className="text-sm text-blue-900">
            <strong>📝 준비 중:</strong> 문제집 품질 관리 기능은 후속 개선사항으로 예정되어 있습니다.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-slate-900">예정된 기능:</h3>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>✓ 공개 문제집 목록</li>
            <li>✓ 신고된 문제집 필터</li>
            <li>✓ 문제집 숨김 처리</li>
            <li>✓ 평가 및 리뷰 통계</li>
            <li>✓ Fork 수 및 활용도 추적</li>
          </ul>
        </div>
      </div>
    </StudyShell>
  );
}
