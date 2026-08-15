// AI Routes - API endpoints para funcionalidades de IA

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { catchAsync } from '../middleware/errorHandler.js';
import {
  analyzeUserTaste,
  getUserListeningStats,
  updateUserProfile,
  recordListeningAction,
} from '../services/ai/userProfileAnalyzer.js';
import {
  getRecommendationsForUser,
  getSimilarSongs,
  getSongsByMood,
  getSongsByGenre,
} from '../services/ai/recommendationEngine.js';
import {
  detectUserMood,
  suggestMoodPlaylists,
  getMoodInfo,
} from '../services/ai/moodDetector.js';
import {
  generateMadeForYouPlaylist,
  generateMoodPlaylist,
  generateDiscoverPlaylist,
  generateTimeCapsulePlaylist,
  generateGenreDeepDive,
  generateAllSmartPlaylists,
} from '../services/ai/smartPlaylistGenerator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ==================== USER PROFILE ====================

// Get user's taste profile
router.get('/profile', catchAsync(async (req: AuthRequest, res) => {
  const profile = await analyzeUserTaste(req.userId!);
  const stats = await getUserListeningStats(req.userId!);
  
  res.json({
    success: true,
    data: {
      profile,
      stats,
    },
  });
}));

// Get listening insights
router.get('/insights', catchAsync(async (req: AuthRequest, res) => {
  const stats = await getUserListeningStats(req.userId!);
  const profile = await analyzeUserTaste(req.userId!);
  
  // Calculate streak (simplified)
  const sessions = await prisma.listeningSession.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
    take: 30,
    distinct: ['createdAt'],
  });

  const listeningStreak = sessions.length;
  
  // Get most active time
  const hours = sessions.map(s => new Date(s.createdAt).getHours());
  const mostActiveHour = hours.length > 0
    ? Math.round(hours.reduce((a, b) => a + b, 0) / hours.length)
    : 12;
  
  const timeOfDay = mostActiveHour < 12 ? 'morning' 
    : mostActiveHour < 18 ? 'afternoon' 
    : mostActiveHour < 22 ? 'evening' : 'night';

  res.json({
    success: true,
    data: {
      ...stats,
      listeningStreak: `${listeningStreak} sessions`,
      mostActiveTime: timeOfDay,
      topGenre: profile.topGenres[0]?.genre || 'Unknown',
      moodPreference: profile.moodPreference,
    },
  });
}));

// Refresh user profile
router.post('/profile/refresh', catchAsync(async (req: AuthRequest, res) => {
  const profile = await updateUserProfile(req.userId!);
  
  res.json({
    success: true,
    data: { profile },
  });
}));

// ==================== RECOMMENDATIONS ====================

// Get personalized recommendations
router.get('/recommendations', catchAsync(async (req: AuthRequest, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const excludeIds = req.query.exclude ? (req.query.exclude as string).split(',') : [];
  const mood = req.query.mood as string;
  const genre = req.query.genre as string;

  const recommendations = await getRecommendationsForUser(req.userId!, {
    limit,
    excludeSongIds: excludeIds,
    mood,
    genre,
  });

  res.json({
    success: true,
    data: {
      recommendations,
      count: recommendations.length,
    },
  });
}));

// POST recommendations with body (for mood-based recommendations)
router.post('/recommend', catchAsync(async (req: AuthRequest, res) => {
  const { mood, genre, limit = 20 } = req.body;

  let songs;
  if (mood) {
    songs = await getSongsByMood(mood, limit);
  } else if (genre) {
    songs = await getSongsByGenre(genre, limit);
  } else {
    songs = await getRecommendationsForUser(req.userId!, { limit });
  }

  const recommendations = songs.map((song: any) => ({
    type: 'track',
    reason: mood ? `Perfect for ${mood} mood` : genre ? `${genre} music` : 'Recommended for you',
    data: song,
    confidence: 0.8 + Math.random() * 0.2,
  }));

  res.json({
    success: true,
    data: {
      recommendations,
      count: recommendations.length,
    },
  });
}));

// Get "Made for You" playlist
router.get('/recommendations/made-for-you', catchAsync(async (req: AuthRequest, res) => {
  const playlist = await generateMadeForYouPlaylist(req.userId!, 30);
  
  res.json({
    success: true,
    data: playlist,
  });
}));

