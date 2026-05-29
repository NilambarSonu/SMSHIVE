import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { Toaster } from 'sonner';
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClerkProvider>
          <header className="fixed top-0 right-0 p-4 z-50 flex gap-4">
            <Show when="signed-out">
              <SignInButton />
              <SignUpButton />
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          <ThemeProvider>
            {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--foreground))',
              },
            }}
          />
        </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
