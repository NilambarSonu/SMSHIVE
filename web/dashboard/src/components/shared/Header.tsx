'use client';

import { UserButton } from '@clerk/nextjs';
import { useAuthUser } from '@/lib/auth';
import { SmshiveLogo } from './Logo';
import {
  Bell,
  Search,
  Moon,
  Sun,
  Menu,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';

export function Header() {
  const { user } = useAuthUser();
  const { theme, setTheme } = useTheme();
  const [showMobileNav, setShowMobileNav] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6">
      {/* Left — Mobile menu + Search */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowMobileNav(!showMobileNav)}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground transition-colors focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search messages, devices..."
            className="w-64 bg-transparent outline-none placeholder:text-muted-foreground/50"
          />
          <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
        </button>

        {/* User Menu — Clerk UserButton */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-foreground leading-none">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {user?.email || ''}
            </p>
          </div>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'h-9 w-9',
                userButtonPopoverCard: 'bg-card/95 backdrop-blur-xl border border-border shadow-2xl shadow-black/20',
                userButtonPopoverActionButton: 'text-muted-foreground hover:bg-accent hover:text-foreground',
                userButtonPopoverActionButtonText: 'text-sm',
                userButtonPopoverFooter: 'hidden',
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
