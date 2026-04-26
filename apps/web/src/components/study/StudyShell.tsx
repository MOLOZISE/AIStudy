'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { StudySidebar } from './layout/StudySidebar';
import { StudyTopbar } from './layout/StudyTopbar';

export function StudyShell({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <StudyTopbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <StudySidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl">
            {/* Page Header */}
            <div className="border-b border-gray-200 bg-white px-6 py-8 sm:px-8">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                  {description && (
                    <p className="mt-2 text-sm text-gray-600">{description}</p>
                  )}
                </div>
                {action && <div className="flex-shrink-0">{action}</div>}
              </div>
            </div>

            {/* Page Content */}
            <div className="p-6 sm:p-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
