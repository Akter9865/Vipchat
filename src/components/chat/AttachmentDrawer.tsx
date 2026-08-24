import React, { useRef, useState } from 'react';
import { Image, Video, Music, FileText, Upload, X } from 'lucide-react';
import { MessageAttachment } from '../../types/index.js';

interface AttachmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachmentUploaded: (attachment: MessageAttachment) => void;
}

export const AttachmentDrawer: React.FC<AttachmentDrawerProps> = ({
  isOpen,
  onClose,
  onAttachmentUploaded,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [acceptType, setAcceptType] = useState('*/*');

  if (!isOpen) return null;

  const triggerFileInput = (accept: string) => {
    setAcceptType(accept);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(`Uploading ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.file) {
        onAttachmentUploaded({
          id: data.file.id,
          fileName: data.file.fileName,
          fileUrl: data.file.fileUrl,
          fileType: data.file.fileType,
          fileSize: data.file.fileSize,
          mimeType: data.file.mimeType,
        });
        onClose();
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err: any) {
      alert('Error uploading file: ' + err.message);
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="absolute bottom-16 right-4 sm:right-12 z-40 bg-[#1e1e26] border border-[#2a2a38] rounded-2xl p-4 shadow-2xl w-72 animate-fade-in">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-700/50">
        <span className="text-xs font-bold text-amber-400">Share Attachment</span>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xs">
          <X className="w-4 h-4" />
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept={acceptType}
        onChange={handleFileChange}
        className="hidden"
      />

      {isUploading ? (
        <div className="py-6 text-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-300 font-medium">{uploadProgress}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {/* Photos */}
          <button
            type="button"
            onClick={() => triggerFileInput('image/*')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-300 transition group"
          >
            <Image className="w-6 h-6 mb-1 text-purple-400 group-hover:scale-110 transition" />
            <span className="text-xs font-semibold">Photo</span>
          </button>

          {/* Videos */}
          <button
            type="button"
            onClick={() => triggerFileInput('video/*')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-300 transition group"
          >
            <Video className="w-6 h-6 mb-1 text-blue-400 group-hover:scale-110 transition" />
            <span className="text-xs font-semibold">Video</span>
          </button>

          {/* Audio */}
          <button
            type="button"
            onClick={() => triggerFileInput('audio/*')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 transition group"
          >
            <Music className="w-6 h-6 mb-1 text-emerald-400 group-hover:scale-110 transition" />
            <span className="text-xs font-semibold">Audio</span>
          </button>

          {/* Documents */}
          <button
            type="button"
            onClick={() => triggerFileInput('.pdf,.doc,.docx,.xlsx,.txt,.zip')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 transition group"
          >
            <FileText className="w-6 h-6 mb-1 text-amber-400 group-hover:scale-110 transition" />
            <span className="text-xs font-semibold">Document</span>
          </button>
        </div>
      )}
    </div>
  );
};
