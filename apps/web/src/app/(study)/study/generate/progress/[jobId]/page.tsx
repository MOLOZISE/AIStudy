'use client';

import { StudyShell } from '@/components/study/StudyShell';
import { SectionCard } from '@/components/study/shared';
import { GenerationProgressStepper } from '@/components/study/generation/GenerationProgressStepper';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

// Mock job polling for UI development
const mockGenerationJob = {
  id: 'job_abc123',
  currentStep: 2,
  progress: 45,
  estimatedSeconds: 180,
  questionCounts: {
    mcq: 15,
    shortAnswer: 8,
    essay: 4,
  },
};

export default function GenerationProgressPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);

  // Mock: increment progress every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setStep(4);
          return 100;
        }
        const increment = Math.random() * 15 + 5;
        const next = Math.min(prev + increment, 100);
        const newStep = Math.ceil((next / 100) * 4);
        setStep(newStep);
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <StudyShell
      title="문제 생성 중"
      description={`생성 작업 ID: ${jobId}`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <SectionCard>
          <GenerationProgressStepper
            currentStep={step}
            progress={Math.round(progress)}
            estimatedSeconds={mockGenerationJob.estimatedSeconds}
            questionCounts={mockGenerationJob.questionCounts}
          />
        </SectionCard>

        <div className="flex gap-3">
          <button className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium">
            백그라운드에서 계속
          </button>
        </div>
      </div>
    </StudyShell>
  );
}
