import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Shield, KeyRound, Ban, CheckCircle2, X, Trash2, Smartphone } from 'lucide-react';
import { User } from '../../types/index.js';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [sessionsModalUser, setSessionsModalUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'AGENT' | 'ADMIN' | 'SUPER_ADMIN'>('AGENT');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) setUsers(await res.json());
    } catch (e) {}
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, role }),
      });
      if (res.ok) {
        setModalOpen(false);
        setFullName('');
        setEmail('');
        setPassword('');
        fetchUsers();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to create user');
      }
    } catch (e) {}
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      fetchUsers();
    } catch (e) {}
  };

  const handleViewSessions = async (user: User) => {
    setSessionsModalUser(user);
    try {
      const res = await fetch(`/api/users/${user.id}/sessions`);
      if (res.ok) setSessions(await res.json());
    } catch (e) {}
  };

  const handleRevokeSession = async (token: string) => {
    try {
      await fetch(`/api/users/sessions/${token}/revoke`, { method: 'POST' });
      if (sessionsModalUser) handleViewSessions(sessionsModalUser);
    } catch (e) {}
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black gold-gradient-text tracking-wide">
            Team & User Access Control (RBAC)
          </h1>
          <p className="text-xs text-slate-400">
            Manage Super Admins, Operations Managers, Support Agents, and active sessions
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Team Member
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-[#14141a] border border-[#242430] rounded-2xl overflow-hidden shadow-lg">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#181822] text-slate-400 font-bold border-b border-[#242430]">
            <tr>
              <th className="p-3">User Profile</th>
              <th className="p-3">Email Address</th>
              <th className="p-3">Role & Access</th>
              <th className="p-3">Account Status</th>
              <th className="p-3">Last Active</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e28]">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#1a1a24] transition">
                <td className="p-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={u.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-amber-500/30"
                    />
                    <span className="font-bold text-white">{u.fullName}</span>
                  </div>
                </td>
                <td className="p-3 text-slate-300 font-medium">{u.email}</td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    u.role === 'SUPER_ADMIN'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                      : u.role === 'ADMIN'
                      ? 'bg-purple-500/15 text-purple-300 border-purple-500/40'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  }`}>
                    <Shield className="w-3 h-3" />
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleToggleStatus(u)}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                      u.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {u.isActive ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td className="p-3 text-slate-500 text-[11px]">
                  {u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleString() : 'Never'}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleViewSessions(u)}
                    title="Active Sessions & Security"
                    className="p-1.5 rounded-lg bg-[#20202c] hover:bg-slate-700 text-slate-300 hover:text-white transition inline-flex items-center gap-1 text-[11px]"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Sessions
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#16161c] border border-[#2a2a38] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2a2a38]">
              <h3 className="text-sm font-bold text-white">Create Team Account</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@vipchat.live"
                  className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Role Permissions</label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                >
                  <option value="AGENT">Support Agent (Assigned chats, replies, notes)</option>
                  <option value="ADMIN">Admin (All contacts, tags, templates, automations)</option>
                  <option value="SUPER_ADMIN">Super Admin (Full control, settings, users, audit)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-gradient-btn px-5 py-2 rounded-xl text-xs font-bold"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Sessions & Revocation Modal */}
      {sessionsModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#16161c] border border-[#2a2a38] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2a2a38]">
              <h3 className="text-sm font-bold text-white">
                Active Sessions: {sessionsModalUser.fullName}
              </h3>
              <button onClick={() => setSessionsModalUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {sessions.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-6">No active sessions.</p>
              ) : (
                sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3 rounded-xl bg-[#111116] border border-[#2a2a38] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block truncate max-w-xs">
                        {sess.userAgent || 'Web Browser'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        IP: {sess.ipAddress || '127.0.0.1'} • Created: {new Date(sess.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {!sess.revokedAt ? (
                      <button
                        onClick={() => handleRevokeSession(sess.token)}
                        className="px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/40 font-semibold text-[10px] transition"
                      >
                        Revoke
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-600 font-semibold">Revoked</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
