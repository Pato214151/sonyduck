// @ts-nocheck
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { formatTotalDuration } from '../utils/helpers.js';

export interface PlaylistBasic {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  isPublic: boolean;
  isCollaborative: boolean;
  isLikedSongs: boolean;
  owner: { id: string; name: string };
  songCount?: number;
}

export interface PlaylistWithSongs extends PlaylistBasic {
  songs: SongInPlaylist[];
  songCount: number;
  totalDuration: string;
}

export interface SongInPlaylist {
  id: string;
  title: string;
  duration: number;
  audioUrl: string;
  artist: { id: string; name: string };
  album: { id: string; title: string; coverUrl: string | null };
  isLiked?: boolean;
  addedAt: Date;
}

export interface CreatePlaylistInput {
  name: string;
  description?: string;
  isPublic?: boolean;
  ownerId: string;
}

export interface UpdatePlaylistInput {
  name?: string;
  description?: string;
  isPublic?: boolean;
  coverUrl?: string;
}

export class PlaylistService {
  async getPlaylists(userId: string, options: { limit?: number; offset?: number } = {}): Promise<{ playlists: PlaylistBasic[]; total: number }> {
    const { limit = 20, offset = 0 } = options;

    const [playlists, total] = await Promise.all([
      prisma.playlist.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { isPublic: true, isLikedSongs: false },
          ],
        },
        include: {
          owner: {
            select: { id: true, name: true },
          },
          _count: {
            select: { songs: true },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.playlist.count({
        where: {
          OR: [
            { ownerId: userId },
            { isPublic: true, isLikedSongs: false },
          ],
        },
      }),
    ]);

    return {
      playlists: playlists.map(p => ({
        ...p,
        songCount: p._count.songs,
      })),
      total,
    };
  }

  async getPlaylistById(id: string, userId?: string): Promise<PlaylistWithSongs> {
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true },
        },
        songs: {
          orderBy: { position: 'asc' },
          include: {
            song: {
              include: {
                artist: {
                  select: { id: true, name: true },
                },
                album: {
                  select: { id: true, title: true, coverUrl: true },
                },
              },
            },
          },
        },
      },
    });

    if (!playlist) {
      throw new AppError('Playlist not found', 404, 'NOT_FOUND');
    }

    // Check access
    if (!playlist.isPublic && playlist.ownerId !== userId) {
      throw new AppError('Not authorized to view this playlist', 403, 'FORBIDDEN');
    }

    const totalDuration = playlist.songs.reduce(
      (acc, ps) => acc + ps.song.duration,
      0
    );

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
      ...playlist,
      songs: playlist.songs.map(ps => ({
        ...ps.song,
        isLiked: likedSongIds.includes(ps.song.id),
        addedAt: ps.addedAt,
      })),
      songCount: playlist.songs.length,
      totalDuration: formatTotalDuration(totalDuration),
    };
  }

  async createPlaylist(input: CreatePlaylistInput): Promise<PlaylistBasic> {
    const playlist = await prisma.playlist.create({
      data: input,
      include: {
        owner: {
          select: { id: true, name: true },
        },
      },
    });

    return { ...playlist, songCount: 0 };
  }

  async updatePlaylist(id: string, userId: string, input: UpdatePlaylistInput): Promise<PlaylistBasic> {
    const playlist = await prisma.playlist.findUnique({
      where: { id },
    });

    if (!playlist) {
      throw new AppError('Playlist not found', 404, 'NOT_FOUND');
    }

    if (playlist.ownerId !== userId) {
      throw new AppError('Not authorized to edit this playlist', 403, 'FORBIDDEN');
    }

    const updated = await prisma.playlist.update({
      where: { id },
      data: input,
      include: {
        owner: {
          select: { id: true, name: true },
        },
        _count: {
          select: { songs: true },
        },
      },
    });

    return { ...updated, songCount: updated._count.songs };
  }

  async deletePlaylist(id: string, userId: string): Promise<void> {
    const playlist = await prisma.playlist.findUnique({
      where: { id },
    });

    if (!playlist) {
      throw new AppError('Playlist not found', 404, 'NOT_FOUND');
    }

    if (playlist.ownerId !== userId) {
      throw new AppError('Not authorized to delete this playlist', 403, 'FORBIDDEN');
    }

    if (playlist.isLikedSongs) {
      throw new AppError('Cannot delete the Liked Songs playlist', 400, 'FORBIDDEN');
    }

    await prisma.playlist.delete({
      where: { id },
    });
  }

  async addSongToPlaylist(playlistId: string, songId: string, userId: string): Promise<void> {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      throw new AppError('Playlist not found', 404, 'NOT_FOUND');
    }

    if (playlist.ownerId !== userId && !playlist.isCollaborative) {
      throw new AppError('Not authorized to add songs to this playlist', 403, 'FORBIDDEN');
    }

    // Get current max position
    const maxPosition = await prisma.playlistSong.findFirst({
      where: { playlistId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const newPosition = (maxPosition?.position ?? -1) + 1;

    // Add song to playlist
    await prisma.playlistSong.create({
      data: {
        playlistId,
        songId,
        position: newPosition,
      },
    });

    // Update playlist's updatedAt
    await prisma.playlist.update({
      where: { id: playlistId },
      data: { updatedAt: new Date() },
    });
  }

  async removeSongFromPlaylist(playlistId: string, songId: string, userId: string): Promise<void> {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      throw new AppError('Playlist not found', 404, 'NOT_FOUND');
    }

    if (playlist.ownerId !== userId && !playlist.isCollaborative) {
      throw new AppError('Not authorized to remove songs from this playlist', 403, 'FORBIDDEN');
    }

    await prisma.playlistSong.delete({
      where: {
        playlistId_songId: {
          playlistId,
          songId,
        },
      },
    });

    // Update playlist's updatedAt
    await prisma.playlist.update({
      where: { id: playlistId },
      data: { updatedAt: new Date() },
    });
  }

  async getLikedSongsPlaylist(userId: string): Promise<PlaylistWithSongs | null> {
    const playlist = await prisma.playlist.findFirst({
      where: {
        ownerId: userId,
        isLikedSongs: true,
      },
    });

    if (!playlist) return null;

    return this.getPlaylistById(playlist.id, userId);
  }
}

export const playlistService = new PlaylistService();
