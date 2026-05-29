'use client';

import { Plus, Webhook, Check, X, Trash2, Pencil, Send, RefreshCw, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const mockWebhooks = [
  { id: '1', url: 'https://api.myapp.com/webhooks/sms', events: ['message_sent', 'message_delivered', 'message_failed'], method: 'POST', enabled: true, failureCount: 0, lastTriggered: new Date(Date.now() - 300000).toISOString() },
  { id: '2', url: 'https://hooks.slack.com/services/T00/B00/xxx', events: ['device_offline', 'message_failed'], method: 'POST', enabled: true, failureCount: 2, lastTriggered: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', url: 'https://mycrm.com/api/sms-received', events: ['message_received'], method: 'POST', enabled: false, failureCount: 5, lastTriggered: new Date(Date.now() - 604800000).toISOString() },
];

const eventLabels: Record<string, string> = { message_sent: 'Sent', message_received: 'Received', message_failed: 'Failed', message_delivered: 'Delivered', device_online: 'Device Online', device_offline: 'Device Offline' };

export default function WebhooksPage() {
  const [showCreate, setShowCreate] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Webhooks</h1>
          <p className="text-muted-foreground mt-1">Receive real-time HTTP callbacks for SMS events.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Plus size={16} /> Add Webhook
        </button>
      </div>

      <div className="space-y-3 stagger-children">
        {mockWebhooks.map((wh) => (
          <div key={wh.id} className="glass-card-hover p-5 group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${wh.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Webhook size={18} />
                </div>
                <div>
                  <code className="text-sm font-mono break-all">{wh.url}</code>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${wh.enabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {wh.enabled ? 'Active' : 'Disabled'}
                    </span>
                    <span className="text-xs text-muted-foreground">· {wh.method}</span>
                    {wh.failureCount > 0 && (
                      <span className="flex items-center gap-1 text-[11px] text-warning">
                        <AlertTriangle size={10} /> {wh.failureCount} failures
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 ml-13 mb-3">
              {wh.events.map((ev) => (
                <span key={ev} className="text-[10px] font-medium bg-primary/10 text-primary rounded px-2 py-0.5">{eventLabels[ev] || ev}</span>
              ))}
            </div>
            <div className="border-t border-border flex divide-x divide-border -mx-5 mt-3">
              <button onClick={() => toast.success('Test webhook sent')} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"><Send size={12} /> Test</button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"><Pencil size={12} /> Edit</button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 size={12} /> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg mx-4 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold">Add Webhook</h2>
              <button onClick={() => setShowCreate(false)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Endpoint URL</label>
                <input type="url" placeholder="https://api.example.com/webhook" className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-mono" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Events</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(eventLabels).map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" defaultChecked={val === 'message_sent'} className="rounded border-border" /> {label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Secret (for HMAC signing)</label>
                <input type="text" placeholder="whsec_..." className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-mono" />
              </div>
              <button className="w-full rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all">Create Webhook</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
