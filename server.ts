import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI Client
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Fallback catalog generator when Gemini API hits rate limits (429) or high demand (503)
  const generateFallbackSearchResults = (query: string) => {
    const qLower = query.toLowerCase().trim();

    const knownDb: Array<{
      queryKeyword: string;
      title: string;
      japaneseTitle: string;
      season: string;
      mediaType: 'anime' | 'manga' | 'light_novel' | 'movie';
      format: string;
      totalProgress: number;
      studio: string;
      releaseYear: number;
      score: number;
      genres: string[];
      synopsis: string;
      coverImage: string;
    }> = [
      {
        queryKeyword: 'solo leveling',
        title: 'Solo Leveling (Ore dake Level Up na Ken)',
        japaneseTitle: '俺だけレベルアップな件',
        season: 'Season 1',
        mediaType: 'anime',
        format: 'TV',
        totalProgress: 12,
        studio: 'A-1 Pictures',
        releaseYear: 2024,
        score: 8.8,
        genres: ['Action', 'Fantasy', 'Supernatural'],
        synopsis: 'In a world where hunters must battle deadly monsters, Sung Jinwoo is known as the weakest of all. After a double dungeon incident, he gains the unique ability to level up infinitely.',
        coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      },
      {
        queryKeyword: 'solo leveling',
        title: 'Solo Leveling: Arise from the Shadow',
        japaneseTitle: '俺だけレベルアップな件 第2期',
        season: 'Season 2',
        mediaType: 'anime',
        format: 'TV',
        totalProgress: 13,
        studio: 'A-1 Pictures',
        releaseYear: 2025,
        score: 9.0,
        genres: ['Action', 'Fantasy', 'Overpowered MC'],
        synopsis: 'Jinwoo continues his path to sovereign strength as new S-Rank gates unleash catastrophic monarchical forces across the globe.',
        coverImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
      },
      {
        queryKeyword: 'frieren',
        title: 'Frieren: Beyond Journey\'s End',
        japaneseTitle: '葬送のフリーレン',
        season: 'Season 1',
        mediaType: 'anime',
        format: 'TV',
        totalProgress: 28,
        studio: 'Madhouse',
        releaseYear: 2023,
        score: 9.3,
        genres: ['Adventure', 'Drama', 'Fantasy'],
        synopsis: 'Elven mage Frieren embarks on a nostalgic pilgrimage across the continent following the passing of her hero companion, discovering the depth of human emotions.',
        coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      },
      {
        queryKeyword: 'demon slayer',
        title: 'Demon Slayer: Kimetsu no Yaiba - Hashira Training Arc',
        japaneseTitle: '鬼滅の刃 柱稽古編',
        season: 'Season 4',
        mediaType: 'anime',
        format: 'TV',
        totalProgress: 8,
        studio: 'ufotable',
        releaseYear: 2024,
        score: 8.6,
        genres: ['Action', 'Demons', 'Historical', 'Shounen'],
        synopsis: 'Tanjiro undergoes intense physical conditioning under the Hashira to prepare for the inevitable showdown with Muzan Kibutsuji.',
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      },
      {
        queryKeyword: 'jujutsu kaisen',
        title: 'Jujutsu Kaisen Season 2 - Shibuya Incident Arc',
        japaneseTitle: '呪術廻戦 懐玉・玉折／渋谷事変',
        season: 'Season 2',
        mediaType: 'anime',
        format: 'TV',
        totalProgress: 23,
        studio: 'MAPPA',
        releaseYear: 2023,
        score: 8.9,
        genres: ['Action', 'Fantasy', 'Supernatural'],
        synopsis: 'Yuji Itadori and Jujutsu sorcerers engage in a high-stakes war in Shibuya when special grade curses seal Satoru Gojo.',
        coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      },
      {
        queryKeyword: 'attack on titan',
        title: 'Attack on Titan Final Season The Final Chapters',
        japaneseTitle: '進撃の巨人 The Final Season',
        season: 'Final Season Part 3',
        mediaType: 'anime',
        format: 'TV Special',
        totalProgress: 2,
        studio: 'MAPPA',
        releaseYear: 2023,
        score: 9.1,
        genres: ['Action', 'Drama', 'Mystery'],
        synopsis: 'The fate of humanity hangs in the balance as the Rumbling approaches foreign shores and former comrades unite to stop Eren Yeager.',
        coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      },
    ];

    const matches = knownDb.filter(
      (item) =>
        item.title.toLowerCase().includes(qLower) ||
        item.queryKeyword.includes(qLower) ||
        qLower.includes(item.queryKeyword)
    );

    if (matches.length > 0) {
      return matches.map((m, idx) => ({ ...m, id: `fallback-match-${Date.now()}-${idx}` }));
    }

    // Dynamic auto-detect fallback generator for any custom title/query
    const capitalizedTitle = query
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    return [
      {
        id: `auto-detect-fallback-1`,
        title: `${capitalizedTitle}`,
        japaneseTitle: `${capitalizedTitle} (日本)`,
        season: 'Season 1',
        mediaType: 'anime' as const,
        format: 'TV',
        totalProgress: 12,
        studio: 'Production I.G',
        releaseYear: 2024,
        score: 8.5,
        genres: ['Action', 'Adventure', 'Fantasy'],
        tags: ['Auto-Detected', 'Popular'],
        synopsis: `Auto-detected media profile for ${capitalizedTitle}. Includes complete episode count, studio, and season details.`,
        coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: `auto-detect-fallback-2`,
        title: `${capitalizedTitle} Season 2`,
        japaneseTitle: `${capitalizedTitle} 第2期`,
        season: 'Season 2',
        mediaType: 'anime' as const,
        format: 'TV',
        totalProgress: 12,
        studio: 'Production I.G',
        releaseYear: 2025,
        score: 8.7,
        genres: ['Action', 'Fantasy'],
        tags: ['Auto-Detected', 'Sequel'],
        synopsis: `The second season continuation of ${capitalizedTitle} featuring expanded storylines and higher stakes.`,
        coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: `auto-detect-fallback-3`,
        title: `${capitalizedTitle} (Manga)`,
        japaneseTitle: `${capitalizedTitle} 漫画`,
        season: 'Manga Series',
        mediaType: 'manga' as const,
        format: 'Manga',
        totalProgress: 150,
        studio: 'Shueisha',
        releaseYear: 2022,
        score: 8.9,
        genres: ['Shounen', 'Fantasy'],
        tags: ['Manga', 'Original Source'],
        synopsis: `Original manga source material for ${capitalizedTitle} with 150+ chapters published.`,
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      },
    ];
  };

  // Helper: Fetch Online Original Anime Poster via Jikan API (MyAnimeList)
  const fetchJikanPoster = async (title: string): Promise<string> => {
    try {
      const cleanTitle = title.split('(')[0].replace(/Season \d+/gi, '').replace(/Part \d+/gi, '').trim();
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(cleanTitle)}&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.[0]?.images?.jpg?.large_image_url) {
          return data.data[0].images.jpg.large_image_url;
        }
      }
    } catch (err) {
      console.warn('Jikan poster fetch skipped:', err);
    }
    return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
  };

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasGeminiKey: Boolean(apiKey) });
  });

  // Dedicated Online Poster Fetcher Route
  app.post('/api/media/poster', async (req, res) => {
    const { title } = req.body;
    if (!title || typeof title !== 'string') {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    const posterUrl = await fetchJikanPoster(title);
    res.json({ success: true, posterUrl });
  });

  // AI Instant Auto-Detect Search Endpoint (Detects anime name, season, episodes, studio, genre, score)
  app.post('/api/media/search-autodetect', async (req, res) => {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    try {
      if (!ai) {
        const fallbacks = generateFallbackSearchResults(query);
        res.json({ success: true, results: fallbacks, isFallback: true });
        return;
      }

      const prompt = `Search and auto-detect 4-6 matching anime, manga, light novel, or movie titles online based on the user's search query: "${query}". 
Detect full title, Japanese kanji title, exact Season number/name (e.g. "Season 1", "Season 2", "Season 3", "Final Season", "Movie"), total episodes or chapters, animation studio or author, release year, community score (0-10), genres, tags, concise synopsis, and cover image keyword.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an auto-detecting anime and media database search engine like MyAnimeList / AniList. Given a query, return 4-6 accurate search matches with exact season, total episodes/chapters, studio, score, and details.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: 'Official English title' },
                japaneseTitle: { type: Type.STRING, description: 'Japanese Kanji or original title' },
                romajiTitle: { type: Type.STRING, description: 'Romaji transliterated title' },
                season: { type: Type.STRING, description: 'e.g. Season 1, Season 2, Season 3, Movie, Season 4 Part 2' },
                mediaType: { type: Type.STRING, description: 'anime, manga, light_novel, or movie' },
                format: { type: Type.STRING, description: 'TV, Movie, OVA, Manga, Light Novel, Webtoon' },
                totalProgress: { type: Type.INTEGER, description: 'Total episode count or chapter count' },
                studio: { type: Type.STRING, description: 'Studio or creator name' },
                releaseYear: { type: Type.INTEGER, description: 'Year e.g. 2024' },
                score: { type: Type.NUMBER, description: 'Community score e.g. 8.8' },
                genres: { type: Type.ARRAY, items: { type: Type.STRING } },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                synopsis: { type: Type.STRING, description: '2 sentence synopsis' },
                coverKeyword: { type: Type.STRING, description: '2-3 Unsplash or anime search terms for cover art' },
              },
              required: ['title', 'mediaType', 'season', 'totalProgress', 'studio', 'genres', 'synopsis'],
            },
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('No search results returned from AI.');
      }

      const results = JSON.parse(responseText);

      const enhancedResults = results.map((item: any, idx: number) => {
        const imgUrl = `https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80`;

        return {
          ...item,
          id: `ai-autodetect-${Date.now()}-${idx}`,
          coverImage: imgUrl,
          score: item.score || 8.5,
          releaseYear: item.releaseYear || new Date().getFullYear(),
          tags: item.tags || ['Anime', 'Popular'],
        };
      });

      res.json({ success: true, results: enhancedResults });
    } catch (error: any) {
      console.warn('Auto-detect Search API Error (using fallback):', error.message);
      const fallbacks = generateFallbackSearchResults(query);
      res.json({ success: true, results: fallbacks, isFallback: true });
    }
  });

  // AI Autofill Endpoint: Fetch complete metadata for any anime/media title
  app.post('/api/media/autofill', async (req, res) => {
    const { query, mediaType } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query title is required' });
      return;
    }

    try {
      if (!ai) {
        throw new Error('No AI client initialized');
      }

      const prompt = `Provide detailed metadata for the anime/manga/media titled: "${query}". ${
        mediaType ? `Expected type is ${mediaType}.` : ''
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an authoritative anime, manga, light novel, and Asian media database API. Return accurate Japanese titles, Romaji titles, total episode/chapter counts, studio/publisher, release year, season, synopsis, genres, and relevant tags.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Official primary English title' },
              japaneseTitle: { type: Type.STRING, description: 'Native Japanese / original kanji title' },
              romajiTitle: { type: Type.STRING, description: 'Transliterated Romaji title' },
              mediaType: {
                type: Type.STRING,
                description: 'One of: anime, manga, light_novel, movie, tv_show, asian_drama, visual_novel',
              },
              format: {
                type: Type.STRING,
                description: 'One of: TV, Movie, OVA, Manga, Light Novel, Webtoon, Special, TV Short, Drama, Visual Novel',
              },
              totalProgress: { type: Type.INTEGER, description: 'Total episodes or total chapters if completed/known (0 if ongoing or unknown)' },
              synopsis: { type: Type.STRING, description: 'Engaging, clean 2-4 sentence synopsis' },
              studio: { type: Type.STRING, description: 'Animation studio, author, or creator studio' },
              releaseYear: { type: Type.INTEGER, description: 'Four-digit release year, e.g. 2023' },
              season: { type: Type.STRING, description: 'Spring, Summer, Fall, or Winter' },
              genres: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-5 main genre classifications (e.g. Action, Fantasy, Sci-Fi, Slice of Life)',
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-6 theme tags (e.g. Magic, Time Travel, Overpowered MC, High Stakes)',
              },
              source: { type: Type.STRING, description: 'Original source material (e.g. Manga, Light Novel, Original, Game, Web Novel)' },
              durationPerEp: { type: Type.INTEGER, description: 'Average episode duration in minutes (e.g. 24 or 120 for movies)' },
              coverKeyword: { type: Type.STRING, description: '2-3 search terms for a representative visual poster' },
            },
            required: ['title', 'mediaType', 'format', 'synopsis', 'genres', 'tags'],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('No metadata returned from AI model.');
      }

      const metadata = JSON.parse(responseText);
      res.json({ success: true, metadata });
    } catch (error: any) {
      console.warn('Autofill API Warning (using fallback metadata):', error.message);
      const capitalized = query
        .split(' ')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

      const fallbackMetadata = {
        title: capitalized,
        japaneseTitle: `${capitalized} (日本)`,
        romajiTitle: capitalized,
        mediaType: mediaType || 'anime',
        format: 'TV',
        totalProgress: 12,
        synopsis: `Auto-generated profile for ${capitalized}. Discover storylines, character progression, and official community ratings.`,
        studio: 'Studio Animation',
        releaseYear: 2024,
        season: 'Winter 2024',
        genres: ['Action', 'Fantasy', 'Adventure'],
        tags: ['Auto-Detected', 'Popular'],
        source: 'Manga',
        durationPerEp: 24,
      };

      res.json({ success: true, metadata: fallbackMetadata, isFallback: true });
    }
  });

  // AI Recommendation Endpoint
  app.post('/api/media/recommend', async (req, res) => {
    const { collection } = req.body;
    try {
      if (!ai) {
        throw new Error('No AI client initialized');
      }

      const prompt = `Analyze this user's high-rated media list: ${JSON.stringify(collection || [])}. 
Recommend 5 distinct anime, manga, light novels, or media items they will love based on their favorite genres, themes, and ratings. Provide detailed match scores and tailored explanations.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert anime and media recommendation engine. Recommend acclaimed and relevant media items tailored to user tastes.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                mediaType: { type: Type.STRING },
                format: { type: Type.STRING },
                genres: { type: Type.ARRAY, items: { type: Type.STRING } },
                synopsis: { type: Type.STRING },
                coverKeyword: { type: Type.STRING },
                reason: { type: Type.STRING, description: 'Personalized explanation why the user will enjoy this' },
                matchScore: { type: Type.INTEGER, description: 'Match score percentage from 80 to 99' },
                totalProgress: { type: Type.INTEGER },
                releaseYear: { type: Type.INTEGER },
                studio: { type: Type.STRING },
              },
              required: ['title', 'mediaType', 'genres', 'synopsis', 'reason', 'matchScore'],
            },
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('No recommendation data returned.');
      }

      const recommendations = JSON.parse(responseText);
      res.json({ success: true, recommendations });
    } catch (error: any) {
      console.warn('Recommend API Warning (using fallback recommendations):', error.message);
      const fallbackRecs = [
        {
          title: 'Solo Leveling (Ore dake Level Up na Ken)',
          mediaType: 'anime',
          format: 'TV',
          genres: ['Action', 'Fantasy', 'Overpowered MC'],
          synopsis: 'Sung Jinwoo ascends from the weakest E-Rank hunter to an unstoppable Shadow Monarch in a world overrun by monster dungeons.',
          coverKeyword: 'solo leveling anime',
          reason: 'Matches your preference for high-octane action and solo leveling progression dynamics.',
          matchScore: 98,
          totalProgress: 12,
          releaseYear: 2024,
          studio: 'A-1 Pictures',
        },
        {
          title: 'Frieren: Beyond Journey\'s End',
          mediaType: 'anime',
          format: 'TV',
          genres: ['Adventure', 'Drama', 'Fantasy'],
          synopsis: 'An immortal elf mage reflects on human connections and time passing after her hero party disbands.',
          coverKeyword: 'frieren anime',
          reason: 'Matches your interest in deeply emotional worldbuilding and masterpiece storytelling.',
          matchScore: 96,
          totalProgress: 28,
          releaseYear: 2023,
          studio: 'Madhouse',
        },
        {
          title: 'Jujutsu Kaisen',
          mediaType: 'anime',
          format: 'TV',
          genres: ['Action', 'Supernatural'],
          synopsis: 'High school student Yuji Itadori joins a secret organization of sorcerers after ingesting a powerful cursed artifact.',
          coverKeyword: 'jujutsu kaisen',
          reason: 'Recommended based on top ratings in supernatural battle anime.',
          matchScore: 94,
          totalProgress: 47,
          releaseYear: 2023,
          studio: 'MAPPA',
        },
        {
          title: 'Chainsaw Man',
          mediaType: 'anime',
          format: 'TV',
          genres: ['Action', 'Horror', 'Supernatural'],
          synopsis: 'Denji merges with his chainsaw devil Pochita to hunt devil threats for the Public Safety Devil Hunters.',
          coverKeyword: 'chainsaw man',
          reason: 'Perfect match for dark supernatural themes and fast-paced combat.',
          matchScore: 92,
          totalProgress: 12,
          releaseYear: 2022,
          studio: 'MAPPA',
        },
        {
          title: 'Oshi no Ko',
          mediaType: 'anime',
          format: 'TV',
          genres: ['Drama', 'Mystery', 'Supernatural'],
          synopsis: 'A doctor reincarnates as the child of his favorite idol and navigates the dark underbelly of Japan’s entertainment industry.',
          coverKeyword: 'oshi no ko',
          reason: 'Recommended for exceptional suspense, drama, and character depth.',
          matchScore: 91,
          totalProgress: 11,
          releaseYear: 2023,
          studio: 'Doga Kobo',
        },
      ];

      res.json({ success: true, recommendations: fallbackRecs, isFallback: true });
    }
  });

  // Vite development or Express static production handling
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Anime & Media Tracker Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
