import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { SonnerToaster } from '@/components/shared/SonnerToaster';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export const metadata: Metadata = {
  title: 'SMSHIVE — Free SMS Gateway',
  description: 'Turn your Android into a professional SMS gateway. Free. Forever. No limits.',
  keywords: ['SMS gateway', 'SMS API', 'Android SMS', 'bulk SMS', 'free SMS gateway', 'textbee alternative'],
  authors: [{ name: 'SMSHIVE' }],
  openGraph: {
    title: 'SMSHIVE — Free SMS Gateway',
    description: 'Turn your Android into a professional SMS gateway. Free. Forever. No limits.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_ZHVtbXkua2V5LmNsZXJrLmFjY291bnRzLmRldiQ"}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#2563EB',
          colorTextOnPrimaryBackground: '#FFFFFF',
          colorBackground: '#0F172A',
          colorInputBackground: '#1E293B',
          colorInputText: '#F8FAFC',
          colorText: '#F8FAFC',
          colorTextSecondary: '#94A3B8',
          colorDanger: '#EF4444',
          colorSuccess: '#10B981',
          borderRadius: '0.75rem',
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        },
        elements: {
          // Hide social login buttons (Email + Password only for MVP)
          socialButtonsBlockButton: { display: 'none' },
          socialButtonsBlockButtonText: { display: 'none' },
          socialButtonsProviderIcon: { display: 'none' },
          dividerRow: { display: 'none' },
          dividerText: { display: 'none' },
          dividerLine: { display: 'none' },
          // Card styling
          card: {
            backgroundColor: 'hsl(222 47% 14% / 0.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid hsl(217 33% 20% / 0.5)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          },
          // Footer branding
          footerAction: {
            '& a': {
              color: '#2563EB',
            },
          },
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        </head>
        <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
          <ThemeProvider>
            {children}
            <SonnerToaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
