/**
 * Rutas /api/users: perfil público, editar el propio perfil y playlists públicas
 * de un usuario.
 */

import { Router } from 'express';
import { updateUserSchema, paginationSchema } from '../utils/validation.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { authService } from '../services/auth.service.js';

const router = Router();

// Get user profile
router.get('/:id', optionalAuth, catchAsync(async (req: AuthRequest, res) => {
  const { id } = req.params;
  
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      avatar: true,
      createdAt: true,
      _count: {
        select: {
          playlists: { where: { isPublic: true } },
          followedArtists: true,
        },
      },
    },
  });
  
  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }
  
  res.json({
    success: true,
    data: {
      ...user,
      playlistsCount: user._count.playlists,
      followingCount: user._count.followedArtists,
    },
  });
}));

// Update user profile
router.put('/:id', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const { id } = req.params;
  
  if (id !== req.userId) {
    throw new AppError('Not authorized to update this profile', 403, 'FORBIDDEN');
  }
  
  const validated = updateUserSchema.parse(req.body);
  
  const user = await authService.updateProfile(id, validated);
  
  res.json({
    success: true,
    data: user,
  });
}));

// Get user's playlists
router.get('/:id/playlists', catchAsync(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { limit = 20, offset = 0 } = paginationSchema.parse(req.query);
  
  const playlists = await prisma.playlist.findMany({
    where: {
      ownerId: id,
      isPublic: true,
      isLikedSongs: false,
    },
    select: {
      id: true,
      name: true,
      coverUrl: true,
      description: true,
      isPublic: true,
      createdAt: true,
      _count: {
        select: { songs: true },
      },
    },
    take: limit,
    skip: offset,
    orderBy: { updatedAt: 'desc' },
  });
  
  const total = await prisma.playlist.count({
    where: { ownerId: id, isPublic: true, isLikedSongs: false },
  });
  
  res.json({
    success: true,
    data: {
      playlists: playlists.map(p => ({
        ...p,
        songCount: p._count.songs,
      })),
      pagination: { total, limit, offset },
    },
  });
}));

export { router as usersRouter };
