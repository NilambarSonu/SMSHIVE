'use client';

import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';
import { useApiAuth, useSyncUser } from '@/lib/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize Clerk token for API calls
  useApiAuth();

  // Sync Clerk user with backend MongoDB
  useSyncUser();

  // Route protection is handled by Clerk middleware (src/middleware.ts)
  // No manual auth checks needed here

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — fixed on the left */}
      <Sidebar />

      {/* Main content area — offset by sidebar width */}
      <div className="flex flex-1 flex-col lg:pl-[260px] transition-all duration-300">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="page-enter p-6 lg:p-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
