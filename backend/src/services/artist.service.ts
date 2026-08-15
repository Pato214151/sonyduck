// @ts-nocheck
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export interface ArtistWithRelations {
  id: string;
  name: string;
  bio: string | null;
  imageUrl: string | null;
  genres: string[];
  monthlyListeners: number;
  albums?: AlbumBasic[];
  topSongs?: ArtistSongBasic[];
  albumCount?: number;
  songCount?: number;
}

export interface AlbumBasic {
  id: string;
  title: string;
  coverUrl: string | null;
  releaseYear: number | null;
  type: string;
}

export interface ArtistSongBasic {
  id: string;
  title: string;
  duration: number;
  album: {
    id: string;
    title: string;
    coverUrl: string | null;
  };
  isLiked?: boolean;
}

export interface GetArtistsOptions {
  limit?: number;
  offset?: number;
  search?: string;
  userId?: string;
}

export class ArtistService {
  async getArtists(options: GetArtistsOptions = {}): Promise<{ artists: ArtistWithRelations[]; total: number }> {
    const { limit = 20, offset = 0, search } = options;

    const where: Record<string, unknown> = {};
    if (search) where.name = { contains: search, mode: 'insensitive' as const };

    const [artists, total] = await Promise.all([
      prisma.artist.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { monthlyListeners: 'desc' },
      }),
      prisma.artist.count({ where }),
    ]);

    return {
      artists: artists.map(a => ({
        ...a,
        type: undefined, // Remove undefined field
      })),
      total,
    };
  }

  async getArtistById(id: string, userId?: string): Promise<ArtistWithRelations> {
    const artist = await prisma.artist.findUnique({
      where: { id },
      include: {
        albums: {
          orderBy: { releaseYear: 'desc' },
          include: {
            _count: {
              select: { songs: true },
            },
          },
        },
      },
    });

    if (!artist) {
      throw new AppError('Artist not found', 404, 'NOT_FOUND');
    }

    // Get top songs (most played from this artist)
    const topSongs = await prisma.song.findMany({
      where: { artistId: id },
      orderBy: { playCount: 'desc' },
      take: 5,
      include: {
        album: {
          select: { id: true, title: true, coverUrl: true },
        },
      },
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

    return {
      ...artist,
      type: undefined,
      albums: artist.albums.map(a => ({
        ...a,
        type: a.type,
      })),
      topSongs: topSongs.map(s => ({
        ...s,
        isLiked: likedSongIds.includes(s.id),
      })),
      albumCount: artist.albums.length,
      songCount: artist.albums.reduce((acc, a) => acc + a._count.songs, 0),
    };
  }

  async followArtist(artistId: string, userId: string): Promise<void> {
    await prisma.artistFollow.create({
      data: {
        artistId,
        userId,
      },
    });
  }

  async unfollowArtist(artistId: string, userId: string): Promise<void> {
    await prisma.artistFollow.delete({
      where: {
        artistId_userId: {
          artistId,
          userId,
        },
      },
    });
  }

  async isFollowing(artistId: string, userId: string): Promise<boolean> {
    const follow = await prisma.artistFollow.findUnique({
      where: {
        artistId_userId: {
          artistId,
          userId,
        },
      },
    });
    return !!follow;
  }

  async getFollowedArtists(userId: string): Promise<ArtistWithRelations[]> {
    const follows = await prisma.artistFollow.findMany({
      where: { userId },
      include: {
        artist: true,
      },
    });

    return follows.map(f => ({
      ...f.artist,
      type: undefined,
    }));
  }
}

export const artistService = new ArtistService();
