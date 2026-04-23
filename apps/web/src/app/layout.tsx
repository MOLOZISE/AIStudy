import type { Metadata } from 'next';
import '../styles/globals.css';
import { TRPCProvider } from '@/components/TRPCProvider';
import { AuthProvider } from '@/components/AuthProvider';
import { ToastContainer } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'AI Study',
  description: 'Excel 문제은행으로 학습하는 AI 스터디 플랫폼',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-[var(--cc-bg)] text-[var(--cc-ink)]">
        <TRPCProvider>
          <AuthProvider>{children}</AuthProvider>
          <ToastContainer />
        </TRPCProvider>
      </body>
    </html>
  );
}
