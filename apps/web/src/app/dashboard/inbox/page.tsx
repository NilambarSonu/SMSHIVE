'use client';

import { StatusBadge } from '@/components/shared/StatusBadge';
import { getRelativeTime, truncateMessage } from '@/lib/utils';
import {
  Inbox as InboxIcon,
  Search,
  Filter,
  MessageSquare,
  ArrowDownLeft,
  Smartphone,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const mockInbox = [
  {
    id: '1', sender: '+91 98765 43210', message: 'Yes, confirmed for tomorrow. Thank you!', device: 'Pixel 8 Pro',
    sim: 'Jio', time: new Date(Date.now() - 60000).toISOString(), read: false,
  },
  {
    id: '2', sender: '+91 87654 32109', message: 'Please send me the invoice for order #4829', device: 'Galaxy S24',
    sim: 'Airtel', time: new Date(Date.now() - 300000).toISOString(), read: false,
  },
  {
    id: '3', sender: '+91 76543 21098', message: 'STOP', device: 'OnePlus 12',
    sim: 'VI', time: new Date(Date.now() - 600000).toISOString(), read: true,
  },
  {
    id: '4', sender: '+91 65432 10987', message: 'Got it, thanks for the update on the shipment!', device: 'Pixel 8 Pro',
    sim: 'Jio', time: new Date(Date.now() - 1800000).toISOString(), read: true,
  },
  {
    id: '5', sender: '+91 54321 09876', message: 'Can you resend the OTP? I didn\'t receive the first one.', device: 'Galaxy S24',
    sim: 'Airtel', time: new Date(Date.now() - 3600000).toISOString(), read: true,
  },
  {
    id: '6', sender: '+91 43210 98765', message: 'Hello, I would like to know more about your service plans.', device: 'OnePlus 12',
    sim: 'BSNL', time: new Date(Date.now() - 7200000).toISOString(), read: true,
  },
];

export default function InboxPage() {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const selected = mockInbox.find((m) => m.id === selectedMessage);
  const filteredMessages = mockInbox.filter((m) =>
    m.sender.includes(searchQuery) || m.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Inbox</h1>
          <p className="text-muted-foreground mt-1">
            Received messages from all devices. <span className="text-primary font-medium">{mockInbox.filter(m => !m.read).length} unread</span>
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Inbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[600px]">
        {/* Message List — 2/5 */}
        <div className="lg:col-span-2 glass-card overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
              <Search size={14} className="text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filteredMessages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelectedMessage(msg.id)}
                className={cn(
                  'w-full text-left px-4 py-3.5 transition-colors hover:bg-muted/30',
                  selectedMessage === msg.id && 'bg-primary/5 border-l-2 border-l-primary',
                  !msg.read && 'bg-primary/[0.02]'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {!msg.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    <span className={cn('text-sm font-mono', !msg.read && 'font-semibold')}>{msg.sender}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{getRelativeTime(msg.time)}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{msg.message}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                    <Smartphone size={10} /> {msg.device}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">· {msg.sim}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message Detail — 3/5 */}
        <div className="lg:col-span-3 glass-card overflow-hidden flex flex-col">
          {selected ? (
            <>
              {/* Detail Header */}
              <div className="p-5 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ArrowDownLeft size={18} />
                    </div>
                    <div>
                      <p className="font-medium font-mono">{selected.sender}</p>
                      <p className="text-xs text-muted-foreground">
                        via {selected.device} · {selected.sim} · {getRelativeTime(selected.time)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status="received" showDot={false} />
                </div>
              </div>
              {/* Message Body */}
              <div className="flex-1 p-6">
                <div className="max-w-md">
                  <div className="rounded-2xl rounded-tl-sm bg-muted/50 border border-border px-5 py-4">
                    <p className="text-sm leading-relaxed">{selected.message}</p>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      {new Date(selected.time).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              {/* Reply Area */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Reply to this number..."
                    className="flex-1 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare size={48} className="mb-4 opacity-30" />
              <p className="text-sm">Select a message to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
