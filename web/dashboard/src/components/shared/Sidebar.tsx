'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SmshiveLogo } from './Logo';
import {
  LayoutDashboard,
  Smartphone,
  Send,
  Inbox,
  Users,
  Clock,
  FileText,
  Contact,
  Webhook,
  Key,
  BarChart3,
  ScrollText,
  UsersRound,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  UserCircle,
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Devices', href: '/dashboard/devices', icon: Smartphone },
  { label: 'Send SMS', href: '/dashboard/send', icon: Send },
  { label: 'Inbox', href: '/dashboard/inbox', icon: Inbox },
  { label: 'Bulk SMS', href: '/dashboard/bulk', icon: Users },
  { type: 'separator' as const, label: 'Automation' },
  { label: 'Scheduled', href: '/dashboard/scheduled', icon: Clock },
  { label: 'Templates', href: '/dashboard/templates', icon: FileText },
  { label: 'Contacts', href: '/dashboard/contacts', icon: Contact },
  { type: 'separator' as const, label: 'Developer' },
  { label: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook },
  { label: 'API Keys', href: '/dashboard/api-keys', icon: Key },
  { type: 'separator' as const, label: 'Insights' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Logs', href: '/dashboard/logs', icon: ScrollText },
  { type: 'separator' as const, label: 'Account' },
  { label: 'Profile', href: '/dashboard/user-profile', icon: UserCircle },
  { label: 'Team', href: '/dashboard/team', icon: UsersRound },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <SmshiveLogo size={32} className="shrink-0" />
          {!collapsed && (
            <span className="font-display text-lg font-bold tracking-tight bg-gradient-to-r from-[#6C63FF] to-[#00D4AA] bg-clip-text text-transparent whitespace-nowrap">
              SMSHIVE
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {NAV_ITEMS.map((item, index) => {
            if ('type' in item && item.type === 'separator') {
              if (collapsed) return <div key={index} className="my-3 border-t border-sidebar-border" />;
              return (
                <div key={index} className="px-3 py-2 mt-4 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    {item.label}
                  </span>
                </div>
              );
            }

            if (!('href' in item)) return null;

            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  collapsed && 'justify-center px-0',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  size={20}
                  className={cn(
                    'shrink-0 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'
                  )}
                />
                {!collapsed && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
                {isActive && !collapsed && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer — Quick Send */}
      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/dashboard/send"
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]',
            collapsed && 'px-2'
          )}
        >
          <Zap size={18} />
          {!collapsed && <span>Quick Send</span>}
        </Link>
      </div>
    </aside>
  );
}
