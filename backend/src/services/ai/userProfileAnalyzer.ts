// @ts-nocheck
// AI Service - User Profile Analyzer
// Analiza el historial del usuario para determinar sus gustos musicales

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Action weights for scoring
const ACTION_WEIGHTS = {
  play: 1,
  complete: 2,
  like: 3,
  addToPlaylist: 2,
  skip: -2, // Negative weight for skipping
};

const GENRE_WEIGHT = 0.3;
const MOOD_WEIGHT = 0.25;
const ENERGY_WEIGHT = 0.2;
const DECADE_WEIGHT = 0.15;
const ARTIST_WEIGHT = 0.1;

export interface UserTasteProfile {
  topGenres: { genre: string; score: number }[];
  topArtists: { artistId: string; name: string; score: number }[];
  moodPreference: string;
  preferredDecade: string;
  energyPreference: number;
  topMoods: string[];
  totalDataPoints: number;
}

export interface ListeningStats {
  totalSongsPlayed: number;
  totalMinutesListened: number;
  uniqueArtists: number;
  favoriteDecade: string;
  topMoods: string[];
}

/**
 * Analiza el historial de escucha del usuario y calcula su perfil de gustos
 */
export async function analyzeUserTaste(userId: string): Promise<UserTasteProfile> {
  // Get user's listening history
  const history = await prisma.listeningSession.findMany({
    where: { userId },
    include: {
      song: {
        include: {
          artist: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 1000, // Last 1000 actions
  });

  // Also include liked songs
  const likedSongs = await prisma.likedSong.findMany({
    where: { userId },
    include: {
      song: {
        include: {
          artist: true,
        },
      },
    },
  });

  // Calculate genre scores
  const genreScores: Record<string, number> = {};
  const artistScores: Record<string, { name: string; score: number }> = {};
  const moodScores: Record<string, number> = {};
  const decadeScores: Record<string, number> = {};
  let totalEnergy = 0;
  let energyCount = 0;
  let totalDataPoints = 0;

  // Process listening history
  for (const session of history) {
    const song = session.song;
    const weight = ACTION_WEIGHTS[session.action as keyof typeof ACTION_WEIGHTS] || 1;
    totalDataPoints += Math.abs(weight);

    // Skip if skipped quickly (less than 30 seconds)
    if (session.action === 'skip' && session.durationListened < 30) {
      continue;
    }

    // Artist genres
    for (const genre of song.artist.genres || []) {
      genreScores[genre] = (genreScores[genre] || 0) + weight;
    }

    // Artist score
    const artistKey = song.artistId;
    if (!artistScores[artistKey]) {
      artistScores[artistKey] = { name: song.artist.name, score: 0 };
    }
    artistScores[artistKey].score += weight * ARTIST_WEIGHT * 10;

    // Mood scores
    for (const mood of song.moods || []) {
      moodScores[mood] = (moodScores[mood] || 0) + weight;
    }

    // Decade scores
    decadeScores[song.decade] = (decadeScores[song.decade] || 0) + weight;

    // Energy
    totalEnergy += song.energy * weight;
    energyCount += weight;
  }

  // Add bonus from liked songs
  for (const liked of likedSongs) {
    const song = liked.song;
    totalDataPoints += ACTION_WEIGHTS.like;

    for (const genre of song.artist.genres || []) {
      genreScores[genre] = (genreScores[genre] || 0) + ACTION_WEIGHTS.like;
    }

    const artistKey = song.artistId;
    if (!artistScores[artistKey]) {
      artistScores[artistKey] = { name: song.artist.name, score: 0 };
    }
    artistScores[artistKey].score += ACTION_WEIGHTS.like;

    for (const mood of song.moods || []) {
      moodScores[mood] = (moodScores[mood] || 0) + ACTION_WEIGHTS.like;
    }

    decadeScores[song.decade] = (decadeScores[song.decade] || 0) + ACTION_WEIGHTS.like;
    totalEnergy += song.energy * ACTION_WEIGHTS.like;
    energyCount += ACTION_WEIGHTS.like;
  }

  // Normalize and sort
  const maxGenreScore = Math.max(...Object.values(genreScores), 1);
  const topGenres = Object.entries(genreScores)
    .map(([genre, score]) => ({ genre, score: score / maxGenreScore }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const maxArtistScore = Math.max(...Object.values(artistScores).map(a => a.score), 1);
  const topArtists = Object.entries(artistScores)
    .map(([artistId, data]) => ({ artistId, name: data.name, score: data.score / maxArtistScore }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const topMood = Object.entries(moodScores)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

  const preferredDecade = Object.entries(decadeScores)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '2020s';

  const energyPreference = energyCount > 0 ? totalEnergy / energyCount : 0.5;

  const topMoods = Object.entries(moodScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([mood]) => mood);

  return {
    topGenres,
    topArtists,
    moodPreference: topMood,
    preferredDecade,
    energyPreference,
    topMoods,
    totalDataPoints,
  };
}

/**
 * Obtiene estadísticas de escucha del usuario
 */
export async function getUserListeningStats(userId: string): Promise<ListeningStats> {
  const sessions = await prisma.listeningSession.findMany({
    where: { userId },
    include: { song: true },
  });

  const totalSongsPlayed = sessions.filter(s => s.action === 'play' || s.action === 'complete').length;
  const totalSecondsListened = sessions.reduce((acc, s) => acc + s.durationListened, 0);
  const totalMinutesListened = Math.round(totalSecondsListened / 60);

  // Count unique artists
  const uniqueArtists = new Set(sessions.map(s => s.song.artistId)).size;

  // Decade counts
  const decadeCounts: Record<string, number> = {};
  for (const session of sessions) {
    decadeCounts[session.song.decade] = (decadeCounts[session.song.decade] || 0) + 1;
  }
  const favoriteDecade = Object.entries(decadeCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '2020s';

  // Mood counts
  const moodCounts: Record<string, number> = {};
  for (const session of sessions) {
    for (const mood of session.song.moods) {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    }
  }
  const topMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([mood]) => mood);

  return {
    totalSongsPlayed,
    totalMinutesListened,
    uniqueArtists,
    favoriteDecade,
    topMoods,
  };
}

/**
 * Registra una acción de escucha
 */
export async function recordListeningAction(
  userId: string,
  songId: string,
  action: 'play' | 'complete' | 'skip' | 'like',
  durationListened: number = 0,
  skipReason?: string
) {
  const session = await prisma.listeningSession.create({
    data: {
      userId,
      songId,
      action,
      durationListened,
      skipReason,
    },
  });

  // Update song play count if played
  if (action === 'play' || action === 'complete') {
    await prisma.song.update({
      where: { id: songId },
      data: { playCount: { increment: 1 } },
    });
  }

  // Update user profile periodically (every 10 actions)
  const actionCount = await prisma.listeningSession.count({
    where: { userId },
  });

  if (actionCount % 10 === 0) {
    await updateUserProfile(userId);
  }

  return session;
}

/**
 * Actualiza el perfil del usuario en la base de datos
 */
export async function updateUserProfile(userId: string) {
  const profile = await analyzeUserTaste(userId);
  const stats = await getUserListeningStats(userId);

  await prisma.user.update({
    where: { id: userId },
    data: {
      topGenres: JSON.stringify(profile.topGenres.map(g => g.genre)),
      moodPreference: profile.moodPreference,
      preferredDecade: profile.preferredDecade,
      energyPreference: profile.energyPreference,
      totalSongsPlayed: stats.totalSongsPlayed,
      totalMinutesListened: stats.totalMinutesListened,
    },
  });

  return profile;
}
