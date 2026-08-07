import React, { useState, useRef } from 'react';
import { MediaItem } from '../types';
import { Star, Plus, Play } from 'lucide-react';

interface MediaGridProps {
  items: MediaItem[];
  onCardClick: (item: MediaItem) => void;
  onIncrementProgress: (e: React.MouseEvent, item: MediaItem) => void;
  onToggleFavorite: (e: React.MouseEvent, item: MediaItem) => void;
}

interface Card3DProps {
  item: MediaItem;
  onCardClick: (item: MediaItem) => void;
  onIncrementProgress: (e: React.MouseEvent, item: MediaItem) => void;
  onToggleFavorite: (e: React.MouseEvent, item: MediaItem) => void;
}

const MediaCard3D: React.FC<Card3DProps> = ({
  item,
  onCardClick,
  onIncrementProgress,
  onToggleFavorite,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within card
    const y = e.clientY - rect.top;  // y position within card

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-8 deg to +8 deg)
    const rX = -((y - centerY) / centerY) * 8;
    const rY = ((x - centerX) / centerX) * 8;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'watching':
        return { label: 'Watching', color: 'bg-[#2e795a]/30 text-[#4ecc97] border-[#4ecc97]/40' };
      case 'completed':
        return { label: 'Completed', color: 'bg-[#2d5c48]/40 text-[#a3d2be] border-[#2d5c48]' };
      case 'plan_to_watch':
        return { label: 'Plan to Watch', color: 'bg-[#1e332d] text-[#85d1b1] border-[#2e795a]' };
      case 'on_hold':
        return { label: 'On Hold', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'dropped':
        return { label: 'Dropped', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      default:
        return { label: status, color: 'bg-[#14211d] text-[#85d1b1]' };
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'anime': return 'bg-[#2e795a]/30 text-[#4ecc97] border-[#4ecc97]/40';
      case 'manga': return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
      case 'light_novel': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'movie': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default: return 'bg-[#14211d] text-[#85d1b1] border-[#1e332d]';
    }
  };

  const statusInfo = getStatusBadge(item.status);
  const typeInfo = getTypeColor(item.mediaType);
  const maxProgress = item.totalProgress || 0;
  const progressPct = maxProgress > 0 ? Math.min(100, Math.round((item.progress / maxProgress) * 100)) : 0;
  const isComplete = maxProgress > 0 && item.progress >= maxProgress;

  return (
    <div
      className="relative [perspective:1000px] group cursor-pointer"
      onClick={() => onCardClick(item)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ambient 3D Backglow Shadow Effect */}
      <div
        className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-600/30 via-violet-600/30 to-pink-600/30 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 pointer-events-none"
        style={{
          transform: isHovered ? 'scale(1.03) translateZ(-10px)' : 'scale(1)',
        }}
      />

      {/* Main 3D Card Container */}
      <div
        ref={cardRef}
        style={{
          transform: isHovered
            ? `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(12px)`
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out, border-color 0.3s, box-shadow 0.3s',
          transformStyle: 'preserve-3d',
        }}
        className="relative bg-[#14211d] border border-[#1e332d] group-hover:border-[#4ecc97] rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:shadow-[#4ecc97]/10 flex flex-col will-change-transform"
      >
        {/* Poster Image Container with 3D Parallax */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0e1613] [transform-style:preserve-3d]">
          <img
            src={item.coverImage}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            style={{
              transform: isHovered ? 'scale(1.08) translateZ(10px)' : 'scale(1) translateZ(0px)',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1613] via-[#0e1613]/20 to-transparent opacity-85 group-hover:opacity-65 transition-opacity duration-300" />

          {/* Top Bar Badges floating layer */}
          <div
            className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-10 transition-transform duration-300"
            style={{ transform: isHovered ? 'translateZ(24px)' : 'translateZ(0px)' }}
          >
            <span className={`text-[0.750rem] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md uppercase tracking-wider shadow-sm ${typeInfo}`}>
              {item.format || item.mediaType}
            </span>

            <button
              onClick={(e) => onToggleFavorite(e, item)}
              className={`p-1.5 rounded-full backdrop-blur-md shadow-sm transition-all duration-200 ${
                item.favorite
                  ? 'bg-amber-500/80 text-amber-200 scale-105'
                  : 'bg-[#0e1613]/70 text-[#85d1b1] hover:text-amber-400 hover:scale-110'
              }`}
              title={item.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <Star className={`w-3.5 h-3.5 ${item.favorite ? 'fill-amber-300' : ''}`} />
            </button>
          </div>

          {/* Rating Badge popping forward */}
          {item.score > 0 && (
            <div
              className="absolute bottom-2.5 left-2.5 bg-[#0e1613]/90 backdrop-blur-md border border-[#1e332d] px-2 py-0.5 rounded-lg text-amber-300 font-bold text-[0.750rem] flex items-center gap-1 shadow-md transition-transform duration-300"
              style={{ transform: isHovered ? 'translateZ(20px)' : 'translateZ(0px)' }}
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{item.score.toFixed(1)}</span>
            </div>
          )}

          {/* Status Badge floating layer */}
          <div
            className="absolute bottom-2.5 right-2.5 transition-transform duration-300"
            style={{ transform: isHovered ? 'translateZ(20px)' : 'translateZ(0px)' }}
          >
            <span className={`text-[0.750rem] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md shadow-sm ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Card Content & Progress with Depth */}
        <div
          className="p-3 flex flex-col flex-1 justify-between gap-2 bg-[#14211d] transition-transform duration-300"
          style={{ transform: isHovered ? 'translateZ(15px)' : 'translateZ(0px)' }}
        >
          <div>
            <h4 className="text-[0.750rem] font-bold text-[#e5ebe9] line-clamp-1 group-hover:text-[#4ecc97] transition-colors duration-200">
              {item.title}
            </h4>
            {item.japaneseTitle && (
              <p className="text-[0.750rem] text-[#85d1b1] line-clamp-1 mt-0.5 font-normal">
                {item.japaneseTitle}
              </p>
            )}
          </div>

          {/* Studio & Year */}
          <div className="flex items-center justify-between text-[0.750rem] text-[#a3d2be]">
            <span className="font-bold truncate max-w-[100px]">{item.studio || 'Studio N/A'}</span>
            <span className="font-bold">{item.releaseYear || ''}</span>
          </div>

          {/* Progress Bar & Quick Increment Button */}
          <div className="pt-1.5 border-t border-[#1e332d] flex items-center justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center justify-between text-[0.750rem] font-bold text-[#e5ebe9] mb-1">
                <span>
                  {item.mediaType === 'manga' || item.mediaType === 'light_novel' ? 'Ch' : 'Ep'} {item.progress}
                  {maxProgress > 0 ? ` / ${maxProgress}` : ''}
                </span>
                {maxProgress > 0 && <span className="text-[#85d1b1]">{progressPct}%</span>}
              </div>
              <div className="w-full bg-[#0e1613] h-1.5 rounded-full overflow-hidden p-[0.5px]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isComplete ? 'bg-[#34b27d]' : 'bg-gradient-to-r from-[#2d5c48] via-[#2e795a] to-[#4ecc97]'
                  }`}
                  style={{ width: `${maxProgress > 0 ? progressPct : Math.min(100, item.progress * 5)}%` }}
                />
              </div>
            </div>

            {/* +1 Quick Progress Button */}
            {!isComplete && (
              <button
                onClick={(e) => onIncrementProgress(e, item)}
                title={`+1 ${item.mediaType === 'manga' ? 'Chapter' : 'Episode'}`}
                className="p-1.5 rounded-lg bg-[#2e795a]/30 hover:bg-[#4ecc97] text-[#4ecc97] hover:text-[#0e1613] border border-[#4ecc97]/30 transition-all duration-200 hover:scale-110 active:scale-95 shrink-0 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const MediaGrid: React.FC<MediaGridProps> = ({
  items,
  onCardClick,
  onIncrementProgress,
  onToggleFavorite,
}) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mb-4 border border-slate-700/60 shadow-inner">
          <Play className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">No media items found</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Try adjusting your search terms or filters, or click "Add Media" above to expand your tracker!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 p-1">
      {items.map((item) => (
        <MediaCard3D
          key={item.id}
          item={item}
          onCardClick={onCardClick}
          onIncrementProgress={onIncrementProgress}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};
