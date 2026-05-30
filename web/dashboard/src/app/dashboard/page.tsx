'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getRelativeTime, truncateMessage, formatNumber, cn } from '@/lib/utils';
import { api } from '@/lib/api';
import {
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Smartphone,
  CalendarDays,
  Activity,
  Zap,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface SmsLog {
  _id: string;
  recipients: string[];
  message: string;
  status: string;
  type: string;
  deviceId?: string;
  createdAt: string;
  sender?: string;
}

interface Device {
  _id: string;
  deviceId: string;
  name: string;
  status: string;
  batteryLevel?: number;
  activeSims: { slot: number; carrier: string; phoneNumber: string; active: boolean }[];
  messagesSent: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    sentToday: 0,
    delivered: 0,
    failed: 0,
    pending: 0,
    activeDevices: 0,
    thisMonth: 0,
  });
  const [devices, setDevices] = useState<Device[]>([]);
  const [recentMessages, setRecentMessages] = useState<SmsLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Send State
  const [quickPhone, setQuickPhone] = useState('');
  const [quickMessage, setQuickMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, devicesRes, smsRes] = await Promise.all([
          api.get<{ totalSent: number; totalDelivered: number; totalFailed: number; totalPending: number; totalReceived: number }>('/api/v1/sms/stats').catch(() => null),
          api.get<{ data: Device[] }>('/api/v1/devices').catch(() => null),
          api.get<{ data: SmsLog[] }>('/api/v1/sms', { params: { limit: 5 } }).catch(() => null),
        ]);

        if (statsRes) {
          const s = (statsRes as any).data || statsRes;
          setStats({
            sentToday: s.totalSent || 0,
            delivered: s.totalDelivered || 0,
            failed: s.totalFailed || 0,
            pending: s.totalPending || 0,
            activeDevices: devicesRes?.data?.filter((d: any) => d.status === 'online').length || 0,
            thisMonth: (s.totalSent || 0) + (s.totalDelivered || 0) + (s.totalFailed || 0),
          });
        }

        if (devicesRes?.data) {
          setDevices(devicesRes.data);
        }

        if (smsRes?.data) {
          const smsArray = Array.isArray(smsRes.data) ? smsRes.data : (smsRes.data as any).data || [];
          setRecentMessages(smsArray);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleQuickSend = async () => {
    if (!quickPhone || !quickMessage) {
      toast.error('Please enter both a phone number and message.');
      return;
    }

    const onlineDevices = devices.filter(d => d.status === 'online');
    if (onlineDevices.length === 0) {
      toast.error('No online devices available to send SMS. Please connect your Android device.');
      return;
    }

    setSending(true);
    try {
      const selectedDevice = onlineDevices[0]; // Round-robin fallback: just use first active device
      await api.post(`/api/v1/gateway/devices/${selectedDevice.deviceId}/send-sms`, {
        recipients: [quickPhone.trim()],
        message: quickMessage.trim(),
      });
      toast.success('SMS queued successfully!');
      setQuickPhone('');
      setQuickMessage('');
      
      // Instantly refresh recent logs
      const smsRes = await api.get<{ data: SmsLog[] }>('/api/v1/sms', { params: { limit: 5 } }).catch(() => null);
      if (smsRes?.data) {
        const smsArray = Array.isArray(smsRes.data) ? smsRes.data : (smsRes.data as any).data || [];
        setRecentMessages(smsArray);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send SMS.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-48 rounded bg-muted" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-card border border-border" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 h-96 rounded-xl bg-card border border-border" />
          <div className="h-96 rounded-xl bg-card border border-border" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">Here&apos;s your live companion gateway at a glance.</p>
        </div>
        
        {/* Connection status pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-success animate-pulse-glow" />
            <span className="text-xs font-semibold text-foreground">API Gateway: Online</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger-children">
        <StatsCard
          title="Sent Today"
          value={stats.sentToday}
          icon={<Send size={18} />}
          variant="blue"
        />
        <StatsCard
          title="Delivered"
          value={stats.delivered}
          icon={<CheckCircle2 size={18} />}
          variant="emerald"
        />
        <StatsCard
          title="Failed"
          value={stats.failed}
          icon={<XCircle size={18} />}
          variant="purple"
        />
        <StatsCard
          title="Pending"
          value={stats.pending}
          icon={<Clock size={18} />}
          variant="amber"
        />
        <StatsCard
          title="Active Devices"
          value={stats.activeDevices}
          icon={<Smartphone size={18} />}
          variant="violet"
        />
        <StatsCard
          title="Total Processed"
          value={formatNumber(stats.thisMonth)}
          icon={<CalendarDays size={18} />}
          variant="teal"
        />
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column — Recent Messages & Quick Send (2/3 width) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Recent Messages */}
          <div className="glass-card overflow-hidden rounded-2xl shadow-soft border border-border/50">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2.5">
                <Activity size={18} className="text-primary animate-float" />
                <h2 className="text-base font-semibold font-display text-foreground">Recent Activity Logs</h2>
                <span className="flex h-1.5 w-1.5 rounded-full bg-success animate-pulse-glow" />
                <span className="text-xs text-muted-foreground">Live Sync</span>
              </div>
              <Link
                href="/dashboard/logs"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View all logs →
              </Link>
            </div>
            
            {recentMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-muted-foreground text-sm">
                <p>No messages sent yet today.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Send size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium font-mono text-foreground">
                          {msg.type === 'incoming' ? msg.sender : msg.recipients.join(', ')}
                        </span>
                        <StatusBadge status={msg.status} size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {truncateMessage(msg.message, 80)}
                      </p>
                    </div>
                    <div className="hidden sm:block text-right shrink-0">
                      <p className="text-xs font-semibold text-foreground">
                        {msg.type === 'incoming' ? 'Incoming SMS' : 'Carrier Direct'}
                      </p>
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                        {getRelativeTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Send Widget */}
          <div className="glass-card p-6 rounded-2xl shadow-soft border border-border/50">
            <div className="flex items-center gap-2.5 mb-4">
              <Zap size={18} className="text-primary animate-float" />
              <h2 className="text-base font-semibold font-display text-foreground">Quick Test Console</h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="tel"
                value={quickPhone}
                onChange={(e) => setQuickPhone(e.target.value)}
                placeholder="Mobile number (e.g. +919937879162)"
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
              />
              <input
                type="text"
                value={quickMessage}
                onChange={(e) => setQuickMessage(e.target.value)}
                placeholder="Enter quick SMS message contents..."
                className="flex-[2] rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
              />
              <button
                onClick={handleQuickSend}
                disabled={sending}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap disabled:opacity-50"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Send Instant SMS
              </button>
            </div>
          </div>

        </div>

        {/* Right Column — Device List, Streak, and Premium CTA (1/3 width) */}
        <div className="space-y-6">
          
          {/* Active Devices status panel */}
          <div className="glass-card overflow-hidden rounded-2xl shadow-soft border border-border/50">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2.5">
                <Smartphone size={18} className="text-primary animate-float" />
                <h2 className="text-base font-semibold font-display text-foreground">Active Hardware</h2>
              </div>
              <Link
                href="/dashboard/devices"
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Manage Devices
              </Link>
            </div>
            
            {devices.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-muted-foreground text-sm">
                <p>No active gateways registered.</p>
                <Link href="/dashboard/devices" className="text-primary text-xs mt-2 underline">Add device now</Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {devices.map((device) => (
                  <div key={device._id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={device.status === 'online' ? 'status-online' : 'status-offline'} />
                        <span className="text-sm font-semibold text-foreground">{device.name}</span>
                      </div>
                      <StatusBadge status={device.status} showDot={false} />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-medium">
                          🔋 {device.batteryLevel ?? 100}%
                        </span>
                        <span className="font-medium text-foreground/80">
                          📶 {device.activeSims[0]?.carrier || 'No Active SIM'}
                        </span>
                      </div>
                      <span className="font-semibold text-foreground">{formatNumber(device.messagesSent)} Sent</span>
                    </div>

                    {/* Battery indicator progress bar */}
                    <div className="mt-2.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          (device.batteryLevel ?? 100) > 50
                            ? 'bg-success'
                            : (device.batteryLevel ?? 100) > 20
                            ? 'bg-warning'
                            : 'bg-destructive'
                        }`}
                        style={{ width: `${device.batteryLevel ?? 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Streak Card (LectureSnap AI Design System) */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#7C3AED] p-5 text-white shadow-soft border border-indigo-400/20 hover:scale-[1.02] transition-transform duration-300">
            {/* Background elements */}
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/5 rounded-full blur-xl translate-x-4 translate-y-4" />
            <div className="absolute left-6 top-6 w-16 h-16 bg-indigo-300/10 rounded-full blur-lg" />
            
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <h3 className="font-display font-bold text-sm tracking-wide uppercase">Sending Activity Streak</h3>
            </div>
            
            <p className="text-xl font-bold font-display mt-2">5-Day Hot Streak!</p>
            <p className="text-xs text-indigo-100/90 mt-1">
              Your gateway is maintaining sub-second carrier delivery. Keep it hot!
            </p>

            {/* Visual 7-day grid */}
            <div className="mt-4 flex items-center justify-between gap-1 bg-white/10 p-2.5 rounded-xl border border-white/10">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                const isActive = idx < 5; // Mon to Fri active
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-indigo-200">{day}</span>
                    <div
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all',
                        isActive
                          ? 'bg-[#F43F5E] text-white shadow-md shadow-[#F43F5E]/30 scale-105'
                          : 'bg-white/10 text-white/40'
                      )}
                    >
                      {isActive ? '✓' : '•'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pro Premium Upgrade CTA Card (LectureSnap AI Design System) */}
          <div className="rounded-2xl bg-gradient-to-r from-amber-200 to-yellow-400 p-5 text-[#0F172A] shadow-soft border border-amber-300 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
            {/* Gloss shine border overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0" />
            
            <div className="flex items-center justify-between">
              <span className="rounded bg-[#0F172A] px-2 py-0.5 text-[10px] font-bold text-yellow-400 tracking-wider">PRO</span>
              <span className="text-xs font-bold text-[#0F172A]">Priority Access</span>
            </div>

            <h3 className="font-display font-extrabold text-lg mt-2.5 tracking-tight leading-tight">
              Unlock Unlimited Carrier Routing
            </h3>
            
            <p className="text-[11px] text-[#0F172A]/80 font-medium mt-1 leading-snug">
              Get sub-second dispatch priority, infinite dual-SIM automations, and premium multi-agent webhooks.
            </p>

            <button
              onClick={() => toast.success('SMSHIVE Premium checkout loaded successfully!')}
              className="mt-4 w-full rounded-xl bg-[#0F172A] py-2 text-center text-xs font-bold text-white shadow hover:bg-[#1E293B] hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              Upgrade for Unlimited Speed
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
