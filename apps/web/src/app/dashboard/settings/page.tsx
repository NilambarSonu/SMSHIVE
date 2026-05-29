'use client';

import { User, Mail, Bell, Shield, Palette, Globe, Save, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Palette },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success('Settings saved'); }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

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
                    'w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
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
              <h2 className="text-lg font-semibold">Profile Information</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white">R</div>
                <button className="text-sm text-primary hover:text-primary/80 transition-colors">Change avatar</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                  <input type="text" defaultValue="Ramamani Behera" className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <input type="email" defaultValue="ramamani@example.com" className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Timezone</label>
                <select className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all appearance-none">
                  <option>Asia/Kolkata (IST)</option>
                  <option>UTC</option>
                  <option>America/New_York (EST)</option>
                  <option>Europe/London (GMT)</option>
                </select>
              </div>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="glass-card p-6 space-y-5 animate-fade-in">
              <h2 className="text-lg font-semibold">Notification Preferences</h2>
              {[
                { label: 'Email on message failure', desc: 'Get notified when a message fails to deliver', default: true },
                { label: 'Email when device goes offline', desc: 'Alert when a gateway device disconnects', default: true },
                { label: 'Daily summary email', desc: 'Receive a daily digest of messaging activity', default: false },
                { label: 'Real-time browser notifications', desc: 'Push notifications in your browser', default: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <button className={`relative h-6 w-11 rounded-full transition-colors ${item.default ? 'bg-primary' : 'bg-muted'}`}>
                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${item.default ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass-card p-6 space-y-5 animate-fade-in">
              <h2 className="text-lg font-semibold">Security Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Current Password</label>
                  <input type="password" className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">New Password</label>
                  <input type="password" className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <button className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
                  Update Password
                </button>
              </div>
              <div className="border-t border-border pt-5 mt-5">
                <h3 className="text-sm font-semibold mb-2">Two-Factor Authentication</h3>
                <p className="text-xs text-muted-foreground mb-3">Add an extra layer of security to your account.</p>
                <button className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors">
                  Enable 2FA
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="glass-card p-6 space-y-5 animate-fade-in">
              <h2 className="text-lg font-semibold">App Preferences</h2>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Default Device</label>
                <select className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all appearance-none">
                  <option>Auto-select (Round Robin)</option>
                  <option>Pixel 8 Pro</option>
                  <option>Galaxy S24</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">SMS Delay (ms)</label>
                <input type="number" defaultValue={1000} className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                <p className="text-xs text-muted-foreground mt-1">Delay between each SMS in bulk operations.</p>
              </div>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