// Get AI Mixes (personalized mini-playlists based on taste)
router.get('/mixes', catchAsync(async (req: AuthRequest, res) => {
  // Generate 6 personalized mixes based on different aspects of taste
  const [madeForYou, discoverMix, genreMix] = await Promise.all([
    generateMadeForYouPlaylist(req.userId!, 25),
    generateDiscoverPlaylist(req.userId!, 20),
    generateGenreDeepDive(req.userId!, 'indie', 20),
  ]);

  // Generate additional mixes
  const profile = await analyzeUserTaste(req.userId!);
  const topGenre = profile.topGenres[0]?.genre || 'pop';
  const genreDeepDive = await generateGenreDeepDive(req.userId!, topGenre, 20);
  
  const moods = ['happy', 'chill', 'energetic'];
  const moodPlaylists = await Promise.all(
    moods.map(mood => generateMoodPlaylist(req.userId!, mood, 20))
  );

  const mixes = [
    {
      id: 'made-for-you',
      name: 'Made For You',
      description: 'Your personal picks',
      ...madeForYou,
    },
    {
      id: 'discover-weekly',
      name: 'Discover Weekly',
      description: 'Fresh finds just for you',
      ...discoverMix,
    },
    {
      id: 'genre-deep-dive',
      name: `${topGenre.charAt(0).toUpperCase() + topGenre.slice(1)} Mix`,
      description: `All your favorite ${topGenre}`,
      ...genreDeepDive,
    },
    ...moodPlaylists.map((playlist, i) => ({
      id: `mood-${moods[i]}`,
      name: `${moods[i].charAt(0).toUpperCase() + moods[i].slice(1)} Mix`,
      description: `Perfect ${moods[i]} vibes`,
      ...playlist,
    })),
  ];

  res.json({
    success: true,
    data: { mixes },
  });
}));

// Get songs similar to a specific song
router.get('/recommendations/similar/:songId', catchAsync(async (req: AuthRequest, res) => {
  const { songId } = req.params;
  const limit = parseInt(req.query.limit as string) || 10;

  const similar = await getSimilarSongs(songId, limit);

  res.json({
    success: true,
    data: {
      songs: similar,
      count: similar.length,
    },
  });
}));

// Get songs by mood
router.get('/mood/:mood/songs', catchAsync(async (req: AuthRequest, res) => {
  const { mood } = req.params;
  const limit = parseInt(req.query.limit as string) || 20;

  const songs = await getSongsByMood(mood, limit);

  res.json({
    success: true,
    data: {
      mood,
      songs,
      count: songs.length,
    },
  });
}));

// Get songs by genre
router.get('/genre/:genre/songs', catchAsync(async (req: AuthRequest, res) => {
  const { genre } = req.params;
  const limit = parseInt(req.query.limit as string) || 20;

  const songs = await getSongsByGenre(genre, limit);

  res.json({
    success: true,
    data: {
      genre,
      songs,
      count: songs.length,
    },
  });
}));

// ==================== MOOD DETECTION ====================

// Detect current user mood
router.get('/mood/detect', catchAsync(async (req: AuthRequest, res) => {
  const moodProfile = await detectUserMood(req.userId!);
  const moodInfo = getMoodInfo(moodProfile.primary);
  const suggestions = await suggestMoodPlaylists(moodProfile.primary, req.userId!);

  res.json({
    success: true,
    data: {
      ...moodProfile,
      info: moodInfo,
      suggestedPlaylists: suggestions,
    },
  });
}));

// Get all mood categories
router.get('/moods', catchAsync(async (req: AuthRequest, res) => {
  const moods = ['happy', 'energetic', 'chill', 'sad', 'romantic', 'epic', 'peaceful', 'nostalgic'];
  
  const moodData = moods.map(mood => ({
    id: mood,
    ...getMoodInfo(mood as any),
  }));

  res.json({
    success: true,
    data: moodData,
  });
}));

// ==================== SMART PLAYLISTS ====================

// Get all smart playlists
router.get('/playlists', catchAsync(async (req: AuthRequest, res) => {
  const playlists = await generateAllSmartPlaylists(req.userId!);

  res.json({
    success: true,
    data: playlists,
  });
}));

// Get mood playlist
router.get('/playlists/mood/:mood', catchAsync(async (req: AuthRequest, res) => {
  const { mood } = req.params;
  const playlist = await generateMoodPlaylist(req.userId!, mood, 25);

  res.json({
    success: true,
    data: playlist,
  });
}));

// Get discover playlist
router.get('/playlists/discover', catchAsync(async (req: AuthRequest, res) => {
  const playlist = await generateDiscoverPlaylist(req.userId!, 20);

  res.json({
    success: true,
    data: playlist,
  });
}));

// Get time capsule playlist
router.get('/playlists/time-capsule', catchAsync(async (req: AuthRequest, res) => {
  const decade = req.query.decade as string;
  const playlist = await generateTimeCapsulePlaylist(req.userId!, decade, 25);

  res.json({
    success: true,
    data: playlist,
  });
}));

// Get genre deep dive
router.get('/playlists/genre/:genre', catchAsync(async (req: AuthRequest, res) => {
  const { genre } = req.params;
  const playlist = await generateGenreDeepDive(req.userId!, genre, 30);

  res.json({
    success: true,
    data: playlist,
  });
}));

// ==================== LISTENING ACTIONS ====================

// Record a listening action
router.post('/actions', catchAsync(async (req: AuthRequest, res) => {
  const { songId, action, durationListened, skipReason } = req.body;

  if (!songId || !action) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION', message: 'songId and action are required' },
    });
  }

  const session = await recordListeningAction(
    req.userId!,
    songId,
    action,
    durationListened || 0,
    skipReason
  );

  res.json({
    success: true,
    data: { session },
  });
}));

export { router as aiRouter };
