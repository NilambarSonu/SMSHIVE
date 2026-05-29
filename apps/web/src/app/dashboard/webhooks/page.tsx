'use client';

import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { Plus, Webhook as WebhookIcon, Check, X, Trash2, Pencil, Send, RefreshCw, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Webhook {
  _id: string;
  url: string;
  events: string[];
  method: string;
  enabled: boolean;
  failureCount: number;
  secret: string;
  createdAt: string;
}

const eventLabels: Record<string, string> = {
  message_sent: 'Sent',
  message_received: 'Received',
  message_failed: 'Failed',
  message_delivered: 'Delivered',
  device_online: 'Device Online',
  device_offline: 'Device Offline'
};

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form State
  const [editingWh, setEditingWh] = useState<Webhook | null>(null);
  const [url, setUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['message_sent']);
  const [method, setMethod] = useState('POST');
  const [submitting, setSubmitting] = useState(false);

  const fetchWebhooks = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const response = await api.get<{ data: Webhook[] }>('/api/v1/webhooks');
      if (response?.data) {
        setWebhooks(response.data);
      }
    } catch (err: any) {
      toast.error('Failed to load webhooks: ' + (err.message || 'API error'));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (!url.trim()) {
      toast.error('Please enter an endpoint URL');
      return;
    }

    setSubmitting(true);
    try {
      if (editingWh) {
        const response = await api.put<{ data: Webhook }>(`/api/v1/webhooks/${editingWh._id}`, {
          url,
          events: selectedEvents,
          method,
          secret,
        });
        if (response?.data) {
          toast.success('Webhook updated successfully');
          fetchWebhooks(true);
          setShowCreate(false);
        }
      } else {
        const response = await api.post<{ data: Webhook }>('/api/v1/webhooks', {
          url,
          events: selectedEvents,
          method,
          secret,
        });
        if (response?.data) {
          toast.success('Webhook created successfully');
          fetchWebhooks(true);
          setShowCreate(false);
        }
      }
    } catch (err: any) {
      toast.error('Failed to save webhook: ' + (err.message || 'API error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) {
      return;
    }

    try {
      await api.delete(`/api/v1/webhooks/${id}`);
      toast.success('Webhook deleted successfully');
      setWebhooks((prev) => prev.filter((wh) => wh._id !== id));
    } catch (err: any) {
      toast.error('Failed to delete webhook: ' + (err.message || 'API error'));
    }
  };

  const handleTest = async (id: string) => {
    toast.info('Sending test payload...');
    try {
      await api.post(`/api/v1/webhooks/${id}/test`);
      toast.success('Test webhook sent successfully!');
    } catch (err: any) {
      toast.error('Webhook test failed: ' + (err.message || 'Server error'));
    }
  };

  const handleToggleActive = async (wh: Webhook) => {
    try {
      await api.put(`/api/v1/webhooks/${wh._id}`, {
        enabled: !wh.enabled,
      });
      toast.success(`Webhook ${!wh.enabled ? 'enabled' : 'disabled'}`);
      setWebhooks((prev) =>
        prev.map((w) => (w._id === wh._id ? { ...w, enabled: !w.enabled } : w))
      );
    } catch (err: any) {
      toast.error('Failed to update status: ' + (err.message || 'API error'));
    }
  };

  const handleEventToggle = (ev: string) => {
    setSelectedEvents((prev) =>
      prev.includes(ev) ? prev.filter((item) => item !== ev) : [...prev, ev]
    );
  };

  const openCreateModal = () => {
    setEditingWh(null);
    setUrl('');
    setSecret('');
    setSelectedEvents(['message_sent']);
    setMethod('POST');
    setShowCreate(true);
  };

  const openEditModal = (wh: Webhook) => {
    setEditingWh(wh);
    setUrl(wh.url);
    setSecret(wh.secret || '');
    setSelectedEvents(wh.events || []);
    setMethod(wh.method || 'POST');
    setShowCreate(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Webhooks</h1>
          <p className="text-muted-foreground mt-1">Receive real-time HTTP callbacks for SMS events.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchWebhooks(true)}
            disabled={isRefreshing || loading}
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={16} /> Add Webhook
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card p-5 h-28 animate-pulse bg-muted/10 border-border" />
          ))}
        </div>
      ) : webhooks.length === 0 ? (
        <EmptyState
          icon={WebhookIcon}
          title="No Webhooks"
          description="Register endpoint URLs to receive real-time updates when messages are sent or received."
          actionLabel="Add Webhook"
          onAction={openCreateModal}
        />
      ) : (
        <div className="space-y-3 stagger-children">
          {webhooks.map((wh) => (
            <div key={wh._id} className="glass-card-hover p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div
                    onClick={() => handleToggleActive(wh)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl cursor-pointer transition-all ${
                      wh.enabled ? 'bg-primary/10 text-primary hover:bg-primary/25' : 'bg-muted text-muted-foreground hover:bg-muted/70'
                    }`}
                  >
                    <WebhookIcon size={18} />
                  </div>
                  <div>
                    <code className="text-sm font-mono break-all font-semibold select-all text-white">{wh.url}</code>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => handleToggleActive(wh)}
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded transition-all ${
                          wh.enabled ? 'bg-success/15 text-[#00D4AA]' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {wh.enabled ? 'Active' : 'Disabled'}
                      </button>
                      <span className="text-xs text-muted-foreground">· {wh.method}</span>
                      {wh.failureCount > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-warning font-semibold">
                          <AlertTriangle size={10} /> {wh.failureCount} failures
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 ml-13 mb-3">
                {wh.events?.map((ev) => (
                  <span key={ev} className="text-[10px] font-bold bg-primary/10 text-primary rounded px-2 py-0.5">
                    {eventLabels[ev] || ev}
                  </span>
                ))}
              </div>
              <div className="border-t border-border flex divide-x divide-border -mx-5 mt-3">
                <button
                  onClick={() => handleTest(wh._id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <Send size={12} /> Test
                </button>
                <button
                  onClick={() => openEditModal(wh)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(wh._id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg mx-4 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold">{editingWh ? 'Edit Webhook' : 'Add Webhook'}</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Endpoint URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.example.com/webhook"
                  className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-mono text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Events</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(eventLabels).map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 text-sm cursor-pointer text-white">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(val)}
                        onChange={() => handleEventToggle(val)}
                        className="rounded border-border bg-muted/50"
                      />{' '}
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Secret (for HMAC signing)</label>
                <input
                  type="text"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="whsec_..."
                  className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-mono text-white"
                />
              </div>
              <button
                onClick={handleCreateOrUpdate}
                disabled={submitting}
                className="w-full rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingWh ? 'Update Webhook' : 'Create Webhook'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
