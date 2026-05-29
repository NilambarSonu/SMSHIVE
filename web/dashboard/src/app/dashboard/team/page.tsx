'use client';

import { Plus, UsersRound, Shield, Mail, MoreVertical, Trash2 } from 'lucide-react';

const mockTeam = [
  { id: '1', name: 'Ramamani Behera', email: 'ramamani@example.com', role: 'admin', joinedAt: '2024-01-15', lastActive: 'now' },
  { id: '2', name: 'Priya Patel', email: 'priya@example.com', role: 'operator', joinedAt: '2024-02-20', lastActive: '2h ago' },
  { id: '3', name: 'Amit Kumar', email: 'amit@example.com', role: 'viewer', joinedAt: '2024-03-10', lastActive: '1d ago' },
];

const roleStyles: Record<string, string> = {
  admin: 'bg-destructive/10 text-destructive',
  operator: 'bg-primary/10 text-primary',
  viewer: 'bg-muted text-muted-foreground',
};

export default function TeamPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground mt-1">Manage team members and their access levels.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Plus size={16} /> Invite Member
        </button>
      </div>

      {/* Roles explanation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { role: 'Admin', desc: 'Full access to all features, settings, and team management', icon: '🔴' },
          { role: 'Operator', desc: 'Send messages, manage devices, view analytics', icon: '🔵' },
          { role: 'Viewer', desc: 'Read-only access to dashboard and logs', icon: '⚪' },
        ].map(r => (
          <div key={r.role} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <span>{r.icon}</span>
              <span className="text-sm font-semibold">{r.role}</span>
            </div>
            <p className="text-xs text-muted-foreground">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Team Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <th className="text-left px-5 py-3 font-medium">Member</th>
              <th className="text-left px-5 py-3 font-medium">Role</th>
              <th className="text-left px-5 py-3 font-medium">Joined</th>
              <th className="text-left px-5 py-3 font-medium">Last Active</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockTeam.map(member => (
              <tr key={member.id} className="hover:bg-muted/20 transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white">{member.name.charAt(0)}</div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${roleStyles[member.role]}`}>{member.role}</span>
                </td>
                <td className="px-5 py-3.5 text-xs text-muted-foreground">{member.joinedAt}</td>
                <td className="px-5 py-3.5 text-xs text-muted-foreground">{member.lastActive}</td>
                <td className="px-5 py-3.5 text-right">
                  <button className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
