'use client';

interface SolveProgressStepperProps {
  currentQuestion: number;
  totalQuestions: number;
  timeRemainingSeconds?: number;
  answeredCount: number;
}

export function SolveProgressStepper({
  currentQuestion,
  totalQuestions,
  timeRemainingSeconds,
  answeredCount,
}: SolveProgressStepperProps) {
  const progress = (answeredCount / totalQuestions) * 100;
  const minutes = timeRemainingSeconds ? Math.floor(timeRemainingSeconds / 60) : 0;
  const seconds = timeRemainingSeconds ? timeRemainingSeconds % 60 : 0;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              문제 {currentQuestion} / {totalQuestions}
            </h2>
            {timeRemainingSeconds !== undefined && (
              <div className={`text-lg font-semibold ${timeRemainingSeconds < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                ⏱️ {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">진행 상황</p>
              <p className="text-sm font-medium text-gray-900">{answeredCount}/{totalQuestions} 풀음</p>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Numbers */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <button
                key={i + 1}
                className={`flex-shrink-0 w-8 h-8 rounded-lg font-medium text-xs transition-colors ${
                  i + 1 === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : answeredCount >= i + 1
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
