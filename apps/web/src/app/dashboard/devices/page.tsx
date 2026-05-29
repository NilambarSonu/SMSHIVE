'use client';

import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatNumber, getRelativeTime, copyToClipboard } from '@/lib/utils';
import {
  Smartphone,
  Plus,
  Copy,
  Check,
  MoreVertical,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Pencil,
  Trash2,
  ScrollText,
  RefreshCw,
  QrCode,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const mockDevices = [
  {
    id: '1', deviceId: 'dev_a1b2c3d4e5f6g7h8', name: 'Pixel 8 Pro', model: 'Google Pixel 8 Pro',
    status: 'online', battery: 85, isCharging: true, networkType: 'WiFi',
    activeSims: [
      { slot: 1, carrier: 'Jio', phoneNumber: '+91 98765 43210', active: true },
      { slot: 2, carrier: 'Airtel', phoneNumber: '+91 87654 32109', active: false },
    ],
    lastSeen: new Date().toISOString(), messagesSent: 8420, appVersion: '1.2.0',
  },
  {
    id: '2', deviceId: 'dev_h8g7f6e5d4c3b2a1', name: 'Galaxy S24 Ultra', model: 'Samsung Galaxy S24 Ultra',
    status: 'online', battery: 62, isCharging: false, networkType: '5G',
    activeSims: [
      { slot: 1, carrier: 'Airtel', phoneNumber: '+91 76543 21098', active: true },
    ],
    lastSeen: new Date(Date.now() - 15000).toISOString(), messagesSent: 12350, appVersion: '1.2.0',
  },
  {
    id: '3', deviceId: 'dev_x9y8z7w6v5u4t3s2', name: 'OnePlus 12', model: 'OnePlus 12',
    status: 'online', battery: 94, isCharging: false, networkType: '4G',
    activeSims: [
      { slot: 1, carrier: 'VI', phoneNumber: '+91 65432 10987', active: true },
      { slot: 2, carrier: 'BSNL', phoneNumber: '+91 54321 09876', active: true },
    ],
    lastSeen: new Date(Date.now() - 5000).toISOString(), messagesSent: 5200, appVersion: '1.1.0',
  },
  {
    id: '4', deviceId: 'dev_r2q1p0o9n8m7l6k5', name: 'Redmi Note 13', model: 'Xiaomi Redmi Note 13 Pro',
    status: 'offline', battery: 15, isCharging: false, networkType: 'unknown',
    activeSims: [
      { slot: 1, carrier: 'BSNL', phoneNumber: '+91 43210 98765', active: true },
    ],
    lastSeen: new Date(Date.now() - 3600000).toISOString(), messagesSent: 2481, appVersion: '1.0.0',
  },
];

export default function DevicesPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleCopyId = async (deviceId: string) => {
    await copyToClipboard(deviceId);
    setCopiedId(deviceId);
    toast.success('Device ID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Devices</h1>
          <p className="text-muted-foreground mt-1">
            Manage your Android gateway devices. <span className="text-success font-medium">{mockDevices.filter(d => d.status === 'online').length} online</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors">
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={16} />
            Add Device
          </button>
        </div>
      </div>

      {/* Load Balancing Toggle */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Load Balancing</p>
          <p className="text-xs text-muted-foreground mt-0.5">Round-robin distribute messages across all online devices</p>
        </div>
        <button className="relative h-6 w-11 rounded-full bg-primary transition-colors">
          <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform translate-x-5" />
        </button>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
        {mockDevices.map((device) => (
          <div
            key={device.id}
            className="glass-card-hover overflow-hidden group"
          >
            {/* Card Header */}
            <div className="p-5 pb-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Smartphone size={22} />
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${device.status === 'online' ? 'bg-success animate-pulse-glow' : 'bg-muted-foreground'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{device.name}</h3>
                    <p className="text-xs text-muted-foreground">{device.model}</p>
                  </div>
                </div>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Device ID */}
            <div className="px-5 py-3">
              <button
                onClick={() => handleCopyId(device.deviceId)}
                className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5 text-xs font-mono text-muted-foreground hover:bg-muted transition-colors w-full"
              >
                <span className="truncate flex-1 text-left">{device.deviceId}</span>
                {copiedId === device.deviceId ? (
                  <Check size={12} className="text-success shrink-0" />
                ) : (
                  <Copy size={12} className="shrink-0" />
                )}
              </button>
            </div>

            {/* Status & Battery */}
            <div className="px-5 pb-3 flex items-center justify-between">
              <StatusBadge status={device.status} />
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  {device.status === 'online' ? <Wifi size={12} className="text-success" /> : <WifiOff size={12} />}
                  {device.networkType}
                </span>
                <span className="flex items-center gap-1">
                  <Battery size={12} className={device.battery > 20 ? 'text-success' : 'text-destructive'} />
                  {device.battery}%{device.isCharging ? ' ⚡' : ''}
                </span>
              </div>
            </div>

            {/* SIM Cards */}
            <div className="px-5 pb-3">
              <div className="space-y-1.5">
                {device.activeSims.map((sim) => (
                  <div
                    key={sim.slot}
                    className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Signal size={12} className={sim.active ? 'text-success' : 'text-muted-foreground'} />
                      <span className="text-xs font-medium">SIM {sim.slot}</span>
                      <span className="text-xs text-muted-foreground">· {sim.carrier}</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{sim.phoneNumber}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Stats */}
            <div className="border-t border-border px-5 py-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatNumber(device.messagesSent)} messages sent</span>
              <span>Last seen: {getRelativeTime(device.lastSeen)}</span>
            </div>

            {/* Action Bar */}
            <div className="border-t border-border flex divide-x divide-border">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <Pencil size={12} /> Edit
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <ScrollText size={12} /> Logs
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors">
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </div>
        ))}

        {/* Add Device Card */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-card/30 p-12 transition-all hover:bg-primary/5 group"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            <Plus size={24} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Add New Device</p>
            <p className="text-xs text-muted-foreground mt-1">Scan QR code or enter manually</p>
          </div>
        </button>
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg mx-4 p-6 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold">Add New Device</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground"
              >
                ✕
              </button>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center p-8 rounded-xl bg-muted/30 border border-border mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <QrCode size={32} />
              </div>
              <p className="text-sm font-medium mb-1">Scan with SMSHIVE Android App</p>
              <p className="text-xs text-muted-foreground text-center">
                Open the SMSHIVE app on your Android device and scan this QR code to connect automatically.
              </p>
              {/* Placeholder QR code area */}
              <div className="mt-4 h-48 w-48 rounded-xl bg-white flex items-center justify-center">
                <div className="grid grid-cols-8 gap-0.5 p-4">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-4 w-4 rounded-sm ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Manual Entry */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground uppercase">or enter manually</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Device Name</label>
                <input
                  type="text"
                  placeholder="e.g., My Pixel 8"
                  className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">API Key</label>
                <input
                  type="text"
                  placeholder="Your API key"
                  className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm font-mono outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <button className="w-full rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all mt-2">
                Register Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
