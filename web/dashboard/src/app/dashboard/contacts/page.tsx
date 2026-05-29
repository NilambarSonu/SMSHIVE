'use client';

import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { Plus, Search, Contact as ContactIcon, Phone, Tag, Pencil, Trash2, Send, Upload, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Contact {
  _id: string;
  name: string;
  phone: string;
  labels: string[];
  notes?: string;
  createdAt: string;
}

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [labelFilter, setLabelFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form State
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [labelsStr, setLabelsStr] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchContacts = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const response = await api.get<{ data: Contact[] }>('/api/v1/contacts');
      if (response?.data) {
        setContacts(response.data);
      }
    } catch (err: any) {
      toast.error('Failed to load contacts: ' + (err.message || 'API error'));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }
    if (!phone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setSubmitting(true);
    const labels = labelsStr
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    try {
      if (editingContact) {
        await api.put(`/api/v1/contacts/${editingContact._id}`, {
          name,
          phone,
          labels,
          notes,
        });
        toast.success('Contact updated successfully');
      } else {
        await api.post('/api/v1/contacts', {
          name,
          phone,
          labels,
          notes,
        });
        toast.success('Contact created successfully');
      }
      fetchContacts(true);
      setShowModal(false);
    } catch (err: any) {
      toast.error('Failed to save contact: ' + (err.message || 'API error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      await api.delete(`/api/v1/contacts/${id}`);
      toast.success('Contact deleted successfully');
      setContacts((prev) => prev.filter((c) => c._id !== id));
    } catch (err: any) {
      toast.error('Failed to delete contact: ' + (err.message || 'API error'));
    }
  };

  const openCreateModal = () => {
    setEditingContact(null);
    setName('');
    setPhone('');
    setLabelsStr('');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setName(contact.name);
    setPhone(contact.phone);
    setLabelsStr(contact.labels?.join(', ') || '');
    setNotes(contact.notes || '');
    setShowModal(true);
  };

  const allLabels = [...new Set(contacts.flatMap((c) => c.labels || []))];

  const filtered = contacts.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchLabel = labelFilter === 'all' || c.labels?.includes(labelFilter);
    return matchSearch && matchLabel;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground mt-1">
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''} in your phonebook.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchContacts(true)}
            disabled={isRefreshing || loading}
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={16} /> Add Contact
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm flex-1">
          <Search size={14} className="text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50 text-white"
          />
        </div>
        {allLabels.length > 0 && (
          <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
            <button
              onClick={() => setLabelFilter('all')}
              className={cn(
                'px-3 py-2 text-xs font-semibold capitalize transition-colors',
                labelFilter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-card text-muted-foreground hover:bg-accent'
              )}
            >
              All
            </button>
            {allLabels.map((label) => (
              <button
                key={label}
                onClick={() => setLabelFilter(label)}
                className={cn(
                  'px-3 py-2 text-xs font-semibold capitalize transition-colors',
                  labelFilter === label
                    ? 'bg-primary text-white'
                    : 'bg-card text-muted-foreground hover:bg-accent'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-8 space-y-4 animate-pulse">
          <div className="h-6 bg-muted/20 rounded w-1/4" />
          <div className="h-10 bg-muted/20 rounded" />
          <div className="h-10 bg-muted/20 rounded" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ContactIcon}
          title="No Contacts Found"
          description="Build your address book to easily send single/bulk messages without typing raw numbers."
          actionLabel="Add Contact"
          onAction={openCreateModal}
        />
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left px-5 py-3 font-semibold">Name</th>
                  <th className="text-left px-5 py-3 font-semibold">Phone</th>
                  <th className="text-left px-5 py-3 font-semibold">Labels</th>
                  <th className="text-left px-5 py-3 font-semibold">Notes</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((contact) => (
                  <tr key={contact._id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white uppercase">
                          {contact.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-white">{contact.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{contact.phone}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {contact.labels?.map((l) => (
                          <span
                            key={l}
                            className="text-[10px] font-bold bg-primary/10 text-primary rounded px-1.5 py-0.5"
                          >
                            {l}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground max-w-[200px] truncate">
                      {contact.notes || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            router.push(`/dashboard/send?phone=${encodeURIComponent(contact.phone)}`);
                          }}
                          className="h-7 w-7 flex items-center justify-center rounded-md text-primary hover:bg-primary/10 transition-colors"
                          title="Send SMS"
                        >
                          <Send size={14} />
                        </button>
                        <button
                          onClick={() => openEditModal(contact)}
                          className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(contact._id)}
                          className="h-7 w-7 flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg mx-4 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold">
                {editingContact ? 'Edit Contact' : 'Add Contact'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-white font-semibold"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-white font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Labels (comma separated)</label>
                <input
                  type="text"
                  value={labelsStr}
                  onChange={(e) => setLabelsStr(e.target.value)}
                  placeholder="VIP, Customer, Leads"
                  className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-white font-semibold"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add some notes about this contact..."
                  rows={3}
                  className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-white resize-none"
                />
              </div>
              <button
                onClick={handleCreateOrUpdate}
                disabled={submitting}
                className="w-full rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingContact ? 'Update Contact' : 'Create Contact'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
