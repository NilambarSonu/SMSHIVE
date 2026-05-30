'use client';

import { EmptyState } from '@/components/shared/EmptyState';
import { copyToClipboard } from '@/lib/utils';
import { api } from '@/lib/api';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Shield,
  Clock,
  AlertTriangle,
  RefreshCw,
  Code2,
  Terminal,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ApiKey {
  _id: string;
  name: string;
  key?: string;
  prefix: string;
  scopes: string[];
  rateLimit: number;
  lastUsed?: string;
  createdAt: string;
}

const scopeLabels: Record<string, string> = {
  send_sms: 'Send SMS',
  receive_sms: 'Receive SMS',
  manage_devices: 'Manage Devices',
  manage_webhooks: 'Webhooks',
  read_logs: 'Read Logs',
};

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyRevealed, setNewKeyRevealed] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form State
  const [keyName, setKeyName] = useState('');
  const [rateLimit, setRateLimit] = useState(100);
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['send_sms']);
  const [creating, setCreating] = useState(false);

  // Integration Snippets State
  const [activeTab, setActiveTab] = useState<'curl' | 'js' | 'python' | 'php'>('curl');
  const [integrationDeviceId, setIntegrationDeviceId] = useState('YOUR_DEVICE_ID');
  const [integrationApiKey, setIntegrationApiKey] = useState('YOUR_API_KEY');
  const [copiedIntegration, setCopiedIntegration] = useState(false);

  const codeSnippets = {
    curl: `curl -X POST "https://smshive.nilambarsonu.me/api/v1/gateway/devices/${integrationDeviceId}/send-sms" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${integrationApiKey}" \\
  -d '{
    "recipients": ["+919937879162"],
    "message": "Your OTP verification code is: 482910. Powered by SMSHIVE.",
    "simSlot": 0
  }'`,
    js: `// Install dependencies if needed: npm install
const sendSMS = async () => {
  const response = await fetch("https://smshive.nilambarsonu.me/api/v1/gateway/devices/${integrationDeviceId}/send-sms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "${integrationApiKey}"
    },
    body: JSON.stringify({
      recipients: ["+919937879162"],
      message: "Your OTP verification code is: 482910. Powered by SMSHIVE.",
      simSlot: 0
    })
  });

  const result = await response.json();
  console.log(result);
};

sendSMS();`,
    python: `import requests

url = "https://smshive.nilambarsonu.me/api/v1/gateway/devices/${integrationDeviceId}/send-sms"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "${integrationApiKey}"
}
payload = {
    "recipients": ["+919937879162"],
    "message": "Your OTP verification code is: 482910. Powered by SMSHIVE.",
    "simSlot": 0
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
    php: `<?php
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "https://smshive.nilambarsonu.me/api/v1/gateway/devices/${integrationDeviceId}/send-sms",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS => json_encode([
    "recipients" => ["+919937879162"],
    "message" => "Your OTP verification code is: 482910. Powered by SMSHIVE.",
    "simSlot" => 0
  ]),
  CURLOPT_HTTPHEADER => [
    "Content-Type: application/json",
    "x-api-key: ${integrationApiKey}"
  ],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}
