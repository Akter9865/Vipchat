import React, { useState, useRef, useEffect } from 'react';
import { Smile, Paperclip, Send, Mic, X, StopCircle } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker.js';
import { AttachmentDrawer } from './AttachmentDrawer.js';
import { Message, MessageAttachment } from '../../types/index.js';

interface MessageComposerProps {
  onSendMessage: (content: string, attachments?: MessageAttachment[], replyToId?: string | null) => Promise<void>;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
  placeholder?: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  replyingTo,
  onCancelReply,
  placeholder = 'Type a message',
}) => {
  const [content, setContent] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [pendingAttachments, setPendingAttachments] = useState<MessageAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<any>(null);
  const recordingTimerRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [content]);

  // Voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecordingVoice]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Trigger typing event
    if (onTypingStart) onTypingStart();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (onTypingStop) onTypingStop();
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if ((!content.trim() && pendingAttachments.length === 0) || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSendMessage(
        content.trim(),
        pendingAttachments.length > 0 ? pendingAttachments : undefined,
        replyingTo ? replyingTo.id : null
      );
      setContent('');
      setPendingAttachments([]);
      setShowEmoji(false);
      setShowAttachments(false);
      if (onCancelReply) onCancelReply();
      if (onTypingStop) onTypingStop();
    } catch (err) {
      console.error('Failed to send:', err);
    } finally {
      setIsSubmitting(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
  };

  const handleAttachmentUploaded = (attachment: MessageAttachment) => {
    setPendingAttachments((prev) => [...prev, attachment]);
  };

  const handleSendVoiceNote = async () => {
    setIsRecordingVoice(false);
    // Simulate voice recording sample attachment
    const voiceAttachment: MessageAttachment = {
      id: 'voice-' + Date.now(),
      fileName: `Voice Note (${recordingSeconds}s).mp3`,
      fileUrl: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
      fileType: 'AUDIO',
      fileSize: recordingSeconds * 8000,
      mimeType: 'audio/mpeg',
    };

    await onSendMessage(`🎤 Voice message (${recordingSeconds}s)`, [voiceAttachment], replyingTo?.id || null);
    if (onCancelReply) onCancelReply();
  };

  return (
    <div className="relative bg-[#16161c] border-t border-[#2a2a38] p-2.5 sm:p-3">
      {/* Reply Preview Bar */}
      {replyingTo && (
        <div className="mb-2 p-2 rounded-xl bg-[#1e1e26] border-l-4 border-amber-500 flex items-center justify-between text-xs animate-fade-in">
          <div className="truncate pr-2">
            <span className="font-bold text-amber-400 block text-[11px]">
              Replying to {replyingTo.senderName}
            </span>
            <span className="text-slate-300 truncate block text-[11px]">
              {replyingTo.content || `[${replyingTo.messageType}]`}
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pending Uploads Preview */}
      {pendingAttachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 animate-fade-in">
          {pendingAttachments.map((att, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#20202c] border border-amber-500/30 text-xs text-amber-300"
            >
              <span className="truncate max-w-[120px]">{att.fileName}</span>
              <button
                type="button"
                onClick={() => setPendingAttachments(pendingAttachments.filter((_, idx) => idx !== i))}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Emoji & Attachment Popups */}
      {showEmoji && <EmojiPicker onSelectEmoji={handleSelectEmoji} onClose={() => setShowEmoji(false)} />}
      {showAttachments && (
        <AttachmentDrawer
          isOpen={showAttachments}
          onClose={() => setShowAttachments(false)}
          onAttachmentUploaded={handleAttachmentUploaded}
        />
      )}

      {/* Main Composer Controls */}
      {isRecordingVoice ? (
        /* Voice Recording UI */
        <div className="flex items-center justify-between p-2 rounded-xl bg-red-950/40 border border-red-500/30 animate-pulse">
          <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span>Recording voice note... {recordingSeconds}s</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsRecordingVoice(false)}
              className="px-3 py-1 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendVoiceNote}
              className="px-3 py-1 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-500 text-white flex items-center gap-1 transition"
            >
              <StopCircle className="w-3.5 h-3.5" />
              Send Audio
            </button>
          </div>
        </div>
      ) : (
        /* Standard Composer Input */
        <div className="flex items-end gap-1.5 sm:gap-2">
          {/* Emoji Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowEmoji(!showEmoji);
              setShowAttachments(false);
            }}
            className={`p-2.5 rounded-full text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition ${
              showEmoji ? 'text-amber-400 bg-slate-800' : ''
            }`}
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Text Area */}
          <div className="flex-1 bg-[#0e0e11] border border-[#2a2a38] rounded-2xl px-3.5 py-2 focus-within:border-amber-500/70 focus-within:ring-1 focus-within:ring-amber-500/70 transition flex items-center">
            <textarea
              ref={inputRef}
              rows={1}
              value={content}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none outline-none max-h-32"
            />
          </div>

          {/* Attachments Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowAttachments(!showAttachments);
              setShowEmoji(false);
            }}
            className={`p-2.5 rounded-full text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition ${
              showAttachments ? 'text-amber-400 bg-slate-800' : ''
            }`}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Send or Voice Record Button */}
          {content.trim() || pendingAttachments.length > 0 ? (
            <button
              type="button"
              onClick={handleSend}
              disabled={isSubmitting}
              className="w-10 h-10 rounded-full gold-gradient-btn flex items-center justify-center shadow-md active:scale-95 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-black" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsRecordingVoice(true)}
              className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md active:scale-95 transition"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
