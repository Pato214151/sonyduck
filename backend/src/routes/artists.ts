/**
 * Rutas /api/artists: listar, perfil, top canciones, discografía, búsqueda
 * y seguir / dejar de seguir artistas.
 */

import { Router } from 'express';
import { paginationSchema } from '../utils/validation.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { optionalAuth, authenticate, AuthRequest } from '../middleware/auth.js';
import { artistService } from '../services/artist.service.js';
import { songService } from '../services/song.service.js';

const router = Router();

// List all artists
router.get('/', catchAsync(async (req, res) => {
  const { limit = 20, offset = 0 } = paginationSchema.parse(req.query);
  
  const result = await artistService.getArtists({ limit, offset });
  
  res.json({
    success: true,
    data: {
      artists: result.artists,
      pagination: { total: result.total, limit, offset },
    },
  });
}));

// Get single artist with full profile
router.get('/:id', optionalAuth, catchAsync(async (req: AuthRequest, res) => {
  const { id } = req.params;
  
  const artist = await artistService.getArtistById(id, req.userId);
  const isFollowing = req.userId ? await artistService.isFollowing(id, req.userId) : false;
  
  res.json({
    success: true,
    data: {
      ...artist,
      isFollowing,
    },
  });
}));

// Get artist's top songs
router.get('/:id/top-songs', optionalAuth, catchAsync(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { limit = 5 } = req.query;
  
  const songs = await songService.getSongs({
    artistId: id,
    limit: Number(limit),
    userId: req.userId,
  });
  
  res.json({
    success: true,
    data: songs.songs,
  });
}));

// Get artist's albums (discography)
router.get('/:id/albums', catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const result = await artistService.getArtistById(id);
  
  res.json({
    success: true,
    data: result.albums,
  });
}));

// Search artists
router.get('/search', catchAsync(async (req, res) => {
  const { q, limit = 20 } = req.query;
  
  if (!q || typeof q !== 'string') {
    throw new AppError('Search query is required', 400, 'VALIDATION_ERROR');
  }
  
  const result = await artistService.getArtists({ search: q, limit: Number(limit) });
  
  res.json({
    success: true,
    data: { artists: result.artists },
  });
}));

// Follow an artist
router.post('/:id/follow', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const { id } = req.params;
  
  try {
    await artistService.followArtist(id, req.userId!);
    
    res.json({
      success: true,
      message: 'Artist followed successfully',
    });
  } catch (error: any) {
    // Handle duplicate follow
    if (error.code === 'P2002') {
      throw new AppError('Already following this artist', 409, 'CONFLICT');
    }
    throw error;
  }
}));

// Unfollow an artist
router.delete('/:id/follow', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const { id } = req.params;
  
  await artistService.unfollowArtist(id, req.userId!);
  
  res.json({
    success: true,
    message: 'Artist unfollowed successfully',
  });
}));

// Get followed artists
router.get('/following', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const artists = await artistService.getFollowedArtists(req.userId!);
  
  res.json({
    success: true,
    data: { artists },
  });
}));

export { router as artistsRouter };
