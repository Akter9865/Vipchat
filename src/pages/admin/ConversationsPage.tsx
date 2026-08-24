import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  CheckCircle2,
  Star,
  Tag as TagIcon,
  UserPlus,
  Lock,
  Send,
  Paperclip,
  Smile,
  FileText,
  StickyNote,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  Sparkles,
  ChevronRight,
  MoreVertical,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useSocket } from '../../context/SocketContext.js';
import { Conversation, Message, Tag, User, MessageTemplate, InternalNote, MessageAttachment } from '../../types/index.js';
import { MessageBubble } from '../../components/chat/MessageBubble.js';
import { MessageComposer } from '../../components/chat/MessageComposer.js';

export const ConversationsPage: React.FC = () => {
  const { adminUser } = useAuth();
  const { socket, joinConversation, leaveConversation, sendMessage } = useSocket();

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([]);
  const [isNotesTab, setIsNotesTab] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [agents, setAgents] = useState<User[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial conversations, agents, tags, templates
  useEffect(() => {
    fetchConversations();
    fetchAgents();
    fetchTags();
    fetchTemplates();
  }, [activeTab]);

  // Real-time socket updates for conversations & new messages
  useEffect(() => {
    if (!socket) return;

    socket.on('message:new', (msg: Message) => {
      if (selectedConvoId && msg.conversationId === selectedConvoId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
      fetchConversations();
    });

    socket.on('conversation:updated', () => {
      fetchConversations();
    });

    return () => {
      socket.off('message:new');
      socket.off('conversation:updated');
    };
  }, [socket, selectedConvoId]);

  // Fetch messages and notes when selected conversation changes
  useEffect(() => {
    if (selectedConvoId) {
      joinConversation(selectedConvoId);
      fetchConvoDetails(selectedConvoId);
      fetchMessages(selectedConvoId);
      fetchNotes(selectedConvoId);
    }
  }, [selectedConvoId]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isNotesTab]);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/conversations?tab=${activeTab}&search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (data.length > 0 && !selectedConvoId) {
          setSelectedConvoId(data[0].id);
        }
      }
    } catch (e) {}
  };

  const fetchConvoDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveConvo(data);
      }
    } catch (e) {}
  };

  const fetchMessages = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {}
  };

  const fetchNotes = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}/notes`);
      if (res.ok) {
        const data = await res.json();
        setInternalNotes(data);
      }
    } catch (e) {}
  };

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (e) {}
  };

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags');
      if (res.ok) {
        const data = await res.json();
        setAllTags(data);
      }
    } catch (e) {}
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (e) {}
  };

  const handleSendMessage = async (content: string, attachments?: MessageAttachment[], replyToId?: string | null) => {
    if (!selectedConvoId) return;
    try {
      const newMsg = await sendMessage({
        conversationId: selectedConvoId,
        content,
        replyToId,
        attachments,
      });
      if (newMsg) {
        setMessages((prev) => [...prev, newMsg]);
      }
    } catch (e) {}
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !selectedConvoId || !activeConvo?.contactId) return;

    try {
      const res = await fetch(`/api/conversations/${selectedConvoId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: noteContent.trim(),
          contactId: activeConvo.contactId,
        }),
      });
      if (res.ok) {
        const newNote = await res.json();
        setInternalNotes((prev) => [newNote, ...prev]);
        setNoteContent('');
      }
    } catch (e) {}
  };

  const handleUpdateLeadStatus = async (status: string) => {
    if (!activeConvo?.contact?.id) return;
    try {
      await fetch(`/api/contacts/${activeConvo.contact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadStatus: status }),
      });
      fetchConvoDetails(selectedConvoId!);
      fetchConversations();
    } catch (e) {}
  };

  const handleAssignAgent = async (agentId: string) => {
    if (!selectedConvoId) return;
    try {
      await fetch(`/api/conversations/${selectedConvoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedAgentId: agentId || null }),
      });
      fetchConvoDetails(selectedConvoId);
      fetchConversations();
    } catch (e) {}
  };

  const handleTogglePriority = async () => {
    if (!selectedConvoId || !activeConvo) return;
    const newPriority = activeConvo.priority === 'VIP' ? 'MEDIUM' : 'VIP';
    try {
      await fetch(`/api/conversations/${selectedConvoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      });
      fetchConvoDetails(selectedConvoId);
      fetchConversations();
    } catch (e) {}
  };

  const handleToggleStar = async () => {
    if (!selectedConvoId || !activeConvo) return;
    try {
      await fetch(`/api/conversations/${selectedConvoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isStarred: !activeConvo.isStarred }),
      });
      fetchConvoDetails(selectedConvoId);
      fetchConversations();
    } catch (e) {}
  };

  const handleApplyTemplate = async (template: MessageTemplate) => {
    if (!activeConvo?.contact || !selectedConvoId) return;
    let text = template.content;
    text = text.replace(/\{\{name\}\}/gi, activeConvo.contact.fullName || 'Guest');
    text = text.replace(/\{\{mobile\}\}/gi, activeConvo.contact.mobileNumber || '');
    text = text.replace(/\{\{email\}\}/gi, activeConvo.contact.emailAddress || '');
    text = text.replace(/\{\{agent_name\}\}/gi, adminUser?.fullName || 'VIP Agent');
    text = text.replace(/\{\{date\}\}/gi, new Date().toLocaleDateString());

    await handleSendMessage(text);
    setShowTemplatesModal(false);
  };

  const filterTabs = [
    { id: 'ALL', label: 'All' },
    { id: 'UNREAD', label: 'Unread' },
    { id: 'ACTIVE', label: 'Active' },
    { id: 'ASSIGNED_TO_ME', label: 'My Chats' },
    { id: 'PRIORITY', label: 'VIP Priority' },
    { id: 'STARRED', label: 'Starred' },
    { id: 'CLOSED', label: 'Closed' },
  ];

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#14141a] border border-[#242430] rounded-2xl overflow-hidden shadow-2xl">
      {/* 1. Left Sidebar: Conversation List */}
      <div className="w-80 border-r border-[#242430] flex flex-col bg-[#111116] shrink-0">
        {/* Search & Tabs */}
        <div className="p-3 border-b border-[#242430] space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchConversations()}
              placeholder="Filter chats..."
              className="w-full bg-[#181822] border border-[#2a2a38] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500/70"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'bg-[#181822] text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List Cards */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#1e1e28]">
          {conversations.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-10">No conversations in this tab</p>
          ) : (
            conversations.map((convo) => {
              const isSelected = convo.id === selectedConvoId;
              const contact = convo.contact;

              return (
                <div
                  key={convo.id}
                  onClick={() => setSelectedConvoId(convo.id)}
                  className={`p-3 cursor-pointer transition flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-amber-500/10 border-l-4 border-amber-500'
                      : 'hover:bg-[#161620]'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={contact?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={contact?.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-amber-500/30"
                    />
                    {contact?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#111116]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {contact?.fullName || 'Anonymous'}
                      </span>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {new Date(convo.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate mb-1">
                      {convo.lastMessageSnippet || 'No messages yet'}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {convo.priority === 'VIP' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          VIP
                        </span>
                      )}
                      {convo.isStarred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                      {convo.unreadAgentCount > 0 && (
                        <span className="ml-auto px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                          {convo.unreadAgentCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Middle Panel: Live Chat History & Composer */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0e0e11]">
        {activeConvo ? (
          <>
            {/* Header */}
            <div className="px-4 py-3 bg-[#16161c] border-b border-[#242430] flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={activeConvo.contact?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={activeConvo.contact?.fullName}
                  className="w-9 h-9 rounded-full object-cover border border-amber-500/30"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-white">
                      {activeConvo.contact?.fullName}
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      ({activeConvo.contact?.mobileNumber})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>Score: <strong className="text-amber-400">{activeConvo.contact?.leadScore}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{activeConvo.contact?.leadStatus?.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-1.5">
                {/* Internal Notes / Chat Toggle */}
                <button
                  onClick={() => setIsNotesTab(!isNotesTab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    isNotesTab
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-[#20202c] text-amber-400 hover:bg-amber-500/20'
                  }`}
                >
                  <StickyNote className="w-3.5 h-3.5" />
                  <span>{isNotesTab ? 'View Chat' : 'Internal Notes'}</span>
                </button>

                {/* Templates Picker Button */}
                <button
                  onClick={() => setShowTemplatesModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#20202c] hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Templates</span>
                </button>

                <button
                  onClick={handleTogglePriority}
                  title="Toggle VIP Priority"
                  className={`p-2 rounded-xl transition ${
                    activeConvo.priority === 'VIP' ? 'bg-amber-500 text-black' : 'bg-[#20202c] text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </button>

                <button
                  onClick={handleToggleStar}
                  title="Star Conversation"
                  className={`p-2 rounded-xl transition ${
                    activeConvo.isStarred ? 'bg-amber-500/20 text-amber-400' : 'bg-[#20202c] text-slate-400 hover:text-white'
                  }`}
                >
                  <Star className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Feed (Chat or Internal Notes) */}
            <div className="flex-1 overflow-y-auto p-4 dark-chat-wallpaper space-y-2">
              {isNotesTab ? (
                /* Internal Notes Stream */
                <div className="max-w-xl mx-auto space-y-4">
                  <form onSubmit={handleAddNote} className="bg-[#1e1e26] border border-amber-500/30 rounded-2xl p-3 shadow-lg">
                    <textarea
                      rows={2}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Add private internal note for agents/admins..."
                      className="w-full bg-[#121217] border border-[#2a2a38] rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-amber-500/70 resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        className="gold-gradient-btn px-4 py-1.5 rounded-xl text-xs font-bold"
                      >
                        Save Internal Note
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2">
                    {internalNotes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-3.5 text-xs text-slate-200"
                      >
                        <div className="flex items-center justify-between text-[10px] text-amber-400 font-semibold mb-1">
                          <span>{note.author?.fullName || 'Agent'}</span>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Customer Chat Stream */
                messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isMe={msg.senderType === 'AGENT'}
                    onReply={(m) => setReplyingTo(m)}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Composer for Agent */}
            {!isNotesTab && (
              <MessageComposer
                onSendMessage={handleSendMessage}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
                placeholder="Type reply as VIP Agent (or click Templates)..."
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
            Select a conversation from the left inbox
          </div>
        )}
      </div>

      {/* 3. Right Customer CRM Profile Drawer */}
      {activeConvo && activeConvo.contact && (
        <div className="w-72 border-l border-[#242430] bg-[#111116] p-4 overflow-y-auto hidden xl:block space-y-5">
          {/* Profile Card */}
          <div className="text-center pb-4 border-b border-[#242430]">
            <img
              src={activeConvo.contact.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={activeConvo.contact.fullName}
              className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-amber-500/40 mb-2"
            />
            <h4 className="text-sm font-bold text-white">{activeConvo.contact.fullName}</h4>
            <p className="text-xs text-amber-400 font-semibold">{activeConvo.contact.mobileNumber}</p>
            {activeConvo.contact.emailAddress && (
              <p className="text-[11px] text-slate-400 truncate">{activeConvo.contact.emailAddress}</p>
            )}
          </div>

          {/* Lead Status Progression */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Lead Stage
            </label>
            <select
              value={activeConvo.contact.leadStatus}
              onChange={(e) => handleUpdateLeadStatus(e.target.value)}
              className="w-full bg-[#181822] border border-[#2a2a38] rounded-xl px-3 py-2 text-xs font-semibold text-amber-300 outline-none cursor-pointer"
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

          {/* Assigned Agent */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Assigned Agent
            </label>
            <select
              value={activeConvo.assignedAgentId || ''}
              onChange={(e) => handleAssignAgent(e.target.value)}
              className="w-full bg-[#181822] border border-[#2a2a38] rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none cursor-pointer"
            >
              <option value="">Unassigned</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              Client Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(activeConvo.tags || []).map((tag) => (
                <span
                  key={tag.id}
                  style={{ backgroundColor: `${tag.colorHex}20`, borderColor: `${tag.colorHex}50`, color: tag.colorHex }}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold border"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-[#242430] space-y-2 text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Source:</span>
              <strong className="text-slate-200">{activeConvo.contact.source}</strong>
            </div>
            <div className="flex justify-between">
              <span>Registered:</span>
              <strong className="text-slate-200">{new Date(activeConvo.contact.createdAt).toLocaleDateString()}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1a1a24] border border-[#2a2a38] rounded-2xl w-full max-w-lg p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/50">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Message Templates
              </h3>
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="p-3 rounded-xl bg-[#121217] border border-[#2a2a38] hover:border-amber-500/60 cursor-pointer transition group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white group-hover:text-amber-300">
                      {tmpl.title}
                    </span>
                    <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">
                      {tmpl.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{tmpl.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
