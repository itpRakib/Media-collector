import React from 'react';
import { MediaItem, WatchStatus } from '../types';
import { Star, Plus, Minus, Edit2 } from 'lucide-react';

interface MediaTableProps {
  items: MediaItem[];
  onRowClick: (item: MediaItem) => void;
  onIncrementProgress: (e: React.MouseEvent, item: MediaItem) => void;
  onDecrementProgress: (e: React.MouseEvent, item: MediaItem) => void;
  onToggleFavorite: (e: React.MouseEvent, item: MediaItem) => void;
  onStatusChange: (item: MediaItem, newStatus: WatchStatus) => void;
}

export const MediaTable: React.FC<MediaTableProps> = ({
  items,
  onRowClick,
  onIncrementProgress,
  onDecrementProgress,
  onToggleFavorite,
  onStatusChange,
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-[#2d5c48] dark:text-[#85d1b1] text-[0.750rem]">
        No media items matching current filters.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-[#d2e4dc] dark:border-[#1e332d] bg-[#f4f8f6] dark:bg-[#14211d] shadow-lg">
      <table className="w-full text-left text-[0.750rem] border-collapse">
        <thead>
          <tr className="bg-[#e9f1ee] dark:bg-[#0e1613] text-[#2d5c48] dark:text-[#a3d2be] font-bold border-b border-[#d2e4dc] dark:border-[#1e332d] uppercase tracking-wider text-[0.750rem]">
            <th className="py-3.5 px-4 w-10">Fav</th>
            <th className="py-3.5 px-4 min-w-[220px]">Title & Metadata</th>
            <th className="py-3.5 px-4 w-28">Type / Format</th>
            <th className="py-3.5 px-4 w-36">Status</th>
            <th className="py-3.5 px-4 w-40">Progress</th>
            <th className="py-3.5 px-4 w-32">Progress Sparkline</th>
            <th className="py-3.5 px-4 w-20">Score</th>
            <th className="py-3.5 px-4 w-32">Studio</th>
            <th className="py-3.5 px-4 w-12 text-center">Edit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#d2e4dc] dark:divide-[#1e332d] text-[#141a18] dark:text-[#e5ebe9]">
          {items.map((item) => {
            const maxProgress = item.totalProgress || 0;
            return (
              <tr
                key={item.id}
                className="hover:bg-[#e9f1ee]/80 dark:hover:bg-[#1e332d]/80 transition cursor-pointer group"
                onClick={() => onRowClick(item)}
              >
                {/* Favorite Star */}
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={(e) => onToggleFavorite(e, item)}
                    className="p-1 text-[#2d5c48] dark:text-[#85d1b1] hover:text-amber-400 transition cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        item.favorite ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>
                </td>

                {/* Title & Cover Thumb */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-9 h-12 rounded-lg object-cover bg-[#e9f1ee] dark:bg-[#0e1613] border border-[#d2e4dc] dark:border-[#1e332d] shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div>
                      <div className="font-bold text-[#141a18] dark:text-[#e5ebe9] group-hover:text-[#34b27d] dark:group-hover:text-[#4ecc97] transition line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-[0.750rem] text-[#2d5c48] dark:text-[#85d1b1] line-clamp-1 font-normal">
                        {item.japaneseTitle || item.romajiTitle || item.genres.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Type & Format */}
                <td className="py-3 px-4">
                  <span className="inline-block uppercase tracking-wider text-[0.750rem] font-bold px-2 py-0.5 rounded-md bg-[#e9f1ee] dark:bg-[#0e1613] text-[#2d5c48] dark:text-[#4ecc97] border border-[#d2e4dc] dark:border-[#1e332d]">
                    {item.format || item.mediaType}
                  </span>
                </td>

                {/* Status Dropdown */}
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={item.status}
                    onChange={(e) => onStatusChange(item, e.target.value as WatchStatus)}
                    className="bg-[#e9f1ee] dark:bg-[#0e1613] text-[#141a18] dark:text-[#e5ebe9] text-[0.750rem] rounded-lg px-2 py-1 border border-[#d2e4dc] dark:border-[#1e332d] focus:outline-none focus:border-[#34b27d] dark:focus:border-[#4ecc97] font-bold"
                  >
                    <option value="watching">Watching / Reading</option>
                    <option value="completed">Completed</option>
                    <option value="plan_to_watch">Plan to Watch</option>
                    <option value="on_hold">On Hold</option>
                    <option value="dropped">Dropped</option>
                  </select>
                </td>

                {/* Progress Control */}
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => onDecrementProgress(e, item)}
                      disabled={item.progress <= 0}
                      className="p-1 rounded bg-[#e9f1ee] dark:bg-[#0e1613] hover:bg-[#d2e4dc] dark:hover:bg-[#1e332d] text-[#2d5c48] dark:text-[#85d1b1] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-[0.750rem] min-w-[50px] text-center text-[#141a18] dark:text-[#e5ebe9]">
                      {item.progress} {maxProgress > 0 ? `/ ${maxProgress}` : ''}
                    </span>
                    <button
                      onClick={(e) => onIncrementProgress(e, item)}
                      disabled={maxProgress > 0 && item.progress >= maxProgress}
                      className="p-1 rounded bg-[#2d5c48] dark:bg-[#2e795a] hover:bg-[#34b27d] dark:hover:bg-[#4ecc97] text-[#e9f1ee] dark:text-[#0e1613] disabled:opacity-30 disabled:pointer-events-none cursor-pointer font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </td>

                {/* Progress Sparkline Evolution */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-20 h-6 overflow-visible" viewBox="0 0 60 20">
                      {(() => {
                        const cur = item.progress;
                        const max = item.totalProgress || 12;
                        const p1 = Math.round(cur * 0.2);
                        const p2 = Math.round(cur * 0.45);
                        const p3 = Math.round(cur * 0.7);
                        const p4 = Math.round(cur * 0.9);
                        const p5 = cur;
                        const scaleY = (val: number) => Math.max(2, 18 - (val / Math.max(1, max)) * 16);
                        const pathD = `M 0 ${scaleY(p1)} L 15 ${scaleY(p2)} L 30 ${scaleY(p3)} L 45 ${scaleY(p4)} L 60 ${scaleY(p5)}`;
                        return (
                          <>
                            <path
                              d={pathD}
                              fill="none"
                              stroke="#22d3ee"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle cx="60" cy={scaleY(p5)} r="3" fill="#f43f5e" />
                          </>
                        );
                      })()}
                    </svg>
                    <span className="text-[10px] font-bold text-[#85d1b1] whitespace-nowrap">
                      {Math.round(((item.progress / (item.totalProgress || 12)) * 100))}%
                    </span>
                  </div>
                </td>

                {/* Score */}
                <td className="py-3 px-4 font-bold text-amber-500 dark:text-amber-300">
                  {item.score > 0 ? item.score.toFixed(1) : '-'}
                </td>

                {/* Studio */}
                <td className="py-3 px-4 text-[#2d5c48] dark:text-[#85d1b1] font-bold">
                  {item.studio || '-'}
                </td>

                {/* Action Edit */}
                <td className="py-3 px-4 text-center">
                  <button className="p-1 text-[#2d5c48] dark:text-[#85d1b1] hover:text-[#34b27d] dark:hover:text-[#4ecc97] transition cursor-pointer">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
