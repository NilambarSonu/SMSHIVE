'use client';

import { StatsCard } from '@/components/shared/StatsCard';
import { api } from '@/lib/api';
import {
  BarChart3,
  Send,
  CheckCircle2,
  XCircle,
  TrendingUp,
  RefreshCw,
  Smartphone,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Device {
  _id: string;
  name: string;
  model: string;
  messagesSent: number;
  status: string;
}

interface SMSStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalPending: number;
  totalReceived: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<SMSStats>({
    totalSent: 0,
    totalDelivered: 0,
    totalFailed: 0,
    totalPending: 0,
    totalReceived: 0,
  });
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const [statsRes, devicesRes] = await Promise.all([
        api.get<SMSStats>('/api/v1/sms/stats').catch(() => ({
          totalSent: 0,
          totalDelivered: 0,
          totalFailed: 0,
          totalPending: 0,
          totalReceived: 0,
        })),
        api.get<{ data: Device[] }>('/api/v1/devices').catch(() => ({ data: [] })),
      ]);

      if (statsRes) setStats(statsRes);
      if (devicesRes) setDevices(devicesRes.data || []);
    } catch (err: any) {
      toast.error('Failed to load analytics: ' + (err.message || 'API error'));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const total = stats.totalSent || 0;
  const delivered = stats.totalDelivered || 0;
  const failed = stats.totalFailed || 0;
  const pending = stats.totalPending || 0;

  const successRate = total > 0 ? Number(((delivered / total) * 100).toFixed(1)) : 0;
  const failureRate = total > 0 ? Number(((failed / total) * 100).toFixed(1)) : 0;
  const pendingRate = total > 0 ? Number(((pending / total) * 100).toFixed(1)) : 0;
  const sentRate = total > 0 ? Number((( (total - delivered - failed - pending) / total) * 100).toFixed(1)) : 0;

  const breakdowns = [
    { status: 'Delivered', count: delivered, percentage: successRate, color: 'bg-success' },
    { status: 'Failed', count: failed, percentage: failureRate, color: 'bg-destructive' },
    { status: 'Pending', count: pending, percentage: pendingRate, color: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track messaging performance and delivery insights.</p>
        </div>
        <button
          onClick={() => fetchAnalytics(true)}
          disabled={isRefreshing || loading}
          className="h-10 w-10 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted/10 border border-border rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-muted/10 border border-border rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            <StatsCard
              title="Total Outgoing SMS"
              value={total.toLocaleString()}
              change={0}
              changeLabel="All-time dispatches"
              icon={<Send size={18} />}
            />
            <StatsCard
              title="Delivered"
              value={delivered.toLocaleString()}
              change={successRate}
              changeLabel={`${successRate}% success rate`}
              icon={<CheckCircle2 size={18} />}
            />
            <StatsCard
              title="Failed SMS"
              value={failed.toLocaleString()}
              change={failureRate}
              changeLabel={`${failureRate}% drop rate`}
              icon={<XCircle size={18} />}
            />
            <StatsCard
              title="Incoming Received"
              value={stats.totalReceived.toLocaleString()}
              change={0}
              changeLabel="Received via gateway"
              icon={<TrendingUp size={18} />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Breakdown — 1.5/3 */}
            <div className="lg:col-span-1 glass-card p-5">
              <h2 className="text-base font-bold text-white mb-6">Status Breakdown</h2>
              <div className="space-y-4">
                {breakdowns.map((item) => (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-1.5 font-semibold text-xs text-muted-foreground">
                      <span className="text-white font-bold">{item.status}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono">{item.count.toLocaleString()}</span>
                        <span>({item.percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-1000`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Pie/Donut Chart Simulation */}
              <div className="mt-8 flex items-center justify-center">
                <div className="relative h-32 w-32">
                  <svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="none"
                      stroke="#00D4AA"
                      strokeWidth="3"
                      strokeDasharray={`${successRate} ${100 - successRate}`}
                      strokeDashoffset="0"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-white">{successRate}%</span>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Success</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Device Performance Table — 2/3 */}
            <div className="lg:col-span-2 glass-card overflow-hidden flex flex-col">
              <div className="p-5 border-b border-border">
                <h2 className="text-base font-bold text-white">Device Performance</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Summary of dispatches completed by registered device IDs.</p>
              </div>
              <div className="overflow-x-auto flex-1">
                {devices.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No connected devices found. Sideload the gateway app to view performance logs here.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="text-left px-5 py-3 font-semibold">Device Name</th>
                        <th className="text-left px-5 py-3 font-semibold">Status</th>
                        <th className="text-right px-5 py-3 font-semibold">Total Dispatched</th>
                        <th className="px-5 py-3 font-semibold text-center">Efficiency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {devices.map((device) => (
                        <tr key={device._id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-white">
                            <span className="flex items-center gap-2">
                              <Smartphone size={14} className="text-primary" />
                              {device.name || device.model}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                                device.status === 'online' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {device.status}
                            </span>
                          </td>
                          <td className="text-right px-5 py-3.5 font-mono font-bold text-white">
                            {(device.messagesSent || 0).toLocaleString()}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3 justify-center">
                              <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{
                                    width: `${Math.min(
                                      ((device.messagesSent || 0) / (total || 1)) * 100,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground font-bold">
                                {(
                                  ((device.messagesSent || 0) / (total || 1)) *
                                  100
                                ).toFixed(0)}
                                %
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
