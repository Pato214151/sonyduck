// @ts-nocheck
// AI Service - Recommendation Engine
// Motor de recomendaciones híbridas (Content-Based + Collaborative)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Weights for recommendation scoring
const WEIGHTS = {
  GENRE_MATCH: 0.30,
  MOOD_MATCH: 0.15,
  ENERGY_MATCH: 0.15,
  DECADE_MATCH: 0.10,
  ARTIST_MATCH: 0.15,
  DANCEABILITY_MATCH: 0.10,
  POPULARITY: 0.05,
};

export interface SongWithScore {
  id: string;
  title: string;
  artist: { id: string; name: string };
  album: { id: string; title: string; coverUrl: string | null };
  score: number;
  reason: string;
}

export interface RecommendationOptions {
  limit?: number;
  excludeSongIds?: string[];
  mood?: string;
  genre?: string;
}

/**
 * Calcula similitud entre dos canciones basada en features
 */
function calculateSongSimilarity(song1: any, song2: any): number {
  let similarity = 0;

  // Genre similarity (Jaccard index)
  const song1Genres = new Set(song1.artist?.genres || []);
  const song2Genres = new Set(song2.artist?.genres || []);
  const genreIntersection = [...song1Genres].filter(g => song2Genres.has(g)).length;
  const genreUnion = new Set([...song1Genres, ...song2Genres]).size;
  const genreSim = genreUnion > 0 ? genreIntersection / genreUnion : 0;

  // Mood similarity (Jaccard index)
  const song1Moods = new Set(song1.moods || []);
  const song2Moods = new Set(song2.moods || []);
  const moodIntersection = [...song1Moods].filter(m => song2Moods.has(m)).length;
  const moodUnion = new Set([...song1Moods, ...song2Moods]).size;
  const moodSim = moodUnion > 0 ? moodIntersection / moodUnion : 0;

  // Energy similarity (inverted distance)
  const energySim = 1 - Math.abs((song1.energy || 0.5) - (song2.energy || 0.5));

  // Decade match
  const decadeSim = song1.decade === song2.decade ? 1 : 0;

  // Danceability similarity
  const danceSim = 1 - Math.abs((song1.danceability || 0.5) - (song2.danceability || 0.5));

  return (
    WEIGHTS.GENRE_MATCH * genreSim +
    WEIGHTS.MOOD_MATCH * moodSim +
    WEIGHTS.ENERGY_MATCH * energySim +
    WEIGHTS.DECADE_MATCH * decadeSim +
    WEIGHTS.DANCEABILITY_MATCH * danceSim
  );
}

/**
 * Obtiene recomendaciones personalizadas para un usuario
 */
