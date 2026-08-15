# 🦆 SonYDuck - Spotify Clone

> Un clon completo de Spotify con funciones de IA, modo oscuro elegante y diseño responsive.

## 🚀 Empezar en 30 segundos

### Opción 1: La más fácil (Windows)

**Doble clic en `setup.bat`** → espera a que instale todo → luego **doble clic en `start.bat`**.

Eso es todo. La app se abre en tu navegador en `http://localhost:5173`.

### Opción 2: Desde la terminal

La app usa **SQLite** (archivo `backend/prisma/dev.db`), así que **NO necesitas Docker ni PostgreSQL**.

```powershell
# Solo la primera vez
npm install
npm run db:push -w backend    # Crea las tablas en SQLite
npm run db:seed               # Llena la BD con datos de ejemplo

# Cada vez que quieras arrancar (backend + frontend)
npm run dev
```

O en dos terminales por separado:

```powershell
npm run dev --prefix backend    # API en http://localhost:3001
npm run dev --prefix frontend   # App en http://localhost:5173
```

## 🔑 Credenciales de prueba

```
Email:    demo@sonyduck.com
Password: Demo1234
```

## 📍 URLs locales

| Servicio   | URL                              |
| ---------- | -------------------------------- |
| Frontend   | http://localhost:5173            |
| Backend    | http://localhost:3001/api        |
| API Health | http://localhost:3001/api/health |
| Prisma DB  | http://localhost:5555            |

## ✨ Características

- 🎵 **Reproductor completo** con play/pause, skip ±10s, shuffle, repeat, volumen (barra de progreso arrastrable)
- 📥 **Importar de Spotify** — Trae los metadatos de tus "Me gusta" (título, artista, álbum, portada) vía la API oficial de Spotify (OAuth PKCE). Nota: Spotify no permite descargar el audio real, así que se usa audio demo como placeholder.
- ⬆️ **Subir tu música** — Sube tus propios MP3/WAV y reprodúcelos de verdad (se guardan en `backend/uploads/`)
- 🧠 **IA Discover** — Recomendaciones por mood, AI mixes, smart playlists
- 🎨 **Tema negro/gris/rojo** — Diseño elegante tipo Spotify
- 📱 **Responsive** — Funciona en móvil, tablet y desktop
- 🔒 **Seguro** — JWT, Helmet, rate limiting, sanitización
- 📊 **Weekly Digest** — Estadísticas de escucha con IA
- 🎯 **Mood Detection** — Detector de ánimo basado en historial

## 📁 Estructura

```
sonyduck/
├── start.bat          ← Doble clic para arrancar
├── setup.bat          ← Doble clic para setup inicial
├── backend/           ← Node.js + Express + Prisma
│   ├── src/
│   │   ├── routes/    ← Auth, songs, albums, playlists, AI
│   │   ├── services/  ← Lógica de negocio
│   │   └── middleware/← Auth, rate limit, security
│   └── prisma/
│       └── seed.ts    ← Datos de ejemplo
├── frontend/          ← React + Vite + TypeScript
│   └── src/
│       ├── pages/     ← Home, Search, Library, Discover, etc.
│       ├── components/← Player, Sidebar, TopBar
│       └── stores/    ← Zustand state
└── docs/
    ├── SECURITY.md    ← Documentación de seguridad
    └── mobile-preview.html  ← Vista previa móvil
```

## 🐛 Problemas comunes

### "Cannot connect to database"
La BD es SQLite (no requiere Docker). Recrea el archivo y los datos:
```powershell
npm run db:push -w backend
npm run db:seed
```

### Importar de Spotify: cómo configurarlo
1. Crea una app gratis en https://developer.spotify.com/dashboard
2. En "Redirect URIs" registra exactamente: `http://localhost:5173/spotify-callback`
   (o `http://127.0.0.1:5173/spotify-callback` según cómo abras la app)
3. Copia el **Client ID** y pégalo en la app: Tu Biblioteca → Importar de Spotify.

### "Port 3001 already in use"
Cambia `PORT=3001` por otro puerto en `backend/.env`.

### "Frontend no carga datos"
Verifica que el backend esté corriendo y el proxy en `vite.config.ts` apunte a `3001`.

## 📜 Scripts útiles

```powershell
npm run dev              # Arranca backend + frontend
npm run build            # Compila para producción
npm run docker:up        # Levanta PostgreSQL
npm run docker:down      # Detiene PostgreSQL
npm run db:migrate       # Aplica migraciones
npm run db:seed          # Llena la BD con datos demo
npm run db:studio        # Abre Prisma Studio (GUI)
```

## 🛡️ Seguridad

Ver `docs/SECURITY.md` para más detalles.

- ✅ Helmet (security headers)
- ✅ CORS restringido al frontend
- ✅ Rate limiting por ruta
- ✅ JWT con refresh tokens
- ✅ Input sanitization
- ✅ Password hashing (bcrypt)

---

Hecho con ❤️ por el equipo de SonYDuck