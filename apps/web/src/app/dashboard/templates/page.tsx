'use client';

import { EmptyState } from '@/components/shared/EmptyState';
import {
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  Copy,
  Zap,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import { cn, copyToClipboard } from '@/lib/utils';
import { toast } from 'sonner';

const mockTemplates = [
  { id: '1', name: 'OTP Verification', body: 'Your verification code is {code}. Valid for {minutes} minutes. Do not share this code.', category: 'otp', variables: ['code', 'minutes'], usageCount: 2840 },
  { id: '2', name: 'Order Shipped', body: 'Hi {name}, your order #{orderId} has been shipped! Track at {url}', category: 'alert', variables: ['name', 'orderId', 'url'], usageCount: 1250 },
  { id: '3', name: 'Appointment Reminder', body: 'Reminder: {name}, your appointment is on {date} at {time}. Reply CONFIRM to confirm.', category: 'alert', variables: ['name', 'date', 'time'], usageCount: 890 },
  { id: '4', name: 'Welcome Message', body: 'Welcome to {brand}! Your account is ready. Get started at {url}', category: 'marketing', variables: ['brand', 'url'], usageCount: 520 },
  { id: '5', name: 'Payment Receipt', body: 'Payment of {amount} received for {description}. Transaction ID: {txnId}', category: 'alert', variables: ['amount', 'description', 'txnId'], usageCount: 1100 },
  { id: '6', name: 'Custom Notification', body: '{message}', category: 'custom', variables: ['message'], usageCount: 340 },
];

const categoryStyles: Record<string, { bg: string; text: string; label: string }> = {
  otp: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'OTP' },
  alert: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: 'Alert' },
  marketing: { bg: 'bg-purple-500/10', text: 'text-purple-500', label: 'Marketing' },
  custom: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Custom' },
};

export default function TemplatesPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = mockTemplates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.body.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground mt-1">Reusable message templates with dynamic variables.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={16} /> New Template
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm flex-1">
          <Search size={14} className="text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
          {['all', 'otp', 'alert', 'marketing', 'custom'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                'px-3 py-2 text-xs font-medium capitalize transition-colors',
                categoryFilter === cat
                  ? 'bg-primary text-white'
                  : 'bg-card text-muted-foreground hover:bg-accent'
              )}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
        {filtered.map((template) => {
          const cat = categoryStyles[template.category] || categoryStyles.custom;
          return (
            <div key={template.id} className="glass-card-hover overflow-hidden group">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{template.name}</h3>
                      <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', cat.bg, cat.text)}>
                        {cat.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/30 border border-border p-3 mb-3">
                  <p className="text-xs text-muted-foreground leading-relaxed font-mono">{template.body}</p>
                </div>
                {/* Variables */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {template.variables.map((v) => (
                    <span key={v} className="text-[10px] font-mono text-primary bg-primary/10 rounded px-1.5 py-0.5">
                      {`{${v}}`}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Used {template.usageCount.toLocaleString()} times</p>
              </div>
              <div className="border-t border-border flex divide-x divide-border">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                  <Copy size={12} /> Use
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                  <Pencil size={12} /> Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Template Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg mx-4 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold">New Template</h2>
              <button onClick={() => setShowCreate(false)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Template Name</label>
                <input type="text" placeholder="e.g., Order Confirmation" className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category</label>
                <select className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all appearance-none">
                  <option value="otp">OTP</option>
                  <option value="alert">Alert</option>
                  <option value="marketing">Marketing</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Message Body</label>
                <textarea
                  rows={4}
                  placeholder="Use {variableName} for dynamic content"
                  className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">Wrap variable names in curly braces: {'{name}'}, {'{code}'}, {'{url}'}</p>
              </div>
              <button className="w-full rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all">
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
