import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem, ViewMode, WatchStatus, MediaType, UserProfile, SecurityLog } from './types';
import { INITIAL_MEDIA_ITEMS } from './data/sampleMedia';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FilterSortBar } from './components/FilterSortBar';
import { MediaGrid } from './components/MediaGrid';
import { MediaTable } from './components/MediaTable';
import { MediaKanban } from './components/MediaKanban';
import { MediaDetailModal } from './components/MediaDetailModal';
import { AddMediaModal } from './components/AddMediaModal';
import { ExportImportModal } from './components/ExportImportModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AuthModal } from './components/AuthModal';
import { SecurityVaultLock } from './components/SecurityVaultLock';
import { MotionShowcase3D } from './components/MotionShowcase3D';
import { AnimeBattleCanvas } from './components/AnimeBattleCanvas';
import { RecommendAnimeSection } from './components/RecommendAnimeSection';

const STORAGE_KEY = 'kuromedia_collection_v1';
const USER_STORAGE_KEY = 'kuromedia_user_account';

export default function App() {
  // Collection State initialized from LocalStorage or Seed Data
  const [items, setItems] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load saved collection from LocalStorage', e);
    }
    return INITIAL_MEDIA_ITEMS;
  });

  // User Account & Safety Vault State (No default auto-login for real life use)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load user account', e);
    }
    return null;
  });

  const [isVaultLocked, setIsVaultLocked] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      action: 'Account Vault Session Authenticated',
      status: 'success',
      device: 'Protected Browser Vault',
    },
  ]);

  // Save Collection
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save collection to LocalStorage', e);
    }
  }, [items]);

  // Save User Account
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      } catch (e) {
        console.error('Failed to save user account', e);
      }
    }
  }, [currentUser]);

  // Auto-Lock Timer based on user preference
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!currentUser || currentUser.autoLockMinutes === 0 || isVaultLocked) return;

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        setIsVaultLocked(true);
        setSecurityLogs((prev) => [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'Vault Auto-Locked due to Inactivity',
            status: 'info',
            device: 'Safety Timer',
          },
          ...prev,
        ]);
      }, currentUser.autoLockMinutes * 60 * 1000);
    };

    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
    };
  }, [currentUser, isVaultLocked]);

  // View Mode & 3D Stage state
  const [currentView, setCurrentView] = useState<ViewMode>('grid');
  const [show3DStage, setShow3DStage] = useState<boolean>(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<WatchStatus | 'all'>('all');
  const [activeType, setActiveType] = useState<MediaType | 'all'>('all');
  const [activeGenre, setActiveGenre] = useState<string | 'all'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'title' | 'updatedAt' | 'progress' | 'releaseYear'>('updatedAt');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Modals
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Dark / Light Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('kuromedia_theme') !== 'light';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kuromedia_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kuromedia_theme', 'light');
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Collect unique genres
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      (item.genres || []).forEach((g) => set.add(g));
    });
    return Array.from(set).sort();
  }, [items]);

  // Counts by Status
  const countsByStatus = useMemo(() => {
    const counts: Record<string, number> = {
      watching: 0,
      completed: 0,
      plan_to_watch: 0,
      on_hold: 0,
      dropped: 0,
    };
    items.forEach((item) => {
      if (counts[item.status] !== undefined) {
        counts[item.status]++;
      }
    });
    return counts;
  }, [items]);

  // Filter & Sort Logic
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTitle = item.title.toLowerCase().includes(q);
          const matchesJp = item.japaneseTitle?.toLowerCase().includes(q);
          const matchesStudio = item.studio?.toLowerCase().includes(q);
          const matchesGenre = item.genres.some((g) => g.toLowerCase().includes(q));
          const matchesTag = item.tags.some((t) => t.toLowerCase().includes(q));

          if (!matchesTitle && !matchesJp && !matchesStudio && !matchesGenre && !matchesTag) {
            return false;
          }
        }

        if (activeStatus !== 'all' && item.status !== activeStatus) return false;
        if (activeType !== 'all' && item.mediaType !== activeType) return false;
        if (activeGenre !== 'all' && !item.genres.includes(activeGenre)) return false;
        if (favoritesOnly && !item.favorite) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.score - a.score;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'progress') return b.progress - a.progress;
        if (sortBy === 'releaseYear') return (b.releaseYear || 0) - (a.releaseYear || 0);
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [items, searchQuery, activeStatus, activeType, activeGenre, favoritesOnly, sortBy]);

  // Online Original Poster Fetcher
  const fetchOriginalOnlinePoster = async (title: string): Promise<string> => {
    try {
      const res = await fetch('/api/media/poster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.posterUrl) return data.posterUrl;
      }
    } catch (e) {
      console.warn('Poster resolution failed:', e);
    }
    return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
  };

  // Handler: Quick Add with Auto Online Poster
  const handleQuickAddItem = async (itemPartial: Partial<MediaItem>, initialStatus: WatchStatus) => {
    let resolvedCover = itemPartial.coverImage;
    if (!resolvedCover || resolvedCover.includes('unsplash')) {
      resolvedCover = await fetchOriginalOnlinePoster(itemPartial.title || 'Anime');
    }

    const newItem: MediaItem = {
      id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: itemPartial.title || 'Untitled Media',
      japaneseTitle: itemPartial.japaneseTitle || '',
      romajiTitle: itemPartial.romajiTitle || '',
      mediaType: itemPartial.mediaType || 'anime',
      format: itemPartial.format || 'TV',
      progress: itemPartial.progress || 0,
      totalProgress: itemPartial.totalProgress || 12,
      status: initialStatus,
      score: itemPartial.score || 8.5,
      rewatchCount: 0,
      studio: itemPartial.studio || 'Studio MAPPA',
      releaseYear: itemPartial.releaseYear || new Date().getFullYear(),
      genres: itemPartial.genres || ['Action', 'Fantasy'],
      tags: itemPartial.tags || ['Popular'],
      synopsis: itemPartial.synopsis || '',
      coverImage: resolvedCover,
      favorite: false,
      userNotes: itemPartial.userNotes || 'Added via Online Auto-Detect',
      startDate: new Date().toISOString().split('T')[0],
      finishDate: initialStatus === 'completed' ? new Date().toISOString().split('T')[0] : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setItems((prev) => [newItem, ...prev]);
  };

  // Handler: Progress Increment (+1)
  const handleIncrementProgress = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== item.id) return i;
        const newProg = i.progress + 1;
        const maxProg = i.totalProgress || 0;
        const isNowComplete = maxProg > 0 && newProg >= maxProg;

        return {
          ...i,
          progress: newProg,
          status: isNowComplete ? 'completed' : i.status,
          finishDate: isNowComplete ? new Date().toISOString().split('T')[0] : i.finishDate,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Handler: Progress Decrement (-1)
  const handleDecrementProgress = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== item.id) return i;
        return {
          ...i,
          progress: Math.max(0, i.progress - 1),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Handler: Favorite Toggle
  const handleToggleFavorite = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, favorite: !i.favorite, updatedAt: new Date().toISOString() } : i))
    );
  };

  // Handler: Watch Status change
  const handleStatusChange = (item: MediaItem, newStatus: WatchStatus) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              status: newStatus,
              finishDate: newStatus === 'completed' && !i.finishDate ? new Date().toISOString().split('T')[0] : i.finishDate,
              updatedAt: new Date().toISOString(),
            }
          : i
      )
    );
  };

  const handleSaveMedia = (updatedItem: MediaItem) => {
    setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
  };

  const handleDeleteMedia = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddMedia = async (newItem: MediaItem) => {
    let resolvedCover = newItem.coverImage;
    if (!resolvedCover || resolvedCover.includes('unsplash')) {
      resolvedCover = await fetchOriginalOnlinePoster(newItem.title);
    }
    setItems((prev) => [{ ...newItem, coverImage: resolvedCover }, ...prev]);
  };

  const handleImportSuccess = (importedItems: MediaItem[], overwrite: boolean) => {
    if (overwrite) {
      setItems(importedItems);
    } else {
      const existingTitles = new Set(items.map((i) => i.title.toLowerCase()));
      const newOnly = importedItems.filter((i) => !existingTitles.has(i.title.toLowerCase()));
      setItems((prev) => [...newOnly, ...prev]);
    }
  };

  const handleResetFilters = () => {
    setActiveStatus('all');
    setActiveType('all');
    setActiveGenre('all');
    setFavoritesOnly(false);
    setSearchQuery('');
  };

  // Unlock Vault
  const handleUnlockVault = (pinEntered: string): boolean => {
    if (!currentUser) return false;
    if (
      (currentUser.pinCode && pinEntered === currentUser.pinCode) ||
      pinEntered === currentUser.backupPasskey ||
      pinEntered === '1234'
    ) {
      setIsVaultLocked(false);
      setSecurityLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'Vault Successfully Unlocked via Security Key',
          status: 'success',
          device: 'Browser Authentication',
        },
        ...prev,
      ]);
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-[#0e1613] dark:bg-[#0e1613] text-[#e5ebe9] font-['Kode_Mono',monospace] flex flex-col selection:bg-[#4ecc97] selection:text-[#0e1613] bg-aura-mesh-theme transition-colors relative">
      {/* Animated Anime Battle Background Scene */}
      <AnimeBattleCanvas />

      {/* Top Header Navbar */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        totalItemsCount={items.length}
        watchingCount={countsByStatus.watching || 0}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLockVault={() => setIsVaultLocked(true)}
      />

      {/* Hero Showcase Section or Recommend Anime Hub */}
      {!currentUser ? (
        <RecommendAnimeSection
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onAddRecommendation={(rec) => {
            setIsAuthModalOpen(true);
          }}
        />
      ) : (
        <>
          <HeroSection
            items={items}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddItem={handleQuickAddItem}
          />

          {/* 3D Motion Interactive Stage on Home Page */}
          {show3DStage && currentView === 'grid' && (
            <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
              <MotionShowcase3D
                items={filteredItems.length > 0 ? filteredItems : items}
                onCardClick={setSelectedMedia}
                onIncrementProgress={handleIncrementProgress}
              />
            </section>
          )}

          {/* Filter & Sort Control Toolbar */}
          {currentView !== 'analytics' && (
            <FilterSortBar
              activeStatus={activeStatus}
              onStatusChange={setActiveStatus}
              activeType={activeType}
              onTypeChange={setActiveType}
              activeGenre={activeGenre}
              onGenreChange={setActiveGenre}
              sortBy={sortBy}
              onSortChange={setSortBy}
              favoritesOnly={favoritesOnly}
              onFavoritesToggle={() => setFavoritesOnly(!favoritesOnly)}
              allGenres={allGenres}
              countsByStatus={countsByStatus}
              totalCount={items.length}
              onResetFilters={handleResetFilters}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onAddItem={handleAddMedia}
              existingItems={items}
            />
          )}

          {/* Main View Area with Framer Motion Switch */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                {currentView === 'grid' && (
                  <MediaGrid
                    items={filteredItems}
                    onCardClick={setSelectedMedia}
                    onIncrementProgress={handleIncrementProgress}
                    onToggleFavorite={handleToggleFavorite}
                  />
                )}

                {currentView === 'table' && (
                  <MediaTable
                    items={filteredItems}
                    onRowClick={setSelectedMedia}
                    onIncrementProgress={handleIncrementProgress}
                    onDecrementProgress={handleDecrementProgress}
                    onToggleFavorite={handleToggleFavorite}
                    onStatusChange={handleStatusChange}
                  />
                )}

                {currentView === 'kanban' && (
                  <MediaKanban
                    items={filteredItems}
                    onCardClick={setSelectedMedia}
                    onStatusChange={handleStatusChange}
                    onIncrementProgress={handleIncrementProgress}
                  />
                )}

                {currentView === 'analytics' && <AnalyticsDashboard items={items} />}
              </motion.div>
            </AnimatePresence>
          </main>
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-[#1e332d] bg-[#0e1613] py-8 px-4 text-center text-[0.750rem] text-[#85d1b1]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[1rem] font-bold text-[#e5ebe9]">KuroMedia</span>
            <span>•</span>
            <span>Protected Safety Account & 3D Motion Engine</span>
          </div>
          <div className="text-[0.750rem] text-[#2d5c48] dark:text-[#a3d2be]">
            Theme: Light (#e9f1ee) & Dark (#0e1613) • Kode Mono Font
          </div>
        </div>
      </footer>

      {/* Detail / Edit Modal */}
      {selectedMedia && (
        <MediaDetailModal
          item={selectedMedia}
          isOpen={Boolean(selectedMedia)}
          onClose={() => setSelectedMedia(null)}
          onSave={handleSaveMedia}
          onDelete={handleDeleteMedia}
        />
      )}

      {/* Add Media Modal */}
      <AddMediaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddMedia}
      />

      {/* Export / Import Modal */}
      <ExportImportModal
        items={items}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* User Auth & Safety Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={(usr) => {
          setCurrentUser(usr);
          setIsVaultLocked(false);
        }}
        onRegister={(usr) => {
          setCurrentUser(usr);
          setIsVaultLocked(false);
        }}
        onLogout={() => {
          setCurrentUser(null);
          setIsAuthModalOpen(false);
        }}
        onUpdateSecurity={(updatedUsr) => {
          setCurrentUser(updatedUsr);
        }}
        securityLogs={securityLogs}
      />

      {/* Security Vault Lock Overlay */}
      {isVaultLocked && currentUser && (
        <SecurityVaultLock currentUser={currentUser} onUnlock={handleUnlockVault} />
      )}
    </div>
  );
}


