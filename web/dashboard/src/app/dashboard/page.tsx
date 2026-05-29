'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getRelativeTime, truncateMessage, formatNumber } from '@/lib/utils';
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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s your live gateway at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger-children">
        <StatsCard
          title="Sent Today"
          value={stats.sentToday}
          icon={<Send size={18} />}
        />
        <StatsCard
          title="Delivered"
          value={stats.delivered}
          icon={<CheckCircle2 size={18} />}
        />
        <StatsCard
          title="Failed"
          value={stats.failed}
          icon={<XCircle size={18} />}
        />
        <StatsCard
          title="Pending"
          value={stats.pending}
          icon={<Clock size={18} />}
        />
        <StatsCard
          title="Active Devices"
          value={stats.activeDevices}
          icon={<Smartphone size={18} />}
        />
        <StatsCard
          title="Total Processed"
          value={formatNumber(stats.thisMonth)}
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
              View all
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground text-sm">
              <p>No messages sent yet.</p>
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
                      <span className="text-sm font-medium font-mono">
                        {msg.type === 'incoming' ? msg.sender : msg.recipients.join(', ')}
                      </span>
                      <StatusBadge status={msg.status} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {truncateMessage(msg.message, 60)}
                    </p>
                  </div>
                  <div className="hidden sm:block text-right shrink-0">
                    <p className="text-xs text-muted-foreground">SIM {msg.type === 'incoming' ? 'Received' : 'Outgoing'}</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                      {getRelativeTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Device Status Panel — 1/3 width */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Smartphone size={18} className="text-primary" />
              <h2 className="text-base font-semibold">Active Devices</h2>
            </div>
            <Link
              href="/dashboard/devices"
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Manage
            </Link>
          </div>
          {devices.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground text-sm">
              <p>No devices connected.</p>
              <Link href="/dashboard/devices" className="text-primary text-xs mt-2 underline">Add one now</Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {devices.map((device) => (
                <div key={device._id} className="p-4 hover:bg-muted/30 transition-colors">
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
                        🔋 {device.batteryLevel ?? 100}%
                      </span>
                      <span>{device.activeSims[0]?.carrier || 'No SIM'}</span>
                    </div>
                    <span>{formatNumber(device.messagesSent)} sent</span>
                  </div>
                  {/* Battery bar */}
                  <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
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
            value={quickPhone}
            onChange={(e) => setQuickPhone(e.target.value)}
            placeholder="Phone number (e.g. +919876543210)"
            className="flex-1 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
          />
          <input
            type="text"
            value={quickMessage}
            onChange={(e) => setQuickMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-[2] rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
          />
          <button 
            onClick={handleQuickSend}
            disabled={sending}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap disabled:opacity-50"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
