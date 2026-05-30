'use client';

import { SignUp } from '@clerk/nextjs';
import { SmshiveLogoFull } from '@/components/shared/Logo';
import { Check } from 'lucide-react';

export default function SignUpPage() {
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

      {/* Right — Sign Up Form */}
      <div className="flex flex-1 flex-col justify-center px-8 sm:px-16 lg:px-24 py-12">
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          <SmshiveLogoFull className="mb-10 self-start" />

          <div className="w-full space-y-6">
            <h1 className="text-3xl font-display font-bold tracking-tight">
              Create your account
            </h1>
            <p className="text-muted-foreground text-sm">
              Join thousands of developers using SMSHIVE to power their messaging.
            </p>

            <SignUp
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'w-full shadow-none bg-transparent border-none p-0',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  formButtonPrimary:
                    'bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 rounded-xl h-12 text-base font-medium',
                  formFieldInput:
                    'bg-[hsl(240,14%,14%)] border-[hsl(240,14%,15%)] text-[hsl(240,100%,97%)] rounded-lg focus:border-[#6C63FF] focus:ring-[#6C63FF]/20',
                  formFieldLabel: 'text-[hsl(218,11%,46%)] text-sm',
                  footerActionLink: 'text-[#6C63FF] hover:text-[#8B83FF]',
                  identityPreviewEditButton: 'text-[#6C63FF]',
                  formResendCodeLink: 'text-[#6C63FF]',
                  alert: 'rounded-lg border-destructive/20 bg-destructive/10',
                },
              }}
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              forceRedirectUrl="/dashboard"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
