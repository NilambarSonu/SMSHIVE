'use client';

import { useState } from 'react';
import { getSegmentCount } from '@/lib/utils';
import {
  Users,
  Upload,
  Send,
  FileSpreadsheet,
  AlertTriangle,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function BulkSmsPage() {
  const [recipients, setRecipients] = useState('');
  const [message, setMessage] = useState('');
  const [csvMode, setCsvMode] = useState(false);
  const [sending, setSending] = useState(false);

  const recipientList = recipients.split('\n').map(r => r.trim()).filter(Boolean);
  const { segments } = getSegmentCount(message);

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
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${!csvMode ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-accent'}`}
        >
          <Users size={16} /> Manual Entry
        </button>
        <button
          onClick={() => setCsvMode(true)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${csvMode ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-accent'}`}
        >
          <FileSpreadsheet size={16} /> CSV Upload
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {csvMode ? (
            <div className="glass-card p-5">
              <label className="text-sm font-medium mb-2 block">Upload CSV File</label>
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload size={32} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">Drop your CSV file here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">Format: phone_number, name (optional), variable1, variable2...</p>
                <input type="file" accept=".csv" className="hidden" />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                <p className="font-medium mb-1">CSV Format Example:</p>
                <code className="block bg-muted/50 rounded p-2 font-mono">
                  phone,name,code{'\n'}
                  +919876543210,John,4829{'\n'}
                  +918765432109,Jane,5190
                </code>
              </div>
            </div>
          ) : (
            <div className="glass-card p-5">
              <label className="text-sm font-medium mb-2 block">
                Recipients <span className="text-muted-foreground font-normal">(one per line)</span>
              </label>
              <textarea
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                rows={6}
                placeholder={"+91 98765 43210\n+91 87654 32109\n+91 76543 21098"}
                className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none font-mono placeholder:text-muted-foreground/50"
              />
              <p className="text-xs text-muted-foreground mt-1">{recipientList.length} recipient{recipientList.length !== 1 ? 's' : ''} entered</p>
            </div>
          )}

          <div className="glass-card p-5">
            <label className="text-sm font-medium mb-2 block">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Type your message... Use {name} for personalization"
              className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground/50"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{message.length} chars · {segments} segment{segments !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <button
            onClick={() => { setSending(true); setTimeout(() => { setSending(false); toast.success(`Bulk send queued for ${recipientList.length} recipients`); }, 2000); }}
            disabled={sending || recipientList.length === 0 || !message}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-6 py-4 text-base font-bold text-white shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            {sending ? 'Queueing...' : `Send to ${recipientList.length} Recipients`}
          </button>
        </div>

        {/* Summary Panel */}
        <div className="glass-card p-5 h-fit">
          <h3 className="text-sm font-medium mb-4">Send Summary</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Recipients</span>
              <span className="font-bold">{recipientList.length}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Segments each</span>
              <span className="font-bold">{segments}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Total segments</span>
              <span className="font-bold">{recipientList.length * segments}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Est. time</span>
              <span className="font-bold">{Math.ceil(recipientList.length * 1.2)}s</span>
            </div>
          </div>
          {recipientList.length > 100 && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-warning/10 border border-warning/20 p-3">
              <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground">
                Large batch. Messages will be queued and sent with a 1s delay between each to avoid carrier blocking.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
