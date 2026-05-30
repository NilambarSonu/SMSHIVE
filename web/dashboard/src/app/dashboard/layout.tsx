'use client';

import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';
import { useApiAuth, useSyncUser, useAuthUser } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuthUser();
  const router = useRouter();

  // Initialize Clerk token for API calls
  useApiAuth();

  // Sync Clerk user with backend MongoDB
  useSyncUser();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/sign-in');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Initializing session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
