// @ts-nocheck
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export interface AlbumWithRelations {
  id: string;
  title: string;
  coverUrl: string | null;
  releaseYear: number | null;
  type: string;
  artist: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
  songs?: SongBasic[];
  songCount?: number;
  totalDuration?: string;
}

export interface SongBasic {
  id: string;
  title: string;
  duration: number;
  trackNumber: number | null;
  isLiked?: boolean;
}

export interface GetAlbumsOptions {
  limit?: number;
  offset?: number;
  artistId?: string;
  search?: string;
  userId?: string;
}

export class AlbumService {
  async getAlbums(options: GetAlbumsOptions = {}): Promise<{ albums: AlbumWithRelations[]; total: number }> {
    const { limit = 20, offset = 0, artistId, search } = options;

    const where: Record<string, unknown> = {};
    if (artistId) where.artistId = artistId;
    if (search) where.title = { contains: search, mode: 'insensitive' as const };

    const [albums, total] = await Promise.all([
      prisma.album.findMany({
        where,
        include: {
          artist: {
            select: { id: true, name: true, imageUrl: true },
          },
          _count: {
            select: { songs: true },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { releaseYear: 'desc' },
      }),
      prisma.album.count({ where }),
    ]);

    return {
      albums: albums.map(a => ({
        ...a,
        type: a.type,
        songCount: a._count.songs,
      })),
      total,
    };
  }

  async getAlbumById(id: string, userId?: string): Promise<AlbumWithRelations> {
    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        artist: {
          select: { id: true, name: true, imageUrl: true },
        },
        songs: {
          orderBy: { trackNumber: 'asc' },
          include: {
            song: {
              select: {
                id: true,
                title: true,
                duration: true,
                trackNumber: true,
              },
            },
          },
        },
      },
    });

    if (!album) {
      throw new AppError('Album not found', 404, 'NOT_FOUND');
    }

    const totalDuration = album.songs.reduce((acc, ps) => acc + ps.song.duration, 0);

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
      ...album,
      type: album.type,
      songs: album.songs.map(ps => ({
        ...ps.song,
        isLiked: likedSongIds.includes(ps.song.id),
      })),
      songCount: album.songs.length,
      totalDuration: this.formatDuration(totalDuration),
    };
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  }
}

export const albumService = new AlbumService();
