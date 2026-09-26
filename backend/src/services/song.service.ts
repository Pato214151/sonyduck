// @ts-nocheck
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export interface SongWithRelations {
  id: string;
  title: string;
  duration: number;
  audioUrl: string;
  trackNumber: number | null;
  tempo: number | null;
  energy: number | null;
  danceability: number | null;
  valence: number | null;
  moods: string[];
  tags: string[];
  decade: string | null;
  occasions: string[];
  playCount: number;
  artist: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
  album: {
    id: string;
    title: string;
    coverUrl: string | null;
    releaseYear: number | null;
  };
  isLiked?: boolean;
}

export interface GetSongsOptions {
  limit?: number;
  offset?: number;
  artistId?: string;
  albumId?: string;
  search?: string;
  userId?: string;
}

export class SongService {
  async getSongs(options: GetSongsOptions = {}): Promise<{ songs: SongWithRelations[]; total: number }> {
    const { limit = 20, offset = 0, artistId, albumId, search, userId } = options;

    const where: Record<string, unknown> = {};
    
    if (artistId) where.artistId = artistId;
    if (albumId) where.albumId = albumId;
    // SQLite no admite `mode: 'insensitive'` en Prisma (revienta la consulta).
    // No hace falta: con SQLite, `contains` ya ignora mayúsculas/minúsculas en ASCII.
    if (search) where.title = { contains: search };

    const [songs, total] = await Promise.all([
      prisma.song.findMany({
        where,
        include: {
          artist: {
            select: { id: true, name: true, imageUrl: true },
          },
          album: {
            select: { id: true, title: true, coverUrl: true, releaseYear: true },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.song.count({ where }),
    ]);

    // Get liked songs if userId provided
    let likedSongIds: string[] = [];
    if (userId) {
      const likedSongs = await prisma.likedSong.findMany({
        where: { userId },
        select: { songId: true },
      });
      likedSongIds = likedSongs.map(ls => ls.songId);
    }

    return {
      songs: songs.map(song => ({
        ...song,
        isLiked: likedSongIds.includes(song.id),
      })),
      total,
    };
  }

  async getSongById(id: string, userId?: string): Promise<SongWithRelations> {
    const song = await prisma.song.findUnique({
      where: { id },
      include: {
        artist: {
          select: { id: true, name: true, imageUrl: true },
        },
        album: {
          select: { id: true, title: true, coverUrl: true, releaseYear: true },
        },
      },
    });

    if (!song) {
      throw new AppError('Song not found', 404, 'NOT_FOUND');
    }

    let isLiked = false;
    if (userId) {
      const liked = await prisma.likedSong.findUnique({
        where: {
          userId_songId: { userId, songId: id },
        },
      });
      isLiked = !!liked;
    }

    return { ...song, isLiked };
  }

  async getSongsByIds(ids: string[], userId?: string): Promise<SongWithRelations[]> {
    const songs = await prisma.song.findMany({
      where: { id: { in: ids } },
      include: {
        artist: {
          select: { id: true, name: true, imageUrl: true },
        },
        album: {
          select: { id: true, title: true, coverUrl: true, releaseYear: true },
        },
      },
    });

    // Preserve order of ids
    const songsMap = new Map(songs.map(s => [s.id, s]));

    // Get liked songs if userId provided
    let likedSongIds: string[] = [];
    if (userId) {
      const likedSongs = await prisma.likedSong.findMany({
        where: { userId, songId: { in: ids } },
        select: { songId: true },
      });
      likedSongIds = likedSongs.map(ls => ls.songId);
    }

    return ids
      .map(id => songsMap.get(id))
      .filter((song): song is NonNullable<typeof song> => song !== undefined)
      .map(song => ({
        ...song,
        isLiked: likedSongIds.includes(song.id),
      }));
  }

  async getTopSongs(limit: number = 10, userId?: string): Promise<SongWithRelations[]> {
    const songs = await prisma.song.findMany({
      orderBy: { playCount: 'desc' },
      include: {
        artist: {
          select: { id: true, name: true, imageUrl: true },
        },
        album: {
          select: { id: true, title: true, coverUrl: true, releaseYear: true },
        },
      },
      take: limit,
    });

    // Get liked songs if userId provided
    let likedSongIds: string[] = [];
    if (userId) {
      const likedSongs = await prisma.likedSong.findMany({
        where: { userId },
        select: { songId: true },
      });
      likedSongIds = likedSongs.map(ls => ls.songId);
    }

    return songs.map(song => ({
      ...song,
      isLiked: likedSongIds.includes(song.id),
    }));
  }

  async incrementPlayCount(songId: string): Promise<void> {
    await prisma.song.update({
      where: { id: songId },
      data: { playCount: { increment: 1 } },
    });
  }
}

export const songService = new SongService();
