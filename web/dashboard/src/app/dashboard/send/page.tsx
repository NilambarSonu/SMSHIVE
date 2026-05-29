'use client';

import { useState, useEffect } from 'react';
import { getSegmentCount } from '@/lib/utils';
import { api } from '@/lib/api';
import {
  Send,
  Smartphone,
  Clock,
  FileText,
  ChevronDown,
  MessageSquare,
  Zap,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';

interface Device {
  _id: string;
  deviceId: string;
  name: string;
  model: string;
  status: string;
  activeSims?: { slot: number; carrier: string; phoneNumber?: string; active: boolean }[];
}

interface Template {
  _id: string;
  name: string;
  body: string;
  variables: string[];
}

export default function SendSmsPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('auto');
  const [selectedSim, setSelectedSim] = useState('1');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [sending, setSending] = useState(false);

  const { segments, remaining } = getSegmentCount(message);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [devRes, tempRes] = await Promise.all([
          api.get<{ data: Device[] }>('/api/v1/devices').catch(() => ({ data: [] })),
          api.get<{ data: Template[] }>('/api/v1/templates').catch(() => ({ data: [] })),
        ]);
        setDevices(devRes.data || []);
        setTemplates(tempRes.data || []);
      } catch (err: any) {
        console.error('Failed to load Send page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSend = async () => {
    if (!recipient.trim()) {
      toast.error('Please enter a recipient phone number');
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter your message');
      return;
    }

    // Determine target device ID
    let targetDeviceId = '';
    if (selectedDevice === 'auto') {
      const onlineDevice = devices.find((d) => d.status === 'online');
      if (!onlineDevice) {
        toast.error('No online gateway devices found. Please setup and start your Android Gateway app first.');
        return;
      }
      targetDeviceId = onlineDevice.deviceId;
    } else {
      const devObj = devices.find((d) => d._id === selectedDevice);
      if (!devObj) {
        toast.error('Selected device not found');
        return;
      }
      targetDeviceId = devObj.deviceId;
    }

    setSending(true);
    try {
      const payload: any = {
        recipients: [recipient.trim()],
        message: message.trim(),
        simSlot: Number(selectedSim) - 1, // 0-indexed for backend API
      };

      if (scheduleEnabled && scheduleDate) {
        payload.scheduledAt = new Date(scheduleDate).toISOString();
      }

      await api.post(`/api/v1/gateway/devices/${targetDeviceId}/send-sms`, payload);

      toast.success(scheduleEnabled ? 'SMS scheduled successfully!' : 'SMS queued for gateway dispatch!');
      setRecipient('');
      setMessage('');
    } catch (err: any) {
      toast.error('Failed to dispatch SMS: ' + (err.message || 'API error'));
    } finally {
      setSending(false);
    }
  };

  const applyTemplate = (template: Template) => {
    setMessage(template.body);
    setShowTemplates(false);
    toast.info(`Template "${template.name}" applied`);
  };

  // Get active Sims for currently selected device to populate slot dropdown
  const getSelectedDeviceSims = () => {
    if (selectedDevice === 'auto') return [1, 2];
    const devObj = devices.find((d) => d._id === selectedDevice);
    if (devObj && devObj.activeSims) {
      return devObj.activeSims.map((s) => s.slot + 1); // 1-indexed for visual
    }
    return [1, 2];
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Send SMS</h1>
        <p className="text-muted-foreground mt-1">Send a single SMS message to any phone number worldwide.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 space-y-5">
            <div className="h-28 bg-muted/10 border border-border rounded-2xl" />
            <div className="h-44 bg-muted/10 border border-border rounded-2xl" />
          </div>
          <div className="h-64 bg-muted/10 border border-border rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form — 2/3 width */}
          <div className="lg:col-span-2 space-y-5">
            {/* Recipient */}
            <div className="glass-card p-5">
              <label className="text-sm font-medium mb-2 block">Recipient</label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm shrink-0">
                  <Globe size={16} className="text-muted-foreground" />
                  <span>🌐 Phone</span>
                  <ChevronDown size={14} className="text-muted-foreground" />
                </div>
                <input
                  type="tel"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. +919876543210 or 9876543210"
                  className="flex-1 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50 font-mono text-white"
                />
              </div>
            </div>

            {/* Message */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Message</label>
                {templates.length > 0 && (
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-bold"
                  >
                    <FileText size={12} />
                    Use Template
                  </button>
                )}
              </div>

              {/* Template Dropdown */}
              {showTemplates && (
                <div className="mb-3 rounded-lg border border-border bg-card/95 shadow-lg overflow-hidden animate-fade-in">
                  {templates.map((template) => (
                    <button
                      key={template._id}
                      onClick={() => applyTemplate(template)}
                      className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-b-0"
                    >
                      <p className="text-sm font-bold text-white">{template.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{template.body}</p>
                    </button>
                  ))}
                </div>
              )}

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={5}
                className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50 resize-none text-white font-mono"
              />

              {/* Character Counter */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
                  <span>{message.length} characters</span>
                  <span>·</span>
                  <span>{segments} segment{segments !== 1 ? 's' : ''}</span>
                  <span>·</span>
                  <span>{remaining} remaining</span>
                </div>
                <div className="h-1 w-24 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min((message.length / 160) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Device & SIM Selection */}
            <div className="glass-card p-5">
              <label className="text-sm font-medium mb-2 block">Device & SIM</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <select
                    value={selectedDevice}
                    onChange={(e) => setSelectedDevice(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all appearance-none text-white cursor-pointer font-semibold"
                  >
                    <option value="auto">🤖 Auto — Best Online Device</option>
                    {devices.map((device) => (
                      <option key={device._id} value={device._id}>
                        {device.status === 'online' ? '🟢' : '🔴'} {device.name || device.model}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={selectedSim}
                    onChange={(e) => setSelectedSim(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all appearance-none text-white cursor-pointer font-semibold"
                  >
                    {getSelectedDeviceSims().map((slot) => (
                      <option key={slot} value={String(slot)}>
                        SIM {slot} {slot === 1 ? '— Primary' : '— Secondary'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  <label className="text-sm font-medium">Schedule for later</label>
                </div>
                <button
                  onClick={() => setScheduleEnabled(!scheduleEnabled)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${scheduleEnabled ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${scheduleEnabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              {scheduleEnabled && (
                <div className="mt-3 animate-fade-in">
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-white font-semibold"
                  />
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={sending || !recipient || !message}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-6 py-4 text-base font-bold text-white shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {sending ? (
                <>
                  <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Sending...
                </>
              ) : scheduleEnabled ? (
                <>
                  <Clock size={20} />
                  Schedule Message
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send Message
                </>
              )}
            </button>
          </div>

          {/* Preview Panel — 1/3 width */}
          <div className="space-y-4">
            {/* Phone Preview */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-white font-bold">
                <MessageSquare size={14} className="text-primary" />
                Preview
              </h3>
              <div className="rounded-2xl bg-gradient-to-b from-muted/50 to-muted/20 border border-border p-4">
                {/* Phone Screen Simulation */}
                <div className="bg-background rounded-xl p-4 min-h-[200px]">
                  {recipient && (
                    <div className="text-center mb-4">
                      <p className="text-xs text-muted-foreground">To</p>
                      <p className="text-sm font-mono font-bold text-white select-all">{recipient}</p>
                    </div>
                  )}
                  {message ? (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary/10 border border-primary/20 px-4 py-2.5">
                        <p className="text-xs whitespace-pre-wrap break-words text-white font-semibold font-mono">{message}</p>
                        <p className="text-[10px] text-muted-foreground text-right mt-1 font-bold">
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
                      Your message will appear here
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="glass-card p-5 space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2 text-white font-bold">
                <Zap size={14} className="text-primary" />
                Sending Info
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Device</span>
                  <span className="font-bold text-white">
                    {selectedDevice === 'auto' ? 'Auto-select' : devices.find((d) => d._id === selectedDevice)?.name || 'Device'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">SIM</span>
                  <span className="font-bold text-white">SIM {selectedSim}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Segments</span>
                  <span className="font-bold text-white">{segments}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Scheduled</span>
                  <span className="font-bold text-white">{scheduleEnabled ? 'Yes' : 'Instant'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
