// @ts-nocheck
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type { SongWithRelations } from './song.service.js';

export class LikeService {
  async getLikedSongs(userId: string): Promise<{ songs: SongWithRelations[]; total: number }> {
    const likedSongs = await prisma.likedSong.findMany({
      where: { userId },
      orderBy: { addedAt: 'desc' },
      include: {
        song: {
          include: {
            artist: {
              select: { id: true, name: true, imageUrl: true },
            },
            album: {
              select: { id: true, title: true, coverUrl: true, releaseYear: true },
            },
          },
        },
      },
    });

    const songs = likedSongs.map(ls => ({
      ...ls.song,
      isLiked: true,
    }));

    return {
      songs,
      total: songs.length,
    };
  }

  async likeSong(songId: string, userId: string): Promise<void> {
    // Check if song exists
    const song = await prisma.song.findUnique({
      where: { id: songId },
    });

    if (!song) {
      throw new AppError('Song not found', 404, 'NOT_FOUND');
    }

    // Check if already liked
    const existing = await prisma.likedSong.findUnique({
      where: {
        userId_songId: {
          userId,
          songId,
        },
      },
    });

    if (existing) {
      throw new AppError('Song already liked', 409, 'CONFLICT');
    }

    // Like the song (fuente de verdad: tabla LikedSong)
    await prisma.likedSong.create({
      data: { userId, songId },
    });

    // Además, sincronizar con la playlist "Me gusta" si el usuario la tiene
    // (best-effort: no debe romper el like si la playlist no existe)
    try {
      const likedPlaylist = await prisma.playlist.findFirst({
        where: { ownerId: userId, isLikedSongs: true },
      });
      if (likedPlaylist) {
        await prisma.playlistSong.create({
          data: { playlistId: likedPlaylist.id, songId, position: 0 },
        });
      }
    } catch {
      // Ignorar fallos de sincronización de playlist
    }
  }

  async unlikeSong(songId: string, userId: string): Promise<void> {
    // Quitar de la fuente de verdad
    await prisma.likedSong.deleteMany({
      where: { userId, songId },
    });

    // Y de la playlist "Me gusta" si aplica (best-effort)
    try {
      await prisma.playlistSong.deleteMany({
        where: { songId, playlist: { ownerId: userId, isLikedSongs: true } },
      });
    } catch {
      // Ignorar
    }
  }

  async toggleLike(songId: string, userId: string): Promise<boolean> {
    const existing = await prisma.likedSong.findUnique({
      where: {
        userId_songId: {
          userId,
          songId,
        },
      },
    });

    if (existing) {
      await this.unlikeSong(songId, userId);
      return false;
    } else {
      await this.likeSong(songId, userId);
      return true;
    }
  }

  async isLiked(songId: string, userId: string): Promise<boolean> {
    const like = await prisma.likedSong.findUnique({
      where: {
        userId_songId: {
          userId,
          songId,
        },
      },
    });
    return !!like;
  }
}

export const likeService = new LikeService();
