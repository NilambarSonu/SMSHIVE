'use client';

import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';
import { useAuthStore } from '@/lib/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Show loading skeleton while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading SMSHIVE...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  // In development, we'll skip auth check for preview purposes
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev && !isAuthenticated) {
    router.push('/login');
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
