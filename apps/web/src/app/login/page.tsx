'use client';

import { useAuthStore } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SmshiveLogoFull } from '@/components/shared/Logo';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, register } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEnterDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      try {
        // Try logging in first
        await login('developer@smshive.app', 'DevPass123!');
      } catch (err) {
        // If login fails (user doesn't exist yet), auto-register the dev account
        await register('Developer', 'developer@smshive.app', 'DevPass123!');
      }
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect. Make sure your NestJS api is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex flex-1 flex-col justify-center px-8 sm:px-16 lg:px-24 py-12">
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          <SmshiveLogoFull className="mb-10 self-start" />
          
          <div className="w-full space-y-6 text-center">
            <h1 className="text-3xl font-display font-bold tracking-tight">Welcome to SMSHIVE</h1>
            <p className="text-muted-foreground text-sm">
              Authentication is temporarily bypassed for development. Click below to auto-provision an active dev session.
            </p>
            
            {error && (
              <div className="p-3.5 rounded-lg border border-destructive/20 bg-destructive/10 text-xs text-destructive text-left leading-relaxed">
                ⚠️ {error}
              </div>
            )}

            <button 
              onClick={handleEnterDashboard}
              disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary to-secondary px-6 font-medium text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                'Enter Dashboard 🚀'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right — Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-card/30 border-l border-border relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-secondary/15 rounded-full blur-3xl" />
        <div className="relative text-center p-12">
          <div className="glass-card p-8 max-w-sm mx-auto">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-display font-bold mb-2">Your Gateway Awaits</h3>
            <p className="text-sm text-muted-foreground">
              Turn any Android phone into a powerful SMS gateway. 
              Unlimited messages, unlimited devices, forever free.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">∞</p>
                <p className="text-xs text-muted-foreground">Messages</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">∞</p>
                <p className="text-xs text-muted-foreground">Devices</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">$0</p>
                <p className="text-xs text-muted-foreground">Forever</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
