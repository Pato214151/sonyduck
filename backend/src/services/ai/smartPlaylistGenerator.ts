// @ts-nocheck
// AI Service - Smart Playlist Generator
// Genera playlists inteligentes basadas en perfil de usuario y algoritmos

import { PrismaClient } from '@prisma/client';
import { analyzeUserTaste } from './userProfileAnalyzer.js';
import { getSongsByMood, getSongsByGenre, getRecommendationsForUser } from './recommendationEngine.js';

const prisma = new PrismaClient();

export type SmartPlaylistType = 
  | 'made-for-you'
  | 'mood-mix'
  | 'discover'
  | 'time-capsule'
  | 'genre-deep-dive';

export interface SmartPlaylistResult {
  id: string;
  name: string;
  description: string;
  type: SmartPlaylistType;
  reason: string;
  songs: any[];
  coverGradient: string;
}

/**
 * Genera una playlist "Made for You"
 */
export async function generateMadeForYouPlaylist(
  userId: string,
  limit: number = 30
): Promise<SmartPlaylistResult> {
  const profile = await analyzeUserTaste(userId);
  const songs = await getRecommendationsForUser(userId, { limit });

  const topGenre = profile.topGenres[0]?.genre || 'rock';
  const topArtist = profile.topArtists[0]?.name || 'unknown';

  const names = [
    `Discover ${topGenre.charAt(0).toUpperCase() + topGenre.slice(1)}`,
    `Your ${topGenre.charAt(0).toUpperCase() + topGenre.slice(1)} Mix`,
    `Because you love ${topArtist}`,
    `${topGenre.charAt(0).toUpperCase() + topGenre.slice(1)} favorites`,
  ];

  return {
    id: 'made-for-you',
    name: names[Math.floor(Math.random() * names.length)],
    description: generateReasonText(profile),
    type: 'made-for-you',
    reason: `Based on your ${profile.topGenres.slice(0, 2).map(g => g.genre).join(' and ')} taste`,
    songs: songs.map(s => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      album: s.album,
      reason: s.reason,
    })),
    coverGradient: getGenreGradient(topGenre),
  };
}

/**
 * Genera una playlist de estado de ánimo
 */
export async function generateMoodPlaylist(
  userId: string,
  mood: string,
  limit: number = 25
): Promise<SmartPlaylistResult> {
  const songs = await getSongsByMood(mood, limit);
  const profile = await analyzeUserTaste(userId);

  const moodDescriptions: Record<string, { name: string; description: string }> = {
    happy: {
      name: 'Good Vibes',
      description: 'Songs to match your happy mood',
    },
    energetic: {
      name: 'Energy Boost',
      description: 'High-powered tracks to keep you going',
    },
    chill: {
      name: 'Chill Mode',
      description: 'Relaxing beats for your chill mood',
    },
    sad: {
      name: 'It\'s Okay',
      description: 'Sometimes we need these songs',
    },
    romantic: {
      name: 'Love Playlist',
      description: 'For moments of love and connection',
    },
    epic: {
      name: 'Epic Journey',
      description: 'Grand and powerful soundscapes',
    },
    peaceful: {
      name: 'Inner Peace',
      description: 'Find your calm',
    },
    nostalgic: {
      name: 'Memory Lane',
      description: `Classics from the ${profile.preferredDecade || '80s'}`,
    },
  };

  const info = moodDescriptions[mood] || moodDescriptions.chill;

  return {
    id: `mood-${mood}`,
    name: info.name,
    description: info.description,
    type: 'mood-mix',
    reason: `Perfect for your ${mood} mood`,
    songs: songs.map(s => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      album: s.album,
      reason: s.reason,
    })),
    coverGradient: getMoodGradient(mood),
  };
}

/**
 * Genera playlist para descubrir nuevos artistas
 */
export async function generateDiscoverPlaylist(
  userId: string,
  limit: number = 20
): Promise<SmartPlaylistResult> {
  const profile = await analyzeUserTaste(userId);
  const topArtist = profile.topArtists[0];

  // Get songs from artists similar to user's top artists (but not the same)
  const excludeArtistIds = profile.topArtists.slice(0, 3).map(a => a.artistId);

  const similarSongs = await prisma.song.findMany({
    where: {
      artistId: { notIn: excludeArtistIds },
      artist: {
        genres: { hasSome: profile.topGenres.slice(0, 3).map(g => g.genre) },
      },
    },
    include: { artist: true, album: true },
    orderBy: { playCount: 'desc' },
    take: limit,
  });

  const songsWithScore = similarSongs.map(song => ({
    id: song.id,
    title: song.title,
    artist: { id: song.artist.id, name: song.artist.name },
    album: { id: song.album.id, title: song.album.title, coverUrl: song.album.coverUrl },
    reason: `Similar to ${topArtist?.name || 'artists you like'}`,
  }));

  return {
    id: 'discover',
    name: `New for ${topArtist?.name || 'you'}`,
    description: `Artists like ${topArtist?.name || 'your favorites'}`,
    type: 'discover',
    reason: `Expand your ${profile.topGenres[0]?.genre || 'music'} horizons`,
    songs: songsWithScore,
    coverGradient: 'from-purple-600 to-blue-600',
  };
}

