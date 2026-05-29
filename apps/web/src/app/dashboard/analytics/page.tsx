'use client';

import { StatsCard } from '@/components/shared/StatsCard';
import {
  BarChart3,
  Send,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Calendar,
  Download,
} from 'lucide-react';
import { useState } from 'react';

const mockChartData = {
  daily: [
    { date: 'Mon', sent: 420, delivered: 400, failed: 12 },
    { date: 'Tue', sent: 380, delivered: 365, failed: 8 },
    { date: 'Wed', sent: 510, delivered: 490, failed: 15 },
    { date: 'Thu', sent: 620, delivered: 605, failed: 10 },
    { date: 'Fri', sent: 700, delivered: 680, failed: 18 },
    { date: 'Sat', sent: 290, delivered: 278, failed: 5 },
    { date: 'Sun', sent: 180, delivered: 175, failed: 3 },
  ],
};

const mockBreakdown = [
  { status: 'Delivered', count: 24893, percentage: 93.2, color: 'bg-success' },
  { status: 'Sent', count: 982, percentage: 3.7, color: 'bg-primary' },
  { status: 'Pending', count: 456, percentage: 1.7, color: 'bg-yellow-500' },
  { status: 'Failed', count: 378, percentage: 1.4, color: 'bg-destructive' },
];

const mockDeviceStats = [
  { name: 'Pixel 8 Pro', sent: 8420, delivered: 8102, rate: 96.2 },
  { name: 'Galaxy S24', sent: 12350, delivered: 11890, rate: 96.3 },
  { name: 'OnePlus 12', sent: 5200, delivered: 4980, rate: 95.8 },
  { name: 'Redmi Note 13', sent: 2481, delivered: 2340, rate: 94.3 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');

  const maxSent = Math.max(...mockChartData.daily.map((d) => d.sent));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track messaging performance and delivery insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-primary text-white'
                    : 'bg-card text-muted-foreground hover:bg-accent'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatsCard
          title="Total Sent"
          value="26,709"
          change={12.5}
          changeLabel="vs last period"
          icon={<Send size={18} />}
        />
        <StatsCard
          title="Delivered"
          value="24,893"
          change={8.3}
          changeLabel="93.2% rate"
          icon={<CheckCircle2 size={18} />}
        />
        <StatsCard
          title="Failed"
          value="378"
          change={-15.2}
          changeLabel="vs last period"
          icon={<XCircle size={18} />}
        />
        <StatsCard
          title="Avg Delivery Time"
          value="2.4s"
          change={-20}
          changeLabel="faster"
          icon={<TrendingUp size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart — 2/3 */}
        <div className="xl:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" />
              Messages Over Time
            </h2>
          </div>
          {/* Simple CSS bar chart */}
          <div className="space-y-3">
            {mockChartData.daily.map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground w-8">{day.date}</span>
                <div className="flex-1 flex gap-1 items-center">
                  {/* Delivered bar */}
                  <div
                    className="h-6 rounded bg-success/60 transition-all duration-700 flex items-center justify-end pr-2"
                    style={{ width: `${(day.delivered / maxSent) * 100}%` }}
                  >
                    <span className="text-[10px] text-white font-medium">{day.delivered}</span>
                  </div>
                  {/* Failed bar */}
                  <div
                    className="h-6 rounded bg-destructive/60 transition-all duration-700"
                    style={{ width: `${(day.failed / maxSent) * 100}%`, minWidth: day.failed > 0 ? '20px' : '0' }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">{day.sent}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-success/60" /> Delivered</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-destructive/60" /> Failed</span>
          </div>
        </div>

        {/* Status Breakdown — 1/3 */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold mb-6">Status Breakdown</h2>
          <div className="space-y-4">
            {mockBreakdown.map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium">{item.status}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{item.count.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
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

          {/* Donut-like visual */}
          <div className="mt-8 flex items-center justify-center">
            <div className="relative h-32 w-32">
              <svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="hsl(var(--success))"
                  strokeWidth="3"
                  strokeDasharray={`${93.2} ${100 - 93.2}`}
                  strokeDashoffset="0"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">93.2%</span>
                <span className="text-[10px] text-muted-foreground">Delivery Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Performance Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-base font-semibold">Device Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left px-5 py-3 font-medium">Device</th>
                <th className="text-right px-5 py-3 font-medium">Sent</th>
                <th className="text-right px-5 py-3 font-medium">Delivered</th>
                <th className="text-right px-5 py-3 font-medium">Success Rate</th>
                <th className="px-5 py-3 font-medium">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockDeviceStats.map((device) => (
                <tr key={device.name} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{device.name}</td>
                  <td className="text-right px-5 py-3.5 font-mono text-muted-foreground">{device.sent.toLocaleString()}</td>
                  <td className="text-right px-5 py-3.5 font-mono text-muted-foreground">{device.delivered.toLocaleString()}</td>
                  <td className="text-right px-5 py-3.5">
                    <span className="text-success font-medium">{device.rate}%</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-2 w-full max-w-[120px] rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-success transition-all duration-700"
                        style={{ width: `${device.rate}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