export async function getRecommendationsForUser(
  userId: string,
  options: RecommendationOptions = {}
): Promise<SongWithScore[]> {
  const { limit = 20, excludeSongIds = [], mood, genre } = options;

  // Get user's liked songs and recent history
  const likedSongs = await prisma.likedSong.findMany({
    where: { userId },
    include: { song: { include: { artist: true } } },
    take: 50,
    orderBy: { addedAt: 'desc' },
  });

  const recentSessions = await prisma.listeningSession.findMany({
    where: { userId },
    include: { song: { include: { artist: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  // Build seed songs from user's history
  const seedSongs = [
    ...likedSongs.map(l => l.song),
    ...recentSessions.map(s => s.song),
  ];

  if (seedSongs.length === 0) {
    // If no history, return popular songs
    return getPopularSongs(limit, excludeSongIds, mood, genre);
  }

  // Get all songs (excluding already listened)
  const excludeIds = new Set([
    ...excludeSongIds,
    ...seedSongs.map(s => s.id),
  ]);

  const candidateSongs = await prisma.song.findMany({
    where: {
      id: { notIn: [...excludeIds] },
      ...(mood ? { moods: { has: mood } } : {}),
      ...(genre ? { artist: { genres: { has: genre } } } : {}),
    },
    include: {
      artist: true,
      album: true,
    },
    take: 500,
  });

  // Score each candidate based on similarity to seed songs
  const scoredSongs: SongWithScore[] = [];

  for (const candidate of candidateSongs) {
    // Calculate similarity to all seed songs
    let totalSimilarity = 0;
    let maxSimilarity = 0;
    let mainReason = '';

    for (const seed of seedSongs) {
      const sim = calculateSongSimilarity(candidate, seed);
      totalSimilarity += sim;
      if (sim > maxSimilarity) {
        maxSimilarity = sim;
        mainReason = getSimilarityReason(candidate, seed);
      }
    }

    const avgSimilarity = totalSimilarity / seedSongs.length;
    const popularityBoost = Math.min(candidate.playCount / 1000, 1) * WEIGHTS.POPULARITY;

    scoredSongs.push({
      id: candidate.id,
      title: candidate.title,
      artist: { id: candidate.artist.id, name: candidate.artist.name },
      album: { 
        id: candidate.album.id, 
        title: candidate.album.title, 
        coverUrl: candidate.album.coverUrl 
      },
      score: avgSimilarity + popularityBoost,
      reason: mainReason,
    });
  }

  // Sort by score and return top N
  return scoredSongs
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Obtiene canciones similares a una canción específica
 */
export async function getSimilarSongs(
  songId: string,
  limit: number = 10
): Promise<SongWithScore[]> {
  const seedSong = await prisma.song.findUnique({
    where: { id: songId },
    include: { artist: true },
  });

  if (!seedSong) {
    return [];
  }

  const similarSongs = await prisma.song.findMany({
    where: {
      id: { not: songId },
      artistId: { not: seedSong.artistId }, // Prefer different artists
    },
    include: { artist: true, album: true },
    take: limit * 2,
  });

  const scored = similarSongs.map(song => ({
    id: song.id,
    title: song.title,
    artist: { id: song.artist.id, name: song.artist.name },
    album: { id: song.album.id, title: song.album.title, coverUrl: song.album.coverUrl },
    score: calculateSongSimilarity(song, seedSong),
    reason: getSimilarityReason(song, seedSong),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Obtiene canciones basadas en género
 */
export async function getSongsByGenre(
  genre: string,
  limit: number = 20
): Promise<SongWithScore[]> {
  const songs = await prisma.song.findMany({
    where: {
      artist: {
        genres: { has: genre },
      },
    },
    include: { artist: true, album: true },
    orderBy: { playCount: 'desc' },
    take: limit,
  });

  return songs.map(song => ({
    id: song.id,
    title: song.title,
    artist: { id: song.artist.id, name: song.artist.name },
    album: { id: song.album.id, title: song.album.title, coverUrl: song.album.coverUrl },
    score: 1,
    reason: `Because you like ${genre}`,
  }));
}

/**
 * Obtiene canciones basadas en estado de ánimo
 */
export async function getSongsByMood(
  mood: string,
  limit: number = 20
): Promise<SongWithScore[]> {
  const songs = await prisma.song.findMany({
    where: {
      moods: { has: mood },
    },
    include: { artist: true, album: true },
    take: limit * 2,
  });

  // Sort by energy (for chill vs energetic within same mood)
  const sortedSongs = songs.sort((a, b) => {
    if (mood === 'chill' || mood === 'peaceful') {
      return (a.energy || 0.5) - (b.energy || 0.5);
    }
    if (mood === 'energetic' || mood === 'happy') {
      return (b.energy || 0.5) - (a.energy || 0.5);
    }
    return 0;
  });

  return sortedSongs.slice(0, limit).map(song => ({
    id: song.id,
    title: song.title,
    artist: { id: song.artist.id, name: song.artist.name },
    album: { id: song.album.id, title: song.album.title, coverUrl: song.album.coverUrl },
    score: 1,
    reason: getMoodReason(song, mood),
  }));
}

/**
 * Obtiene canciones populares (fallback)
 */
async function getPopularSongs(
  limit: number,
  excludeIds: string[] = [],
  mood?: string,
  genre?: string
): Promise<SongWithScore[]> {
  const songs = await prisma.song.findMany({
    where: {
      id: { notIn: excludeIds },
      ...(mood ? { moods: { has: mood } } : {}),
      ...(genre ? { artist: { genres: { has: genre } } } : {}),
    },
    include: { artist: true, album: true },
    orderBy: { playCount: 'desc' },
    take: limit,
  });

  return songs.map(song => ({
    id: song.id,
    title: song.title,
    artist: { id: song.artist.id, name: song.artist.name },
    album: { id: song.album.id, title: song.album.title, coverUrl: song.album.coverUrl },
    score: 1,
    reason: 'Popular choice',
  }));
}

// Helper functions

function getSimilarityReason(song1: any, song2: any): string {
  const genres = song1.artist?.genres || [];
  const moods = song1.moods || [];

  const matchingGenre = genres.find((g: string) => (song2.artist?.genres || []).includes(g));
  if (matchingGenre) {
    return `Similar to ${matchingGenre} artists you like`;
  }
  
  const matchingMood = moods.find((m: string) => (song2.moods || []).includes(m));
  if (matchingMood) {
    return `More ${matchingMood} music`;
  }
  
  if (song1.decade === song2.decade) {
    return `Classic ${song1.decade} sound`;
  }
  return 'Recommended for you';
}

function getMoodReason(song: any, mood: string): string {
  const reasons: Record<string, string[]> = {
    happy: ['Perfect for your good mood!', 'Upbeat tunes to match your energy'],
    energetic: ['Get ready to move!', 'High energy tracks for you'],
    chill: ['Relax and unwind', 'Mellow vibes for you'],
    sad: ['Sometimes we need these songs', 'We understand'],
    romantic: ['Love is in the air', 'Perfect for this moment'],
    epic: ['Time for something epic', 'Grand and powerful'],
    peaceful: ['Find your serenity', 'Calm and soothing'],
    nostalgic: ['Take a trip down memory lane', 'Classic vibes'],
  };

  const options = reasons[mood] || ['Great choice for you'];
  return options[Math.floor(Math.random() * options.length)];
}
