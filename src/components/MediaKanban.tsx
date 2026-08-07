import React from 'react';
import { MediaItem, WatchStatus } from '../types';
import { Plus, Star, ArrowRight, Play, CheckCircle2, PauseCircle, Clock, XCircle } from 'lucide-react';

interface MediaKanbanProps {
  items: MediaItem[];
  onCardClick: (item: MediaItem) => void;
  onStatusChange: (item: MediaItem, newStatus: WatchStatus) => void;
  onIncrementProgress: (e: React.MouseEvent, item: MediaItem) => void;
}

export const MediaKanban: React.FC<MediaKanbanProps> = ({
  items,
  onCardClick,
  onStatusChange,
  onIncrementProgress,
}) => {
  const columns: { id: WatchStatus; title: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'watching',
      title: 'Watching / Reading',
      icon: <Play className="w-4 h-4 text-[#34b27d] dark:text-[#4ecc97]" />,
      color: 'border-[#34b27d]/40 dark:border-[#4ecc97]/40 text-[#2d5c48] dark:text-[#4ecc97]',
    },
    {
      id: 'plan_to_watch',
      title: 'Plan to Watch',
      icon: <Clock className="w-4 h-4 text-[#2d5c48] dark:text-[#a3d2be]" />,
      color: 'border-[#2d5c48]/40 dark:border-[#a3d2be]/40 text-[#2d5c48] dark:text-[#a3d2be]',
    },
    {
      id: 'completed',
      title: 'Completed',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
      color: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-300',
    },
    {
      id: 'on_hold',
      title: 'On Hold',
      icon: <PauseCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
      color: 'border-amber-500/40 text-amber-600 dark:text-amber-300',
    },
    {
      id: 'dropped',
      title: 'Dropped',
      icon: <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />,
      color: 'border-rose-500/40 text-rose-600 dark:text-rose-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const colItems = items.filter((item) => item.status === col.id);

        return (
          <div
            key={col.id}
            className="bg-[#f4f8f6] dark:bg-[#14211d] rounded-2xl border border-[#d2e4dc] dark:border-[#1e332d] p-3 flex flex-col gap-3 min-w-[240px] shadow-md"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#d2e4dc] dark:border-[#1e332d]">
              <div className="flex items-center gap-2">
                {col.icon}
                <h3 className={`text-[0.750rem] font-bold uppercase tracking-wider ${col.color}`}>
                  {col.title}
                </h3>
              </div>
              <span className="text-[0.750rem] font-bold px-2 py-0.5 rounded-full bg-[#e9f1ee] dark:bg-[#0e1613] text-[#2d5c48] dark:text-[#4ecc97] border border-[#d2e4dc] dark:border-[#1e332d]">
                {colItems.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="flex flex-col gap-2.5 flex-1 min-h-[300px]">
              {colItems.length === 0 ? (
                <div className="flex-1 flex items-center justify-center border border-dashed border-[#d2e4dc] dark:border-[#1e332d] rounded-xl p-4 text-center">
                  <p className="text-[0.750rem] text-[#2d5c48] dark:text-[#85d1b1] italic font-normal">
                    No media in {col.title}
                  </p>
                </div>
              ) : (
                colItems.map((item) => {
                  const maxProgress = item.totalProgress || 0;
                  return (
                    <div
                      key={item.id}
                      onClick={() => onCardClick(item)}
                      className="group bg-[#e9f1ee] dark:bg-[#0e1613] hover:bg-[#d2e4dc] dark:hover:bg-[#1e332d] rounded-xl border border-[#d2e4dc] dark:border-[#1e332d] hover:border-[#34b27d] dark:hover:border-[#4ecc97] p-2.5 flex gap-3 shadow-sm hover:shadow-md transition cursor-pointer"
                    >
                      {/* Mini Thumbnail */}
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-12 h-16 rounded-lg object-cover bg-[#f4f8f6] dark:bg-[#14211d] border border-[#d2e4dc] dark:border-[#1e332d] shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
                        }}
                      />

                      {/* Card Content */}
                      <div className="flex-1 flex flex-col justify-between overflow-hidden">
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[0.750rem] font-bold uppercase px-1.5 py-0.2 rounded bg-[#2d5c48]/20 dark:bg-[#2e795a]/40 text-[#2d5c48] dark:text-[#4ecc97]">
                              {item.format || item.mediaType}
                            </span>
                            {item.score > 0 && (
                              <span className="text-[0.750rem] font-bold text-amber-500 dark:text-amber-300 flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-300" />
                                {item.score.toFixed(1)}
                              </span>
                            )}
                          </div>
                          <h4 className="text-[0.750rem] font-bold text-[#141a18] dark:text-[#e5ebe9] group-hover:text-[#34b27d] dark:group-hover:text-[#4ecc97] transition line-clamp-1 mt-1">
                            {item.title}
                          </h4>
                        </div>

                        {/* Progress & Quick Actions */}
                        <div className="flex items-center justify-between pt-1 text-[0.750rem] text-[#2d5c48] dark:text-[#85d1b1]">
                          <span className="font-bold">
                            {item.progress} {maxProgress > 0 ? `/ ${maxProgress}` : ''}
                          </span>

                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {col.id !== 'completed' && (
                              <button
                                onClick={(e) => onIncrementProgress(e, item)}
                                title="+1 Progress"
                                className="p-1 rounded bg-[#2d5c48] dark:bg-[#2e795a] hover:bg-[#34b27d] dark:hover:bg-[#4ecc97] text-[#e9f1ee] dark:text-[#0e1613] font-bold cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            )}

                            {/* Move status menu selector */}
                            <select
                              value={item.status}
                              onChange={(e) => onStatusChange(item, e.target.value as WatchStatus)}
                              className="bg-[#f4f8f6] dark:bg-[#14211d] text-[#141a18] dark:text-[#e5ebe9] text-[0.750rem] font-bold rounded px-1 py-0.5 border border-[#d2e4dc] dark:border-[#1e332d]"
                            >
                              <option value="watching">Watch</option>
                              <option value="plan_to_watch">Plan</option>
                              <option value="completed">Done</option>
                              <option value="on_hold">Hold</option>
                              <option value="dropped">Drop</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
