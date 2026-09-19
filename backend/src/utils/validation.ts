/**
 * Esquemas zod que validan el cuerpo y la query de las peticiones
 * (registro, login, perfil, playlists, paginación).
 */

import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  avatar: z.string().url().nullable().optional(),
});

export const createPlaylistSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(300).optional(),
  isPublic: z.boolean().optional(),
});

export const updatePlaylistSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(300).optional(),
  coverUrl: z.string().url().nullable().optional(),
  isPublic: z.boolean().optional(),
});

export const addSongToPlaylistSchema = z.object({
  songId: z.string(),
});

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreatePlaylistInput = z.infer<typeof createPlaylistSchema>;
export type UpdatePlaylistInput = z.infer<typeof updatePlaylistSchema>;
