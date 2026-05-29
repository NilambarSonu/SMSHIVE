import Link from 'next/link';
import { SmshiveLogoFull } from '@/components/shared/Logo';
import { Check } from 'lucide-react';
import { SignUp } from '@clerk/nextjs';

export default function RegisterPage() {
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
          <SignUp routing="hash" />
        </div>
      </div>
    </div>
  );
}
