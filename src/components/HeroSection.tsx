import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Database,
  Film,
  TrendingUp,
} from 'lucide-react';
import { MediaItem, WatchStatus } from '../types';
import { AiSearchAutocomplete } from './AiSearchAutocomplete';

interface HeroSectionProps {
  items: MediaItem[];
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddItem: (item: Partial<MediaItem>, initialStatus: WatchStatus) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  items,
  onOpenAddModal,
  onOpenExportModal,
  searchQuery,
  onSearchChange,
  onAddItem,
}) => {
  const watchingCount = items.filter((i) => i.status === 'watching').length;
  const completedCount = items.filter((i) => i.status === 'completed').length;

  return (
    <section className="relative overflow-hidden pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-[#1e2b38] bg-[#090d12]/60 backdrop-blur-sm">
      {/* Ambient Theme Mesh Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#801b38]/25 rounded-full blur-[130px] pointer-events-none animate-aura-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-[#008b8b]/25 rounded-full blur-[120px] pointer-events-none animate-aura-pulse [animation-delay:2s]" />

      <div className="max-w-3xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121922] border border-[#22d3ee]/30 text-[0.750rem] font-bold text-[#22d3ee] shadow-lg shadow-[#22d3ee]/10 backdrop-blur-xl">
            <span className="flex h-2 w-2 rounded-full bg-[#22d3ee] animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-[#22d3ee] shrink-0" />
            <span className="tracking-wide uppercase text-[0.750rem]">
              AI Auto-Detect Engine • MyAnimeList Direct Sync
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-[2.2rem] sm:text-[3.2rem] lg:text-[4rem] font-bold tracking-tight text-[#f0f6f8] leading-[1.1]">
            Track Your Anime & <br />
            <span className="bg-gradient-to-r from-[#f43f5e] via-[#22d3ee] to-[#14b8a6] bg-clip-text text-transparent drop-shadow-sm">Media Universe</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[0.95rem] sm:text-[1.1rem] text-[#8ba8b7] max-w-2xl mx-auto leading-relaxed font-normal">
            Keep track of your favorite anime, manga, and movies. Auto-detect episode counts, organize watchlists, or instantly import your public MyAnimeList collection!
          </p>

          {/* Search Bar in Hero Section */}
          <div className="w-full max-w-2xl mx-auto text-left pt-2">
            <AiSearchAutocomplete
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              onAddItem={onAddItem}
              existingItems={items}
              placeholder="Search or auto-suggest any anime by name (e.g. 'Frieren', 'Solo Leveling')..."
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenAddModal}
              className="group relative px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#9f1239] via-[#0d9488] to-[#06b6d4] text-white font-bold text-[0.875rem] sm:text-[1rem] shadow-xl shadow-[#06b6d4]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4.5 h-4.5 text-white group-hover:rotate-12 transition-transform shrink-0" />
              <span className="whitespace-nowrap">Quick Add with AI</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            <button
              onClick={onOpenExportModal}
              className="px-6 py-3.5 rounded-2xl bg-[#121922] hover:bg-[#1a2432] text-[#22d3ee] font-bold text-[0.875rem] sm:text-[1rem] border border-[#22d3ee]/30 transition-all duration-300 shadow-md flex items-center gap-2 cursor-pointer backdrop-blur-md whitespace-nowrap"
            >
              <Database className="w-4.5 h-4.5 text-[#22d3ee] shrink-0" />
              <span className="whitespace-nowrap">Import MyAnimeList</span>
            </button>
          </div>

          {/* Quick Collection Metrics Banner */}
          <div className="pt-6 border-t border-[#1e2b38]/80 max-w-2xl mx-auto flex flex-wrap items-center justify-around gap-4 text-xs text-[#8ba8b7]">
            <div className="flex items-center gap-2 bg-[#121922]/80 px-4 py-2 rounded-xl border border-[#1e2b38]">
              <Film className="w-4 h-4 text-[#22d3ee]" />
              <span className="font-bold text-[#f0f6f8]">{items.length}</span> Total Titles
            </div>
            <div className="flex items-center gap-2 bg-[#121922]/80 px-4 py-2 rounded-xl border border-[#1e2b38]">
              <TrendingUp className="w-4 h-4 text-[#f43f5e]" />
              <span className="font-bold text-[#f43f5e]">{watchingCount}</span> Currently Watching
            </div>
            <div className="flex items-center gap-2 bg-[#121922]/80 px-4 py-2 rounded-xl border border-[#1e2b38]">
              <CheckCircle2 className="w-4 h-4 text-[#14b8a6]" />
              <span className="font-bold text-[#14b8a6]">{completedCount}</span> Completed
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};