/**
 * Genera playlist de una época específica
 */
export async function generateTimeCapsulePlaylist(
  userId: string,
  decade?: string,
  limit: number = 25
): Promise<SmartPlaylistResult> {
  const profile = await analyzeUserTaste(userId);
  const targetDecade = decade || profile.preferredDecade || '80s';

  const songs = await prisma.song.findMany({
    where: {
      decade: targetDecade,
      artist: {
        genres: { hasSome: profile.topGenres.slice(0, 2).map(g => g.genre) },
      },
    },
    include: { artist: true, album: true },
    orderBy: { playCount: 'desc' },
    take: limit,
  });

  return {
    id: `time-capsule-${targetDecade}`,
    name: `${targetDecade} Essentials`,
    description: `The best music from the ${targetDecade}`,
    type: 'time-capsule',
    reason: `Your favorite era: ${targetDecade}`,
    songs: songs.map(song => ({
      id: song.id,
      title: song.title,
      artist: { id: song.artist.id, name: song.artist.name },
      album: { id: song.album.id, title: song.album.title, coverUrl: song.album.coverUrl },
      reason: `Classic ${targetDecade}`,
    })),
    coverGradient: getDecadeGradient(targetDecade),
  };
}

/**
 * Genera deep dive en un género específico
 */
export async function generateGenreDeepDive(
  userId: string,
  genre: string,
  limit: number = 30
): Promise<SmartPlaylistResult> {
  const songs = await getSongsByGenre(genre, limit);
  const profile = await analyzeUserTaste(userId);

  return {
    id: `deep-dive-${genre}`,
    name: `${genre.charAt(0).toUpperCase() + genre.slice(1)} Deep Dive`,
    description: `Explore more ${genre}`,
    type: 'genre-deep-dive',
    reason: `Because you love ${genre}`,
    songs: songs.map(s => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      album: s.album,
      reason: s.reason,
    })),
    coverGradient: getGenreGradient(genre),
  };
}

// Helper functions

function generateReasonText(profile: any): string {
  const parts: string[] = [];

  if (profile.topGenres.length > 0) {
    parts.push(`lots of ${profile.topGenres[0].genre}`);
  }

  if (profile.topArtists.length > 0) {
    parts.push(`you love ${profile.topArtists[0].name}`);
  }

  if (parts.length === 0) {
    return 'Based on your listening habits';
  }

  return `Because you've been listening to ${parts.slice(0, 2).join(' and ')}`;
}

function getGenreGradient(genre: string): string {
  const gradients: Record<string, string> = {
    rock: 'from-red-600 to-orange-600',
    pop: 'from-pink-500 to-purple-500',
    electronic: 'from-cyan-500 to-blue-600',
    hiphop: 'from-amber-500 to-red-600',
    jazz: 'from-yellow-600 to-orange-600',
    classical: 'from-stone-500 to-stone-700',
    metal: 'from-gray-700 to-gray-900',
    indie: 'from-emerald-500 to-teal-600',
    rnb: 'from-violet-600 to-fuchsia-600',
    country: 'from-amber-600 to-yellow-600',
  };

  return gradients[genre.toLowerCase()] || 'from-gray-600 to-gray-700';
}

function getMoodGradient(mood: string): string {
  const gradients: Record<string, string> = {
    happy: 'from-yellow-400 to-orange-400',
    energetic: 'from-red-500 to-pink-500',
    chill: 'from-teal-400 to-cyan-400',
    sad: 'from-blue-600 to-indigo-700',
    romantic: 'from-pink-400 to-rose-500',
    epic: 'from-purple-600 to-indigo-600',
    peaceful: 'from-green-400 to-emerald-500',
    nostalgic: 'from-amber-500 to-yellow-500',
  };

  return gradients[mood] || 'from-gray-500 to-gray-600';
}

function getDecadeGradient(decade: string): string {
  const gradients: Record<string, string> = {
    '70s': 'from-amber-600 to-orange-700',
    '80s': 'from-pink-500 to-purple-600',
    '90s': 'from-violet-500 to-fuchsia-600',
    '00s': 'from-cyan-500 to-blue-600',
    '10s': 'from-teal-500 to-emerald-600',
    '20s': 'from-indigo-500 to-violet-600',
  };

  return gradients[decade] || 'from-gray-500 to-gray-600';
}

/**
 * Genera todas las playlists inteligentes para un usuario
 */
export async function generateAllSmartPlaylists(userId: string) {
  const profile = await analyzeUserTaste(userId);

  const playlists = await Promise.all([
    generateMadeForYouPlaylist(userId, 30),
    generateMoodPlaylist(userId, profile.moodPreference, 25),
    generateDiscoverPlaylist(userId, 20),
    generateTimeCapsulePlaylist(userId, undefined, 25),
  ]);

  return playlists;
}
