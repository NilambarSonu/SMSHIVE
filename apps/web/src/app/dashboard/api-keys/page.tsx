'use client';

import { EmptyState } from '@/components/shared/EmptyState';
import { copyToClipboard } from '@/lib/utils';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const mockApiKeys = [
  {
    id: '1', name: 'Production Server', prefix: 'sk_live_Xa9f',
    scopes: ['send_sms', 'receive_sms', 'manage_devices'],
    rateLimit: 100, lastUsed: new Date(Date.now() - 300000).toISOString(),
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2', name: 'Development', prefix: 'sk_test_Bp2k',
    scopes: ['send_sms', 'receive_sms'],
    rateLimit: 10, lastUsed: new Date(Date.now() - 86400000).toISOString(),
    createdAt: '2024-02-20T14:00:00Z',
  },
  {
    id: '3', name: 'Android App', prefix: 'sk_dev_Mn4r',
    scopes: ['send_sms', 'receive_sms', 'manage_devices'],
    rateLimit: 1000, lastUsed: new Date(Date.now() - 60000).toISOString(),
    createdAt: '2024-03-10T09:15:00Z',
  },
];

const scopeLabels: Record<string, string> = {
  send_sms: 'Send SMS',
  receive_sms: 'Receive SMS',
  manage_devices: 'Manage Devices',
  manage_webhooks: 'Webhooks',
  read_logs: 'Read Logs',
};

export default function ApiKeysPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyRevealed, setNewKeyRevealed] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    await copyToClipboard(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateKey = () => {
    setNewKeyRevealed(process.env.NEXT_PUBLIC_API_KEY_PLACEHOLDER || 'your-api-key-will-appear-here');
    toast.success('API Key created successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground mt-1">Manage access tokens for your SMS gateway API.</p>
        </div>
        <button
          onClick={() => { setShowCreateModal(true); setNewKeyRevealed(null); }}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={16} /> Create Key
        </button>
      </div>

      {/* Warning Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4">
        <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-warning">Keep your API keys secure</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Never expose API keys in client-side code. Use environment variables on your server.
          </p>
        </div>
      </div>

      {/* Keys List */}
      <div className="space-y-3 stagger-children">
        {mockApiKeys.map((key) => (
          <div key={key.id} className="glass-card-hover p-5 group">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Key size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{key.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                      {key.prefix}••••••••••••
                    </code>
                    <button
                      onClick={() => handleCopy(key.prefix + '...', key.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copiedId === key.id ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>
              <button className="text-destructive/60 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={16} />
              </button>
            </div>

            {/* Scopes */}
            <div className="flex flex-wrap gap-1.5 mt-3 ml-13">
              {key.scopes.map((scope) => (
                <span
                  key={scope}
                  className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-medium"
                >
                  <Shield size={10} />
                  {scopeLabels[scope] || scope}
                </span>
              ))}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 mt-3 ml-13 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock size={12} /> Rate: {key.rateLimit} req/min
              </span>
              <span>Last used: {new Date(key.lastUsed).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg mx-4 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold">
                {newKeyRevealed ? 'API Key Created' : 'Create API Key'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground"
              >
                ✕
              </button>
            </div>

            {newKeyRevealed ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                  <p className="text-sm font-medium text-warning mb-1">⚠️ Copy this key now</p>
                  <p className="text-xs text-muted-foreground">You won&apos;t be able to see it again.</p>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 border border-border p-3">
                  <code className="flex-1 text-sm font-mono break-all">{newKeyRevealed}</code>
                  <button
                    onClick={() => handleCopy(newKeyRevealed, 'new')}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white shrink-0"
                  >
                    {copiedId === 'new' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-full rounded-lg bg-card border border-border px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Key Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Production Server"
                    className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Rate Limit (requests/minute)</label>
                  <input
                    type="number"
                    defaultValue={100}
                    className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Scopes</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(scopeLabels).map(([value, label]) => (
                      <label key={value} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" defaultChecked={value === 'send_sms'} className="rounded border-border" />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleCreateKey}
                  className="w-full rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                >
                  Generate API Key
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
