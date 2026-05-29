'use client';

import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getRelativeTime, truncateMessage, formatNumber } from '@/lib/utils';
import {
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Smartphone,
  CalendarDays,
  ArrowUpRight,
  Activity,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

// Mock data for initial UI (will be replaced with API calls)
const mockStats = {
  sentToday: 1247,
  delivered: 1189,
  failed: 23,
  pending: 35,
  activeDevices: 4,
  thisMonth: 28451,
  sentTodayChange: 12.5,
  deliveredChange: 8.3,
  failedChange: -15.2,
  activeDevicesChange: 0,
};

const mockRecentMessages = [
  { id: '1', to: '+91 98765 43210', message: 'Your OTP is 482910. Valid for 5 minutes.', status: 'delivered', device: 'Pixel 8 Pro', time: new Date(Date.now() - 30000).toISOString() },
  { id: '2', to: '+91 87654 32109', message: 'Your order #ORD-4829 has been shipped! Track at...', status: 'sent', device: 'Galaxy S24', time: new Date(Date.now() - 120000).toISOString() },
  { id: '3', to: '+91 76543 21098', message: 'Reminder: Your appointment is tomorrow at 10:00 AM', status: 'pending', device: 'OnePlus 12', time: new Date(Date.now() - 180000).toISOString() },
  { id: '4', to: '+91 65432 10987', message: 'Payment of ₹2,500 received. Balance: ₹15,230', status: 'delivered', device: 'Pixel 8 Pro', time: new Date(Date.now() - 300000).toISOString() },
  { id: '5', to: '+91 54321 09876', message: 'Welcome to SMSHIVE! Your account is ready.', status: 'failed', device: 'Galaxy S24', time: new Date(Date.now() - 600000).toISOString() },
];

const mockDevices = [
  { id: '1', name: 'Pixel 8 Pro', status: 'online', battery: 85, sim: 'Jio', messagesSent: 8420, lastSeen: new Date().toISOString() },
  { id: '2', name: 'Galaxy S24', status: 'online', battery: 62, sim: 'Airtel', messagesSent: 12350, lastSeen: new Date().toISOString() },
  { id: '3', name: 'OnePlus 12', status: 'online', battery: 94, sim: 'VI', messagesSent: 5200, lastSeen: new Date().toISOString() },
  { id: '4', name: 'Redmi Note 13', status: 'offline', battery: 15, sim: 'BSNL', messagesSent: 2481, lastSeen: new Date(Date.now() - 3600000).toISOString() },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s your gateway at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger-children">
        <StatsCard
          title="Sent Today"
          value={mockStats.sentToday}
          change={mockStats.sentTodayChange}
          changeLabel="vs yesterday"
          icon={<Send size={18} />}
        />
        <StatsCard
          title="Delivered"
          value={mockStats.delivered}
          change={mockStats.deliveredChange}
          changeLabel="delivery rate"
          icon={<CheckCircle2 size={18} />}
        />
        <StatsCard
          title="Failed"
          value={mockStats.failed}
          change={mockStats.failedChange}
          changeLabel="vs yesterday"
          icon={<XCircle size={18} />}
        />
        <StatsCard
          title="Pending"
          value={mockStats.pending}
          icon={<Clock size={18} />}
        />
        <StatsCard
          title="Active Devices"
          value={mockStats.activeDevices}
          icon={<Smartphone size={18} />}
        />
        <StatsCard
          title="This Month"
          value={formatNumber(mockStats.thisMonth)}
          change={22.1}
          changeLabel="vs last month"
          icon={<CalendarDays size={18} />}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Messages — 2/3 width */}
        <div className="xl:col-span-2 glass-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              <h2 className="text-base font-semibold">Recent Messages</h2>
              <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
            <Link
              href="/dashboard/logs"
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {mockRecentMessages.map((msg, index) => (
              <div
                key={msg.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Send size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium font-mono">{msg.to}</span>
                    <StatusBadge status={msg.status} size="sm" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {truncateMessage(msg.message, 60)}
                  </p>
                </div>
                <div className="hidden sm:block text-right shrink-0">
                  <p className="text-xs text-muted-foreground">{msg.device}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                    {getRelativeTime(msg.time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Status Panel — 1/3 width */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Smartphone size={18} className="text-primary" />
              <h2 className="text-base font-semibold">Devices</h2>
            </div>
            <Link
              href="/dashboard/devices"
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Manage <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {mockDevices.map((device) => (
              <div key={device.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={device.status === 'online' ? 'status-online' : 'status-offline'} />
                    <span className="text-sm font-medium">{device.name}</span>
                  </div>
                  <StatusBadge status={device.status} showDot={false} />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      🔋 {device.battery}%
                    </span>
                    <span>{device.sim}</span>
                  </div>
                  <span>{formatNumber(device.messagesSent)} sent</span>
                </div>
                {/* Battery bar */}
                <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      device.battery > 50
                        ? 'bg-success'
                        : device.battery > 20
                        ? 'bg-warning'
                        : 'bg-destructive'
                    }`}
                    style={{ width: `${device.battery}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Send Widget */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} className="text-primary" />
          <h2 className="text-base font-semibold">Quick Send</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="tel"
            placeholder="Phone number (e.g. +91 98765 43210)"
            className="flex-1 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
          />
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-[2] rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
          />
          <button className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap">
            <Send size={16} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
