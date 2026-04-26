'use client';

import { StudyShell } from '@/components/study/StudyShell';
import { SectionCard } from '@/components/study/shared';
import Link from 'next/link';
import { Download } from 'lucide-react';

export default function ExcelTemplatePage() {
  return (
    <StudyShell
      title="엑셀 템플릿"
      description="Excel 템플릿을 다운로드하여 문제를 직접 작성한 후 업로드하세요"
    >
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Template Download */}
        <SectionCard>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📥 템플릿 다운로드</h3>
              <p className="text-sm text-gray-600 mb-4">
                아래 링크에서 Excel 템플릿을 다운로드하여 문제를 작성하세요.
              </p>
            </div>

            <div className="space-y-2">
              <a
                href="#"
                download
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-5 h-5 text-blue-600" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">AIStudy_문제템플릿.xlsx</p>
                  <p className="text-xs text-gray-500">객관식, 단답형, 서술형 포함</p>
                </div>
                <span className="text-xs text-gray-500">234 KB</span>
              </a>
            </div>
          </div>
        </SectionCard>

        {/* Instructions */}
        <SectionCard>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">📋 작성 가이드</h3>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                  1
                </span>
                <div>
                  <p className="font-medium text-gray-900">템플릿 다운로드</p>
                  <p className="text-gray-600">위의 Excel 파일을 다운로드합니다</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                  2
                </span>
                <div>
                  <p className="font-medium text-gray-900">문제 작성</p>
                  <p className="text-gray-600">
                    각 행에 문제 정보를 입력 (문제유형, 제목, 내용, 정답 등)
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                  3
                </span>
                <div>
                  <p className="font-medium text-gray-900">파일 저장</p>
                  <p className="text-gray-600">편집 완료 후 .xlsx 형식으로 저장</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                  4
                </span>
                <div>
                  <p className="font-medium text-gray-900">파일 업로드</p>
                  <p className="text-gray-600">준비된 Excel 파일을 업로드하여 문제집 생성</p>
                </div>
              </li>
            </ol>
          </div>
        </SectionCard>

        {/* Column Format */}
        <SectionCard>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">📝 필수 열 정보</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-semibold text-gray-900">열</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-900">설명</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-900">예시</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium text-gray-900">유형</td>
                    <td className="py-3 px-3 text-gray-600">
                      문제 유형 (객관식, 단답형, 서술형)
                    </td>
                    <td className="py-3 px-3 text-gray-600 font-mono text-xs">객관식</td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium text-gray-900">제목</td>
                    <td className="py-3 px-3 text-gray-600">문제의 짧은 제목</td>
                    <td className="py-3 px-3 text-gray-600 font-mono text-xs">
                      함수의 정의
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium text-gray-900">내용</td>
                    <td className="py-3 px-3 text-gray-600">문제 본문 내용</td>
                    <td className="py-3 px-3 text-gray-600 font-mono text-xs">
                      다음 중 함수의 정의로 옳은 것은?
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium text-gray-900">정답</td>
                    <td className="py-3 px-3 text-gray-600">
                      정답 (객관식은 선택지 번호 또는 텍스트)
                    </td>
                    <td className="py-3 px-3 text-gray-600 font-mono text-xs">1</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium text-gray-900">해설</td>
                    <td className="py-3 px-3 text-gray-600">문제의 상세한 해설</td>
                    <td className="py-3 px-3 text-gray-600 font-mono text-xs">
                      함수는 입력과 출력의 관계를 나타냅니다...
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>

        <div className="flex gap-3">
          <Link
            href="/study/generate"
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
          >
            ← 뒤로 가기
          </Link>
          <button className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium">
            다음 → 파일 업로드
          </button>
        </div>
      </div>
    </StudyShell>
  );
}
