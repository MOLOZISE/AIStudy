import Link from 'next/link';
import { StudyShell } from '@/components/study/StudyShell';
import { AdminOverview } from '@/components/study/AdminOverview';
import { AdminGuard } from '@/components/study/admin/AdminGuard';
import { AdminNav } from '@/components/study/admin/AdminNav';

export default function AdminPage() {
  return (
    <AdminGuard>
      <StudyShell
        title="관리자 대시보드"
        description="AIStudy 운영 현황을 관리합니다."
      >
        <AdminNav />
        <div className="space-y-6 p-6">
          <AdminOverview />

        {/* Admin Links */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Link
            href="/study/admin/reports"
            className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
          >
            <p className="font-semibold text-slate-900">📋 신고 관리</p>
            <p className="text-xs text-slate-600 mt-1">신고 접수 및 처리</p>
          </Link>

          <Link
            href="/study/admin/quests"
            className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
          >
            <p className="font-semibold text-slate-900">🎯 퀘스트 관리</p>
            <p className="text-xs text-slate-600 mt-1">일일/주간/월간 퀘스트</p>
          </Link>

          <Link
            href="/study/admin/ai-jobs"
            className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
          >
            <p className="font-semibold text-slate-900">🤖 AI 작업</p>
            <p className="text-xs text-slate-600 mt-1">AI 생성 작업 모니터링</p>
          </Link>

          <Link
            href="/study/admin/questions"
            className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
          >
            <p className="font-semibold text-slate-900">✓ 문제 QC</p>
            <p className="text-xs text-slate-600 mt-1">문제 검수 상태 관리</p>
          </Link>

          <Link
            href="/study/admin/workbooks"
            className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
          >
            <p className="font-semibold text-slate-900">📚 문제집 관리</p>
            <p className="text-xs text-slate-600 mt-1">공개 문제집 품질 관리</p>
          </Link>

          <Link
            href="/study"
            className="rounded-lg border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100 transition-colors"
          >
            <p className="font-semibold text-slate-600">← 돌아가기</p>
            <p className="text-xs text-slate-500 mt-1">메인 화면</p>
          </Link>
        </section>
        </div>
      </StudyShell>
    </AdminGuard>
  );
}
