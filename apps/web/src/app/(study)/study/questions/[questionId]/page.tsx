import { use } from 'react';
import { StudyShell } from '@/components/study/StudyShell';
import { QuestionPractice } from '@/components/study/QuestionPractice';
import { CommentThread } from '@/components/study/CommentThread';

export default function StudyQuestionPage({ params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = use(params);

  return (
    <StudyShell title="1문항 풀이" description="모바일에서 한 화면에 한 문항씩 푸는 기본 풀이 화면입니다.">
      <QuestionPractice questionId={questionId} />
      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">댓글</h2>
        <CommentThread targetType="question" targetId={questionId} />
      </div>
    </StudyShell>
  );
}
