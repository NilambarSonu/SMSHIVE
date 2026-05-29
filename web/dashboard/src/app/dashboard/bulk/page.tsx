'use client';

import { useState, useEffect } from 'react';
import { getSegmentCount } from '@/lib/utils';
import { api } from '@/lib/api';
import {
  Users,
  Upload,
  Send,
  FileSpreadsheet,
  AlertTriangle,
  Loader2,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';

interface Device {
  _id: string;
  deviceId: string;
  name: string;
  model: string;
  status: string;
}

export default function BulkSmsPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const [recipients, setRecipients] = useState('');
  const [message, setMessage] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('auto');
  const [csvMode, setCsvMode] = useState(false);
  const [sending, setSending] = useState(false);

  // CSV parsing
  const [csvFileName, setCsvFileName] = useState('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [phoneColumn, setPhoneColumn] = useState('');

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      try {
        const response = await api.get<{ data: Device[] }>('/api/v1/devices');
        if (response?.data) {
          setDevices(response.data);
        }
      } catch (err: any) {
        console.error('Failed to load devices for bulk send:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  const getRecipientList = () => {
    if (csvMode) {
      if (!phoneColumn) return [];
      return csvData.map((row) => row[phoneColumn]?.trim()).filter(Boolean);
    }
    return recipients
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);
  };

  const recipientList = getRecipientList();
  const { segments } = getSegmentCount(message);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
      if (lines.length === 0) {
        toast.error('CSV file is empty');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim());
      setCsvHeaders(headers);

      // Try to auto-detect a phone number column
      const phoneCol = headers.find((h) =>
        /phone|mobile|tel|number|recipient/i.test(h)
      ) || headers[0];
      setPhoneColumn(phoneCol);

      const parsedData = lines.slice(1).map((line) => {
        const values = line.split(',');
        const row: Record<string, string> = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx]?.trim() || '';
        });
        return row;
      });

      setCsvData(parsedData);
      toast.success(`Loaded ${parsedData.length} rows from CSV`);
    };
    reader.readAsText(file);
  };

  const handleBulkSend = async () => {
    if (recipientList.length === 0) {
      toast.error('Please enter or upload recipients');
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter a message template');
      return;
    }

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
      if (csvMode) {
        // Build customized messages if using CSV mode with placeholders like {name}
        // However, the standard DTO takes a single message and a list of recipients.
        // We will send a single batch to recipients for the common message.
        // If they want personalized templates, we can handle it or send them as single dispatches.
        // For standard bulk SMS, we will dispatch the list of numbers in one API request.
        await api.post(`/api/v1/gateway/devices/${targetDeviceId}/send-sms`, {
          recipients: recipientList,
          message: message.trim(),
        });
        toast.success(`Bulk dispatch queued for ${recipientList.length} recipients successfully!`);
      } else {
        await api.post(`/api/v1/gateway/devices/${targetDeviceId}/send-sms`, {
          recipients: recipientList,
          message: message.trim(),
        });
        toast.success(`Bulk dispatch queued for ${recipientList.length} recipients successfully!`);
      }

      setRecipients('');
      setMessage('');
      setCsvFileName('');
      setCsvData([]);
      setCsvHeaders([]);
    } catch (err: any) {
      toast.error('Failed to dispatch bulk SMS: ' + (err.message || 'API error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Bulk SMS</h1>
        <p className="text-muted-foreground mt-1">Send messages to multiple recipients at once.</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden w-fit">
        <button
          onClick={() => setCsvMode(false)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors ${!csvMode ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-accent'}`}
        >
          <Users size={16} /> Manual Entry
        </button>
        <button
          onClick={() => setCsvMode(true)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors ${csvMode ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-accent'}`}
        >
          <FileSpreadsheet size={16} /> CSV Upload
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 space-y-5">
            <div className="h-44 bg-muted/10 border border-border rounded-2xl" />
            <div className="h-32 bg-muted/10 border border-border rounded-2xl" />
          </div>
          <div className="h-56 bg-muted/10 border border-border rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Device selection */}
            <div className="glass-card p-5">
              <label className="text-sm font-medium mb-2 block">Select Dispatch Gateway Device</label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all appearance-none text-white cursor-pointer font-bold"
              >
                <option value="auto">🤖 Auto — Best Online Device</option>
                {devices.map((device) => (
                  <option key={device._id} value={device._id}>
                    {device.status === 'online' ? '🟢' : '🔴'} {device.name || device.model}
                  </option>
                ))}
              </select>
            </div>

            {csvMode ? (
              <div className="glass-card p-5">
                <label className="text-sm font-medium mb-2 block">Upload CSV File</label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer relative bg-muted/10">
                  <Upload size={32} className="mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-bold text-white">
                    {csvFileName ? `Selected: ${csvFileName}` : 'Click or drag CSV here to import'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Columns: phone, name (optional), message...
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {csvHeaders.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Map Phone Number Column</label>
                      <select
                        value={phoneColumn}
                        onChange={(e) => setPhoneColumn(e.target.value)}
                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs outline-none text-white font-semibold appearance-none"
                      >
                        {csvHeaders.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="mt-4 text-xs text-muted-foreground">
                  <p className="font-semibold mb-1">CSV Format Example:</p>
                  <code className="block bg-muted/50 rounded p-2 font-mono whitespace-pre text-[10px]">
                    phone,name{'\n'}
                    +919876543210,John{'\n'}
                    +918765432109,Jane
                  </code>
                </div>
              </div>
            ) : (
              <div className="glass-card p-5">
                <label className="text-sm font-medium mb-2 block flex justify-between items-center">
                  <span>Recipients <span className="text-muted-foreground font-normal">(one per line)</span></span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Globe size={12}/> Global format: +country_code</span>
                </label>
                <textarea
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  rows={6}
                  placeholder={"+919876543210\n+918765432109\n+917654321098"}
                  className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none font-mono placeholder:text-muted-foreground/50 text-white"
                />
                <p className="text-xs text-muted-foreground mt-1 font-bold">
                  {recipientList.length} recipient{recipientList.length !== 1 ? 's' : ''} entered
                </p>
              </div>
            )}

            <div className="glass-card p-5">
              <label className="text-sm font-medium mb-2 block">Message Template</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Type your bulk message here..."
                className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground/50 text-white font-mono"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground font-semibold">
                <span>{message.length} chars · {segments} segment{segments !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <button
              onClick={handleBulkSend}
              disabled={sending || recipientList.length === 0 || !message.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-6 py-4 text-base font-bold text-white shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Queueing batch...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send to {recipientList.length} Recipients
                </>
              )}
            </button>
          </div>

          {/* Summary Panel */}
          <div className="glass-card p-5 h-fit space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Send Summary</h3>
            <div className="space-y-3 text-xs text-muted-foreground font-semibold">
              <div className="flex justify-between py-2 border-b border-border">
                <span>Recipients</span>
                <span className="font-bold text-white">{recipientList.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span>Segments each</span>
                <span className="font-bold text-white">{segments}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span>Total segments</span>
                <span className="font-bold text-white">{recipientList.length * segments}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Est. delay (gateway queue)</span>
                <span className="font-bold text-white">{recipientList.length * 2}s</span>
              </div>
            </div>
            {recipientList.length > 50 && (
              <div className="flex items-start gap-2 rounded-lg bg-warning/10 border border-warning/20 p-3">
                <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Large batch. Gateway will process messages consecutively with safety intervals to avoid SIM suspension by your carrier.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
