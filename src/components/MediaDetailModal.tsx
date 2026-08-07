import React, { useState } from 'react';
import { MediaItem, WatchStatus, MediaType, MediaFormat, Season } from '../types';
import { X, Star, Sparkles, Trash2, Save, Calendar, Building, Film, BookOpen, Clock, RefreshCw } from 'lucide-react';

interface MediaDetailModalProps {
  item: MediaItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: MediaItem) => void;
  onDelete: (itemId: string) => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<MediaItem>({ ...item });
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [autofillSuccessMsg, setAutofillSuccessMsg] = useState('');
  const [autofillErrorMsg, setAutofillErrorMsg] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [newGenreInput, setNewGenreInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleInputChange = (field: keyof MediaItem, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value, updatedAt: new Date().toISOString() }));
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    if (!formData.tags.includes(newTagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTagInput.trim()] }));
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tagToRemove) }));
  };

  const handleAddGenre = () => {
    if (!newGenreInput.trim()) return;
    if (!formData.genres.includes(newGenreInput.trim())) {
      setFormData((prev) => ({ ...prev, genres: [...prev.genres, newGenreInput.trim()] }));
    }
    setNewGenreInput('');
  };

  const handleRemoveGenre = (genreToRemove: string) => {
    setFormData((prev) => ({ ...prev, genres: prev.genres.filter((g) => g !== genreToRemove) }));
  };

  const handleAiAutofill = async () => {
    setIsAutofilling(true);
    setAutofillSuccessMsg('');
    setAutofillErrorMsg('');

    try {
      const res = await fetch('/api/media/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: formData.title,
          mediaType: formData.mediaType,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to auto-fill metadata');
      }

      const meta = data.metadata;
      setFormData((prev) => ({
        ...prev,
        title: meta.title || prev.title,
        japaneseTitle: meta.japaneseTitle || prev.japaneseTitle,
        romajiTitle: meta.romajiTitle || prev.romajiTitle,
        mediaType: (meta.mediaType as MediaType) || prev.mediaType,
        format: (meta.format as MediaFormat) || prev.format,
        totalProgress: meta.totalProgress || prev.totalProgress,
        synopsis: meta.synopsis || prev.synopsis,
        studio: meta.studio || prev.studio,
        releaseYear: meta.releaseYear || prev.releaseYear,
        season: (meta.season as Season) || prev.season,
        genres: meta.genres && meta.genres.length > 0 ? Array.from(new Set([...prev.genres, ...meta.genres])) : prev.genres,
        tags: meta.tags && meta.tags.length > 0 ? Array.from(new Set([...prev.tags, ...meta.tags])) : prev.tags,
        source: meta.source || prev.source,
        durationPerEp: meta.durationPerEp || prev.durationPerEp,
        updatedAt: new Date().toISOString(),
      }));

      setAutofillSuccessMsg('Metadata auto-filled with Gemini AI!');
    } catch (err: any) {
      setAutofillErrorMsg(err.message || 'AI Autofill unavailable.');
    } finally {
      setIsAutofilling(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header Hero Banner */}
        <div className="relative h-44 sm:h-52 w-full bg-slate-800 overflow-hidden shrink-0">
          <img
            src={formData.bannerImage || formData.coverImage}
            alt={formData.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-40 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Poster & Main Title Header */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end gap-5">
            <img
              src={formData.coverImage}
              alt={formData.title}
              referrerPolicy="no-referrer"
              className="w-24 h-32 sm:w-28 sm:h-36 rounded-xl object-cover border-2 border-slate-700 shadow-xl shrink-0 bg-slate-800"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
              }}
            />
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40">
                  {formData.format || formData.mediaType}
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  {formData.studio ? `By ${formData.studio}` : ''} {formData.releaseYear ? `(${formData.releaseYear})` : ''}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white line-clamp-1">{formData.title}</h2>
              {formData.japaneseTitle && (
                <p className="text-xs text-slate-400 line-clamp-1">{formData.japaneseTitle}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleAiAutofill}
              disabled={isAutofilling}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-violet-600/30 hover:bg-violet-600 text-violet-200 border border-violet-500/40 transition shrink-0 shadow-sm"
            >
              <Sparkles className={`w-4 h-4 text-violet-400 ${isAutofilling ? 'animate-spin' : ''}`} />
              <span>{isAutofilling ? 'Fetching AI...' : 'Refill with AI'}</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {autofillSuccessMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center justify-between">
              <span>{autofillSuccessMsg}</span>
              <button type="button" onClick={() => setAutofillSuccessMsg('')} className="text-emerald-400 font-bold">
                ✕
              </button>
            </div>
          )}

          {autofillErrorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center justify-between">
              <span>{autofillErrorMsg}</span>
              <button type="button" onClick={() => setAutofillErrorMsg('')} className="text-rose-400 font-bold">
                ✕
              </button>
            </div>
          )}

          {/* Section 1: Core Progress & Ratings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            {/* Watch Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as WatchStatus)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="watching">Watching / Reading</option>
                <option value="completed">Completed</option>
                <option value="plan_to_watch">Plan to Watch</option>
                <option value="on_hold">On Hold</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>

            {/* Score Rating */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Score Rating (0 - 10): <span className="text-amber-300 font-bold">{formData.score}</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={formData.score}
                  onChange={(e) => handleInputChange('score', parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>

            {/* Current Progress */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Progress ({formData.mediaType === 'manga' ? 'Chapters' : 'Episodes'})
              </label>
              <input
                type="number"
                min="0"
                value={formData.progress}
                onChange={(e) => handleInputChange('progress', parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Total Progress */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Total Count (0 if ongoing)
              </label>
              <input
                type="number"
                min="0"
                value={formData.totalProgress || 0}
                onChange={(e) => handleInputChange('totalProgress', parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Section 2: Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Title (English)</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Japanese / Original Title</label>
              <input
                type="text"
                value={formData.japaneseTitle || ''}
                onChange={(e) => handleInputChange('japaneseTitle', e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Romaji Title</label>
              <input
                type="text"
                value={formData.romajiTitle || ''}
                onChange={(e) => handleInputChange('romajiTitle', e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Media Type</label>
              <select
                value={formData.mediaType}
                onChange={(e) => handleInputChange('mediaType', e.target.value as MediaType)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Format</label>
              <input
                type="text"
                value={formData.format || ''}
                onChange={(e) => handleInputChange('format', e.target.value as MediaFormat)}
                placeholder="TV, Movie, OVA, Manga..."
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Studio / Creator</label>
              <input
                type="text"
                value={formData.studio || ''}
                onChange={(e) => handleInputChange('studio', e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Release Year</label>
              <input
                type="number"
                value={formData.releaseYear || ''}
                onChange={(e) => handleInputChange('releaseYear', parseInt(e.target.value, 10) || undefined)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Finish Date</label>
              <input
                type="date"
                value={formData.finishDate || ''}
                onChange={(e) => handleInputChange('finishDate', e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Cover Image Poster URL</label>
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) => handleInputChange('coverImage', e.target.value)}
              className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Synopsis */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Synopsis</label>
            <textarea
              rows={3}
              value={formData.synopsis}
              onChange={(e) => handleInputChange('synopsis', e.target.value)}
              className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* User Personal Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">My Personal Review & Notes</label>
            <textarea
              rows={2}
              value={formData.userNotes || ''}
              onChange={(e) => handleInputChange('userNotes', e.target.value)}
              placeholder="Add your thoughts, favorite episodes, or notes..."
              className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Genres & Tags Editors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Genres */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Genres</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.genres.map((genre) => (
                  <span
                    key={genre}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1"
                  >
                    {genre}
                    <button
                      type="button"
                      onClick={() => handleRemoveGenre(genre)}
                      className="hover:text-rose-400 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGenreInput}
                  onChange={(e) => setNewGenreInput(e.target.value)}
                  placeholder="Add genre..."
                  className="flex-1 bg-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 border border-slate-700"
                />
                <button
                  type="button"
                  onClick={handleAddGenre}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-xl"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Custom Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Custom Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-400 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Add custom tag..."
                  className="flex-1 bg-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 border border-slate-700"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-xl"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Footer Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <div>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400 font-medium">Delete item?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(formData.id);
                      onClose();
                    }}
                    className="px-3 py-1.5 text-xs bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Media</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20 transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
