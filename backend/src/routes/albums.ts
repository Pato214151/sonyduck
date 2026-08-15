import { Router } from 'express';
import { paginationSchema } from '../utils/validation.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { optionalAuth, AuthRequest } from '../middleware/auth.js';
import { albumService } from '../services/album.service.js';

const router = Router();

// List all albums
router.get('/', catchAsync(async (req, res) => {
  const { limit = 20, offset = 0 } = paginationSchema.parse(req.query);
  const { type, artist } = req.query;
  
  const where: Record<string, unknown> = {};
  if (type && ['ALBUM', 'SINGLE', 'EP'].includes(String(type).toUpperCase())) {
    where.type = String(type).toUpperCase();
  }
  if (artist) {
    where.artistId = String(artist);
  }
  
  const result = await albumService.getAlbums({ limit, offset, artistId: where.artistId as string });
  
  res.json({
    success: true,
    data: {
      albums: result.albums,
      pagination: { total: result.total, limit, offset },
    },
  });
}));

// Get single album with songs
router.get('/:id', optionalAuth, catchAsync(async (req: AuthRequest, res) => {
  const { id } = req.params;
  
  const album = await albumService.getAlbumById(id, req.userId);
  
  res.json({
    success: true,
    data: album,
  });
}));

// Search albums
router.get('/search', catchAsync(async (req, res) => {
  const { q, limit = 20 } = req.query;
  
  if (!q || typeof q !== 'string') {
    throw new AppError('Search query is required', 400, 'VALIDATION_ERROR');
  }
  
  const result = await albumService.getAlbums({ search: q, limit: Number(limit) });
  
  res.json({
    success: true,
    data: { albums: result.albums },
  });
}));

export { router as albumsRouter };
