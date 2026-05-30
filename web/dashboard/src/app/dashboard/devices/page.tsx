'use client';

import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatNumber, getRelativeTime, copyToClipboard } from '@/lib/utils';
import { api } from '@/lib/api';
import {
  Smartphone,
  Plus,
  Copy,
  Check,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Pencil,
  Trash2,
  RefreshCw,
  QrCode,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface SimInfo {
  slot: number;
  carrier: string;
  phoneNumber: string;
  active: boolean;
}

interface Device {
  _id: string;
  deviceId: string;
  name: string;
  model?: string;
  status: string;
  batteryLevel?: number;
  isCharging: boolean;
  networkType?: string;
  activeSims: SimInfo[];
  messagesSent: number;
  lastSeen?: string;
  appVersion?: string;
}

interface ApiKey {
  _id: string;
  name: string;
  key: string;
  prefix: string;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Edit Device State
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [editName, setEditName] = useState('');

  // Add Device State
  const [newDeviceName, setNewDeviceName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [serverUrl, setServerUrl] = useState('');

  // Generate QR Code Setup Data
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrToken, setQrToken] = useState('');
  const [polling, setPolling] = useState(false);

  const fetchDevices = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const response = await api.get<{ data: Device[] }>('/api/v1/devices');
      if (response?.data) {
        setDevices(response.data);
      }
    } catch (err: any) {
      toast.error('Failed to load devices: ' + (err.message || 'API error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDevices();

    // Auto-fetch API key to simplify QR generation
    const fetchApiKey = async () => {
      try {
        const response = await api.get<{ data: ApiKey[] }>('/api/v1/api-keys');
        if (response?.data && response.data.length > 0) {
          setApiKey(response.data[0].key || `${response.data[0].prefix}...`);
        } else {
          // If no key exists, auto-generate one named "android-gateway"
          const newKey = await api.post<{ data: { name: string; key: string } }>('/api/v1/api-keys', {
            name: 'Android Gateway App',
            scopes: ['send_sms', 'receive_sms', 'manage_devices'],
          });
          if (newKey?.data?.key) {
            setApiKey(newKey.data.key);
          }
        }
      } catch (err) {
        console.error('Failed to fetch/generate API Key:', err);
      }
    };

    fetchApiKey();
    setServerUrl(process.env.NEXT_PUBLIC_API_URL || window.location.origin.replace('3000', '8000')); // API server URL for mobile app
  }, []);

  // Fetch QR Token on modal open
  useEffect(() => {
    if (showAddModal) {
      const fetchQrToken = async () => {
        try {
          const response = await api.post<{ data: { qrToken: string; apiKey?: string; expiresAt: string } }>('/api/v1/devices/generate-qr-token');
          if (response?.data) {
            const fetchedToken = response.data.qrToken;
            const fetchedApiKey = response.data.apiKey || apiKey;
            setQrToken(fetchedToken);
            
            const setupObj = {
              v: 1,
              apiKey: fetchedApiKey,
              serverUrl: window.location.origin.replace('3000', '8000'),
              qrToken: fetchedToken,
            };
            const qrData = encodeURIComponent(JSON.stringify(setupObj));
            setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrData}`);
            setPolling(true);
          }
        } catch (err) {
          toast.error('Failed to generate QR token');
        }
      };
      fetchQrToken();
    } else {
      setQrToken('');
      setQrCodeUrl('');
      setPolling(false);
    }
  }, [showAddModal, apiKey]);

  // Poll for QR Token status
  useEffect(() => {
    if (!polling || !qrToken) return;

    const interval = setInterval(async () => {
      try {
        const response = await api.get<{ data: { status: string; deviceId?: string; deviceName?: string } }>(`/api/v1/devices/qr-token-status?token=${qrToken}`);
        if (response?.data?.status === 'connected') {
          toast.success(`Device ${response.data.deviceName || 'connected'} registered successfully!`);
          setShowAddModal(false);
          setPolling(false);
          fetchDevices(true);
        }
      } catch (err) {
        // Silent fail for polling
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [polling, qrToken]);

  const handleCopyId = async (deviceId: string) => {
    await copyToClipboard(deviceId);
    setCopiedId(deviceId);
    toast.success('Device ID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteDevice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this device? It will stop forwarding messages.')) return;
    
    try {
      await api.delete(`/api/v1/devices/${id}`);
      toast.success('Device deleted successfully');
      fetchDevices(true);
    } catch (err: any) {
      toast.error('Failed to delete device: ' + (err.message || 'API error'));
    }
  };

  const handleUpdateName = async () => {
    if (!editingDevice || !editName.trim()) return;

    try {
      await api.put(`/api/v1/devices/${editingDevice._id}`, {
        name: editName.trim(),
      });
      toast.success('Device name updated');
      setEditingDevice(null);
      fetchDevices(true);
    } catch (err: any) {
      toast.error('Failed to update device: ' + (err.message || 'API error'));
    }
  };

  const handleManualRegister = async () => {
    if (!newDeviceName.trim()) {
      toast.error('Please enter a device name.');
      return;
    }

    try {
      const generatedId = 'dev_' + Math.random().toString(36).substring(2, 15);
      await api.post('/api/v1/devices/register', {
        deviceId: generatedId,
        name: newDeviceName.trim(),
        model: 'Generic Web Gateway',
      });
      toast.success('Device registered! Install the APK on your phone to start syncing.');
      setShowAddModal(false);
      setNewDeviceName('');
      fetchDevices(true);
    } catch (err: any) {
      toast.error('Registration failed: ' + (err.message || 'API error'));
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse p-6">
        <div className="h-10 w-48 rounded bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-96 rounded-xl bg-card border border-border" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Devices</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your Android gateway devices. <span className="text-success font-medium">{devices.filter(d => d.status === 'online').length} online</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchDevices(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
          >
            {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
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
          <p className="text-sm font-medium">Device Load Balancing</p>
          <p className="text-xs text-muted-foreground mt-0.5">Round-robin distribute messages across all online devices automatically</p>
        </div>
        <button className="relative h-6 w-11 rounded-full bg-primary transition-colors">
          <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform translate-x-5" />
        </button>
      </div>

      {devices.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center p-16 text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Smartphone size={32} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">No Devices Connected</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1 mx-auto">
              Sideload the companion APK on any Android phone, scan the registration QR code, and start sending!
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-primary/90 transition-all"
          >
            Connect My First Phone 🚀
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {devices.map((device) => (
            <div
              key={device._id}
              className="glass-card-hover overflow-hidden group relative"
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
                      <p className="text-xs text-muted-foreground">{device.model || 'Companion Gateway'}</p>
                    </div>
                  </div>
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
                    {device.networkType || 'Offline'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Battery size={12} className={(device.batteryLevel ?? 100) > 20 ? 'text-success' : 'text-destructive'} />
                    {device.batteryLevel ?? 100}%{device.isCharging ? ' ⚡' : ''}
                  </span>
                </div>
              </div>

              {/* SIM Cards */}
              <div className="px-5 pb-3">
                <div className="space-y-1.5">
                  {device.activeSims.length === 0 ? (
                    <div className="flex items-center gap-2 rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                      <AlertCircle size={12} />
                      No SIM card slots reported.
                    </div>
                  ) : (
                    device.activeSims.map((sim, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <Signal size={12} className={sim.active ? 'text-success' : 'text-muted-foreground'} />
                          <span className="text-xs font-medium">SIM {sim.slot}</span>
                          <span className="text-xs text-muted-foreground">· {sim.carrier || 'Unknown'}</span>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">{sim.phoneNumber || 'Hidden'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Footer Stats */}
              <div className="border-t border-border px-5 py-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatNumber(device.messagesSent)} messages sent</span>
                <span>Seen: {device.lastSeen ? getRelativeTime(device.lastSeen) : 'Never'}</span>
              </div>

              {/* Action Bar */}
              <div className="border-t border-border flex divide-x divide-border">
                <button 
                  onClick={() => {
                    setEditingDevice(device);
                    setEditName(device.name);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button 
                  onClick={() => handleDeleteDevice(device._id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Name Dialog Modal */}
      {editingDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm mx-4 p-6 shadow-2xl">
            <h2 className="text-base font-bold mb-4">Edit Device Name</h2>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2 text-sm outline-none focus:border-primary/50"
            />
            <div className="flex gap-2 justify-end mt-6">
              <button 
                onClick={() => setEditingDevice(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-muted/40 hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateName}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-white shadow hover:bg-primary/90 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg mx-4 p-6 shadow-2xl shadow-black/20 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold">Add New Companion Device</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground"
              >
                ✕
              </button>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center p-6 rounded-xl bg-muted/30 border border-border mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                <QrCode size={24} />
              </div>
              <p className="text-sm font-medium mb-1">Scan with SMSHIVE Mobile App</p>
              <p className="text-xs text-muted-foreground text-center mb-4">
                Launch the companion Android app, tap **Scan Setup**, and point the camera at this screen!
              </p>
              {qrCodeUrl ? (
                <div className="h-48 w-48 rounded-xl bg-white flex items-center justify-center shadow p-2 border border-border/10">
                  <img src={qrCodeUrl} alt="SMSHIVE setup QR Code" className="h-full w-full object-contain" />
                </div>
              ) : (
                <div className="h-48 w-48 rounded-xl bg-muted/50 flex items-center justify-center animate-pulse">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              )}
            </div>

            {/* Manual Entry */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground uppercase">or manual browser claim</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">Device Display Name</label>
                <input
                  type="text"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="e.g. Pixel 8 Gateway"
                  className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <button 
                onClick={handleManualRegister}
                className="w-full rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all mt-2"
              >
                Claim/Register Web Gateway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
