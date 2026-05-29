'use client';

import { StatusBadge } from '@/components/shared/StatusBadge';
import { getRelativeTime, truncateMessage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import {
  ScrollText,
  Search,
  Filter,
  Download,
  Send,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface SmsLog {
  _id: string;
  type: 'incoming' | 'outgoing';
  recipients?: string[];
  sender?: string;
  message: string;
  status: string;
  deviceId?: string;
  deviceName?: string;
  simSlot?: number;
  createdAt: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const limit = 15;

  const fetchLogs = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const params: Record<string, string | number | boolean | undefined> = {
        page,
        limit,
      };

      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (search.trim()) params.search = search.trim();

      const response = await api.get<{
        data: SmsLog[];
        total: number;
        pages: number;
      }>('/api/v1/sms', { params });

      if (response?.data) {
        const smsData = response.data as any;
        const logsArray = Array.isArray(smsData) ? smsData : smsData.data || [];
        const total = Array.isArray(smsData) ? smsData.length : smsData.total || 0;
        const totalPages = Array.isArray(smsData) ? 1 : smsData.totalPages || 1;

        setLogs(logsArray);
        setTotalEntries(total);
        setTotalPages(totalPages);
      }
    } catch (err: any) {
      toast.error('Failed to load logs: ' + (err.message || 'API error'));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, statusFilter, typeFilter]);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchLogs(true);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.error('No logs available to export');
      return;
    }

    const headers = 'ID,Type,Phone,Message,Status,Device,Sim,Segments,Time\n';
    const rows = logs
      .map((log) => {
        const phone = log.type === 'outgoing' ? (log.recipients?.join(';') || '') : (log.sender || '');
        const cleanMsg = log.message.replace(/"/g, '""');
        return `"${log._id}","${log.type}","${phone}","${cleanMsg}","${log.status}","${log.deviceName || log.deviceId || 'Auto'}","SIM ${log.simSlot || 1}","1","${log.createdAt}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `smshive-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Logs exported to CSV successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Message Logs</h1>
          <p className="text-muted-foreground mt-1">Complete history of all sent and received messages.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent transition-colors"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={() => fetchLogs(true)}
            disabled={isRefreshing || loading}
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm flex-1">
          <Search size={14} className="text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by phone or message..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50 text-white font-mono"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none text-white font-semibold cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="delivered">Delivered</option>
            <option value="sent">Sent</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => {
              setPage(1);
              setTypeFilter(e.target.value);
            }}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none text-white font-semibold cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="outgoing">Outgoing</option>
            <option value="incoming">Incoming</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            <div className="h-6 bg-muted/20 rounded w-1/4" />
            <div className="h-10 bg-muted/20 rounded" />
            <div className="h-10 bg-muted/20 rounded" />
            <div className="h-10 bg-muted/20 rounded" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/10 text-muted-foreground mb-4">
              <ScrollText size={24} />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">No logs match filters</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              When messages are sent through the gateway or incoming texts are received, they will populate here.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left px-5 py-3 font-semibold">Type</th>
                    <th className="text-left px-5 py-3 font-semibold">Phone</th>
                    <th className="text-left px-5 py-3 font-semibold">Message</th>
                    <th className="text-left px-5 py-3 font-semibold">Status</th>
                    <th className="text-left px-5 py-3 font-semibold">Device</th>
                    <th className="text-left px-5 py-3 font-semibold">Sim</th>
                    <th className="text-left px-5 py-3 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => {
                    const phone = log.type === 'outgoing' ? (log.recipients?.[0] || 'Unknown') : (log.sender || 'Unknown');
                    const hasMoreRecipients = log.type === 'outgoing' && log.recipients && log.recipients.length > 1;

                    return (
                      <tr key={log._id} className="hover:bg-muted/20 transition-colors group">
                        <td className="px-5 py-3.5">
                          {log.type === 'outgoing' ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                              <Send size={12} />
                            </div>
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary/10 text-secondary">
                              <ArrowDownLeft size={12} />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-white">
                          {phone}
                          {hasMoreRecipients && (
                            <span className="text-[10px] ml-1 bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                              +{log.recipients!.length - 1} more
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 max-w-[300px]">
                          <p className="text-xs text-muted-foreground truncate font-mono select-all select-text">{log.message}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={log.status} size="sm" />
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-white font-medium">{log.deviceName || log.deviceId || 'Auto'}</span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-muted-foreground font-semibold">
                          SIM {log.simSlot !== undefined ? log.simSlot : 1}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                          {getRelativeTime(log.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Showing {logs.length} of {totalEntries} entries
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                    .map((p, idx, arr) => {
                      const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                      return (
                        <div key={p} className="flex items-center">
                          {showEllipsis && <span className="px-1 text-muted-foreground text-xs">...</span>}
                          <button
                            onClick={() => setPage(p)}
                            className={cn(
                              'h-8 w-8 flex items-center justify-center rounded-md text-sm font-semibold transition-colors',
                              p === page ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-accent'
                            )}
                          >
                            {p}
                          </button>
                        </div>
                      );
                    })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent transition-colors disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
