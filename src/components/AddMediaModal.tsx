import React, { useState } from 'react';
import { MediaItem, WatchStatus, MediaType, MediaFormat } from '../types';
import { X, Sparkles, Plus, Search, Check } from 'lucide-react';

interface AddMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newItem: MediaItem) => void;
}

export const AddMediaModal: React.FC<AddMediaModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [japaneseTitle, setJapaneseTitle] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('anime');
  const [format, setFormat] = useState<MediaFormat>('TV');
  const [status, setStatus] = useState<WatchStatus>('watching');
  const [progress, setProgress] = useState(0);
  const [totalProgress, setTotalProgress] = useState(24);
  const [score, setScore] = useState(8.0);
  const [studio, setStudio] = useState('');
  const [releaseYear, setReleaseYear] = useState<number>(new Date().getFullYear());
  const [genres, setGenres] = useState<string[]>(['Action', 'Fantasy']);
  const [synopsis, setSynopsis] = useState('');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80'
  );

  const handleAiSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');

    try {
      const res = await fetch('/api/media/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          mediaType: mediaType,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch media details');
      }

      const meta = data.metadata;
      setTitle(meta.title || searchQuery);
      setJapaneseTitle(meta.japaneseTitle || '');
      if (meta.mediaType) setMediaType(meta.mediaType as MediaType);
      if (meta.format) setFormat(meta.format as MediaFormat);
      if (meta.totalProgress) setTotalProgress(meta.totalProgress);
      if (meta.studio) setStudio(meta.studio);
      if (meta.releaseYear) setReleaseYear(meta.releaseYear);
      if (meta.genres && meta.genres.length) setGenres(meta.genres);
      if (meta.synopsis) setSynopsis(meta.synopsis);

      // Generate a clean photo poster keyword URL if available
      if (meta.coverKeyword) {
        setCoverImage(
          `https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80`
        );
      }

      setActiveTab('manual'); // Switch to review & customize view
    } catch (err: any) {
      setSearchError(err.message || 'AI Search unavailable.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: MediaItem = {
      id: `media-${Date.now()}`,
      title,
      japaneseTitle,
      mediaType,
      format,
      status,
      progress,
      totalProgress: totalProgress > 0 ? totalProgress : undefined,
      score,
      favorite: false,
      rewatchCount: 0,
      coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      genres,
      tags: [],
      studio,
      releaseYear: releaseYear || undefined,
      synopsis: synopsis || 'Added to collection.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAdd(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0e1613]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#14211d] border border-[#2e795a] rounded-3xl shadow-2xl overflow-hidden my-8 p-6 space-y-6">
        {/* Modal Top Title */}
        <div className="flex items-center justify-between border-b border-[#1e332d] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#2e795a]/30 text-[#4ecc97] border border-[#4ecc97]/40">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#e5ebe9]">Add New Media Entry</h2>
              <p className="text-xs text-[#85d1b1]">Add anime, manga, light novels or movies to your tracker</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#0e1613] hover:bg-[#1e332d] text-[#85d1b1] hover:text-[#e5ebe9] transition cursor-pointer border border-[#1e332d]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Mode Tabs */}
        <div className="flex bg-[#0e1613] p-1 rounded-2xl border border-[#1e332d]">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-[#2e795a] text-[#e5ebe9] shadow-md'
                : 'text-[#85d1b1] hover:text-[#e5ebe9]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#4ecc97]" />
            <span>AI Smart Autofill Search</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-[#2e795a] text-[#e5ebe9] shadow-md'
                : 'text-[#85d1b1] hover:text-[#e5ebe9]'
            }`}
          >
            <Plus className="w-4 h-4 text-[#4ecc97]" />
            <span>Manual Entry Form</span>
          </button>
        </div>

        {/* Tab 1: AI Search */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <p className="text-xs text-[#85d1b1] leading-relaxed">
              Type any title (e.g. <span className="text-[#4ecc97] font-semibold">"Solo Leveling"</span>,{' '}
              <span className="text-[#4ecc97] font-semibold">"AOT Season 4"</span>,{' '}
              <span className="text-[#4ecc97] font-semibold">"Demon Slayer"</span>) and Gemini AI will fetch full metadata, genres, total episodes, and studios for you!
            </p>

            <form onSubmit={handleAiSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4ecc97]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter anime, manga, or movie title..."
                  className="w-full bg-[#0e1613] text-[#e5ebe9] placeholder-[#85d1b1]/50 text-xs rounded-xl pl-10 pr-3 py-3 border border-[#1e332d] focus:outline-none focus:border-[#4ecc97]"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-5 py-3 text-xs font-bold bg-[#2e795a] hover:bg-[#4ecc97] text-[#0e1613] rounded-xl shadow-lg shadow-[#4ecc97]/20 disabled:opacity-50 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
                <span>{isSearching ? 'Searching...' : 'Fetch Metadata'}</span>
              </button>
            </form>

            {searchError && (
              <p className="text-xs text-rose-300 bg-rose-500/10 p-3 rounded-xl border border-rose-500/30">
                {searchError}
              </p>
            )}

            {/* Suggested Quick Searches */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-[#85d1b1] block mb-2">Try Quick Search:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Demon Slayer: Kimetsu no Yaiba',
                  'Vinland Saga',
                  'Jujutsu Kaisen',
                  'Attack on Titan',
                  'Chainsaw Man',
                  'Death Note',
                ].map((sample) => (
                  <button
                    key={sample}
                    onClick={() => {
                      setSearchQuery(sample);
                    }}
                    className="text-[11px] bg-[#0e1613] hover:bg-[#1e332d] text-[#4ecc97] border border-[#1e332d] px-2.5 py-1 rounded-xl transition cursor-pointer"
                  >
                    + {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Form */}
        {activeTab === 'manual' && (
          <form onSubmit={handleCreateMedia} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#85d1b1] mb-1">Title (English) *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Solo Leveling"
                  className="w-full bg-[#0e1613] text-[#e5ebe9] rounded-xl p-2.5 border border-[#1e332d] focus:outline-none focus:border-[#4ecc97]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#85d1b1] mb-1">Japanese Title</label>
                <input
                  type="text"
                  value={japaneseTitle}
                  onChange={(e) => setJapaneseTitle(e.target.value)}
                  placeholder="e.g. ナホンジヤマン レベルアップ"
                  className="w-full bg-[#0e1613] text-[#e5ebe9] rounded-xl p-2.5 border border-[#1e332d] focus:outline-none focus:border-[#4ecc97]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#85d1b1] mb-1">Media Type</label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as MediaType)}
                  className="w-full bg-[#0e1613] text-[#e5ebe9] rounded-xl p-2.5 border border-[#1e332d] focus:outline-none focus:border-[#4ecc97]"
                >
                  <option value="anime">Anime</option>
                  <option value="manga">Manga</option>
                  <option value="light_novel">Light Novel</option>
                  <option value="movie">Movie</option>
                  <option value="tv_show">TV Show</option>
                  <option value="asian_drama">Asian Drama</option>
                  <option value="visual_novel">Visual Novel</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#85d1b1] mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as WatchStatus)}
                  className="w-full bg-[#0e1613] text-[#e5ebe9] rounded-xl p-2.5 border border-[#1e332d] focus:outline-none focus:border-[#4ecc97]"
                >
                  <option value="watching">Watching / Reading</option>
                  <option value="completed">Completed</option>
                  <option value="plan_to_watch">Plan to Watch</option>
                  <option value="on_hold">On Hold</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#85d1b1] mb-1">
                  Current Progress ({mediaType === 'manga' ? 'Chapters' : 'Episodes'})
                </label>
                <input
                  type="number"
                  min="0"
                  value={progress}
                  onChange={(e) => setProgress(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[#0e1613] text-[#e5ebe9] rounded-xl p-2.5 border border-[#1e332d] focus:outline-none focus:border-[#4ecc97]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#85d1b1] mb-1">Total Episodes / Chapters</label>
                <input
                  type="number"
                  min="0"
                  value={totalProgress}
                  onChange={(e) => setTotalProgress(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[#0e1613] text-[#e5ebe9] rounded-xl p-2.5 border border-[#1e332d] focus:outline-none focus:border-[#4ecc97]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#85d1b1] mb-1">Score Rating (0 - 10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={score}
                  onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0e1613] text-[#e5ebe9] rounded-xl p-2.5 border border-[#1e332d] focus:outline-none focus:border-[#4ecc97]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#85d1b1] mb-1">Studio / Publisher</label>
                <input
                  type="text"
                  value={studio}
                  onChange={(e) => setStudio(e.target.value)}
                  placeholder="e.g. MAPPA, Ufotable, Madhouse"
                  className="w-full bg-[#0e1613] text-[#e5ebe9] rounded-xl p-2.5 border border-[#1e332d] focus:outline-none focus:border-[#4ecc97]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#85d1b1] mb-1">Synopsis</label>
              <textarea
                rows={2}
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                placeholder="Brief plot overview..."
                className="w-full bg-[#0e1613] text-[#e5ebe9] rounded-xl p-2.5 border border-[#1e332d] focus:outline-none focus:border-[#4ecc97]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#85d1b1] mb-1">Cover Poster Image URL</label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full bg-[#0e1613] text-[#e5ebe9] rounded-xl p-2.5 border border-[#1e332d] focus:outline-none focus:border-[#4ecc97]"
              />
            </div>

            <div className="pt-4 border-t border-[#1e332d] flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-[#85d1b1] hover:bg-[#1e332d] rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-[#0e1613] bg-[#4ecc97] hover:bg-[#85d1b1] rounded-xl shadow-lg shadow-[#4ecc97]/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save to Collection</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
