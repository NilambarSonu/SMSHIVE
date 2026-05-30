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
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#6C63FF',
          colorTextOnPrimaryBackground: '#FFFFFF',
          colorBackground: '#0A0A0F',
          colorInputBackground: '#111118',
          colorInputText: '#F0F0FF',
          colorText: '#F0F0FF',
          colorTextSecondary: '#6B7280',
          colorDanger: '#EF4444',
          colorSuccess: '#00D4AA',
          borderRadius: '0.75rem',
          fontFamily: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
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
            backgroundColor: 'hsl(240 18% 8% / 0.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid hsl(240 14% 15% / 0.5)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          },
          // Footer branding
          footerAction: {
            '& a': {
              color: '#6C63FF',
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
