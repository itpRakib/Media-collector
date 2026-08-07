export type MediaType =
  | 'anime'
  | 'manga'
  | 'light_novel'
  | 'movie'
  | 'tv_show'
  | 'asian_drama'
  | 'visual_novel';

export type WatchStatus =
  | 'watching'
  | 'completed'
  | 'on_hold'
  | 'dropped'
  | 'plan_to_watch';

export type MediaFormat =
  | 'TV'
  | 'Movie'
  | 'OVA'
  | 'Manga'
  | 'Light Novel'
  | 'Webtoon'
  | 'Special'
  | 'TV Short'
  | 'Drama'
  | 'Visual Novel';

export type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter';

export interface MediaItem {
  id: string;
  title: string;
  japaneseTitle?: string;
  romajiTitle?: string;
  mediaType: MediaType;
  format: MediaFormat;
  status: WatchStatus;
  progress: number; // Current episode / chapter
  totalProgress?: number; // Total episodes / chapters (0 or undefined if ongoing)
  score: number; // 0 to 10 rating
  favorite: boolean;
  rewatchCount: number;
  coverImage: string;
  bannerImage?: string;
  genres: string[];
  tags: string[];
  studio?: string;
  releaseYear?: number;
  season?: Season;
  synopsis: string;
  startDate?: string; // YYYY-MM-DD
  finishDate?: string; // YYYY-MM-DD
  userNotes?: string;
  episodesPerSeason?: number;
  durationPerEp?: number; // Minutes
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'grid' | 'table' | 'kanban' | 'analytics';

export type ExportFormat = 'json' | 'csv' | 'mal_xml' | 'anilist_json';

export interface ExportOptions {
  format: ExportFormat;
  includeNotes: boolean;
  includeCustomTags: boolean;
  filterByStatus: WatchStatus | 'all';
  filterByType: MediaType | 'all';
  selectedFields?: string[];
}

export interface CollectionStats {
  totalItems: number;
  completedCount: number;
  watchingCount: number;
  planToWatchCount: number;
  onHoldCount: number;
  droppedCount: number;
  totalEpisodesWatched: number;
  totalChaptersRead: number;
  estimatedHoursSpent: number;
  averageScore: number;
  topGenres: { genre: string; count: number }[];
  statusDistribution: Record<WatchStatus, number>;
  typeDistribution: Record<MediaType, number>;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  pinCode?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  autoLockMinutes: number; // 0 for disabled, or 1, 5, 15
  isVaultLocked: boolean;
  backupPasskey: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'warning' | 'info';
  device: string;
}

export interface AIRecommendation {
  title: string;
  mediaType: MediaType;
  format: MediaFormat;
  genres: string[];
  synopsis: string;
  coverKeyword: string;
  reason: string;
  matchScore: number;
  totalProgress?: number;
  releaseYear?: number;
  studio?: string;
}
