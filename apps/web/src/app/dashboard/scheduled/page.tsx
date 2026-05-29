'use client';

import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { api } from '@/lib/api';
import { Plus, Clock, Play, Pause, Trash2, Pencil, CalendarDays, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ScheduledJob {
  _id: string;
  recipients: string[];
  message: string;
  scheduledAt: string;
  recurrence: string;
  cronExpression?: string;
  status: string;
  createdAt: string;
}

const recurrenceLabels: Record<string, string> = {
  none: 'One-time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export default function ScheduledPage() {
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchScheduledJobs = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const response = await api.get<{ data: ScheduledJob[] }>('/api/v1/scheduled');
      if (response?.data) {
        setScheduledJobs(response.data);
      }
    } catch (err: any) {
      toast.error('Failed to load scheduled jobs: ' + (err.message || 'API error'));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScheduledJobs();
  }, []);

  const handleToggleStatus = async (job: ScheduledJob) => {
    const newStatus = job.status === 'paused' ? 'active' : 'paused';
    try {
      await api.put(`/api/v1/scheduled/${job._id}`, {
        status: newStatus,
      });
      toast.success(`Job ${newStatus === 'active' ? 'resumed' : 'paused'} successfully!`);
      setScheduledJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, status: newStatus } : j))
      );
    } catch (err: any) {
      toast.error('Failed to update scheduled job status: ' + (err.message || 'API error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to cancel and delete this scheduled message?')) {
      return;
    }

    try {
      await api.delete(`/api/v1/scheduled/${id}`);
      toast.success('Scheduled message canceled successfully');
      setScheduledJobs((prev) => prev.filter((j) => j._id !== id));
    } catch (err: any) {
      toast.error('Failed to cancel scheduled message: ' + (err.message || 'API error'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Scheduled Messages</h1>
          <p className="text-muted-foreground mt-1">Schedule one-time or recurring SMS campaigns.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchScheduledJobs(true)}
            disabled={isRefreshing || loading}
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <a
            href="/dashboard/send"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={16} /> Schedule Message
          </a>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card p-5 h-36 animate-pulse bg-muted/10 border-border" />
          ))}
        </div>
      ) : scheduledJobs.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No Scheduled Messages"
          description="Schedule SMS notifications, birthday alerts, or recurring updates easily by composing a message."
          actionLabel="Schedule Message"
          onAction={() => (window.location.href = '/dashboard/send')}
        />
      ) : (
        <div className="space-y-3 stagger-children">
          {scheduledJobs.map((item) => (
            <div key={item._id} className="glass-card-hover p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div
                    onClick={() => handleToggleStatus(item)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl cursor-pointer transition-all ${
                      item.status === 'active' || item.status === 'pending'
                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                        : 'bg-warning/10 text-warning hover:bg-warning/20'
                    }`}
                  >
                    {item.status === 'paused' ? <Pause size={18} /> : <Clock size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white max-w-md select-text">{item.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground font-semibold">
                        {item.recipients?.length || 0} recipient{item.recipients?.length > 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
                        <RefreshCw size={10} /> {recurrenceLabels[item.recurrence] || item.recurrence || 'One-time'}
                      </span>
                      {item.cronExpression && (
                        <code className="text-[10px] font-mono text-muted-foreground/60 bg-muted/50 px-1 rounded font-bold">
                          {item.cronExpression}
                        </code>
                      )}
                    </div>
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <div className="flex items-center gap-2 ml-13 text-xs text-muted-foreground font-semibold">
                <CalendarDays size={12} />
                <span>
                  {item.status === 'active' || item.status === 'pending'
                    ? `Next Dispatch: ${new Date(item.scheduledAt).toLocaleString()}`
                    : `Paused`}
                </span>
              </div>
              <div className="border-t border-border flex divide-x divide-border -mx-5 mt-4">
                <button
                  onClick={() => handleToggleStatus(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors font-medium"
                >
                  {item.status === 'paused' ? (
                    <>
                      <Play size={12} /> Resume
                    </>
                  ) : (
                    <>
                      <Pause size={12} /> Pause
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors font-medium"
                >
                  <Trash2 size={12} /> Cancel & Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
