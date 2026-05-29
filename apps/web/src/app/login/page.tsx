import Link from 'next/link';
import { SmshiveLogoFull } from '@/components/shared/Logo';
import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex flex-1 flex-col justify-center px-8 sm:px-16 lg:px-24 py-12">
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          <SmshiveLogoFull className="mb-10 self-start" />
          <SignIn routing="hash" />
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
