'use client';

import { StatusBadge } from '@/components/shared/StatusBadge';
import { getRelativeTime, truncateMessage } from '@/lib/utils';
import { cn } from '@/lib/utils';
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
import { useState } from 'react';

const mockLogs = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1),
  type: i % 3 === 0 ? 'incoming' : 'outgoing',
  recipient: `+91 ${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
  message: [
    'Your OTP is 482910. Valid for 5 minutes.',
    'Order #ORD-4829 has been shipped!',
    'Reminder: Appointment tomorrow at 10:00 AM',
    'Payment of ₹2,500 received successfully.',
    'Welcome to SMSHIVE! Your account is ready.',
    'Please confirm your booking.',
  ][i % 6],
  status: ['delivered', 'sent', 'pending', 'failed', 'delivered', 'delivered'][i % 6],
  device: ['Pixel 8 Pro', 'Galaxy S24', 'OnePlus 12', 'Redmi Note 13'][i % 4],
  sim: ['Jio', 'Airtel', 'VI', 'BSNL'][i % 4],
  segments: i % 3 === 2 ? 2 : 1,
  time: new Date(Date.now() - (i * 300000 + Math.random() * 60000)).toISOString(),
}));

export default function LogsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = mockLogs.filter((log) => {
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    const matchesSearch = log.recipient.includes(search) || log.message.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Message Logs</h1>
          <p className="text-muted-foreground mt-1">Complete history of all sent and received messages.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors">
            <Download size={16} /> Export CSV
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors">
            <RefreshCw size={16} />
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
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="delivered">Delivered</option>
            <option value="sent">Sent</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none"
          >
            <option value="all">All Types</option>
            <option value="outgoing">Outgoing</option>
            <option value="incoming">Incoming</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left px-5 py-3 font-medium">Type</th>
                <th className="text-left px-5 py-3 font-medium">Phone</th>
                <th className="text-left px-5 py-3 font-medium">Message</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Device</th>
                <th className="text-left px-5 py-3 font-medium">Seg</th>
                <th className="text-left px-5 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-muted/20 transition-colors group">
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
                  <td className="px-5 py-3.5 font-mono text-xs">{log.recipient}</td>
                  <td className="px-5 py-3.5 max-w-[300px]">
                    <p className="text-xs text-muted-foreground truncate">{log.message}</p>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={log.status} size="sm" /></td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-muted-foreground">{log.device}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{log.segments}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{getRelativeTime(log.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">Showing {filtered.length} of {mockLogs.length} entries</p>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent transition-colors">
              <ChevronLeft size={16} />
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={cn(
                  'h-8 w-8 flex items-center justify-center rounded-md text-sm transition-colors',
                  page === 1 ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-accent'
                )}
              >
                {page}
              </button>
            ))}
            <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
