import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Star, Flame, ArrowRight, ShieldCheck, Plus } from 'lucide-react';
import { MediaItem } from '../types';

const OFFICIAL_WEEKLY_RECOMMENDATIONS = [
  {
    title: "Frieren: Beyond Journey's End",
    japaneseTitle: "葬送のフリーレン",
    site: "MyAnimeList Official #1 Top Rated",
    score: 10.0,
    episodes: 28,
    studio: "Madhouse",
    synopsis: "After the party of heroes defeated the Demon King, elven mage Frieren embarks on a poignant journey to understand humanity and the mortality of her former companions.",
    coverImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
    genres: ["Fantasy", "Adventure", "Drama"]
  },
  {
    title: "Solo Leveling",
    japaneseTitle: "나 혼자만 레벨업",
    site: "Crunchyroll & D&C Media Official Hit",
    score: 9.6,
    episodes: 12,
    studio: "A-1 Pictures",
    synopsis: "In a world where hunters battle deadly monsters in dungeon gates, the weakest hunter Sung Jinwoo is granted a mysterious leveling system.",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    genres: ["Action", "Fantasy", "System"]
  },
  {
    title: "Jujutsu Kaisen Season 2",
    japaneseTitle: "呪術廻戦 渋谷事変",
    site: "Studio MAPPA Official Broadcast",
    score: 9.4,
    episodes: 23,
    studio: "MAPPA",
    synopsis: "Gojo Satoru's past and the cataclysmic Shibuya Incident unfold with breathtaking animation and emotional resonance.",
    coverImage: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
    genres: ["Action", "Supernatural", "Dark Fantasy"]
  },
  {
    title: "Demon Slayer: Hashira Training Arc",
    japaneseTitle: "鬼滅の刃 柱稽古編",
    site: "ufotable Official Release",
    score: 9.2,
    episodes: 8,
    studio: "ufotable",
    synopsis: "Tanjiro undergoes rigorous training with the elite Hashira to prepare for the final showdown against Muzan Kibutsuji.",
    coverImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    genres: ["Action", "Fantasy", "Historical"]
  },
  {
    title: "The Apothecary Diaries",
    japaneseTitle: "薬屋のひとりごと",
    site: "TOHO Animation Official Site",
    score: 9.1,
    episodes: 24,
    studio: "OLM / Toho Animation",
    synopsis: "Maomao uses her expert botanical and medical knowledge to solve complex mysteries within the imperial palace court.",
    coverImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    genres: ["Mystery", "Drama", "Historical"]
  }
];

interface RecommendAnimeSectionProps {
  onOpenAuthModal: () => void;
  onAddRecommendation: (rec: any) => void;
}

export const RecommendAnimeSection: React.FC<RecommendAnimeSectionProps> = ({
  onOpenAuthModal,
  onAddRecommendation,
}) => {
  // Rotate every 3 days
  const current3DayPeriod = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 3));
  const activeAnime = OFFICIAL_WEEKLY_RECOMMENDATIONS[current3DayPeriod % OFFICIAL_WEEKLY_RECOMMENDATIONS.length];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Header Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121922] border border-[#22d3ee]/40 text-[#22d3ee] text-xs font-bold shadow-lg">
            <Sparkles className="w-4 h-4 text-[#22d3ee] animate-pulse" />
            <span>Official Weekly Top Anime Recommendation (Auto-updates every 3 days)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#f0f6f8] tracking-tight">
            Recommend Anime <span className="text-[#22d3ee]">Hub</span>
          </h2>
          <p className="text-sm text-[#8ba8b7] max-w-xl mx-auto">
            Explore this week's top-trending masterpiece from official anime networks. Log in or create an account to start building your personal media collection.
          </p>
        </div>

        {/* Featured Weekly Anime Card */}
        <div className="relative bg-[#121922] border border-[#1e332d] rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 items-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#22d3ee]/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Cover Poster */}
          <div className="md:col-span-5 relative group">
            <img
              src={activeAnime.coverImage}
              alt={activeAnime.title}
              referrerPolicy="no-referrer"
              className="w-full h-80 sm:h-96 rounded-2xl object-cover border border-[#1e332d] shadow-xl group-hover:scale-[1.01] transition duration-500"
            />
            <div className="absolute top-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-md rounded-xl text-amber-400 font-extrabold text-xs flex items-center gap-1.5 border border-amber-400/30">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{activeAnime.score.toFixed(1)} Rating</span>
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-7 space-y-4 z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#1e332d] text-[#22d3ee] border border-[#22d3ee]/30 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                {activeAnime.site}
              </span>
              <span className="text-xs font-bold text-[#8ba8b7]">
                Studio: <strong className="text-[#e5ebe9]">{activeAnime.studio}</strong>
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-[#f0f6f8]">
              {activeAnime.title}
            </h3>
            <p className="text-sm text-[#8ba8b7] italic">
              {activeAnime.japaneseTitle}
            </p>

            <p className="text-sm text-[#c5d8d1] leading-relaxed">
              {activeAnime.synopsis}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {activeAnime.genres.map((g) => (
                <span key={g} className="text-xs px-2.5 py-1 rounded-lg bg-[#0e1613] text-[#85d1b1] border border-[#1e332d] font-semibold">
                  {g}
                </span>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenAuthModal}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#22d3ee] to-[#0d9488] text-[#0e1613] font-extrabold text-xs sm:text-sm shadow-lg hover:brightness-110 transition flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Create Account / Login to Track</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onAddRecommendation(activeAnime)}
                className="px-5 py-3 rounded-xl bg-[#1e332d] hover:bg-[#28473c] text-[#22d3ee] font-bold text-xs sm:text-sm border border-[#22d3ee]/30 transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Quick Add to Watchlist</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
