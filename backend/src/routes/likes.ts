/**
 * Rutas /api/likes: canciones que le gustan al usuario (listar, dar/quitar
 * like, alternar y consultar). Todas requieren sesión.
 */

import { Router } from 'express';
import { catchAsync } from '../middleware/errorHandler.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { likeService } from '../services/like.service.js';

const router = Router();

// Get user's liked songs
router.get('/songs', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const result = await likeService.getLikedSongs(req.userId!);

  res.json({
    success: true,
    data: { songs: result.songs },
  });
}));

// Like a song
router.post('/songs/:songId', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const { songId } = req.params;

  await likeService.likeSong(songId, req.userId!);

  res.status(201).json({
    success: true,
    message: 'Song added to Liked Songs',
  });
}));

// Unlike a song
router.delete('/songs/:songId', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const { songId } = req.params;

  await likeService.unlikeSong(songId, req.userId!);

  res.json({
    success: true,
    message: 'Song removed from Liked Songs',
  });
}));

// Toggle like
router.post('/songs/:songId/toggle', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const { songId } = req.params;

  const isLiked = await likeService.toggleLike(songId, req.userId!);

  res.json({
    success: true,
    data: { isLiked },
  });
}));

// Check if song is liked
router.get('/songs/:songId/check', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const { songId } = req.params;
  
  const isLiked = await likeService.isLiked(songId, req.userId!);
  
  res.json({
    success: true,
    data: { isLiked },
  });
}));

export { router as likesRouter };
