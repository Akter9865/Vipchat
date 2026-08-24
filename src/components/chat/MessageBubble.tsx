import React, { useState } from 'react';
import { Check, CheckCheck, Play, Pause, Download, FileText, Reply, Copy, Trash2, ExternalLink } from 'lucide-react';
import { Message } from '../../types/index.js';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  onReply?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  onReply,
  onDelete,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showLightbox, setShowLightbox] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Time formatter
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // URL linkifier
  const renderFormattedContent = (content: string) => {
    if (!content) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-amber-300 underline font-medium break-all hover:opacity-80 inline-flex items-center gap-0.5"
          >
            {part} <ExternalLink className="w-2.5 h-2.5 inline" />
          </a>
        );
      }
      return <span key={i} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const isSystem = message.senderType === 'SYSTEM' || message.senderType === 'AUTOMATION';

  return (
    <>
      <div
        className={`flex w-full my-1.5 group relative ${
          isSystem ? 'justify-center' : isMe ? 'justify-end' : 'justify-start'
        }`}
      >
        {/* System Message Banner */}
        {isSystem ? (
          <div className="max-w-lg bg-[#1a232a] border border-amber-500/20 text-slate-200 text-xs px-4 py-3 rounded-2xl shadow-lg text-center leading-relaxed">
            <div className="text-amber-400 font-bold text-[11px] mb-1 uppercase tracking-wider flex items-center justify-center gap-1">
              👑 {message.senderName || 'VIP Concierge Bot'}
            </div>
            <div className="text-slate-100 font-medium">
              {renderFormattedContent(message.content)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 text-right">
              {formatTime(message.createdAt)}
            </div>
          </div>
        ) : (
          /* Normal Message Bubble */
          <div
            className={`max-w-[85%] sm:max-w-md md:max-w-lg rounded-2xl px-3.5 py-2.5 shadow-md relative transition ${
              isMe
                ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-slate-100 rounded-tr-none'
                : 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-transparent'
            }`}
          >
            {/* Sender Name in Group/Agent context */}
            {!isMe && (
              <div className="text-[11px] font-bold text-emerald-600 dark:text-amber-400 mb-0.5">
                {message.senderName}
              </div>
            )}

            {/* Quoted Reply Block */}
            {message.replyTo && (
              <div className="mb-2 p-2 rounded-lg bg-black/5 dark:bg-black/25 border-l-4 border-amber-500 text-xs opacity-90">
                <span className="font-semibold text-amber-600 dark:text-amber-400 text-[10px] block">
                  {message.replyTo.senderName}
                </span>
                <p className="truncate text-slate-700 dark:text-slate-300">
                  {message.replyTo.content || `[${message.replyTo.messageType}]`}
                </p>
              </div>
            )}

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mb-2 space-y-2">
                {message.attachments.map((att, i) => {
                  const isImage = att.mimeType.startsWith('image/');
                  const isVideo = att.mimeType.startsWith('video/');
                  const isAudio = att.mimeType.startsWith('audio/');

                  if (isImage) {
                    return (
                      <div key={i} className="rounded-xl overflow-hidden cursor-pointer">
                        <img
                          src={att.fileUrl}
                          alt={att.fileName}
                          onClick={() => setShowLightbox(att.fileUrl)}
                          className="max-h-64 w-full object-cover rounded-xl hover:opacity-95 transition"
                        />
                      </div>
                    );
                  } else if (isVideo) {
                    return (
                      <div key={i} className="rounded-xl overflow-hidden bg-black max-h-64">
                        <video src={att.fileUrl} controls className="w-full h-auto rounded-xl" />
                      </div>
                    );
                  } else if (isAudio) {
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-black/10 dark:bg-black/30"
                      >
                        <button
                          type="button"
                          onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                          className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md active:scale-95 transition"
                        >
                          {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </button>
                        <div className="flex-1">
                          <audio
                            src={att.fileUrl}
                            controls
                            className="w-full h-8"
                            onPlay={() => setIsPlayingAudio(true)}
                            onPause={() => setIsPlayingAudio(false)}
                            onEnded={() => setIsPlayingAudio(false)}
                          />
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                            {att.fileName}
                          </span>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <a
                        key={i}
                        href={att.fileUrl}
                        download={att.fileName}
                        className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-black/30 hover:bg-black/10 transition group"
                      >
                        <FileText className="w-6 h-6 text-amber-500 group-hover:scale-110 transition" />
                        <div className="flex-1 truncate">
                          <span className="text-xs font-semibold block truncate">{att.fileName}</span>
                          <span className="text-[10px] text-slate-500">
                            {(att.fileSize / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <Download className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition" />
                      </a>
                    );
                  }
                })}
              </div>
            )}

            {/* Text Content */}
            {message.content && (
              <div className="text-xs sm:text-[13px] leading-relaxed break-words font-normal">
                {renderFormattedContent(message.content)}
              </div>
            )}

            {/* Bottom Meta Bar: Time & Checkmarks */}
            <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-500 dark:text-slate-400 select-none">
              <span>{formatTime(message.createdAt)}</span>

              {isMe && (
                <span className="ml-0.5">
                  {message.status === 'READ' ? (
                    <CheckCheck className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
                  ) : message.status === 'DELIVERED' ? (
                    <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </span>
              )}
            </div>

            {/* Quick Action Hover Bar */}
            <div
              className={`absolute top-1 ${
                isMe ? '-left-16' : '-right-16'
              } opacity-0 group-hover:opacity-100 transition flex items-center gap-1 bg-[#1e1e26] border border-[#2a2a38] rounded-lg p-1 shadow-lg z-10`}
            >
              {onReply && (
                <button
                  onClick={() => onReply(message)}
                  title="Reply"
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition"
                >
                  <Reply className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={handleCopy}
                title={copied ? 'Copied' : 'Copy'}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {isMe && onDelete && (
                <button
                  onClick={() => onDelete(message.id)}
                  title="Delete"
                  className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-red-900/30 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal for Full Image Zoom */}
      {showLightbox && (
        <div
          onClick={() => setShowLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in cursor-pointer"
        >
          <img
            src={showLightbox}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
};
