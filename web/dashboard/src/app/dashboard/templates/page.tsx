'use client';

import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import {
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Template {
  _id: string;
  name: string;
  body: string;
  category: string;
  variables: string[];
  usageCount: number;
}

const categoryStyles: Record<string, { bg: string; text: string; label: string }> = {
  otp: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'OTP' },
  alert: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: 'Alert' },
  marketing: { bg: 'bg-purple-500/10', text: 'text-purple-500', label: 'Marketing' },
  custom: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Custom' },
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form State
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('otp');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTemplates = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const response = await api.get<{ data: Template[] }>('/api/v1/templates');
      if (response?.data) {
        setTemplates(response.data);
      }
    } catch (err: any) {
      toast.error('Failed to load templates: ' + (err.message || 'API error'));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Extract variables in curly braces: {name}, {code}
  const extractVariables = (text: string): string[] => {
    const regex = /\{([a-zA-Z0-9_]+)\}/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }
    return matches;
  };

  const handleCreateOrUpdate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    if (!body.trim()) {
      toast.error('Please enter a message body');
      return;
    }

    setSubmitting(true);
    const variables = extractVariables(body);

    try {
      if (editingTemplate) {
        const response = await api.put<{ data: Template }>(`/api/v1/templates/${editingTemplate._id}`, {
          name,
          category,
          body,
          variables,
        });
        if (response?.data) {
          toast.success('Template updated successfully');
          fetchTemplates(true);
          setShowCreate(false);
        }
      } else {
        const response = await api.post<{ data: Template }>('/api/v1/templates', {
          name,
          category,
          body,
          variables,
        });
        if (response?.data) {
          toast.success('Template created successfully');
          fetchTemplates(true);
          setShowCreate(false);
        }
      }
    } catch (err: any) {
      toast.error('Failed to save template: ' + (err.message || 'API error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await api.delete(`/api/v1/templates/${id}`);
      toast.success('Template deleted successfully');
      setTemplates((prev) => prev.filter((t) => t._id !== id));
    } catch (err: any) {
      toast.error('Failed to delete template: ' + (err.message || 'API error'));
    }
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setName('');
    setCategory('otp');
    setBody('');
    setShowCreate(true);
  };

  const openEditModal = (template: Template) => {
    setEditingTemplate(template);
    setName(template.name);
    setCategory(template.category || 'otp');
    setBody(template.body);
    setShowCreate(true);
  };

  const filtered = templates.filter((t) => {
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchTemplates(true)}
            disabled={isRefreshing || loading}
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={16} /> New Template
          </button>
        </div>
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
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50 text-white"
          />
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
          {['all', 'otp', 'alert', 'marketing', 'custom'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                'px-3 py-2 text-xs font-semibold capitalize transition-colors',
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5 h-44 animate-pulse bg-muted/10 border-border" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Templates Found"
          description="Create custom SMS templates with {variables} to speed up sending common OTPs or alert messages."
          actionLabel="New Template"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {filtered.map((template) => {
            const cat = categoryStyles[template.category] || categoryStyles.custom;
            return (
              <div key={template._id} className="glass-card-hover overflow-hidden group flex flex-col justify-between h-full">
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{template.name}</h3>
                        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 inline-block', cat.bg, cat.text)}>
                          {cat.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/30 border border-border p-3 mb-3">
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono whitespace-pre-wrap break-all">{template.body}</p>
                  </div>
                  {/* Variables */}
                  {template.variables && template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {template.variables.map((v) => (
                        <span key={v} className="text-[10px] font-mono font-bold text-primary bg-primary/10 rounded px-1.5 py-0.5">
                          {`{${v}}`}
                        </span>
                      ))}
                    </div>
                  )}
                  {template.usageCount !== undefined && (
                    <p className="text-[10px] text-muted-foreground">Used {template.usageCount.toLocaleString()} times</p>
                  )}
                </div>
                <div className="border-t border-border flex divide-x divide-border mt-auto">
                  <button
                    onClick={() => openEditModal(template)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors font-medium"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(template._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors font-medium"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Template Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg mx-4 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold">{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Template Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Order Confirmation"
                  className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-white font-semibold"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-white font-semibold appearance-none"
                >
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
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Use {variableName} for dynamic content"
                  className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none font-mono text-white"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Wrap variable names in curly braces: {'{name}'}, {'{code}'}, {'{url}'}
                </p>
              </div>
              <button
                onClick={handleCreateOrUpdate}
                disabled={submitting}
                className="w-full rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
