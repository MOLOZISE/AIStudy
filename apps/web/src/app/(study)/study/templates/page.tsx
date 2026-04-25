'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StudyShell } from '@/components/study/StudyShell';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
    >
      {copied ? '✓ 복사됨' : '프롬프트 복사'}
    </button>
  );
}

export default function TemplatesPage() {
  const aiPrompt = `당신은 교육 콘텐츠 전문가입니다. 제공되는 PDF/교재/강의자료를 바탕으로 AIStudy Excel 템플릿에 맞는 문제은행을 생성해주세요.

[출력 형식]
다음 Excel 시트 구조로 문제를 정리해주세요:

1. 00_문제집정보 시트:
   - 문제집명, 출판사, 저자, 버전, 최종수정일, 총문항수

2. 01_개념마스터 시트:
   - concept_id (고유 ID, 중복 방지)
   - concept_name (개념명)
   - parent_concept_id (상위 개념)
   - description (설명)

3. 02_출제포인트표 시트:
   - point_id (포인트 ID)
   - concept_id (관련 개념)
   - point_name (출제포인트명)
   - weight (중요도: 상/중/하)

4. 05_정식문제은행 시트:
   - question_id (고유 ID, 중복 방지)
   - concept_id (관련 개념)
   - question_type (객관식/주관식)
   - prompt (문제 내용)
   - answer (정답)
   - explanation (해설)
   - difficulty (난이도: 상/중/하)

[요구사항]
- 제공 자료에만 기반하여 문제를 생성해주세요
- concept_id와 question_id는 서로 중복되지 않도록 해주세요
- 객관식 문제는 최소 4개의 선지를 포함해주세요
- 각 문제마다 정답과 명확한 해설을 제시해주세요
- 난이도는 학습 수준에 따라 적절히 배치해주세요
- 총 최소 10개 이상의 문제를 생성해주세요

[경고]
- 자료에 없는 내용으로 문제를 만들지 마세요
- 모호한 해설보다는 구체적인 출처를 명시해주세요
- 생성된 문제는 반드시 검수 후 사용해주세요

자료를 붙여넣어주세요.`;

  return (
    <StudyShell
      title="문제은행 템플릿 센터"
      description="Excel 템플릿을 사용하여 학습 자료를 AIStudy 문제은행으로 변환하는 방법을 안내합니다."
    >
      <div className="space-y-8">
        {/* Overview Section */}
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-bold">AIStudy 문제은행 템플릿</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            AIStudy는 Excel 템플릿을 핵심 콘텐츠 포맷으로 사용합니다. PDF, 교재, 강의자료를 체계적인 문제은행으로 변환하여 학습,
            공유, 협업이 가능하도록 합니다.
          </p>
        </section>

        {/* Workflow Section */}
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold">📋 문제은행 만드는 흐름</h2>
          <div className="space-y-3">
            {[
              { step: 1, title: 'PDF/자료 준비', desc: '학습 자료, 교재, 강의노트 등을 준비합니다.' },
              { step: 2, title: 'AI로 문제 생성', desc: 'ChatGPT/Claude에 아래 프롬프트를 붙여넣고 문제를 생성합니다.' },
              { step: 3, title: 'Excel 템플릿 다운로드', desc: '아래 샘플 템플릿을 다운로드하여 AI 생성 결과를 정리합니다.' },
              { step: 4, title: 'AIStudy에 업로드', desc: '정리된 Excel을 문제집 업로드에서 import합니다.' },
              { step: 5, title: '검수 및 학습', desc: 'AI 생성 결과를 확인하고 학습을 시작합니다.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Prompt Section */}
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-2">
            <span className="text-xl">⚡</span>
            <div className="flex-1">
              <h2 className="font-bold">AI 문제 생성 프롬프트</h2>
              <p className="mt-2 text-xs text-slate-600">
                아래 프롬프트를 복사해서 ChatGPT, Claude, Gemini 등에 붙여넣으세요.
                자료를 붙여넣으면 Excel 형식의 문제가 생성됩니다.
              </p>
              <textarea
                readOnly
                value={aiPrompt}
                className="mt-3 w-full rounded-lg border border-amber-300 bg-white p-3 font-mono text-xs leading-5 text-slate-700"
                rows={15}
              />
              <CopyButton text={aiPrompt} />
            </div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold text-red-900">AI 생성 결과는 반드시 검수하세요</h3>
              <ul className="mt-2 space-y-2 text-sm text-red-800">
                <li>• AI가 생성한 문제가 출처 자료에 정확히 기반하는지 확인</li>
                <li>• 오류나 부정확한 해설은 수정</li>
                <li>• 중복된 문제나 개념 제거</li>
                <li>• 난이도와 출제포인트가 적절한지 재검토</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Template Schema */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">📊 필수 시트 (반드시 포함)</h2>
            <div className="mt-3 space-y-2">
              {[
                {
                  name: '00_문제집정보',
                  desc: '문제집 메타데이터 (문제집명, 출판사, 버전, 총문항수 등)',
                },
                {
                  name: '01_개념마스터',
                  desc: '개념/단원 목록 (concept_id, concept_name, parent_concept_id, description)',
                },
                {
                  name: '02_출제포인트표',
                  desc: '출제 포인트 (point_id, concept_id, point_name, weight)',
                },
                {
                  name: '05_정식문제은행',
                  desc: '실제 문제 (question_id, concept_id, prompt, answer, explanation, difficulty)',
                },
                {
                  name: '07_모의고사_세트매핑',
                  desc: '모의고사 세트 (set_id, set_name, question_id_list)',
                },
              ].map((sheet) => (
                <div key={sheet.name} className="rounded-lg border border-slate-200 bg-white p-3">
                  <h3 className="font-mono font-semibold text-blue-600">{sheet.name}</h3>
                  <p className="text-xs text-slate-600">{sheet.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold">💡 권장 시트 (선택사항)</h2>
            <div className="mt-3 space-y-2">
              {[
                { name: '03_자료출처', desc: '참고 자료 및 출처 정보' },
                { name: '04_문제초안', desc: 'AI 생성 후 1차 초안' },
                { name: '06_해설보강', desc: '상세 해설 및 보강 자료' },
                { name: '08_태그_난이도_메타', desc: '태그, 난이도, 추가 메타데이터' },
                { name: '09_QC_검수결과', desc: '검수 결과 및 품질 지표' },
              ].map((sheet) => (
                <div key={sheet.name} className="rounded-lg border border-slate-200 bg-white p-3">
                  <h3 className="font-mono font-semibold text-slate-700">{sheet.name}</h3>
                  <p className="text-xs text-slate-600">{sheet.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Column Reference */}
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold">📋 필수 컬럼 정보</h2>
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="font-semibold">01_개념마스터</h3>
              <div className="mt-2 grid gap-2 bg-slate-50 p-3 font-mono text-xs">
                <div>
                  <span className="font-bold">concept_id:</span> 고유 개념 ID (예: C001, C002...)
                </div>
                <div>
                  <span className="font-bold">concept_name:</span> 개념명 (예: &lsquo;함수&rsquo;, &lsquo;확률과 통계&rsquo;)
                </div>
                <div>
                  <span className="font-bold">parent_concept_id:</span> 상위 개념 (없으면 공백)
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold">05_정식문제은행</h3>
              <div className="mt-2 grid gap-2 bg-slate-50 p-3 font-mono text-xs">
                <div>
                  <span className="font-bold">question_id:</span> 고유 문제 ID (예: Q001, Q002...)
                </div>
                <div>
                  <span className="font-bold">concept_id:</span> 관련 개념 ID
                </div>
                <div>
                  <span className="font-bold">question_type:</span> &lsquo;객관식&rsquo; 또는 &lsquo;주관식&rsquo;
                </div>
                <div>
                  <span className="font-bold">prompt:</span> 문제 내용 (선지는 개행으로 구분)
                </div>
                <div>
                  <span className="font-bold">answer:</span> 정답 (객관식: 1~4, 주관식: 정답텍스트)
                </div>
                <div>
                  <span className="font-bold">explanation:</span> 해설 및 풀이 설명
                </div>
                <div>
                  <span className="font-bold">difficulty:</span> &lsquo;상&rsquo; 또는 &lsquo;중&rsquo; 또는 &lsquo;하&rsquo;
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold">🚀 시작하기</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/study/library"
              className="rounded-lg border border-blue-300 bg-blue-50 px-6 py-4 text-center font-semibold text-blue-700 hover:bg-blue-100"
            >
              Excel 업로드하기
            </Link>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert('PDF AI 생성 기능은 후속 릴리즈에서 제공됩니다. (준비 중)');
              }}
              className="rounded-lg border border-slate-300 bg-slate-50 px-6 py-4 text-center font-semibold text-slate-600 hover:bg-slate-100"
            >
              PDF 자동 분석 (준비 중)
            </a>
          </div>
        </section>

        {/* Sample Section */}
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold">📄 샘플 & 다운로드</h2>
          <div className="space-y-3 text-sm">
            <p className="text-slate-600">
              현재 샘플 Excel 템플릿 파일은 준비 중입니다.
              AI 프롬프트로 생성된 결과를 위의 템플릿 시트 구조에 맞춰 정리해주세요.
            </p>
            <p className="text-xs text-slate-500">
              TODO: 다음 업데이트에서 기본 템플릿 파일을 제공합니다.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold">❓ FAQ</h2>
          <details className="rounded-lg border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-semibold">
              Q. Excel 파일을 어떻게 만들어야 하나요?
            </summary>
            <p className="mt-3 text-sm text-slate-600">
              위의 AI 프롬프트를 사용해 ChatGPT/Claude에서 문제를 생성하고, 생성된 결과를 필수 시트 구조에 맞춰 Excel로 정리하시면 됩니다.
              여러 번 실행해서 충분한 문제 수를 확보한 후 검수하세요.
            </p>
          </details>
          <details className="rounded-lg border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-semibold">
              Q. 객관식과 주관식을 어떻게 구분하나요?
            </summary>
            <p className="mt-3 text-sm text-slate-600">
              question_type 컬럼에 &lsquo;객관식&rsquo; 또는 &lsquo;주관식&rsquo;을 명시합니다.
              객관식은 4개 이상의 선지를 제공하고, 주관식은 정답 텍스트를 제시하세요.
            </p>
          </details>
          <details className="rounded-lg border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-semibold">
              Q. 모의고사 세트는 필수인가요?
            </summary>
            <p className="mt-3 text-sm text-slate-600">
              아니요, 07_모의고사_세트매핑은 선택사항입니다. 학습 방식에 따라 필요하면 추가하세요.
              먼저 정식문제은행만 작성해도 충분합니다.
            </p>
          </details>
        </section>
      </div>
    </StudyShell>
  );
}
