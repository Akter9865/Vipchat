import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, FileText, Check, Sparkles, X } from 'lucide-react';
import { MessageTemplate } from '../../types/index.js';

export const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Greetings');
  const [content, setContent] = useState('');
  const [shortcutKey, setShortcutKey] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) setTemplates(await res.json());
    } catch (e) {}
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetch(`/api/templates/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, category, content, shortcutKey }),
        });
      } else {
        await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, category, content, shortcutKey }),
        });
      }
      setModalOpen(false);
      resetForm();
      fetchTemplates();
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      fetchTemplates();
    } catch (e) {}
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Greetings');
    setContent('');
    setShortcutKey('');
  };

  const insertVariable = (varName: string) => {
    setContent((prev) => prev + ` {{${varName}}}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black gold-gradient-text tracking-wide">
            Canned Message Templates
          </h1>
          <p className="text-xs text-slate-400">
            Create standard VIP responses with dynamic customer variables
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Create Template
        </button>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="bg-[#14141a] border border-[#242430] rounded-2xl p-4 shadow-lg hover:border-amber-500/40 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {tmpl.category}
                </span>
                {tmpl.shortcutKey && (
                  <span className="text-[10px] font-mono text-slate-400 bg-[#1e1e28] px-2 py-0.5 rounded">
                    {tmpl.shortcutKey}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{tmpl.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap line-clamp-4">
                {tmpl.content}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 mt-4 border-t border-[#242430]">
              <button
                onClick={() => {
                  setEditingId(tmpl.id);
                  setTitle(tmpl.title);
                  setCategory(tmpl.category);
                  setContent(tmpl.content);
                  setShortcutKey(tmpl.shortcutKey || '');
                  setModalOpen(true);
                }}
                className="p-1.5 rounded-lg bg-[#1e1e28] text-slate-300 hover:text-white transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(tmpl.id)}
                className="p-1.5 rounded-lg bg-red-950/30 text-red-400 hover:bg-red-900/40 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#16161c] border border-[#2a2a38] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2a2a38]">
              <h3 className="text-sm font-bold text-white">
                {editingId ? 'Edit Message Template' : 'Create New Message Template'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Template Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. VIP Welcome Greeting"
                  className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                  >
                    <option value="Greetings">Greetings</option>
                    <option value="Verification">Verification</option>
                    <option value="Sales">Sales & Offers</option>
                    <option value="Billing">Billing & Deposits</option>
                    <option value="Support">Support</option>
                    <option value="Closing">Closing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Shortcut Key</label>
                  <input
                    type="text"
                    value={shortcutKey}
                    onChange={(e) => setShortcutKey(e.target.value)}
                    placeholder="e.g. /welcome"
                    className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-400 font-semibold">Message Content</label>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500">Insert:</span>
                    {['name', 'mobile', 'agent_name', 'date'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertVariable(v)}
                        className="px-1.5 py-0.5 rounded text-[9px] bg-[#242434] text-amber-300 hover:bg-amber-500/20"
                      >
                        +{v}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Hello {{name}}, welcome to VIP Concierge..."
                  className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl p-3 text-white outline-none focus:border-amber-500/70 resize-none"
                />
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
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
