'use client';

import { StatusBadge } from '@/components/shared/StatusBadge';
import { getRelativeTime } from '@/lib/utils';
import { api } from '@/lib/api';
import {
  Inbox as InboxIcon,
  Search,
  MessageSquare,
  ArrowDownLeft,
  Smartphone,
  RefreshCw,
  Send,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SmsMessage {
  _id: string;
  type: 'incoming' | 'outgoing';
  sender?: string;
  recipients?: string[];
  message: string;
  status: string;
  deviceId?: string;
  deviceName?: string;
  simSlot?: number;
  createdAt: string;
}

export default function InboxPage() {
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reply State
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchInbox = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      // Query incoming SMS messages
      const response = await api.get<{ data: SmsMessage[] }>('/api/v1/sms', {
        params: {
          type: 'incoming',
          limit: 50,
        },
      });

      if (response?.data) {
        const msgArray = Array.isArray(response.data) ? response.data : (response.data as any).data || [];
        setMessages(msgArray);
        if (msgArray.length > 0 && !selectedMessageId) {
          setSelectedMessageId(msgArray[0]._id);
        }
      }
    } catch (err: any) {
      toast.error('Failed to load inbox messages: ' + (err.message || 'API error'));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const handleReply = async () => {
    if (!selected) return;
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setSendingReply(true);
    try {
      const targetDevice = selected.deviceId || 'auto';
      
      await api.post(`/api/v1/gateway/devices/${targetDevice}/send-sms`, {
        recipients: [selected.sender || ''],
        message: replyText.trim(),
        simSlot: selected.simSlot !== undefined ? selected.simSlot : 0,
      });

      toast.success(`Reply queued for dispatch to ${selected.sender}`);
      setReplyText('');
    } catch (err: any) {
      toast.error('Failed to send reply: ' + (err.message || 'API error'));
    } finally {
      setSendingReply(false);
    }
  };

  const selected = messages.find((m) => m._id === selectedMessageId);

  const filteredMessages = messages.filter((m) => {
    const sender = m.sender || '';
    const msg = m.message || '';
    return sender.includes(searchQuery) || msg.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Inbox</h1>
          <p className="text-muted-foreground mt-1">
            Received messages from all registered companion devices.{' '}
            <span className="text-secondary font-bold">Live Feed</span>
          </p>
        </div>
        <button
          onClick={() => fetchInbox(true)}
          disabled={isRefreshing || loading}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-accent text-white transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[600px] animate-pulse">
          <div className="lg:col-span-2 bg-muted/10 border border-border rounded-2xl" />
          <div className="lg:col-span-3 bg-muted/10 border border-border rounded-2xl" />
        </div>
      ) : (
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
                  placeholder="Search inbox..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50 text-white"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No incoming messages found.
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <button
                    key={msg._id}
                    onClick={() => setSelectedMessageId(msg._id)}
                    className={cn(
                      'w-full text-left px-4 py-3.5 transition-colors hover:bg-muted/30 border-l-2',
                      selectedMessageId === msg._id
                        ? 'bg-primary/5 border-l-primary'
                        : 'border-l-transparent'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-white select-all">{msg.sender || 'Unknown'}</span>
                      <span className="text-[10px] text-muted-foreground">{getRelativeTime(msg.createdAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate font-mono">{msg.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1 font-semibold">
                        <Smartphone size={10} /> {msg.deviceName || msg.deviceId || 'Gateway'}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">· SIM {msg.simSlot !== undefined ? msg.simSlot + 1 : 1}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message Detail — 3/5 */}
          <div className="lg:col-span-3 glass-card overflow-hidden flex flex-col justify-between">
            {selected ? (
              <>
                {/* Detail Header */}
                <div className="p-5 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                        <ArrowDownLeft size={18} />
                      </div>
                      <div>
                        <p className="font-bold font-mono text-white select-all">{selected.sender || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground font-semibold">
                          via {selected.deviceName || selected.deviceId || 'Gateway'} · SIM {selected.simSlot !== undefined ? selected.simSlot + 1 : 1} · {getRelativeTime(selected.createdAt)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status="received" showDot={false} />
                  </div>
                </div>

                {/* Message Body */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="max-w-md">
                    <div className="rounded-2xl rounded-tl-sm bg-muted/50 border border-border px-5 py-4">
                      <p className="text-xs font-mono select-all text-white whitespace-pre-wrap leading-relaxed">{selected.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-2 font-semibold">
                        {new Date(selected.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reply Area */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${selected.sender || 'sender'}...`}
                      className="flex-1 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-white font-semibold"
                    />
                    <button
                      onClick={handleReply}
                      disabled={sendingReply || !replyText.trim()}
                      className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {sendingReply ? (
                        <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : (
                        <Send size={14} />
                      )}
                      Reply
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare size={48} className="mb-4 opacity-30 text-primary" />
                <p className="text-sm font-bold">Select a message thread to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
