'use client';

import { UserProfile } from '@clerk/nextjs';

export default function UserProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Profile & Security</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account settings, password, and email verification.
        </p>
      </div>

      <UserProfile
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'w-full shadow-none bg-transparent border-none',
            navbar: 'hidden',
            navbarMobileMenuButton: 'hidden',
            pageScrollBox: 'p-0',
            page: 'gap-6',
            profileSection: 'glass-card p-6',
            formButtonPrimary:
              'bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 rounded-xl h-10 text-sm font-medium',
            formFieldInput:
              'bg-[hsl(240,14%,14%)] border-[hsl(240,14%,15%)] text-[hsl(240,100%,97%)] rounded-lg focus:border-[#6C63FF] focus:ring-[#6C63FF]/20',
            formFieldLabel: 'text-[hsl(218,11%,46%)] text-sm',
            headerTitle: 'text-foreground font-display font-bold',
            headerSubtitle: 'text-muted-foreground',
            // Hide social connection sections (MVP: email+password only)
            socialButtonsBlockButton: { display: 'none' },
            socialButtonsBlockButtonText: { display: 'none' },
            socialButtonsProviderIcon: { display: 'none' },
          },
        }}
        routing="path"
        path="/dashboard/user-profile"
      />
    </div>
  );
}
