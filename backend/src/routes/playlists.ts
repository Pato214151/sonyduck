/**
 * Rutas /api/playlists: CRUD de playlists y agregar/quitar canciones.
 * Solo el dueño puede modificar su playlist (lo valida el servicio).
 */

import { Router } from 'express';
import { createPlaylistSchema, updatePlaylistSchema, addSongToPlaylistSchema, paginationSchema } from '../utils/validation.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.js';
import { playlistService } from '../services/playlist.service.js';

const router = Router();

// Get all playlists (user's own + public)
router.get('/', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const { limit = 20, offset = 0 } = paginationSchema.parse(req.query);
  
  const result = await playlistService.getPlaylists(req.userId!, { limit, offset });
  
  res.json({
    success: true,
    data: {
      playlists: result.playlists,
      pagination: { total: result.total, limit, offset },
    },
  });
}));

// Create playlist
router.post('/', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const validated = createPlaylistSchema.parse(req.body) as { name: string; description?: string; isPublic?: boolean };
  
  const playlist = await playlistService.createPlaylist({
    ...validated,
    ownerId: req.userId!,
  });
  
  res.status(201).json({
    success: true,
    data: playlist,
  });
}));

// Get single playlist with songs
router.get('/:id', optionalAuth, catchAsync(async (req: AuthRequest, res) => {
  const { id } = req.params;
  
  const playlist = await playlistService.getPlaylistById(id, req.userId);
  
  res.json({
    success: true,
    data: playlist,
  });
}));

// Update playlist
router.put('/:id', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const validated = updatePlaylistSchema.parse(req.body);
  
  const playlist = await playlistService.updatePlaylist(id, req.userId!, validated);
  
  res.json({
    success: true,
    data: playlist,
  });
}));

// Delete playlist
router.delete('/:id', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const { id } = req.params;
  
  await playlistService.deletePlaylist(id, req.userId!);
  
  res.json({
    success: true,
    message: 'Playlist deleted successfully',
  });
}));

// Add song(s) to playlist
router.post('/:id/songs', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { songId } = addSongToPlaylistSchema.parse(req.body);
  
  await playlistService.addSongToPlaylist(id, songId, req.userId!);
  
  res.json({
    success: true,
    message: 'Song added to playlist',
  });
}));

// Remove song from playlist
router.delete('/:id/songs/:songId', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const { id, songId } = req.params;
  
  await playlistService.removeSongFromPlaylist(id, songId, req.userId!);
  
  res.json({
    success: true,
    message: 'Song removed from playlist',
  });
}));

export { router as playlistsRouter };
