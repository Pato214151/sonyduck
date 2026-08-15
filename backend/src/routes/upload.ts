// @ts-nocheck
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

// Carpeta donde se guardan los MP3 subidos por el usuario
export const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname) || '.mp3').toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB por archivo
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) cb(null, true);
    else cb(new AppError('Solo se permiten archivos de audio', 400, 'INVALID_FILE_TYPE'));
  },
});

const router = Router();

async function getOrCreateArtist(name: string) {
  let artist = await prisma.artist.findFirst({ where: { name } });
  if (!artist) artist = await prisma.artist.create({ data: { name } });
  return artist;
}

async function getOrCreateAlbum(title: string, artistId: string) {
  let album = await prisma.album.findFirst({ where: { title, artistId } });
  if (!album) {
    album = await prisma.album.create({
      data: { title, artistId, releaseYear: new Date().getFullYear(), type: 'UPLOAD' },
    });
  }
  return album;
}

// POST /api/upload  -> sube un archivo de audio y lo agrega a la biblioteca
router.post('/', authenticate, upload.single('file'), catchAsync(async (req: AuthRequest, res) => {
  if (!req.file) throw new AppError('No se subió ningún archivo', 400, 'NO_FILE');

  const title = (req.body.title || path.parse(req.file.originalname).name || 'Sin título')
    .toString().slice(0, 200).trim() || 'Sin título';
  const artistName = (req.body.artist || 'Mis Subidas').toString().slice(0, 200).trim() || 'Mis Subidas';
  const duration = Math.max(1, Math.round(parseFloat(req.body.duration) || 0)) || 1;

  const artist = await getOrCreateArtist(artistName);
  const album = await getOrCreateAlbum('Subidas', artist.id);

  const song = await prisma.song.create({
    data: {
      title,
      duration,
      audioUrl: `/api/uploads/${req.file.filename}`,
      albumId: album.id,
      artistId: artist.id,
      tags: JSON.stringify(['upload']),
    },
    include: {
      artist: { select: { id: true, name: true, imageUrl: true } },
      album: { select: { id: true, title: true, coverUrl: true } },
    },
  });

  // Agregar a "Me gusta" (desacoplado de la playlist para no fallar si no existe)
  await prisma.likedSong.upsert({
    where: { userId_songId: { userId: req.userId!, songId: song.id } },
    create: { userId: req.userId!, songId: song.id },
    update: {},
  });

  res.status(201).json({ success: true, data: { song: { ...song, isLiked: true } } });
}));

export { router as uploadRouter };
