import React, { useState, useEffect } from 'react';
import { MediaItem, AIRecommendation, MediaType, MediaFormat } from '../types';
import { Sparkles, X, Plus, Star, Check, Flame } from 'lucide-react';

interface AIRecommendationsModalProps {
  items: MediaItem[];
  isOpen: boolean;
  onClose: () => void;
  onAddMedia: (newItem: MediaItem) => void;
}

export const AIRecommendationsModal: React.FC<AIRecommendationsModalProps> = ({
  items,
  isOpen,
  onClose,
  onAddMedia,
}) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [addedTitles, setAddedTitles] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState('');

  const fetchRecommendations = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const topCollection = items
        .filter((i) => i.score >= 7 || i.favorite)
        .map((i) => ({
          title: i.title,
          score: i.score,
          genres: i.genres,
          mediaType: i.mediaType,
        }));

      const res = await fetch('/api/media/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection: topCollection }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch recommendations');
      }

      setRecommendations(data.recommendations || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'AI Recommendation service unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleAddRecommendation = (rec: AIRecommendation) => {
    const newItem: MediaItem = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: rec.title,
      mediaType: (rec.mediaType as MediaType) || 'anime',
      format: (rec.format as MediaFormat) || 'TV',
      status: 'plan_to_watch',
      progress: 0,
      totalProgress: rec.totalProgress || 12,
      score: 0,
      favorite: false,
      rewatchCount: 0,
      coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      genres: rec.genres || ['Action'],
      tags: ['AI Recommended'],
      studio: rec.studio,
      releaseYear: rec.releaseYear,
      synopsis: rec.synopsis,
      userNotes: `AI Match (${rec.matchScore}%): ${rec.reason}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddMedia(newItem);
    setAddedTitles((prev) => new Set(prev).add(rec.title));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 p-6 space-y-6 max-h-[90vh] flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Personalized AI Recommendations</span>
                <span className="text-[10px] font-semibold bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/30">
                  Gemini Powered
                </span>
              </h2>
              <p className="text-xs text-slate-400">Tailored suggestions generated from your top-rated media</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto space-y-4 flex-1">
          {loading && (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30 animate-pulse">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">Analyzing Your Collection Tastes...</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Gemini AI is matching your top rated titles, studios, and genres to find hidden gems you'll love.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center justify-between">
              <span>{errorMsg}</span>
              <button
                onClick={fetchRecommendations}
                className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-500"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && recommendations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec, idx) => {
                const isAdded = addedTitles.has(rec.title);
                return (
                  <div
                    key={idx}
                    className="bg-slate-800/60 rounded-2xl border border-slate-700/60 p-4 flex flex-col justify-between gap-3 shadow-md hover:border-violet-500/50 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {rec.format || rec.mediaType}
                        </span>
                        <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <Flame className="w-3.5 h-3.5" />
                          {rec.matchScore}% Match
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-100">{rec.title}</h3>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {rec.synopsis}
                      </p>

                      <div className="mt-2.5 p-2 rounded-xl bg-violet-950/40 border border-violet-500/20 text-[11px] text-violet-200">
                        <strong className="text-violet-300 block mb-0.5">Why You'll Love It:</strong>
                        {rec.reason}
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {rec.genres.map((g) => (
                          <span key={g} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddRecommendation(rec)}
                      disabled={isAdded}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm ${
                        isAdded
                          ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-indigo-500/20'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Added to Plan to Watch</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add to Plan to Watch</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
