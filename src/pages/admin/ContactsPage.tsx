import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Filter,
  UserPlus,
  Trash2,
  Tag as TagIcon,
  UserCheck,
  CheckSquare,
  Square,
  FileSpreadsheet,
  FileText,
  X,
  Edit2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Contact, Tag, User, LeadStatus } from '../../types/index.js';

export const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [agentFilter, setAgentFilter] = useState('ALL');
  const [tagFilter, setTagFilter] = useState('ALL');

  const [agents, setAgents] = useState<User[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Drawer
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchContacts();
    fetchAgents();
    fetchTags();
  }, [page, search, statusFilter, agentFilter, tagFilter]);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        status: statusFilter,
        agentId: agentFilter,
        tagId: tagFilter,
      });
      const res = await fetch(`/api/contacts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts);
        setTotal(data.total);
      }
    } catch (e) {
      console.error('Fetch contacts error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) setAgents(await res.json());
    } catch (e) {}
  };

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags');
      if (res.ok) setTags(await res.json());
    } catch (e) {}
  };

  const handleSelectAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map((c) => c.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    try {
      await fetch('/api/contacts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactIds: selectedIds,
          updates: { leadStatus: newStatus as LeadStatus },
        }),
      });
      setSelectedIds([]);
      fetchContacts();
    } catch (e) {}
  };

  const handleBulkAddTag = async (tagId: string) => {
    if (selectedIds.length === 0 || !tagId) return;
    try {
      await fetch('/api/contacts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactIds: selectedIds,
          updates: { addTagId: tagId },
        }),
      });
      setSelectedIds([]);
      fetchContacts();
    } catch (e) {}
  };

  const handleExportCsv = () => {
    window.open('/api/contacts/export/csv', '_blank');
  };

  const handleExportXlsx = () => {
    window.open('/api/contacts/export/xlsx', '_blank');
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;

    try {
      await fetch(`/api/contacts/${editingContact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingContact),
      });
      setDrawerOpen(false);
      fetchContacts();
    } catch (e) {}
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      fetchContacts();
      setDrawerOpen(false);
    } catch (e) {}
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black gold-gradient-text tracking-wide">
            Contacts CRM & Lead Database
          </h1>
          <p className="text-xs text-slate-400">
            Total {total} client records captured across live chat channels
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-[#1a1a24] border border-[#2a2a38] hover:border-amber-500/50 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportXlsx}
            className="px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500 text-xs font-semibold text-emerald-300 flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-[#14141a] border border-[#242430] rounded-2xl p-4 shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, phone, email..."
              className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500/70"
            />
          </div>

          {/* Lead Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500/70"
          >
            <option value="ALL">All Lead Stages</option>
            <option value="NEW_LEAD">New Lead</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="HIGH_VALUE">High Value</option>
            <option value="FOLLOW_UP">Follow Up</option>
            <option value="CONVERTED">Converted</option>
            <option value="NOT_INTERESTED">Not Interested</option>
            <option value="CLOSED">Closed</option>
          </select>

          {/* Agent Filter */}
          <select
            value={agentFilter}
            onChange={(e) => {
              setAgentFilter(e.target.value);
              setPage(1);
            }}
            className="bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500/70"
          >
            <option value="ALL">All Assigned Agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.fullName}
              </option>
            ))}
          </select>

          {/* Tag Filter */}
          <select
            value={tagFilter}
            onChange={(e) => {
              setTagFilter(e.target.value);
              setPage(1);
            }}
            className="bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500/70"
          >
            <option value="ALL">All Client Tags</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk Action Bar (Visible when rows selected) */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#242430] animate-fade-in">
            <span className="text-xs font-bold text-amber-400">
              {selectedIds.length} Selected:
            </span>

            <select
              onChange={(e) => e.target.value && handleBulkStatusChange(e.target.value)}
              defaultValue=""
              className="bg-[#1e1e28] border border-[#2a2a38] rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none"
            >
              <option value="" disabled>Change Status...</option>
              <option value="QUALIFIED">Set Qualified</option>
              <option value="CONFIRMED">Set Confirmed</option>
              <option value="HIGH_VALUE">Set High Value</option>
              <option value="CONVERTED">Set Converted</option>
              <option value="CLOSED">Set Closed</option>
            </select>

            <select
              onChange={(e) => e.target.value && handleBulkAddTag(e.target.value)}
              defaultValue=""
              className="bg-[#1e1e28] border border-[#2a2a38] rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none"
            >
              <option value="" disabled>Add Tag...</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Contacts Table */}
      <div className="bg-[#14141a] border border-[#242430] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#181822] text-slate-400 font-bold border-b border-[#242430]">
              <tr>
                <th className="p-3 w-10 text-center">
                  <button onClick={handleSelectAll} className="text-slate-400 hover:text-white">
                    {selectedIds.length === contacts.length && contacts.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-3">Client Profile</th>
                <th className="p-3">Mobile & Email</th>
                <th className="p-3">Lead Stage</th>
                <th className="p-3">Score</th>
                <th className="p-3">Tags</th>
                <th className="p-3">Assigned Agent</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e28]">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    Loading contacts...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No matching contacts found.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => {
                  const isSelected = selectedIds.includes(c.id);

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-[#1a1a24] transition ${
                        isSelected ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleSelect(c.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={c.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={c.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-amber-500/30"
                          />
                          <div>
                            <span className="font-bold text-white block">{c.fullName}</span>
                            <span className="text-[10px] text-slate-500">{c.source}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-amber-300">{c.mobileNumber}</div>
                        <div className="text-[10px] text-slate-400">{c.emailAddress || 'N/A'}</div>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          {c.leadStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 font-extrabold text-slate-200">
                        {c.leadScore}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {(c.tags || []).map((t) => (
                            <span
                              key={t.id}
                              style={{ color: t.colorHex, borderColor: `${t.colorHex}50` }}
                              className="px-1.5 py-0.2 rounded text-[9px] font-semibold border bg-black/20"
                            >
                              {t.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-slate-300 font-medium">
                        {c.assignedAgent?.fullName || <span className="text-slate-500">Unassigned</span>}
                      </td>
                      <td className="p-3 text-[11px] text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setEditingContact(c);
                            setDrawerOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-[#20202c] hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 bg-[#181822] border-t border-[#242430] flex items-center justify-between text-xs text-slate-400">
          <span>Page {page} of {Math.ceil(total / limit) || 1}</span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="p-1.5 rounded-lg bg-[#14141a] hover:bg-slate-700 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg bg-[#14141a] hover:bg-slate-700 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Contact Drawer Modal */}
      {drawerOpen && editingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md h-full bg-[#16161c] border-l border-[#2a2a38] p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#2a2a38] mb-6">
                <h3 className="text-base font-bold text-white">Edit Customer Record</h3>
                <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveContact} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingContact.fullName}
                    onChange={(e) => setEditingContact({ ...editingContact, fullName: e.target.value })}
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={editingContact.mobileNumber}
                    onChange={(e) => setEditingContact({ ...editingContact, mobileNumber: e.target.value })}
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editingContact.emailAddress || ''}
                    onChange={(e) => setEditingContact({ ...editingContact, emailAddress: e.target.value })}
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Lead Stage</label>
                  <select
                    value={editingContact.leadStatus}
                    onChange={(e) => setEditingContact({ ...editingContact, leadStatus: e.target.value as LeadStatus })}
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                  >
                    <option value="NEW_LEAD">New Lead</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="HIGH_VALUE">High Value</option>
                    <option value="FOLLOW_UP">Follow Up</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="NOT_INTERESTED">Not Interested</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Lead Score</label>
                  <input
                    type="number"
                    value={editingContact.leadScore}
                    onChange={(e) => setEditingContact({ ...editingContact, leadScore: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Assigned Agent</label>
                  <select
                    value={editingContact.assignedAgentId || ''}
                    onChange={(e) => setEditingContact({ ...editingContact, assignedAgentId: e.target.value || null })}
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                  >
                    <option value="">Unassigned</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>{a.fullName}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 gold-gradient-btn py-2.5 rounded-xl text-xs font-bold"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteContact(editingContact.id)}
                    className="px-3 py-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/40 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