`
  };

  const fetchApiKeys = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const response = await api.get<{ data: ApiKey[] }>('/api/v1/api-keys');
      if (response?.data) {
        setApiKeys(response.data);
      }
    } catch (err: any) {
      toast.error('Failed to load API keys: ' + (err.message || 'API error'));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const handleCopy = async (text: string, id: string) => {
    await copyToClipboard(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateKey = async () => {
    if (!keyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    setCreating(true);
    try {
      const response = await api.post<{ data: ApiKey }>('/api/v1/api-keys', {
        name: keyName,
        scopes: selectedScopes,
        rateLimit,
      });

      if (response?.data) {
        const generatedKey = response.data.key || 'key-not-returned';
        setNewKeyRevealed(generatedKey);
        setIntegrationApiKey(generatedKey);
        toast.success('API Key generated successfully');
        fetchApiKeys(true);
      }
    } catch (err: any) {
      toast.error('Failed to create API key: ' + (err.message || 'API error'));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/api/v1/api-keys/${id}`);
      toast.success('API key revoked successfully');
      setApiKeys((prev) => prev.filter((k) => k._id !== id));
    } catch (err: any) {
      toast.error('Failed to revoke API key: ' + (err.message || 'API error'));
    }
  };

  const handleScopeToggle = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground mt-1">Manage access tokens for your SMS gateway API.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchApiKeys(true)}
            disabled={isRefreshing || loading}
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => {
              setShowCreateModal(true);
              setNewKeyRevealed(null);
              setKeyName('');
              setRateLimit(100);
              setSelectedScopes(['send_sms']);
            }}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={16} /> Create Key
          </button>
        </div>
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
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card p-5 h-32 animate-pulse bg-muted/10 border-border" />
          ))}
        </div>
      ) : apiKeys.length === 0 ? (
        <EmptyState
          icon={<Key size={24} />}
          title="No API Keys"
          description="Create your first API key to start connecting external apps to SMSHIVE."
          action={
            <button
              onClick={() => {
                setShowCreateModal(true);
                setNewKeyRevealed(null);
                setKeyName('');
                setRateLimit(100);
                setSelectedScopes(['send_sms']);
              }}
              className="rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Create API Key
            </button>
          }
        />
      ) : (
        <div className="space-y-3 stagger-children">
          {apiKeys.map((key) => (
            <div key={key._id} className="glass-card-hover p-5 group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Key size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{key.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded font-bold">
                        {key.prefix}••••••••••••
                      </code>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteKey(key._id)}
                  className="text-destructive/60 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Scopes */}
              <div className="flex flex-wrap gap-1.5 mt-3 ml-13">
                {key.scopes?.map((scope) => (
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
                {key.lastUsed && (
                  <span>Last used: {new Date(key.lastUsed).toLocaleString()}</span>
                )}
                <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dynamic API Integration Guide Card */}
      <div className="glass-card p-6 border-border mt-8 stagger-item">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Code2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-white">API Integration Guide</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Copy-paste code to integrate SMS OTP verification into any application.</p>
          </div>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Device ID
            </label>
            <input
              type="text"
              value={integrationDeviceId}
              onChange={(e) => setIntegrationDeviceId(e.target.value)}
              placeholder="YOUR_DEVICE_ID"
              className="w-full rounded-lg border border-border bg-muted/20 px-3.5 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-mono text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              API Key
            </label>
            <input
              type="text"
              value={integrationApiKey}
              onChange={(e) => setIntegrationApiKey(e.target.value)}
              placeholder="YOUR_API_KEY"
              className="w-full rounded-lg border border-border bg-muted/20 px-3.5 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-mono text-white"
            />
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-border mb-4 overflow-x-auto scrollbar-none">
          {(['curl', 'js', 'python', 'php'] as const).map((tab) => {
            const labels = { curl: 'cURL', js: 'JavaScript', python: 'Python', php: 'PHP' };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2.5 px-4 text-sm font-semibold border-b-2 transition-all relative ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Code Panel */}
        <div className="relative rounded-lg overflow-hidden border border-border bg-muted/15 font-mono text-xs select-all text-white p-4">
          <button
            onClick={async () => {
              await copyToClipboard(codeSnippets[activeTab]);
              setCopiedIntegration(true);
              toast.success('Snippet copied to clipboard');
              setTimeout(() => setCopiedIntegration(false), 2000);
            }}
            className="absolute right-3 top-3 h-8 px-3 rounded bg-primary text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/95 hover:scale-[1.02] active:scale-[0.98] transition-all select-none z-10"
          >
            {copiedIntegration ? (
              <>
                <Check size={12} /> Copied!
              </>
            ) : (
              <>
                <Copy size={12} /> Copy Code
              </>
            )}
          </button>
          <pre className="overflow-x-auto whitespace-pre pr-24 max-h-[300px] leading-relaxed select-text font-mono text-muted-foreground selection:bg-primary/30">
            {codeSnippets[activeTab]}
          </pre>
        </div>
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
                  <code className="flex-1 text-sm font-mono break-all font-bold select-all">{newKeyRevealed}</code>
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
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="e.g., Production Server"
                    className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Rate Limit (requests/minute)</label>
                  <input
                    type="number"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Scopes</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(scopeLabels).map(([value, label]) => (
                      <label key={value} className="flex items-center gap-2 text-sm cursor-pointer text-white">
                        <input
                          type="checkbox"
                          checked={selectedScopes.includes(value)}
                          onChange={() => handleScopeToggle(value)}
                          className="rounded border-border bg-muted/50"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleCreateKey}
                  disabled={creating}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all disabled:opacity-50"
                >
                  {creating ? 'Generating...' : 'Generate API Key'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
