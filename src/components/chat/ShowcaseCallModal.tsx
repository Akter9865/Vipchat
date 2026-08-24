import React from 'react';
import { Phone, Video, X, Sparkles, ShieldCheck } from 'lucide-react';

interface ShowcaseCallModalProps {
  isOpen: boolean;
  type: 'audio' | 'video';
  supportName: string;
  onClose: () => void;
}

export const ShowcaseCallModal: React.FC<ShowcaseCallModalProps> = ({
  isOpen,
  type,
  supportName,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#16161c] border border-amber-500/30 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Showcase Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-500/40 flex items-center justify-center shadow-gold-glow">
          {type === 'audio' ? (
            <Phone className="w-8 h-8 text-amber-400 animate-pulse" />
          ) : (
            <Video className="w-8 h-8 text-emerald-400 animate-pulse" />
          )}
        </div>

        {/* Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Feature Showcase: {type === 'audio' ? 'VIP Audio Call' : 'HD Video Call'}
        </div>

        <h3 className="text-lg font-bold text-white mb-2">
          {type === 'audio' ? 'Direct Voice Calling' : 'One-on-One Video Concierge'}
        </h3>

        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          Direct {type} calling with <strong className="text-amber-300">{supportName}</strong> is scheduled for release in the next platform update. Our 24×7 live text chat and file sharing are 100% active right now!
        </p>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full gold-gradient-btn py-2.5 rounded-xl text-xs font-bold transition shadow-md"
        >
          Continue in Live Chat
        </button>
      </div>
    </div>
  );
};
