import Link from 'next/link';
import type { ReactNode } from 'react';

const navItems = [
  { href: '/study', label: '홈' },
  { href: '/study/templates', label: '템플릿' },
  { href: '/study/library', label: '문제집' },
  { href: '/study/practice', label: '연습' },
  { href: '/study/exams', label: '모의고사' },
  { href: '/study/wrong-notes', label: '오답' },
  { href: '/study/search', label: '검색' },
  { href: '/study/stats', label: '통계' },
  { href: '/study/growth', label: '성장' },
  { href: '/study/profile', label: '프로필' },
];

export function StudyShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-4 sm:px-6 sm:py-6">
        <header className="sticky top-0 z-10 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link href="/study" className="text-base font-bold tracking-tight">
              Excel 학습
            </Link>
            <nav className="flex items-center gap-1 overflow-x-auto text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-md px-3 py-2 font-medium text-slate-600 hover:bg-white hover:text-slate-950"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <section className="py-6">
          <p className="text-xs font-semibold uppercase text-blue-600">Study MVP</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
          {description ? <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p> : null}
        </section>

        <div className="flex-1 pb-10">{children}</div>
      </div>
    </main>
  );
}
