'use client';

import { Plus, Search, Contact, Phone, Tag, Pencil, Trash2, Send, Upload } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const mockContacts = [
  { id: '1', name: 'Rahul Sharma', phone: '+91 98765 43210', labels: ['VIP', 'Customer'], notes: 'Premium customer since 2023' },
  { id: '2', name: 'Priya Patel', phone: '+91 87654 32109', labels: ['Customer'], notes: '' },
  { id: '3', name: 'Amit Kumar', phone: '+91 76543 21098', labels: ['Lead'], notes: 'Interested in bulk SMS API' },
  { id: '4', name: 'Sneha Reddy', phone: '+91 65432 10987', labels: ['Customer', 'Beta'], notes: 'Beta tester' },
  { id: '5', name: 'Vikram Singh', phone: '+91 54321 09876', labels: ['Team'], notes: 'Internal team member' },
  { id: '6', name: 'Neha Gupta', phone: '+91 43210 98765', labels: ['Customer'], notes: '' },
];

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const [labelFilter, setLabelFilter] = useState('all');
  const allLabels = [...new Set(mockContacts.flatMap(c => c.labels))];
  const filtered = mockContacts.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchLabel = labelFilter === 'all' || c.labels.includes(labelFilter);
    return matchSearch && matchLabel;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground mt-1">{mockContacts.length} contacts in your book.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors">
            <Upload size={16} /> Import CSV
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Plus size={16} /> Add Contact
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm flex-1">
          <Search size={14} className="text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contacts..." className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50" />
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
          <button onClick={() => setLabelFilter('all')} className={cn('px-3 py-2 text-xs font-medium transition-colors', labelFilter === 'all' ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-accent')}>All</button>
          {allLabels.map(label => (
            <button key={label} onClick={() => setLabelFilter(label)} className={cn('px-3 py-2 text-xs font-medium transition-colors', labelFilter === label ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-accent')}>{label}</button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-5 py-3 font-medium">Phone</th>
              <th className="text-left px-5 py-3 font-medium">Labels</th>
              <th className="text-left px-5 py-3 font-medium">Notes</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(contact => (
              <tr key={contact.id} className="hover:bg-muted/20 transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white">{contact.name.charAt(0)}</div>
                    <span className="font-medium">{contact.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{contact.phone}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1">
                    {contact.labels.map(l => <span key={l} className="text-[10px] font-medium bg-primary/10 text-primary rounded px-1.5 py-0.5">{l}</span>)}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs text-muted-foreground max-w-[200px] truncate">{contact.notes || '—'}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="h-7 w-7 flex items-center justify-center rounded-md text-primary hover:bg-primary/10 transition-colors" title="Send SMS"><Send size={14} /></button>
                    <button className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent transition-colors" title="Edit"><Pencil size={14} /></button>
                    <button className="h-7 w-7 flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10 transition-colors" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
