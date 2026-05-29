'use client';

import { useState } from 'react';
import { getSegmentCount } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
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

const mockDevices = [
  { id: '1', name: 'Pixel 8 Pro', status: 'online', sim1: 'Jio', sim2: 'Airtel' },
  { id: '2', name: 'Galaxy S24 Ultra', status: 'online', sim1: 'Airtel' },
  { id: '3', name: 'OnePlus 12', status: 'online', sim1: 'VI', sim2: 'BSNL' },
];

const mockTemplates = [
  { id: '1', name: 'OTP Verification', body: 'Your verification code is {code}. Valid for {minutes} minutes.' },
  { id: '2', name: 'Order Shipped', body: 'Hi {name}, your order #{orderId} has been shipped! Track at {url}' },
  { id: '3', name: 'Appointment Reminder', body: 'Reminder: Your appointment is on {date} at {time}. Reply CONFIRM to confirm.' },
];

export default function SendSmsPage() {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('auto');
  const [selectedSim, setSelectedSim] = useState('1');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [sending, setSending] = useState(false);

  const { segments, remaining } = getSegmentCount(message);

  const handleSend = async () => {
    if (!recipient || !message) {
      toast.error('Please enter a recipient and message');
      return;
    }
    setSending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSending(false);
    toast.success('Message sent successfully!', {
      description: `Sent to ${recipient}`,
    });
    setRecipient('');
    setMessage('');
  };

  const applyTemplate = (template: typeof mockTemplates[0]) => {
    setMessage(template.body);
    setShowTemplates(false);
    toast.info(`Template "${template.name}" applied`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Send SMS</h1>
        <p className="text-muted-foreground mt-1">Send a single SMS message to any phone number worldwide.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form — 2/3 width */}
        <div className="lg:col-span-2 space-y-5">
          {/* Recipient */}
          <div className="glass-card p-5">
            <label className="text-sm font-medium mb-2 block">Recipient</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm shrink-0">
                <Globe size={16} className="text-muted-foreground" />
                <span>🇮🇳 +91</span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </div>
              <input
                type="tel"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="98765 43210"
                className="flex-1 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50 font-mono"
              />
            </div>
          </div>

          {/* Message */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Message</label>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <FileText size={12} />
                Use Template
              </button>
            </div>

            {/* Template Dropdown */}
            {showTemplates && (
              <div className="mb-3 rounded-lg border border-border bg-card/95 shadow-lg overflow-hidden animate-fade-in">
                {mockTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-b-0"
                  >
                    <p className="text-sm font-medium">{template.name}</p>
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
              className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50 resize-none"
            />

            {/* Character Counter */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                  className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                >
                  <option value="auto">🤖 Auto — Best Available</option>
                  {mockDevices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.status === 'online' ? '🟢' : '🔴'} {device.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={selectedSim}
                  onChange={(e) => setSelectedSim(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                >
                  <option value="1">SIM 1 — Primary</option>
                  <option value="2">SIM 2 — Secondary</option>
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
                  className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
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
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <MessageSquare size={14} className="text-primary" />
              Preview
            </h3>
            <div className="rounded-2xl bg-gradient-to-b from-muted/50 to-muted/20 border border-border p-4">
              {/* Phone Screen Simulation */}
              <div className="bg-background rounded-xl p-4 min-h-[200px]">
                {recipient && (
                  <div className="text-center mb-4">
                    <p className="text-xs text-muted-foreground">To</p>
                    <p className="text-sm font-mono font-medium">{recipient || 'No recipient'}</p>
                  </div>
                )}
                {message ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary/10 border border-primary/20 px-4 py-2.5">
                      <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
                      <p className="text-[10px] text-muted-foreground text-right mt-1">
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
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Zap size={14} className="text-primary" />
              Sending Info
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Device</span>
                <span className="font-medium">{selectedDevice === 'auto' ? 'Auto-select' : mockDevices.find(d => d.id === selectedDevice)?.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">SIM</span>
                <span className="font-medium">SIM {selectedSim}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Segments</span>
                <span className="font-medium">{segments}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Scheduled</span>
                <span className="font-medium">{scheduleEnabled ? 'Yes' : 'Instant'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
