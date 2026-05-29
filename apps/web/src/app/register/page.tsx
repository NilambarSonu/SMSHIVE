'use client';

import { useAuthStore } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SmshiveLogoFull } from '@/components/shared/Logo';
import { Check, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { login, register } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEnterDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      try {
        await login('developer@smshive.app', 'DevPass123!');
      } catch (err) {
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
      {/* Left — Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-card/30 border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-secondary/15 rounded-full blur-3xl" />
        <div className="relative text-center p-12">
          <div className="glass-card p-8 max-w-sm mx-auto">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-display font-bold mb-2">Get Started in Seconds</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Create your free account, install the Android app, 
              and start sending SMS via API immediately.
            </p>
            <div className="space-y-3">
              {['No credit card required', 'All features included', 'Self-hostable'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-success shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex flex-1 flex-col justify-center px-8 sm:px-16 lg:px-24 py-12">
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          <SmshiveLogoFull className="mb-10 self-start" />
          
          <div className="w-full space-y-6 text-center">
            <h1 className="text-3xl font-display font-bold tracking-tight">Create your Account</h1>
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
    </div>
  );
}
