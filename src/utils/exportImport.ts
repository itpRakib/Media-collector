import { MediaItem, ExportOptions, WatchStatus, MediaType } from '../types';

export function filterItemsForExport(items: MediaItem[], options: ExportOptions): MediaItem[] {
  return items.filter((item) => {
    if (options.filterByStatus !== 'all' && item.status !== options.filterByStatus) {
      return false;
    }
    if (options.filterByType !== 'all' && item.mediaType !== options.filterByType) {
      return false;
    }
    return true;
  });
}

export function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToJSON(items: MediaItem[], options: ExportOptions): string {
  const filtered = filterItemsForExport(items, options);
  const dataToExport = filtered.map((item) => {
    const copy = { ...item };
    if (!options.includeNotes) {
      delete copy.userNotes;
    }
    if (!options.includeCustomTags) {
      delete copy.tags;
    }
    return copy;
  });

  const exportEnvelope = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    sourceApp: 'Anime & Media Collection Tracker',
    itemCount: dataToExport.length,
    media: dataToExport,
  };

  return JSON.stringify(exportEnvelope, null, 2);
}

export function exportToCSV(items: MediaItem[], options: ExportOptions): string {
  const filtered = filterItemsForExport(items, options);
  
  const headers = [
    'ID',
    'Title',
    'Japanese Title',
    'Romaji Title',
    'Media Type',
    'Format',
    'Status',
    'Progress',
    'Total Progress',
    'Score',
    'Favorite',
    'Rewatch Count',
    'Studio',
    'Release Year',
    'Genres',
    options.includeCustomTags ? 'Tags' : null,
    options.includeNotes ? 'User Notes' : null,
    'Cover Image',
    'Start Date',
    'Finish Date',
    'Updated At'
  ].filter(Boolean) as string[];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = filtered.map((item) => {
    const row = [
      item.id,
      item.title,
      item.japaneseTitle || '',
      item.romajiTitle || '',
      item.mediaType,
      item.format,
      item.status,
      item.progress,
      item.totalProgress || '',
      item.score,
      item.favorite ? 'TRUE' : 'FALSE',
      item.rewatchCount,
      item.studio || '',
      item.releaseYear || '',
      (item.genres || []).join('; '),
      options.includeCustomTags ? (item.tags || []).join('; ') : null,
      options.includeNotes ? item.userNotes || '' : null,
      item.coverImage || '',
      item.startDate || '',
      item.finishDate || '',
      item.updatedAt || ''
    ].filter((v) => v !== null);

    return row.map(escapeCSV).join(',');
  });

  return [headers.map(escapeCSV).join(','), ...rows].join('\n');
}

// Convert watch status to MyAnimeList numeric code
function malStatusCode(status: WatchStatus): number {
  switch (status) {
    case 'watching': return 1; // Watching / Reading
    case 'completed': return 2;
    case 'on_hold': return 3;
    case 'dropped': return 4;
    case 'plan_to_watch': return 6;
    default: return 1;
  }
}

