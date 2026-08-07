import React from 'react';
import {
  Film,
  Plus,
  Download,
  LayoutGrid,
  List,
  Kanban,
  BarChart2,
  Sun,
  Moon,
  Shield,
  ShieldCheck,
  Lock,
  User,
} from 'lucide-react';
import { ViewMode, MediaItem, WatchStatus, UserProfile } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  totalItemsCount: number;
  watchingCount: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onLockVault: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenAddModal,
  onOpenExportModal,
  totalItemsCount,
  watchingCount,
  isDarkMode,
  onToggleTheme,
  currentUser,
  onOpenAuthModal,
  onLockVault,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#090d12]/90 backdrop-blur-xl border-b border-[#1e2b38] px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Title & Glowing Logo */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#e11d48] to-[#22d3ee] opacity-50 group-hover:opacity-100 blur-md transition duration-300" />
              <div className="relative h-11 w-11 rounded-2xl bg-[#121922] border border-[#22d3ee]/40 flex items-center justify-center text-[#22d3ee] shadow-xl">
                <Film className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[1.333rem] sm:text-[1.5rem] font-bold text-[#f0f6f8] tracking-tight leading-none group-hover:text-[#22d3ee] transition-colors">
                  KuroMedia
                </h1>
                <span className="text-[0.700rem] font-bold uppercase tracking-wider bg-[#801b38]/40 text-[#22d3ee] border border-[#22d3ee]/40 px-2 py-0.5 rounded-full shadow-sm">
                  Pro
                </span>
              </div>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-2 text-[0.750rem] text-[#a3d2be] bg-[#14211d] px-3 py-1.5 rounded-xl border border-[#1e332d]">
            <span>{totalItemsCount} Saved</span>
            <span>•</span>
            <span className="text-[#4ecc97] font-bold">{watchingCount} Active</span>
          </div>
        </div>



        {/* View Switcher & Action Buttons */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 w-full md:w-auto">
          {/* View Segmented Toggle */}
          <div className="bg-[#14211d] p-1 rounded-2xl border border-[#1e332d] flex items-center gap-1 shadow-inner">
            <button
              onClick={() => onViewChange('grid')}
              title="3D Motion Grid"
              className={`px-3 py-1.5 rounded-xl text-[0.750rem] font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                currentView === 'grid'
                  ? 'bg-[#2e795a] text-[#e5ebe9] shadow-md'
                  : 'text-[#85d1b1] hover:text-[#e5ebe9] hover:bg-[#1e332d]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => onViewChange('table')}
              title="Table List View"
              className={`px-3 py-1.5 rounded-xl text-[0.750rem] font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                currentView === 'table'
                  ? 'bg-[#2e795a] text-[#e5ebe9] shadow-md'
                  : 'text-[#85d1b1] hover:text-[#e5ebe9] hover:bg-[#1e332d]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => onViewChange('kanban')}
              title="Kanban Board View"
              className={`px-3 py-1.5 rounded-xl text-[0.750rem] font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                currentView === 'kanban'
                  ? 'bg-[#2e795a] text-[#e5ebe9] shadow-md'
                  : 'text-[#85d1b1] hover:text-[#e5ebe9] hover:bg-[#1e332d]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => onViewChange('analytics')}
              title="Stats & Insights"
              className={`px-3 py-1.5 rounded-xl text-[0.750rem] font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                currentView === 'analytics'
                  ? 'bg-[#2e795a] text-[#e5ebe9] shadow-md'
                  : 'text-[#85d1b1] hover:text-[#e5ebe9] hover:bg-[#1e332d]'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stats</span>
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="p-2.5 rounded-xl bg-[#14211d] hover:bg-[#1e332d] text-[#4ecc97] border border-[#2e795a]/50 transition-all duration-200 hover:scale-105 cursor-pointer shadow-sm"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-[#4ecc97]" />}
          </button>

          {/* Action CTAs & Account Safety controls */}
          <div className="flex items-center gap-2">
            {/* Account & Safety Lock Control */}
            {currentUser ? (
              <div className="flex items-center gap-1 bg-[#14211d] p-1 rounded-2xl border border-[#2e795a]/50">
                <button
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-2 px-2.5 py-1 text-[0.750rem] font-bold text-[#e5ebe9] hover:text-[#4ecc97] cursor-pointer"
                  title="Account Profile & Safety Vault"
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.username}
                    className="w-6 h-6 rounded-lg bg-[#0e1613] border border-[#2e795a]"
                  />
                  <span className="hidden xl:inline">{currentUser.username}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4ecc97]" />
                </button>
                <button
                  onClick={onLockVault}
                  title="Lock Vault Now"
                  className="p-1.5 rounded-xl bg-[#090d12] hover:bg-rose-500/20 text-[#22d3ee] hover:text-rose-300 border border-[#22d3ee]/20 transition cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3 py-2 text-[0.750rem] font-bold rounded-xl bg-[#801b38]/30 hover:bg-[#801b38] text-[#22d3ee] hover:text-white border border-[#22d3ee]/40 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Account Login</span>
              </button>
            )}

            <button
              onClick={onOpenExportModal}
              className="p-2 sm:px-3 sm:py-2 text-[0.750rem] font-bold rounded-xl bg-[#121922] hover:bg-[#1a2432] text-[#f0f6f8] border border-[#1e2b38] flex items-center gap-1.5 transition-all duration-200 hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-[#8ba8b7] shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Export</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-2 text-[0.750rem] font-bold rounded-xl bg-gradient-to-r from-[#9f1239] via-[#0d9488] to-[#06b6d4] hover:brightness-110 text-white shadow-lg shadow-[#06b6d4]/20 flex items-center gap-1.5 transition-all duration-200 hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-white shrink-0" />
              <span className="whitespace-nowrap">Add Media</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

