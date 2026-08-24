import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Phone,
  Video,
  Search,
  MoreVertical,
  CheckCircle2,
  Lock,
  Shield,
  LogOut,
  Sparkles,
  ArrowLeft,
  X,
  Volume2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useSocket } from '../../context/SocketContext.js';
import { useSettings } from '../../context/SettingsContext.js';
import { MessageBubble } from '../../components/chat/MessageBubble.js';
import { MessageComposer } from '../../components/chat/MessageComposer.js';
import { ShowcaseCallModal } from '../../components/chat/ShowcaseCallModal.js';
import { Message, MessageAttachment } from '../../types/index.js';

export const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { customer, customerConversation, isCustomerLoading, logoutCustomer } = useAuth();
  const { socket, joinConversation, sendMessage, sendTypingStart, sendTypingStop, markConversationAsRead } = useSocket();
  const { settings } = useSettings();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [callModal, setCallModal] = useState<{ isOpen: boolean; type: 'audio' | 'video' }>({
    isOpen: false,
    type: 'audio',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If not logged in and done loading, redirect to onboarding
  useEffect(() => {
    if (!isCustomerLoading && !customer) {
      navigate('/login');
    }
  }, [customer, isCustomerLoading, navigate]);

  // Join conversation & fetch messages
  useEffect(() => {
    if (customerConversation?.id) {
      joinConversation(customerConversation.id);
      fetchMessages(customerConversation.id);
      markConversationAsRead(customerConversation.id);
    }
  }, [customerConversation?.id]);

  // Real-time socket message listeners
  useEffect(() => {
    if (!socket || !customerConversation?.id) return;

    const handleNewMessage = (msg: Message) => {
      if (msg.conversationId === customerConversation.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        markConversationAsRead(customerConversation.id);
      }
    };

    const handleTypingStatus = (data: any) => {
      if (data.conversationId === customerConversation.id && data.userType === 'AGENT') {
        setIsAgentTyping(data.isTyping);
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('typing:status', handleTypingStatus);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('typing:status', handleTypingStatus);
    };
  }, [socket, customerConversation?.id]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentTyping]);

  const fetchMessages = async (convoId: string) => {
    try {
      setIsLoadingMessages(true);
      const res = await fetch(`/api/conversations/${convoId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Fetch messages error:', e);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (content: string, attachments?: MessageAttachment[], replyToId?: string | null) => {
    if (!customerConversation?.id) return;

    try {
      const newMsg = await sendMessage({
        conversationId: customerConversation.id,
        content,
        replyToId,
        attachments,
      });

      if (newMsg) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
    }
  };

  const handleLogout = async () => {
    await logoutCustomer();
    navigate('/');
  };

  // Filter messages by search query if search bar active
  const displayedMessages = searchQuery.trim()
    ? messages.filter((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-[#0b141a] text-slate-100 shadow-2xl relative overflow-hidden border-x border-[#2a2a38]">
      {/* 1. Header (WhatsApp-inspired Header with Dynamic Settings) */}
      <header
        style={{ backgroundColor: settings.headerColor || '#005c4b' }}
        className="px-3.5 py-2.5 flex items-center justify-between shadow-md z-30 select-none transition-colors"
      >
        {/* Left Side: Avatar & Identity */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={settings.supportAvatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
              alt="Support"
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shadow-md"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#1f2c34]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white tracking-wide">
                {settings.supportName || 'Chat Support'}
              </h2>
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
            </div>
            <p className="text-[11px] text-emerald-300 font-medium leading-none mt-0.5">
              {isAgentTyping ? (
                <span className="text-cyan-300 animate-pulse">Typing...</span>
              ) : (
                settings.onlineText || 'Online'
              )}
            </p>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-1 text-slate-200">
          {/* Audio Call Showcase Button */}
          <button
            onClick={() => setCallModal({ isOpen: true, type: 'audio' })}
            title="Audio Call (Showcase)"
            className="p-2 rounded-full hover:bg-black/20 text-slate-200 hover:text-white transition"
          >
            <Phone className="w-5 h-5" />
          </button>

          {/* Video Call Showcase Button */}
          <button
            onClick={() => setCallModal({ isOpen: true, type: 'video' })}
            title="Video Call (Showcase)"
            className="p-2 rounded-full hover:bg-black/20 text-slate-200 hover:text-white transition"
          >
            <Video className="w-5 h-5" />
          </button>

          {/* Search Button */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            title="Search Messages"
            className="p-2 rounded-full hover:bg-black/20 text-slate-200 hover:text-white transition"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* More Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-black/20 text-slate-200 hover:text-white transition"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 z-50 bg-[#1e1e26] border border-[#2a2a38] rounded-xl py-1.5 shadow-2xl w-48 text-xs text-slate-200 animate-fade-in">
                <div className="px-3 py-1.5 border-b border-slate-700/50 text-[11px] text-amber-400 font-semibold truncate">
                  Logged in as {customer?.fullName}
                </div>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setCallModal({ isOpen: true, type: 'audio' });
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-700/50 transition flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" /> Audio Showcase
                </button>
                <Link
                  to="/privacy"
                  onClick={() => setShowMenu(false)}
                  className="block w-full text-left px-3 py-2 hover:bg-slate-700/50 transition"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  onClick={() => setShowMenu(false)}
                  className="block w-full text-left px-3 py-2 hover:bg-slate-700/50 transition"
                >
                  Terms & Conditions
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-950/40 transition flex items-center gap-2 border-t border-slate-700/50 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> End Session / Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Inline Search Bar */}
      {showSearch && (
        <div className="bg-[#1f2c34] p-2 flex items-center gap-2 border-b border-[#2a2a38] animate-fade-in z-20">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversation..."
            className="flex-1 bg-[#111b21] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-400 outline-none"
            autoFocus
          />
          <button
            onClick={() => {
              setSearchQuery('');
              setShowSearch(false);
            }}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Chat Message Stream */}
      <div
        className={`flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 ${
          settings.chatWallpaperType === 'doodle_light' ? 'chat-wallpaper' : 'dark-chat-wallpaper'
        }`}
      >
        {/* Support Showcase Info Card (Matching Screenshot 1) */}
        <div className="bg-white dark:bg-[#1f2c34] rounded-3xl p-5 shadow-xl text-center max-w-sm mx-auto my-3 border border-emerald-500/20">
          {/* Avatar with Ring */}
          <div className="relative inline-block mb-3">
            <img
              src={settings.supportAvatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
              alt="Support Avatar"
              className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-emerald-500 p-0.5"
            />
            <span className="absolute bottom-1 right-2 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1f2c34]" />
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {settings.supportName || 'Chat Support'}
            </h3>
            <CheckCircle2 className="w-4 h-4 text-cyan-500 fill-cyan-500/20" />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
            {settings.replyTimeText || 'Typically replies within 5 minutes'}
          </p>

          {/* Quick Action Badges */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() => setCallModal({ isOpen: true, type: 'audio' })}
              className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition active:scale-95"
            >
              <Phone className="w-4 h-4 mb-1" />
              <span className="text-[11px] font-bold">Audio</span>
            </button>

            <button
              onClick={() => setCallModal({ isOpen: true, type: 'video' })}
              className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition active:scale-95"
            >
              <Video className="w-4 h-4 mb-1" />
              <span className="text-[11px] font-bold">Video</span>
            </button>

            <div className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 mb-1" />
              <span className="text-[11px] font-bold">Verified</span>
            </div>
          </div>

          {/* Encryption Guarantees */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>End-to-end encrypted</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Secure</span>
            </div>
          </div>
        </div>

        {/* Date Pill Separator */}
        <div className="flex justify-center my-3">
          <span className="px-3 py-1 rounded-lg bg-[#182229] border border-slate-800 text-[11px] font-semibold text-slate-400 shadow-sm">
            Today
          </span>
        </div>

        {/* Messages Feed */}
        {isLoadingMessages ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading live conversation...
          </div>
        ) : (
          displayedMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMe={msg.senderType === 'CUSTOMER'}
              onReply={(m) => setReplyingTo(m)}
            />
          ))
        )}

        {/* Typing Bubble */}
        {isAgentTyping && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#202c33] max-w-[120px] text-xs text-slate-300 animate-pulse shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-100" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-200" />
            <span className="text-[10px] text-slate-400 ml-1">typing</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Message Composer */}
      <MessageComposer
        onSendMessage={handleSendMessage}
        onTypingStart={() => customerConversation?.id && sendTypingStart(customerConversation.id)}
        onTypingStop={() => customerConversation?.id && sendTypingStop(customerConversation.id)}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />

      {/* 4. Audio/Video Showcase Modal */}
      <ShowcaseCallModal
        isOpen={callModal.isOpen}
        type={callModal.type}
        supportName={settings.supportName || 'Chat Support'}
        onClose={() => setCallModal({ ...callModal, isOpen: false })}
      />
    </div>
  );
};
