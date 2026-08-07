import React from 'react';
import { MediaItem, CollectionStats } from '../types';
import {
  BarChart2,
  Tv,
  BookOpen,
  Clock,
  Star,
  CheckCircle2,
  TrendingUp,
  Award,
  PieChart,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  items: MediaItem[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ items }) => {
  const totalItems = items.length;

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const watchingCount = items.filter((i) => i.status === 'watching').length;
  const planToWatchCount = items.filter((i) => i.status === 'plan_to_watch').length;
  const onHoldCount = items.filter((i) => i.status === 'on_hold').length;
  const droppedCount = items.filter((i) => i.status === 'dropped').length;

  let totalEpisodesWatched = 0;
  let totalChaptersRead = 0;
  let totalMinutesSpent = 0;
  let ratedCount = 0;
  let scoreSum = 0;

  const genreMap: Record<string, number> = {};
  const typeMap: Record<string, number> = {};

  items.forEach((item) => {
    // Media Types
    typeMap[item.mediaType] = (typeMap[item.mediaType] || 0) + 1;

    // Genres
    (item.genres || []).forEach((g) => {
      genreMap[g] = (genreMap[g] || 0) + 1;
    });

    // Score
    if (item.score > 0) {
      ratedCount++;
      scoreSum += item.score;
    }

    // Progress
    if (item.mediaType === 'manga' || item.mediaType === 'light_novel') {
      totalChaptersRead += item.progress;
      totalMinutesSpent += item.progress * 8; // approx 8 mins per chapter
    } else {
      totalEpisodesWatched += item.progress;
      const epDuration = item.durationPerEp || 24;
      totalMinutesSpent += item.progress * epDuration;
    }
  });

  const totalHoursSpent = Math.round(totalMinutesSpent / 60);
  const totalDaysSpent = (totalMinutesSpent / (60 * 24)).toFixed(1);
  const averageScore = ratedCount > 0 ? (scoreSum / ratedCount).toFixed(1) : '0';
  const completionRate = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  // Top Genres sorted
  const sortedGenres = Object.entries(genreMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Top Favorites
  const topFavorites = [...items]
    .filter((i) => i.favorite || i.score >= 9)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="bg-[#f4f8f6] dark:bg-[#14211d] p-6 rounded-3xl border border-[#d2e4dc] dark:border-[#2e795a] shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-[1.333rem] font-bold text-[#141a18] dark:text-[#e5ebe9] flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#34b27d] dark:text-[#4ecc97]" />
            <span>Collection Analytics & Insights</span>
          </h2>
          <p className="text-[0.750rem] text-[#2d5c48] dark:text-[#85d1b1] mt-1 font-normal">
            Tracking stats across {totalItems} saved anime, manga, movies, and light novels
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#e9f1ee] dark:bg-[#0e1613] px-4 py-2 rounded-2xl border border-[#d2e4dc] dark:border-[#1e332d] text-center">
            <span className="text-[0.750rem] text-[#2d5c48] dark:text-[#85d1b1] uppercase font-bold block">
              Mean Rating
            </span>
            <span className="text-[1.333rem] font-bold text-amber-500 dark:text-amber-300 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-300" />
              {averageScore}
            </span>
          </div>

          <div className="bg-[#e9f1ee] dark:bg-[#0e1613] px-4 py-2 rounded-2xl border border-[#d2e4dc] dark:border-[#1e332d] text-center">
            <span className="text-[0.750rem] text-[#2d5c48] dark:text-[#85d1b1] uppercase font-bold block">
              Completion
            </span>
            <span className="text-[1.333rem] font-bold text-[#34b27d] dark:text-[#4ecc97]">{completionRate}%</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#f4f8f6] dark:bg-[#14211d] p-4 rounded-2xl border border-[#d2e4dc] dark:border-[#1e332d] flex items-center gap-3 shadow-sm">
          <div className="p-3 rounded-xl bg-[#2d5c48]/10 dark:bg-[#2e795a]/30 text-[#2d5c48] dark:text-[#4ecc97] border border-[#d2e4dc] dark:border-[#4ecc97]/30 shrink-0">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[1.333rem] font-bold text-[#141a18] dark:text-[#e5ebe9]">{totalEpisodesWatched}</div>
            <div className="text-[0.750rem] text-[#2d5c48] dark:text-[#85d1b1]">Episodes Watched</div>
          </div>
        </div>

        <div className="bg-[#f4f8f6] dark:bg-[#14211d] p-4 rounded-2xl border border-[#d2e4dc] dark:border-[#1e332d] flex items-center gap-3 shadow-sm">
          <div className="p-3 rounded-xl bg-[#2d5c48]/10 dark:bg-[#2e795a]/30 text-[#2d5c48] dark:text-[#4ecc97] border border-[#d2e4dc] dark:border-[#4ecc97]/30 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[1.333rem] font-bold text-[#141a18] dark:text-[#e5ebe9]">{totalChaptersRead}</div>
            <div className="text-[0.750rem] text-[#2d5c48] dark:text-[#85d1b1]">Chapters Read</div>
          </div>
        </div>

        <div className="bg-[#f4f8f6] dark:bg-[#14211d] p-4 rounded-2xl border border-[#d2e4dc] dark:border-[#1e332d] flex items-center gap-3 shadow-sm">
          <div className="p-3 rounded-xl bg-[#2d5c48]/10 dark:bg-[#2e795a]/30 text-[#2d5c48] dark:text-[#4ecc97] border border-[#d2e4dc] dark:border-[#4ecc97]/30 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[1.333rem] font-bold text-[#141a18] dark:text-[#e5ebe9]">{totalHoursSpent} hrs</div>
            <div className="text-[0.750rem] text-[#2d5c48] dark:text-[#85d1b1]">~ {totalDaysSpent} Total Days</div>
          </div>
        </div>

        <div className="bg-[#f4f8f6] dark:bg-[#14211d] p-4 rounded-2xl border border-[#d2e4dc] dark:border-[#1e332d] flex items-center gap-3 shadow-sm">
          <div className="p-3 rounded-xl bg-[#2d5c48]/10 dark:bg-[#2e795a]/30 text-[#2d5c48] dark:text-[#4ecc97] border border-[#d2e4dc] dark:border-[#4ecc97]/30 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[1.333rem] font-bold text-[#141a18] dark:text-[#e5ebe9]">{completedCount}</div>
            <div className="text-[0.750rem] text-[#2d5c48] dark:text-[#85d1b1]">Completed Entries</div>
          </div>
        </div>
      </div>

      {/* Visual Charts & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Genre Breakdown Progress Bars */}
        <div className="bg-[#f4f8f6] dark:bg-[#14211d] p-5 rounded-3xl border border-[#d2e4dc] dark:border-[#1e332d] space-y-4 shadow-sm">
          <h3 className="text-[0.750rem] font-bold uppercase tracking-wider text-[#141a18] dark:text-[#e5ebe9] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#34b27d] dark:text-[#4ecc97]" />
            <span>Top Favorite Genres</span>
          </h3>

          <div className="space-y-3">
            {sortedGenres.map(([genre, count]) => {
              return (
                <div key={genre} className="space-y-1">
                  <div className="flex justify-between text-[0.750rem] font-bold text-[#141a18] dark:text-[#e5ebe9]">
                    <span>{genre}</span>
                    <span className="text-[#2d5c48] dark:text-[#85d1b1]">{count} items</span>
                  </div>
                  <div className="w-full bg-[#e9f1ee] dark:bg-[#0e1613] h-2.5 rounded-full overflow-hidden border border-[#d2e4dc] dark:border-[#1e332d]">
                    <div
                      className="bg-gradient-to-r from-[#2d5c48] via-[#34b27d] to-[#85d1b1] dark:from-[#2e795a] dark:to-[#4ecc97] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (count / (sortedGenres[0]?.[1] || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-[#f4f8f6] dark:bg-[#14211d] p-5 rounded-3xl border border-[#d2e4dc] dark:border-[#1e332d] space-y-4 shadow-sm">
          <h3 className="text-[0.750rem] font-bold uppercase tracking-wider text-[#141a18] dark:text-[#e5ebe9] flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#34b27d] dark:text-[#4ecc97]" />
            <span>Status Breakdown</span>
          </h3>

          <div className="space-y-2 text-[0.750rem]">
            {[
              { label: 'Watching / Reading', count: watchingCount, color: 'bg-[#34b27d] dark:bg-[#4ecc97]' },
              { label: 'Completed', count: completedCount, color: 'bg-[#2d5c48] dark:bg-[#2e795a]' },
              { label: 'Plan to Watch', count: planToWatchCount, color: 'bg-[#85d1b1] dark:bg-[#a3d2be]' },
              { label: 'On Hold', count: onHoldCount, color: 'bg-amber-500' },
              { label: 'Dropped', count: droppedCount, color: 'bg-rose-500' },
            ].map((st) => (
              <div key={st.label} className="flex items-center justify-between p-2.5 rounded-xl bg-[#e9f1ee] dark:bg-[#0e1613] border border-[#d2e4dc] dark:border-[#1e332d]">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${st.color}`} />
                  <span className="text-[#141a18] dark:text-[#e5ebe9] font-bold">{st.label}</span>
                </div>
                <span className="font-extrabold text-[#141a18] dark:text-[#e5ebe9]">{st.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Rated Highlights */}
        <div className="bg-[#f4f8f6] dark:bg-[#14211d] p-5 rounded-3xl border border-[#d2e4dc] dark:border-[#1e332d] space-y-4 shadow-sm">
          <h3 className="text-[0.750rem] font-bold uppercase tracking-wider text-[#141a18] dark:text-[#e5ebe9] flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Top Rated Masterpieces</span>
          </h3>

          <div className="space-y-2.5">
            {topFavorites.map((fav) => (
              <div key={fav.id} className="flex items-center gap-3 p-2 rounded-xl bg-[#e9f1ee] dark:bg-[#0e1613] border border-[#d2e4dc] dark:border-[#1e332d]">
                <img
                  src={fav.coverImage}
                  alt={fav.title}
                  referrerPolicy="no-referrer"
                  className="w-8 h-11 rounded-lg object-cover bg-[#f4f8f6] dark:bg-[#14211d] shrink-0"
                />
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-[0.750rem] font-bold text-[#141a18] dark:text-[#e5ebe9] line-clamp-1">{fav.title}</h4>
                  <span className="text-[0.750rem] text-[#2d5c48] dark:text-[#85d1b1] uppercase font-bold">{fav.format || fav.mediaType}</span>
                </div>
                <div className="text-[0.750rem] font-extrabold text-amber-500 dark:text-amber-300 flex items-center gap-1 shrink-0">
                  <Star className="w-3 h-3 fill-amber-300" />
                  <span>{fav.score.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
