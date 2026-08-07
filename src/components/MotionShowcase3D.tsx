import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem } from '../types';
import {
  Star,
  Play,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Compass,
  RotateCw,
  Box,
} from 'lucide-react';

interface MotionShowcase3DProps {
  items: MediaItem[];
  onCardClick: (item: MediaItem) => void;
  onIncrementProgress: (e: React.MouseEvent, item: MediaItem) => void;
}

export const MotionShowcase3D: React.FC<MotionShowcase3DProps> = ({
  items,
  onCardClick,
  onIncrementProgress,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'stack' | 'cylinder'>('stack');
  const [rotationAngle, setRotationAngle] = useState(0);

  if (items.length === 0) return null;

  const currentItem = items[activeIndex % items.length];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
    setRotationAngle((prev) => prev - 360 / Math.min(items.length, 10));
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    setRotationAngle((prev) => prev + 360 / Math.min(items.length, 10));
  };

  return (
    <div className="relative my-8 p-6 sm:p-10 rounded-3xl bg-[#14211d] border border-[#2e795a] shadow-2xl overflow-hidden">
      {/* Background Aura Effects */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#2e795a]/25 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#4ecc97]/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e332d] pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0e1613] border border-[#2e795a] text-[#4ecc97] text-[0.750rem] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive 3D Motion Stage</span>
          </div>
          <h2 className="text-[1.777rem] font-bold text-[#e5ebe9]">
            Spatial Collection Showcase
          </h2>
          <p className="text-[0.750rem] text-[#85d1b1]">
            Drag, tilt, or cycle through your media universe in dynamic 3D space
          </p>
        </div>

        {/* Display Mode Toggles & Controls */}
        <div className="flex items-center gap-3">
          <div className="bg-[#0e1613] p-1 rounded-2xl border border-[#1e332d] flex items-center gap-1">
            <button
              onClick={() => setViewMode('stack')}
              className={`px-3 py-1.5 rounded-xl text-[0.750rem] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'stack'
                  ? 'bg-[#2e795a] text-[#e5ebe9]'
                  : 'text-[#85d1b1] hover:text-[#e5ebe9]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3D Card Stack</span>
            </button>
            <button
              onClick={() => setViewMode('cylinder')}
              className={`px-3 py-1.5 rounded-xl text-[0.750rem] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'cylinder'
                  ? 'bg-[#2e795a] text-[#e5ebe9]'
                  : 'text-[#85d1b1] hover:text-[#e5ebe9]'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Cylinder Carousel</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-2xl bg-[#0e1613] hover:bg-[#1e332d] text-[#4ecc97] border border-[#2e795a] transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 rounded-2xl bg-[#0e1613] hover:bg-[#1e332d] text-[#4ecc97] border border-[#2e795a] transition cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3D Motion Area */}
      {viewMode === 'stack' ? (
        <div className="relative z-10 min-h-[420px] flex items-center justify-center perspective-1000">
          <div className="relative w-full max-w-sm aspect-[3/4] flex items-center justify-center">
            {items.slice(0, 5).map((item, index) => {
              const offset = (index - (activeIndex % Math.min(items.length, 5)) + 5) % 5;
              const isFront = offset === 0;

              return (
                <motion.div
                  key={item.id}
                  onClick={() => onCardClick(item)}
                  animate={{
                    scale: 1 - offset * 0.08,
                    y: offset * 18,
                    z: -offset * 60,
                    rotateX: offset * 4,
                    opacity: 1 - offset * 0.18,
                  }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  style={{
                    zIndex: 5 - offset,
                    transformStyle: 'preserve-3d',
                  }}
                  className={`absolute inset-0 rounded-3xl overflow-hidden bg-[#0e1613] border border-[#2e795a] shadow-2xl cursor-pointer group ${
                    isFront ? 'ring-2 ring-[#4ecc97]/60' : ''
                  }`}
                >
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e1613] via-[#0e1613]/20 to-transparent" />

                  {/* Card Content Header */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="text-[0.750rem] font-bold px-2.5 py-1 rounded-full bg-[#2e795a]/80 text-[#e5ebe9] backdrop-blur-md border border-[#4ecc97]/40 uppercase tracking-wider">
                      {item.format || item.mediaType}
                    </span>
                    {item.score > 0 && (
                      <span className="text-[0.750rem] font-bold px-2.5 py-1 rounded-full bg-[#0e1613]/90 text-amber-300 backdrop-blur-md border border-[#1e332d] flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-300" />
                        {item.score.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* Card Bottom Details */}
                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <h3 className="text-[1.333rem] font-bold text-[#e5ebe9] line-clamp-1 group-hover:text-[#4ecc97] transition">
                      {item.title}
                    </h3>
                    <p className="text-[0.750rem] text-[#85d1b1] line-clamp-2">{item.synopsis}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#1e332d]">
                      <span className="text-[0.750rem] font-bold text-[#a3d2be]">
                        Ep {item.progress} / {item.totalProgress || '∞'}
                      </span>
                      <button
                        onClick={(e) => onIncrementProgress(e, item)}
                        className="p-2 rounded-xl bg-[#2e795a] hover:bg-[#4ecc97] text-[#e5ebe9] hover:text-[#0e1613] font-bold transition shadow-md flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="text-[0.750rem]">+1 Progress</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        /* CYLINDER 3D PROJECTION MODE */
        <div className="relative z-10 min-h-[420px] flex items-center justify-center perspective-1000 overflow-hidden py-10">
          <motion.div
            animate={{ rotateY: rotationAngle }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            className="relative w-64 h-80 transform-style-3d flex items-center justify-center"
          >
            {items.slice(0, 8).map((item, idx) => {
              const total = Math.min(items.length, 8);
              const angle = (idx * (360 / total));
              const radius = 280;

              return (
                <div
                  key={item.id}
                  onClick={() => onCardClick(item)}
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  }}
                  className="absolute w-52 h-72 rounded-2xl overflow-hidden bg-[#0e1613] border border-[#2e795a] shadow-2xl cursor-pointer group hover:border-[#4ecc97] transition-all"
                >
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e1613] via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 p-2 bg-[#0e1613]/90 backdrop-blur-md rounded-xl border border-[#1e332d]">
                    <h4 className="text-[0.750rem] font-bold text-[#e5ebe9] truncate">{item.title}</h4>
                    <span className="text-[0.750rem] text-[#4ecc97] font-bold">{item.studio || 'Anime'}</span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      )}
    </div>
  );
};
