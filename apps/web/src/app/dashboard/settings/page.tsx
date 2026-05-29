'use client';

import { User, Mail, Bell, Shield, Palette, Save, Loader2, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'preferences', label: 'Preferences', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

interface UserProfile {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences?: {
    timezone?: string;
    defaultDeviceId?: string;
    smsDelay?: number;
    notifications?: { email?: boolean; push?: boolean; sms?: boolean };
    theme?: string;
  };
}

interface Device {
  _id: string;
  deviceId: string;
  name: string;
  model: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [defaultDevice, setDefaultDevice] = useState('auto');
  const [smsDelay, setSmsDelay] = useState(1000);
  const [emailFailure, setEmailFailure] = useState(true);
  const [emailOffline, setEmailOffline] = useState(true);

  const fetchProfileAndDevices = async () => {
    setLoading(true);
    try {
      const [profRes, devRes] = await Promise.all([
        api.get<UserProfile>('/api/users/profile').catch(() => null as any),
        api.get<{ data: Device[] }>('/api/v1/devices').catch(() => ({ data: [] })),
      ]);

      if (profRes) {
        setProfile(profRes);
        setName(profRes.name || '');
        if (profRes.preferences) {
          setTimezone(profRes.preferences.timezone || 'Asia/Kolkata');
          setDefaultDevice(profRes.preferences.defaultDeviceId || 'auto');
          setSmsDelay(profRes.preferences.smsDelay || 1000);
          if (profRes.preferences.notifications) {
            setEmailFailure(profRes.preferences.notifications.email !== false);
            setEmailOffline(profRes.preferences.notifications.push !== false);
          }
        }
      }
      if (devRes) {
        setDevices(devRes.data || []);
      }
    } catch (err: any) {
      toast.error('Failed to load profile data: ' + (err.message || 'API error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndDevices();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await api.put<UserProfile>('/api/users/profile', {
        name,
        preferences: {
          timezone,
          defaultDeviceId: defaultDevice,
          smsDelay,
          notifications: {
            email: emailFailure,
            push: emailOffline,
          },
        },
      });

      if (updated) {
        setProfile(updated);
        toast.success('Profile and preferences updated successfully!');
      }
    } catch (err: any) {
      toast.error('Failed to save settings: ' + (err.message || 'API error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and gateway preferences.</p>
        </div>
        <button
          onClick={fetchProfileAndDevices}
          disabled={loading}
          className="h-10 w-10 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-pulse">
          <div className="lg:col-span-1 h-32 bg-muted/10 border border-border rounded-xl" />
          <div className="lg:col-span-3 h-96 bg-muted/10 border border-border rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs */}
          <div className="lg:col-span-1">
            <div className="glass-card p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <Icon size={16} /> {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="glass-card p-6 space-y-5 animate-fade-in">
                <h2 className="text-lg font-bold text-white">Profile Information</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white uppercase">
                    {name.charAt(0) || 'D'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white uppercase">{name || 'Developer Mode'}</p>
                    <p className="text-xs text-muted-foreground">{profile?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full rounded-lg border border-border bg-muted/20 px-4 py-2.5 text-sm outline-none text-muted-foreground cursor-not-allowed font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-white font-semibold cursor-pointer appearance-none"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="glass-card p-6 space-y-5 animate-fade-in">
                <h2 className="text-lg font-bold text-white">App Preferences</h2>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Default Dispatch Device</label>
                  <select
                    value={defaultDevice}
                    onChange={(e) => setDefaultDevice(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-white font-semibold cursor-pointer appearance-none"
                  >
                    <option value="auto">🤖 Auto-select (Round Robin)</option>
                    {devices.map((d) => (
                      <option key={d._id} value={d.deviceId}>
                        {d.name || d.model} ({d.deviceId.substring(0, 6)}...)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">SMS Delay Interval (ms)</label>
                  <input
                    type="number"
                    value={smsDelay}
                    onChange={(e) => setSmsDelay(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-white font-mono font-bold"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Adds safety buffer time between sending consecutive messages in bulk to shield SIM from carrier spam block.
                  </p>
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Preferences
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="glass-card p-6 space-y-5 animate-fade-in">
                <h2 className="text-lg font-bold text-white">Notification Preferences</h2>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="text-sm font-bold text-white">Email alerts on SMS failures</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Receive failure report upon dispatch error</p>
                  </div>
                  <button
                    onClick={() => setEmailFailure(!emailFailure)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${emailFailure ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${emailFailure ? 'left-6' : 'left-1'}`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-bold text-white">Email alerts when gateway disconnects</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Alert immediately if companion device heartbeat stalls</p>
                  </div>
                  <button
                    onClick={() => setEmailOffline(!emailOffline)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${emailOffline ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${emailOffline ? 'left-6' : 'left-1'}`}
                    />
                  </button>
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Preferences
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="glass-card p-6 space-y-5 animate-fade-in text-white">
                <h2 className="text-lg font-bold text-white">Security Settings</h2>
                <p className="text-xs text-muted-foreground">
                  Authentication is run under sandbox Developer mode bypass. Custom credentials updates are disabled in this mode.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
