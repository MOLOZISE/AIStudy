import Link from 'next/link';
import { StudyShell } from '@/components/study/StudyShell';

const cards = [
  { href: '/study/library', title: '문제집 업로드', body: 'Excel 원본을 Storage에 저장하고 import job으로 적재 상태를 추적합니다.' },
  { href: '/study/exams', title: '모의고사 세트', body: '07_모의고사_세트매핑으로 구성된 세트를 한 번에 풀고 채점합니다.' },
  { href: '/study/wrong-notes', title: '오답노트', body: '틀린 문항을 자동으로 누적하고 다시 풀 수 있게 모읍니다.' },
  { href: '/study/stats', title: '학습 통계', body: 'attempt 기록을 기반으로 풀이 수, 정답률, 오답 수를 확인합니다.' },
];

export default function StudyHomePage() {
  return (
    <StudyShell
      title="Excel 문제은행 학습"
      description="정식문제은행, 개념마스터, 출제포인트표, 세트매핑을 study 도메인으로 분리해 모바일 풀이 흐름으로 연결합니다."
    >
      <div className="grid gap-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{card.body}</p>
          </Link>
        ))}
      </div>
    </StudyShell>
  );
}
