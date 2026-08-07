import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, Plus, Check, Loader2, Star, Tv, Film, BookOpen, ArrowRight } from 'lucide-react';
import { MediaItem, WatchStatus } from '../types';

interface AiSearchResult {
  id?: string;
  title: string;
  japaneseTitle?: string;
  romajiTitle?: string;
  season?: string;
  mediaType: 'anime' | 'manga' | 'light_novel' | 'movie';
  format?: string;
  totalProgress: number;
  studio?: string;
  releaseYear?: number;
  score: number;
  genres: string[];
  tags?: string[];
  synopsis: string;
  coverImage?: string;
}

interface AiSearchAutocompleteProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddItem: (item: Partial<MediaItem>, initialStatus: WatchStatus) => void;
  existingItems: MediaItem[];
  placeholder?: string;
}

export const AiSearchAutocomplete: React.FC<AiSearchAutocompleteProps> = ({
  searchQuery,
  onSearchChange,
  onAddItem,
  existingItems,
  placeholder = "Auto-detect anime, season & episodes (e.g., 'Solo Leveling', 'Frieren')...",
}) => {
  const [results, setResults] = useState<AiSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchCacheRef = useRef<Map<string, AiSearchResult[]>>(new Map());

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced AI Search with local caching
  useEffect(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    if (searchCacheRef.current.has(trimmed)) {
      setResults(searchCacheRef.current.get(trimmed)!);
      setIsLoading(false);
      setIsOpen(true);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setIsOpen(true);
      try {
        const response = await fetch('/api/media/search-autodetect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.results && Array.isArray(data.results)) {
            setResults(data.results);
            searchCacheRef.current.set(trimmed, data.results);
          }
        }
      } catch (err) {
        console.error('AI Auto-detect search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectStore = (res: AiSearchResult, status: WatchStatus = 'watching') => {
    const isAlreadySaved = existingItems.some(
      (item) => item.title.toLowerCase() === res.title.toLowerCase()
    );

    if (!isAlreadySaved) {
      const newItem: Partial<MediaItem> = {
        title: res.title,
        japaneseTitle: res.japaneseTitle,
        mediaType: res.mediaType || 'anime',
        format: (res.format as any) || 'TV',
        totalProgress: res.totalProgress || 12,
        progress: status === 'completed' ? res.totalProgress || 12 : 0,
        status: status,
        score: res.score || 8.5,
        studio: res.studio || 'Animation Studio',
        releaseYear: res.releaseYear || new Date().getFullYear(),
        genres: res.genres || ['Action', 'Fantasy'],
        tags: res.tags || ['Popular'],
        synopsis: res.synopsis,
        favorite: false,
        userNotes: `Auto-detected via AI • Season: ${res.season || '1'}`,
        coverImage:
          res.coverImage ||
          'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      };

      onAddItem(newItem, status);
      setAddedIds((prev) => new Set(prev).add(res.title));
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'manga':
      case 'light_novel':
        return <BookOpen className="w-3.5 h-3.5 text-pink-400" />;
      case 'movie':
        return <Film className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Tv className="w-3.5 h-3.5 text-[#4ecc97]" />;
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Input Field */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4ecc97]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-[#14211d] text-[#e5ebe9] placeholder-[#85d1b1]/50 text-xs sm:text-sm rounded-xl pl-10 pr-24 py-2.5 border border-[#1e332d] focus:outline-none focus:border-[#4ecc97] focus:ring-2 focus:ring-[#4ecc97]/20 transition-all shadow-inner"
        />

        {/* AI Auto-detect Badge / Loader */}
        <div className="absolute right-2.5 flex items-center gap-1.5">
          {isLoading ? (
            <span className="flex items-center gap-1 text-[11px] text-[#4ecc97] font-bold bg-[#2e795a]/30 px-2.5 py-1 rounded-lg border border-[#4ecc97]/40">
              <Loader2 className="w-3 h-3 animate-spin text-[#4ecc97]" />
              <span>Detecting...</span>
            </span>
          ) : (
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-[#a3d2be] bg-[#2e795a]/20 px-2.5 py-1 rounded-lg border border-[#2e795a]/40">
              <Sparkles className="w-3 h-3 text-[#4ecc97]" />
              <span>AI Auto-Detect</span>
            </span>
          )}
        </div>
      </div>

      {/* Dropdown Results Overlay */}
      <AnimatePresence>
        {isOpen && (results.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#121922] border border-[#1e2b38] rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl max-h-[420px] overflow-y-auto"
          >
            {/* Header of Overlay */}
            <div className="px-4 py-2.5 bg-[#090d12]/90 border-b border-[#1e2b38] flex items-center justify-between text-xs text-[#8ba8b7] font-bold">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#22d3ee]" />
                <span>AI Auto-Detected Online Database Results</span>
              </div>
              <span className="text-[10px] text-[#8ba8b7]">Click to Store in Collection</span>
            </div>

            {isLoading && results.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8ba8b7] flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#22d3ee]" />
                <p>Detecting anime title, season, episodes & studio metadata...</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1e2b38]">
                {results.map((res, index) => {
                  const isSaved =
                    addedIds.has(res.title) ||
                    existingItems.some((i) => i.title.toLowerCase() === res.title.toLowerCase());

                  return (
                    <div
                      key={index}
                      className="p-3 sm:p-3.5 hover:bg-[#1e332d]/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                    >
                      {/* Item Info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-12 h-16 rounded-lg bg-[#0e1613] overflow-hidden shrink-0 border border-[#1e332d] relative group-hover:scale-105 transition-transform">
                          <img
                            src={
                              res.coverImage ||
                              'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80'
                            }
                            alt={res.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-[#e5ebe9] line-clamp-1 group-hover:text-[#4ecc97] transition-colors">
                              {res.title}
                            </h4>
                            {res.season && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#2e795a]/40 text-[#4ecc97] border border-[#4ecc97]/30">
                                {res.season}
                              </span>
                            )}
                          </div>

                          {res.japaneseTitle && (
                            <p className="text-[10px] text-[#85d1b1] line-clamp-1 font-normal">
                              {res.japaneseTitle}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-[10px] text-[#a3d2be] flex-wrap">
                            <span className="flex items-center gap-1 font-bold text-[#4ecc97]">
                              {getMediaIcon(res.mediaType)}
                              <span className="uppercase">{res.format || res.mediaType}</span>
                            </span>
                            <span>•</span>
                            <span>{res.totalProgress > 0 ? `${res.totalProgress} Eps/Chs` : 'Ongoing'}</span>
                            <span>•</span>
                            <span>{res.studio || 'Studio'}</span>
                            {res.score > 0 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 text-amber-300 font-bold">
                                  <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                                  {res.score.toFixed(1)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Store Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
                        {isSaved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4ecc97] bg-[#2e795a]/20 border border-[#4ecc97]/30 px-3 py-1.5 rounded-xl">
                            <Check className="w-3.5 h-3.5" />
                            <span>In Collection</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleSelectStore(res, 'watching')}
                              className="px-3 py-1.5 text-[11px] font-bold text-[#0e1613] bg-[#4ecc97] hover:bg-[#85d1b1] rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
                              title="Add to Watching"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Watch</span>
                            </button>
                            <button
                              onClick={() => handleSelectStore(res, 'plan_to_watch')}
                              className="px-2.5 py-1.5 text-[11px] font-bold text-[#a3d2be] bg-[#14211d] hover:bg-[#1e332d] border border-[#2e795a] rounded-xl transition cursor-pointer"
                              title="Add to Plan to Watch"
                            >
                              <span>Plan</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