export function exportToMALXml(items: MediaItem[], options: ExportOptions): string {
  const filtered = filterItemsForExport(items, options);
  
  let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<!--
 Created by Anime & Media Collection Tracker
 MyAnimeList Export Format
-->
<myanimelist>
\t<myinfo>
\t\t<user_export_type>1</user_export_type>
\t\t<export_date>${new Date().toISOString().split('T')[0]}</export_date>
\t</myinfo>
`;

  filtered.forEach((item) => {
    xml += `\t<anime>
\t\t<series_animedb_id>0</series_animedb_id>
\t\t<series_title><![CDATA[${item.title}]]></series_title>
\t\t<series_type>${item.format}</series_type>
\t\t<series_episodes>${item.totalProgress || 0}</series_episodes>
\t\t<my_watched_episodes>${item.progress}</my_watched_episodes>
\t\t<my_start_date>${item.startDate || '0000-00-00'}</my_start_date>
\t\t<my_finish_date>${item.finishDate || '0000-00-00'}</my_finish_date>
\t\t<my_score>${Math.round(item.score)}</my_score>
\t\t<my_status>${malStatusCode(item.status)}</my_status>
\t\t<my_rewatching>${item.rewatchCount > 0 ? 1 : 0}</my_rewatching>
\t\t<my_comments><![CDATA[${options.includeNotes ? item.userNotes || '' : ''}]]></my_comments>
\t\t<my_tags><![CDATA[${options.includeCustomTags ? (item.tags || []).join(', ') : ''}]]></my_tags>
\t</anime>\n`;
  });

  xml += `</myanimelist>`;
  return xml;
}

export function exportToAniListJSON(items: MediaItem[], options: ExportOptions): string {
  const filtered = filterItemsForExport(items, options);

  const entries = filtered.map((item) => ({
    media: {
      title: {
        userPreferred: item.title,
        native: item.japaneseTitle,
        romaji: item.romajiTitle,
      },
      format: item.format,
      episodes: item.totalProgress,
      chapters: item.totalProgress,
      genres: item.genres,
      coverImage: {
        large: item.coverImage,
      },
    },
    status: item.status.toUpperCase(),
    progress: item.progress,
    score: item.score,
    repeat: item.rewatchCount,
    notes: options.includeNotes ? item.userNotes : undefined,
    customLists: options.includeCustomTags ? item.tags : undefined,
    startedAt: item.startDate ? { date: item.startDate } : null,
    completedAt: item.finishDate ? { date: item.finishDate } : null,
  }));

  const aniListExport = {
    data: {
      MediaListCollection: {
        lists: [
          {
            name: 'All Media Collection',
            entries,
          },
        ],
      },
    },
  };

  return JSON.stringify(aniListExport, null, 2);
}

export function parseImportedMALXml(xmlString: string): MediaItem[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  const animeNodes = xmlDoc.getElementsByTagName('anime');
  const items: MediaItem[] = [];

  for (let i = 0; i < animeNodes.length; i++) {
    const node = animeNodes[i];
    const getTag = (tagName: string) => {
      const el = node.getElementsByTagName(tagName)[0];
      return el ? el.textContent || '' : '';
    };

    const title = getTag('series_title');
    if (!title) continue;

    const watchedEp = parseInt(getTag('my_watched_episodes') || '0', 10) || 0;
    const totalEp = parseInt(getTag('series_episodes') || '0', 10) || 0;
    const myScore = parseFloat(getTag('my_score') || '0') || 0;
    const rawStatus = getTag('my_status');
    const comments = getTag('my_comments');

    let status: WatchStatus = 'watching';
    if (rawStatus === '1' || rawStatus === 'Watching') status = 'watching';
    else if (rawStatus === '2' || rawStatus === 'Completed') status = 'completed';
    else if (rawStatus === '3' || rawStatus === 'On-Hold') status = 'on_hold';
    else if (rawStatus === '4' || rawStatus === 'Dropped') status = 'dropped';
    else if (rawStatus === '6' || rawStatus === 'Plan to Watch') status = 'plan_to_watch';

    items.push({
      id: `mal-import-${Date.now()}-${i}`,
      title,
      mediaType: 'anime',
      format: (getTag('series_type') as any) || 'TV',
      status,
      progress: watchedEp,
      totalProgress: totalEp > 0 ? totalEp : undefined,
      score: myScore,
      favorite: false,
      rewatchCount: parseInt(getTag('my_rewatching') || '0', 10) || 0,
      coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      genres: ['Anime'],
      tags: ['MyAnimeList Import'],
      synopsis: comments || 'Imported from MyAnimeList XML export.',
      userNotes: comments || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return items;
}

export async function fetchMALUserList(username: string): Promise<MediaItem[]> {
  const cleanUser = username.trim();
  if (!cleanUser) throw new Error('MyAnimeList Username cannot be empty.');

  // Fetch via Jikan API v4
  const url = `https://api.jikan.moe/v4/users/${encodeURIComponent(cleanUser)}/animelist`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`MyAnimeList user "${cleanUser}" not found or profile is set to private.`);
    }
    throw new Error(`Failed to fetch MAL list for "${cleanUser}". Please try again or upload XML export.`);
  }

  const data = await res.json();
  if (!data || !Array.isArray(data.data)) {
    throw new Error('No public anime entries found for this MyAnimeList username.');
  }

  const items: MediaItem[] = data.data.map((entry: any, idx: number) => {
    const anime = entry.anime || {};
    const watched = entry.watched_episodes || 0;
    const score = entry.score || 0;
    const statusStr = (entry.status || '').toLowerCase();

    let status: WatchStatus = 'watching';
    if (statusStr.includes('completed') || statusStr.includes('2')) status = 'completed';
    else if (statusStr.includes('hold') || statusStr.includes('3')) status = 'on_hold';
    else if (statusStr.includes('drop') || statusStr.includes('4')) status = 'dropped';
    else if (statusStr.includes('plan') || statusStr.includes('6')) status = 'plan_to_watch';

    const cover =
      anime.images?.jpg?.large_image_url ||
      anime.images?.jpg?.image_url ||
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';

    return {
      id: `mal-user-${Date.now()}-${idx}`,
      title: anime.title || 'Untitled Anime',
      japaneseTitle: anime.title_japanese || undefined,
      romajiTitle: anime.title_japanese || undefined,
      mediaType: 'anime' as const,
      format: anime.type || 'TV',
      status,
      progress: watched,
      totalProgress: anime.episodes || undefined,
      score,
      favorite: Boolean(entry.is_rewatching),
      rewatchCount: entry.rewatch_value || 0,
      coverImage: cover,
      genres: anime.genres ? anime.genres.map((g: any) => g.name) : ['Anime'],
      tags: ['MyAnimeList Sync'],
      synopsis: anime.synopsis || `Imported directly from MyAnimeList profile @${cleanUser}`,
      userNotes: entry.comments || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  return items;
}

export function parseImportedJSON(jsonString: string): MediaItem[] {
  try {
    const parsed = JSON.parse(jsonString);
    let rawList: any[] = [];

    if (Array.isArray(parsed)) {
      rawList = parsed;
    } else if (parsed && Array.isArray(parsed.media)) {
      rawList = parsed.media;
    } else if (parsed && parsed.data?.MediaListCollection?.lists) {
      // AniList format
      parsed.data.MediaListCollection.lists.forEach((list: any) => {
        if (Array.isArray(list.entries)) {
          list.entries.forEach((entry: any) => {
            rawList.push({
              title: entry.media?.title?.userPreferred || entry.media?.title?.romaji || 'Untitled',
              japaneseTitle: entry.media?.title?.native,
              mediaType: entry.media?.format === 'Manga' ? 'manga' : 'anime',
              format: entry.media?.format || 'TV',
              status: (entry.status || 'watching').toLowerCase() as WatchStatus,
              progress: entry.progress || 0,
              totalProgress: entry.media?.episodes || entry.media?.chapters || 0,
              score: entry.score || 0,
              favorite: false,
              rewatchCount: entry.repeat || 0,
              coverImage: entry.media?.coverImage?.large || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
              genres: entry.media?.genres || [],
              tags: entry.customLists || [],
              synopsis: 'Imported from AniList backup.',
              userNotes: entry.notes || '',
            });
          });
        }
      });
    }

    return rawList.map((raw, idx) => ({
      id: raw.id || `imported-${Date.now()}-${idx}`,
      title: raw.title || 'Untitled Media',
      japaneseTitle: raw.japaneseTitle,
      romajiTitle: raw.romajiTitle,
      mediaType: normalizeMediaType(raw.mediaType),
      format: raw.format || 'TV',
      status: normalizeWatchStatus(raw.status),
      progress: Number(raw.progress) || 0,
      totalProgress: Number(raw.totalProgress) || undefined,
      score: Number(raw.score) || 0,
      favorite: Boolean(raw.favorite),
      rewatchCount: Number(raw.rewatchCount) || 0,
      coverImage: raw.coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      bannerImage: raw.bannerImage,
      genres: Array.isArray(raw.genres) ? raw.genres : typeof raw.genres === 'string' ? raw.genres.split(/;|,/).map((g: string) => g.trim()) : [],
      tags: Array.isArray(raw.tags) ? raw.tags : typeof raw.tags === 'string' ? raw.tags.split(/;|,/).map((t: string) => t.trim()) : [],
      studio: raw.studio,
      releaseYear: Number(raw.releaseYear) || undefined,
      season: raw.season,
      synopsis: raw.synopsis || 'No synopsis provided.',
      startDate: raw.startDate,
      finishDate: raw.finishDate,
      userNotes: raw.userNotes,
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  } catch (err) {
    throw new Error('Invalid JSON format or corrupted file.');
  }
}

export function parseImportedCSV(csvString: string): MediaItem[] {
  const lines = csvString.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length < 2) return [];

  // Simple CSV parser supporting quotes
  const parseRow = (text: string) => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"' && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseRow(lines[0]).map((h) => h.toLowerCase());
  const items: MediaItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseRow(lines[i]);
    if (!cols || cols.length === 0) continue;

    const getVal = (name: string) => {
      const idx = headers.findIndex((h) => h.includes(name));
      return idx >= 0 && cols[idx] ? cols[idx] : '';
    };

    const title = getVal('title') || cols[1] || 'Untitled';
    if (!title) continue;

    items.push({
      id: getVal('id') || `csv-import-${Date.now()}-${i}`,
      title,
      japaneseTitle: getVal('japanese') || undefined,
      romajiTitle: getVal('romaji') || undefined,
      mediaType: normalizeMediaType(getVal('type')),
      format: (getVal('format') as any) || 'TV',
      status: normalizeWatchStatus(getVal('status')),
      progress: parseInt(getVal('progress') || '0', 10) || 0,
      totalProgress: parseInt(getVal('total') || '0', 10) || undefined,
      score: parseFloat(getVal('score') || '0') || 0,
      favorite: getVal('favorite').toLowerCase() === 'true',
      rewatchCount: parseInt(getVal('rewatch') || '0', 10) || 0,
      coverImage: getVal('cover') || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      studio: getVal('studio') || undefined,
      releaseYear: parseInt(getVal('year') || '0', 10) || undefined,
      genres: getVal('genres') ? getVal('genres').split(';').map((s) => s.trim()) : [],
      tags: getVal('tags') ? getVal('tags').split(';').map((s) => s.trim()) : [],
      synopsis: getVal('synopsis') || 'Imported from CSV',
      userNotes: getVal('notes') || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return items;
}

function normalizeMediaType(typeStr: string): MediaType {
  const str = (typeStr || '').toLowerCase();
  if (str.includes('manga')) return 'manga';
  if (str.includes('novel') || str.includes('ln')) return 'light_novel';
  if (str.includes('movie')) return 'movie';
  if (str.includes('tv') || str.includes('show')) return 'tv_show';
  if (str.includes('drama')) return 'asian_drama';
  if (str.includes('visual')) return 'visual_novel';
  return 'anime';
}

function normalizeWatchStatus(statusStr: string): WatchStatus {
  const str = (statusStr || '').toLowerCase();
  if (str.includes('completed') || str.includes('2') || str.includes('finish')) return 'completed';
  if (str.includes('hold') || str.includes('3') || str.includes('paused')) return 'on_hold';
  if (str.includes('drop') || str.includes('4')) return 'dropped';
  if (str.includes('plan') || str.includes('6') || str.includes('ptw')) return 'plan_to_watch';
  return 'watching';
}
