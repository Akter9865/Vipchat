import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Tags, X } from 'lucide-react';
import { Tag } from '../../types/index.js';

export const TagsPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorHex, setColorHex] = useState('#dfb75c');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags');
      if (res.ok) setTags(await res.json());
    } catch (e) {}
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetch(`/api/tags/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, colorHex }),
        });
      } else {
        await fetch('/api/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, colorHex }),
        });
      }
      setModalOpen(false);
      resetForm();
      fetchTags();
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tag?')) return;
    try {
      await fetch(`/api/tags/${id}`, { method: 'DELETE' });
      fetchTags();
    } catch (e) {}
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setColorHex('#dfb75c');
  };

  const colorPresets = [
    '#dfb75c', '#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black gold-gradient-text tracking-wide">
            Client & CRM Tags
          </h1>
          <p className="text-xs text-slate-400">
            Categorize and label high-value leads and conversations
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Create Tag
        </button>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="bg-[#14141a] border border-[#242430] rounded-2xl p-4 shadow-lg hover:border-amber-500/30 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  style={{ backgroundColor: `${tag.colorHex}20`, borderColor: `${tag.colorHex}60`, color: tag.colorHex }}
                  className="px-3 py-1 rounded-xl text-xs font-extrabold border"
                >
                  {tag.name}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {tag.usageCount || 0} clients
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {tag.description || 'No description provided'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 mt-4 border-t border-[#242430]">
              <button
                onClick={() => {
                  setEditingId(tag.id);
                  setName(tag.name);
                  setDescription(tag.description || '');
                  setColorHex(tag.colorHex);
                  setModalOpen(true);
                }}
                className="p-1.5 rounded-lg bg-[#1e1e28] text-slate-300 hover:text-white transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(tag.id)}
                className="p-1.5 rounded-lg bg-red-950/30 text-red-400 hover:bg-red-900/40 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Tag Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#16161c] border border-[#2a2a38] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2a2a38]">
              <h3 className="text-sm font-bold text-white">
                {editingId ? 'Edit Tag' : 'Create New Tag'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tag Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. VIP Client"
                  className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Highest priority conversion client"
                  className="w-full bg-[#0e0e11] border border-[#2a2a38] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/70"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-2">Tag Badge Color</label>
                <div className="flex items-center gap-2">
                  {colorPresets.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setColorHex(hex)}
                      style={{ backgroundColor: hex }}
                      className={`w-6 h-6 rounded-full transition transform ${
                        colorHex === hex ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#16161c]' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-0 ml-2"
                  />
                </div>
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
                  Save Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
