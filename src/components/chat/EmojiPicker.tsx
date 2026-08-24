import React from 'react';

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

const emojis = [
  '👑', '⭐', '✨', '🔥', '💯', '👍', '🙏', '❤️', '💎', '🎉',
  '😊', '😁', '😎', '😍', '🤝', '🚀', '💰', '💵', '💳', '🏆',
  '✅', '⚡', '🌟', '🎯', '👌', '👏', '🙌', '🔔', '📢', '💬',
  '📞', '📲', '🔒', '🛡️', '⏳', '🎁', '🎈', '🥇', '📈', '🥂'
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelectEmoji, onClose }) => {
  return (
    <div className="absolute bottom-16 left-4 z-40 bg-[#1e1e26] border border-[#2a2a38] rounded-2xl p-3 shadow-2xl w-64 animate-fade-in">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/50 text-[11px] font-semibold text-amber-400">
        <span>VIP Emojis</span>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xs">✕</button>
      </div>
      <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelectEmoji(emoji)}
            className="text-xl p-1.5 rounded-lg hover:bg-slate-700/60 transition active:scale-125"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
