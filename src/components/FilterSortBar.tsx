import React from 'react';
import { WatchStatus, MediaType, MediaItem } from '../types';
import { Filter, ArrowUpDown, X, Star } from 'lucide-react';
import { AiSearchAutocomplete } from './AiSearchAutocomplete';

interface FilterSortBarProps {
  activeStatus: WatchStatus | 'all';
  onStatusChange: (status: WatchStatus | 'all') => void;
  activeType: MediaType | 'all';
  onTypeChange: (type: MediaType | 'all') => void;
  activeGenre: string | 'all';
  onGenreChange: (genre: string | 'all') => void;
  sortBy: 'score' | 'title' | 'updatedAt' | 'progress' | 'releaseYear';
  onSortChange: (sort: 'score' | 'title' | 'updatedAt' | 'progress' | 'releaseYear') => void;
  favoritesOnly: boolean;
  onFavoritesToggle: () => void;
  allGenres: string[];
  countsByStatus: Record<string, number>;
  totalCount: number;
  onResetFilters: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddItem: (item: Partial<MediaItem>, initialStatus: WatchStatus) => void;
  existingItems: MediaItem[];
}

export const FilterSortBar: React.FC<FilterSortBarProps> = ({
  activeStatus,
  onStatusChange,
  activeType,
  onTypeChange,
  activeGenre,
  onGenreChange,
  sortBy,
  onSortChange,
  favoritesOnly,
  onFavoritesToggle,
  allGenres,
  countsByStatus,
  totalCount,
  onResetFilters,
  searchQuery,
  onSearchChange,
  onAddItem,
  existingItems,
}) => {
  const statusTabs: { id: WatchStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'All Media' },
    { id: 'watching', label: 'Watching / Reading' },
    { id: 'completed', label: 'Completed' },
    { id: 'plan_to_watch', label: 'Plan to Watch' },
    { id: 'on_hold', label: 'On Hold' },
    { id: 'dropped', label: 'Dropped' },
  ];

  const hasActiveFilters =
    activeStatus !== 'all' ||
    activeType !== 'all' ||
    activeGenre !== 'all' ||
    favoritesOnly ||
    searchQuery.length > 0;

  return (
    <div className="bg-[#0b0f14]/90 border-b border-[#1e2b38] px-4 lg:px-8 py-4 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        {/* Main Search Bar with AI Auto-Suggest Suggestions */}
        <div className="w-full">
          <AiSearchAutocomplete
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onAddItem={onAddItem}
            existingItems={existingItems}
            placeholder="Search anime by title/name (e.g., 'Frieren', 'Solo Leveling', 'Naruto')..."
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            {statusTabs.map((tab) => {
              const count = tab.id === 'all' ? totalCount : countsByStatus[tab.id] || 0;
              const isActive = activeStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onStatusChange(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-[0.750rem] font-bold transition-all duration-200 flex items-center gap-2 border cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#801b38] to-[#008b8b] text-white border-[#22d3ee] shadow-md shadow-[#22d3ee]/20'
                      : 'bg-[#121922] text-[#8ba8b7] border-[#1e2b38] hover:bg-[#1a2432] hover:text-[#f0f6f8]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[0.750rem] px-2 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-[#090d12]/50 text-[#22d3ee]' : 'bg-[#090d12] text-[#8ba8b7]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onFavoritesToggle}
            className={`px-3.5 py-1.5 rounded-xl text-[0.750rem] font-bold transition-all duration-200 flex items-center gap-1.5 border shrink-0 cursor-pointer whitespace-nowrap ${
              favoritesOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-[#121922] text-[#8ba8b7] border-[#1e2b38] hover:bg-[#1a2432]'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-amber-400 text-amber-400' : 'text-[#85d1b1]'}`} />
            <span>Favorites</span>
          </button>
        </div>

        {/* Secondary Selectors (Type, Genre, Sort) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[0.750rem] text-[#85d1b1] border-t border-[#1e332d]">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-[#a3d2be] font-bold">
              <Filter className="w-3.5 h-3.5 text-[#4ecc97]" />
              <span>Filters:</span>
            </div>

            {/* Media Type Select */}
            <select
              value={activeType}
              onChange={(e) => onTypeChange(e.target.value as any)}
              className="bg-[#14211d] text-[#e5ebe9] text-[0.750rem] rounded-xl px-3 py-1.5 border border-[#1e332d] focus:outline-none focus:border-[#4ecc97] transition"
            >
              <option value="all">All Types</option>
              <option value="anime">Anime</option>
              <option value="manga">Manga</option>
              <option value="light_novel">Light Novels</option>
              <option value="movie">Movies</option>
              <option value="tv_show">TV Shows</option>
              <option value="asian_drama">Asian Dramas</option>
              <option value="visual_novel">Visual Novels</option>
            </select>

            {/* Genre Select */}
            <select
              value={activeGenre}
              onChange={(e) => onGenreChange(e.target.value)}
              className="bg-[#14211d] text-[#e5ebe9] text-[0.750rem] rounded-xl px-3 py-1.5 border border-[#1e332d] focus:outline-none focus:border-[#4ecc97] transition"
            >
              <option value="all">All Genres</option>
              {allGenres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="text-[0.750rem] text-[#85d1b1] hover:text-rose-400 flex items-center gap-1 transition px-2.5 py-1 rounded-xl hover:bg-rose-500/10 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1.5 text-[#a3d2be] font-bold">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#4ecc97]" />
              <span>Sort By:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="bg-[#14211d] text-[#e5ebe9] text-[0.750rem] rounded-xl px-3 py-1.5 border border-[#1e332d] focus:outline-none focus:border-[#4ecc97] transition"
            >
              <option value="score">Highest Rated</option>
              <option value="updatedAt">Recently Updated</option>
              <option value="title">Title (A-Z)</option>
              <option value="progress">Progress</option>
              <option value="releaseYear">Release Year</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

