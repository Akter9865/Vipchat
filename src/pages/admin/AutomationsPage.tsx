import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Plus,
  Trash2,
  Edit2,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Automation } from '../../types/index.js';

export const AutomationsPage: React.FC = () => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'rules' | 'logs'>('rules');
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState('CUSTOMER_REGISTERED');
  const [keywordValue, setKeywordValue] = useState('');
  const [actionType, setActionType] = useState('SEND_MESSAGE');
  const [messageContent, setMessageContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('IMAGE');
  const [mediaName, setMediaName] = useState('');

  const mediaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAutomations();
    fetchLogs();
  }, []);

  const fetchAutomations = async () => {
    try {
      const res = await fetch('/api/automations');
      if (res.ok) setAutomations(await res.json());
    } catch (e) {}
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/automations/logs');
      if (res.ok) setLogs(await res.json());
    } catch (e) {}
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const form = new FormData();
      form.append('file', file);

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();
      if (res.ok && data.file) {
        setMediaUrl(data.file.fileUrl);
        setMediaName(data.file.fileName);
        setMediaType(data.file.fileType || 'IMAGE');
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const conditions: any[] = [];
      if (triggerType === 'KEYWORD_MATCH' && keywordValue.trim()) {
        conditions.push({
          field: 'keyword',
          operator: 'CONTAINS',
          value: keywordValue.trim().toLowerCase(),
        });
      }

      const actions: any[] = [];
      if (actionType === 'SEND_MESSAGE') {
        actions.push({
          actionType: 'SEND_MESSAGE',
          payload: {
            content: messageContent,
            mediaUrl: mediaUrl || undefined,
            mediaType: mediaType || undefined,
            mediaName: mediaName || undefined,
          },
        });
      } else if (actionType === 'ADD_TAG') {
        actions.push({
          actionType: 'ADD_TAG',
          payload: { tagName: 'Hot Lead' },
        });
      } else if (actionType === 'CHANGE_STATUS') {
        actions.push({
          actionType: 'CHANGE_STATUS',
          payload: { status: 'QUALIFIED' },
        });
      }

      await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          triggerType,
          conditions,
          actions,
        }),
      });

      setModalOpen(false);
      setName('');
      setDescription('');
      setMessageContent('');
      setMediaUrl('');
      setKeywordValue('');
      fetchAutomations();
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this automation rule?')) return;
    try {
      await fetch(`/api/automations/${id}`, { method: 'DELETE' });
      fetchAutomations();
    } catch (e) {}
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black gold-gradient-text tracking-wide">
            Smart CRM Automations & Quick-Replies
          </h1>
          <p className="text-xs text-slate-400">
            Set up automatic responses with formatted text, images, videos, audio, and keyword bots
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#14141a] border border-[#242430] rounded-xl p-1 text-xs">
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                activeTab === 'rules' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active Rules ({automations.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                activeTab === 'logs' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Execution Logs ({logs.length})
            </button>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" /> Create Rule
          </button>
        </div>
      </div>

      {/* View: Active Rules */}
      {activeTab === 'rules' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automations.map((rule) => (
            <div
              key={rule.id}
              className="bg-[#14141a] border border-[#242430] rounded-2xl p-5 shadow-lg hover:border-amber-500/40 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white">{rule.name}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4">{rule.description}</p>

                {/* Visual Pipeline Block */}
                <div className="p-3 rounded-xl bg-[#0e0e11] border border-[#242430] text-xs space-y-2">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-[10px] uppercase font-bold text-amber-400">TRIGGER:</span>
                    <span className="font-mono text-[11px] text-slate-200">{rule.triggerType}</span>
                  </div>

                  {rule.conditions && rule.conditions.length > 0 && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-[10px] uppercase font-bold text-blue-400">MATCH:</span>
                      <span className="text-[11px] text-slate-300">
                        {rule.conditions.map((c: any) => `${c.field} = "${c.value}"`).join(', ')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-[10px] uppercase font-bold text-emerald-400">ACTIONS:</span>
                    <span className="text-[11px] text-slate-400">
                      {rule.actions?.map((a: any) => a.actionType).join(', ') || 'Auto Message'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#242430] text-xs text-slate-500">
                <span>{rule.executionCount || 0} times triggered</span>
                <button
                  onClick={() => handleDelete(rule.id)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/30 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* View: Execution Logs */
        <div className="bg-[#14141a] border border-[#242430] rounded-2xl overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#181822] text-slate-400 font-bold border-b border-[#242430]">
              <tr>
                <th className="p-3">Rule Name</th>
                <th className="p-3">Trigger Event</th>
                <th className="p-3">Customer Affected</th>
                <th className="p-3">Execution Status</th>
                <th className="p-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e28]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">
                    No execution logs yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#1a1a24] transition">
                    <td className="p-3 font-bold text-white">{log.automationName}</td>
                    <td className="p-3 font-mono text-amber-300">{log.triggerEvent}</td>
                    <td className="p-3 text-slate-300">{log.contactName || 'Visitor'}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {log.status === 'SUCCESS' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-500">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* New Rule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#16161c] border border-[#2a2a38] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2a2a38]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Create Smart Automation & Quick Reply
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Instant Banking / Deposit Guide"
                  className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe when this rule triggers"
                  className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Trigger Condition</label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value)}
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                  >
                    <option value="CUSTOMER_REGISTERED">When Customer Joins</option>
                    <option value="FIRST_MESSAGE">Customer Sends First Message</option>
                    <option value="KEYWORD_MATCH">Specific Keyword Received</option>
                    <option value="STATUS_CHANGED">Lead Status Changes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Action</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                  >
                    <option value="SEND_MESSAGE">Send Auto Message & Media</option>
                    <option value="ADD_TAG">Add VIP Tag</option>
                    <option value="CHANGE_STATUS">Set Qualified Status</option>
                  </select>
                </div>
              </div>

              {/* Keyword Input if Keyword trigger */}
              {triggerType === 'KEYWORD_MATCH' && (
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Matching Keyword (e.g. deposit, bonus, withdraw, id)
                  </label>
                  <input
                    type="text"
                    required
                    value={keywordValue}
                    onChange={(e) => setKeywordValue(e.target.value)}
                    placeholder="e.g. deposit"
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                  />
                </div>
              )}

              {actionType === 'SEND_MESSAGE' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Auto-Response Message</label>
                    <textarea
                      rows={3}
                      required
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Hello {{name}}, here are the details..."
                      className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl p-2.5 text-white outline-none focus:border-amber-500/70 resize-none"
                    />
                  </div>

                  {/* Media Attachment */}
                  <div className="p-3 rounded-xl bg-[#0e0e11] border border-[#2a2a38]">
                    <span className="block text-slate-400 font-semibold mb-1.5">Optional Media Attachment (Photo/Video/Doc)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={mediaInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => mediaInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-[#1e1e28] hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-400" /> Upload File
                      </button>
                      {mediaUrl && (
                        <span className="text-[11px] text-emerald-400 truncate max-w-xs font-semibold">
                          Attached: {mediaName || mediaUrl}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

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
                  Save Automation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
