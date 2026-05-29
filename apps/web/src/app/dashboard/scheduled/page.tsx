'use client';

import { StatusBadge } from '@/components/shared/StatusBadge';
import { Plus, Clock, Play, Pause, Trash2, Pencil, CalendarDays, RefreshCw } from 'lucide-react';
import { useState } from 'react';

const mockScheduled = [
  { id: '1', recipients: ['+91 98765 43210', '+91 87654 32109'], message: 'Flash Sale! 50% off today only. Shop now at example.com', scheduledAt: new Date(Date.now() + 3600000).toISOString(), recurrence: 'none', status: 'pending' },
  { id: '2', recipients: ['+91 76543 21098'], message: 'Your weekly report is ready. Check your dashboard.', scheduledAt: new Date(Date.now() + 86400000).toISOString(), recurrence: 'weekly', cronExpression: '0 9 * * 1', status: 'active' },
  { id: '3', recipients: ['+91 65432 10987', '+91 54321 09876', '+91 43210 98765'], message: 'Monthly billing reminder: Your payment is due on {date}.', scheduledAt: new Date(Date.now() + 2592000000).toISOString(), recurrence: 'monthly', cronExpression: '0 10 1 * *', status: 'active' },
  { id: '4', recipients: ['+91 98765 43210'], message: 'Good morning! Your daily digest is ready.', scheduledAt: new Date(Date.now() - 86400000).toISOString(), recurrence: 'daily', cronExpression: '0 8 * * *', status: 'paused' },
];

const recurrenceLabels: Record<string, string> = { none: 'One-time', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };

export default function ScheduledPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Scheduled Messages</h1>
          <p className="text-muted-foreground mt-1">Schedule one-time or recurring SMS campaigns.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Plus size={16} /> Schedule Message
        </button>
      </div>

      <div className="space-y-3 stagger-children">
        {mockScheduled.map((item) => (
          <div key={item.id} className="glass-card-hover p-5 group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.status === 'active' ? 'bg-success/10 text-success' : item.status === 'paused' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}>
                  {item.status === 'paused' ? <Pause size={18} /> : <Clock size={18} />}
                </div>
                <div>
                  <p className="text-sm font-medium truncate max-w-md">{item.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{item.recipients.length} recipient{item.recipients.length > 1 ? 's' : ''}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <RefreshCw size={10} /> {recurrenceLabels[item.recurrence]}
                    </span>
                    {item.cronExpression && <code className="text-[10px] font-mono text-muted-foreground/60 bg-muted/50 px-1 rounded">{item.cronExpression}</code>}
                  </div>
                </div>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <div className="flex items-center gap-2 ml-13 text-xs text-muted-foreground">
              <CalendarDays size={12} />
              <span>
                {item.status === 'active' || item.status === 'pending'
                  ? `Next: ${new Date(item.scheduledAt).toLocaleString()}`
                  : `Paused`}
              </span>
            </div>
            <div className="border-t border-border flex divide-x divide-border -mx-5 mt-4">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                {item.status === 'paused' ? <><Play size={12} /> Resume</> : <><Pause size={12} /> Pause</>}
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"><Pencil size={12} /> Edit</button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 size={12} /> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
