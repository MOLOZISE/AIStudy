import { SectionCard, MetricCard } from '@/components/study/shared';

export function GenerationProgressStepper({
  currentStep,
  progress,
  estimatedSeconds,
  questionCounts,
}: {
  currentStep: number;
  progress: number;
  estimatedSeconds?: number;
  questionCounts: { mcq: number; essay: number; shortAnswer: number };
}) {
  const steps = [
    { number: 1, label: '자료 분석' },
    { number: 2, label: '핵심 내용 추출' },
    { number: 3, label: '문제 생성' },
    { number: 4, label: '품질 검수' },
  ];

  return (
    <SectionCard>
      <div className="space-y-8">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">생성 진행 중</h3>
            <span className="text-2xl font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="h-4 w-full rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.number} className="flex items-center gap-3">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  currentStep > step.number
                    ? 'bg-green-600 text-white'
                    : currentStep === step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}
              >
                {currentStep > step.number ? '✓' : step.number}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{step.label}</p>
              </div>
              {currentStep === step.number && (
                <div className="text-xs text-gray-600">진행 중...</div>
              )}
            </div>
          ))}
        </div>

        {/* Estimated Time */}
        {estimatedSeconds && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">⏱️ 예상 완료 시간</p>
            <p className="text-lg font-bold text-blue-700 mt-1">
              {Math.ceil(estimatedSeconds / 60)}분
            </p>
          </div>
        )}

        {/* Question Counts */}
        <div>
          <p className="text-sm font-medium text-gray-900 mb-3">예상 생성 문제</p>
          <div className="grid grid-cols-3 gap-3">
            <MetricCard label="객관식" value={questionCounts.mcq} />
            <MetricCard label="단답형" value={questionCounts.shortAnswer} />
            <MetricCard label="서술형" value={questionCounts.essay} />
          </div>
        </div>

        {/* CTA */}
        {progress === 100 && (
          <button className="w-full rounded-lg bg-green-600 text-white px-4 py-3 text-sm font-medium hover:bg-green-700">
            결과 보기 →
          </button>
        )}
      </div>
    </SectionCard>
  );
}
