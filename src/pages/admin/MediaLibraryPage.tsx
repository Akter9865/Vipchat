import React, { useState, useEffect } from 'react';
import { FolderOpen, Upload, Image, Video, Music, FileText, Download, Trash2, ExternalLink } from 'lucide-react';

export const MediaLibraryPage: React.FC = () => {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [category, setCategory] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMedia();
  }, [category]);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/media?category=${category}`);
      if (res.ok) setMediaList(await res.json());
    } catch (e) {}
    finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black gold-gradient-text tracking-wide">
            VPS Media Asset Library
          </h1>
          <p className="text-xs text-slate-400">
            Filesystem storage organized into /storage/uploads/{'{images, videos, audio, documents}'}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex bg-[#14141a] border border-[#242430] rounded-xl p-1 text-xs">
          {['ALL', 'images', 'videos', 'audio', 'documents'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-lg font-bold uppercase transition ${
                category === cat ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500">
            Loading storage assets...
          </div>
        ) : mediaList.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500">
            No media uploaded in this category yet.
          </div>
        ) : (
          mediaList.map((item) => (
            <div
              key={item.id}
              className="bg-[#14141a] border border-[#242430] rounded-2xl p-3 shadow-lg hover:border-amber-500/40 transition flex flex-col justify-between group"
            >
              <div className="aspect-square rounded-xl bg-[#0e0e11] overflow-hidden flex items-center justify-center mb-2 relative">
                {item.fileCategory === 'images' ? (
                  <img
                    src={`/storage/uploads/images/${item.storedName}`}
                    alt={item.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                ) : item.fileCategory === 'videos' ? (
                  <Video className="w-10 h-10 text-blue-400" />
                ) : item.fileCategory === 'audio' ? (
                  <Music className="w-10 h-10 text-emerald-400" />
                ) : (
                  <FileText className="w-10 h-10 text-amber-400" />
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-slate-200 truncate">{item.originalName}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                  <span>{formatBytes(item.sizeBytes)}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
