import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { errorHandler, catchAsync } from './middleware/errorHandler.js';
import { securityHeaders } from './middleware/securityHeaders.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
import { sanitizeBody, sanitizeQuery, validateContentLength } from './middleware/sanitize.js';
import {
  authRouter,
  usersRouter,
  songsRouter,
  albumsRouter,
  artistsRouter,
  playlistsRouter,
  likesRouter,
  aiRouter,
  uploadRouter,
  importRouter,
} from './routes/index.js';
import { uploadsDir } from './routes/upload.js';

const app = express();

// Security headers (must be first)
app.use(securityHeaders);

// CORS
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// General rate limiting (antes de rutas grandes para que también las cubra)
app.use(generalLimiter);

// --- Rutas con cuerpos grandes (subida de archivos e importación) ---
// Se montan ANTES del límite global de 10KB para no ser bloqueadas por él.
// Servir los MP3 subidos como archivos estáticos
app.use('/api/uploads', express.static(uploadsDir));
// Subida de audio (multipart, lo parsea multer dentro del router)
app.use('/api/upload', uploadRouter);
// Importación de biblioteca (JSON grande con muchas canciones)
app.use('/api/import', express.json({ limit: '5mb' }), importRouter);

// Body parsing with size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request sanitization
app.use(sanitizeBody);
app.use(sanitizeQuery);
app.use(validateContentLength);

// Health check (no rate limit)
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'SonYDuck API is running!', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Auth routes with strict rate limiting
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/users', usersRouter);
app.use('/api/songs', songsRouter);
app.use('/api/albums', albumsRouter);
app.use('/api/artists', artistsRouter);
app.use('/api/playlists', playlistsRouter);
app.use('/api/likes', likesRouter);
app.use('/api/ai', aiRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// Error handling (must be last)
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`🎵 SonYDuck API running on http://localhost:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Security: Helmet, CORS, Rate Limiting, Input Sanitization enabled`);
});

export default app;
