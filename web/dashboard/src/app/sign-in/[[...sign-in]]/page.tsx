'use client';

import { SignIn } from '@clerk/nextjs';
import { SmshiveLogoFull } from '@/components/shared/Logo';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left — Sign In Form */}
      <div className="flex flex-1 flex-col justify-center px-8 sm:px-16 lg:px-24 py-12">
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          <SmshiveLogoFull className="mb-10 self-start" />

          <div className="w-full space-y-6">
            <h1 className="text-3xl font-display font-bold tracking-tight">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign in to your SMSHIVE account to manage your SMS gateway.
            </p>

            <SignIn
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
              path="/sign-in"
              signUpUrl="/sign-up"
              forceRedirectUrl="/dashboard"
            />
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
