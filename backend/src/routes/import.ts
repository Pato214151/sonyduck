// @ts-nocheck
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

const router = Router();

// Audio placeholder legal (no se puede descargar el audio real de Spotify)
const SOUNDHELIX = (i: number) =>
  `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(i % 16) + 1}.mp3`;

const clean = (v: unknown, max: number, fallback = '') =>
  (typeof v === 'string' ? v : fallback).toString().slice(0, max).trim();

// POST /api/import/spotify
// Body: { tracks: [{ title, artist, album, coverUrl, durationMs, spotifyId }] }
router.post('/spotify', authenticate, catchAsync(async (req: AuthRequest, res) => {
  const tracks = Array.isArray(req.body?.tracks) ? req.body.tracks : [];
  if (tracks.length === 0) throw new AppError('No se recibieron canciones', 400, 'NO_TRACKS');
  if (tracks.length > 2000) throw new AppError('Demasiadas canciones (máx. 2000)', 400, 'TOO_MANY');

  let imported = 0;
  let skipped = 0;
  const artistCache = new Map<string, string>();
  const albumCache = new Map<string, string>();

  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i] || {};
    const title = clean(t.title, 300);
    if (!title) { skipped++; continue; }
    const artistName = clean(t.artist, 300, 'Desconocido') || 'Desconocido';
    const albumTitle = clean(t.album, 300, 'Sencillo') || 'Sencillo';
    const coverUrl = clean(t.coverUrl, 500) || null;
    const duration = Math.max(1, Math.round((Number(t.durationMs) || 0) / 1000)) || 180;
    const spotifyId = clean(t.spotifyId, 100);

    // Artista (find-or-create con caché)
    const aKey = artistName.toLowerCase();
    let artistId = artistCache.get(aKey);
    if (!artistId) {
      let artist = await prisma.artist.findFirst({ where: { name: artistName } });
      if (!artist) artist = await prisma.artist.create({ data: { name: artistName } });
      artistId = artist.id;
      artistCache.set(aKey, artistId);
    }

    // Álbum (find-or-create por título + artista)
    const albKey = `${aKey}::${albumTitle.toLowerCase()}`;
    let albumId = albumCache.get(albKey);
    if (!albumId) {
      let album = await prisma.album.findFirst({ where: { title: albumTitle, artistId } });
      if (!album) {
        album = await prisma.album.create({
          data: { title: albumTitle, artistId, coverUrl, releaseYear: new Date().getFullYear(), type: 'IMPORT' },
        });
      } else if (coverUrl && !album.coverUrl) {
        await prisma.album.update({ where: { id: album.id }, data: { coverUrl } });
      }
      albumId = album.id;
      albumCache.set(albKey, albumId);
    }

    // Canción (dedupe por título + artista + álbum)
    let song = await prisma.song.findFirst({ where: { title, artistId, albumId } });
    if (!song) {
      song = await prisma.song.create({
        data: {
          title,
          duration,
          audioUrl: SOUNDHELIX(i),
          albumId,
          artistId,
          tags: JSON.stringify(spotifyId ? ['spotify', spotifyId] : ['spotify']),
        },
      });
    }

    // Agregar a "Me gusta"
    const already = await prisma.likedSong.findUnique({
      where: { userId_songId: { userId: req.userId!, songId: song.id } },
    });
    if (already) {
      skipped++;
    } else {
      await prisma.likedSong.create({ data: { userId: req.userId!, songId: song.id } });
      imported++;
    }
  }

  res.status(201).json({ success: true, data: { imported, skipped, total: tracks.length } });
}));

export { router as importRouter };
