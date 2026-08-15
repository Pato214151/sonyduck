import { Router } from 'express';
import { paginationSchema } from '../utils/validation.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { optionalAuth, authenticate, AuthRequest } from '../middleware/auth.js';
import { songService } from '../services/song.service.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Get user's recently played songs (from listening sessions)
router.get('/history', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
  
  // Get recent listening sessions with song details
  const sessions = await prisma.listeningSession.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
    take: limit,
    distinct: ['songId'],
    include: {
      song: {
        include: {
          album: { select: { id: true, title: true, coverUrl: true } },
          artist: { select: { id: true, name: true } },
        },
      },
    },
  });

  const tracks = sessions
    .filter(s => s.song)
    .map(s => ({
      id: s.song.id,
      title: s.song.title,
      duration: s.song.duration,
      trackNumber: s.song.trackNumber,
      audioUrl: s.song.audioUrl,
      album: s.song.album,
      artist: s.song.artist,
    }));

  res.json({
    success: true,
    data: {
      tracks,
      count: tracks.length,
    },
  });
}));

// List all songs
router.get('/', optionalAuth, catchAsync(async (req: AuthRequest, res) => {
  const { limit = 20, offset = 0 } = paginationSchema.parse(req.query);
  
  const result = await songService.getSongs({
    limit,
    offset,
    userId: req.userId,
  });
  
  res.json({
    success: true,
    data: {
      songs: result.songs,
      pagination: { total: result.total, limit, offset },
    },
  });
}));

// Get single song
router.get('/:id', optionalAuth, catchAsync(async (req: AuthRequest, res) => {
  const { id } = req.params;
  
  const song = await songService.getSongById(id, req.userId);
  
  res.json({
    success: true,
    data: song,
  });
}));

// Search songs
router.get('/search', optionalAuth, catchAsync(async (req: AuthRequest, res) => {
  const { q, limit = 20 } = req.query;
  
  if (!q || typeof q !== 'string') {
    throw new AppError('Search query is required', 400, 'VALIDATION_ERROR');
  }
  
  const result = await songService.getSongs({
    search: q,
    limit: Number(limit),
    userId: req.userId,
  });
  
  res.json({
    success: true,
    data: {
      songs: result.songs,
    },
  });
}));

export { router as songsRouter };
