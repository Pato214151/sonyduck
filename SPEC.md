# 🎵 SONYDUCK - Clon de Spotify

> **Stack Modernizado:** TypeScript, React 18, Node.js, Prisma, Zustand, Docker

---

## 1. Stack Tecnológico

| Capa | Tecnología | Versión | Por qué |
|------|------------|---------|---------|
| **Frontend** | React + Vite | React 18, Vite 5 | Hot reload ultra rápido, TypeScript nativo |
| **Estado Global** | Zustand | v4 | Minimalista, TypeScript-friendly, sin boilerplate |
| **UI/Animaciones** | Framer Motion | v11 | Animaciones declarativas y fluidas |
| **Estilos** | Tailwind CSS | v3 | Desarrollo rápido, consistente, dark mode nativo |
| **HTTP Client** | Axios | v1 | Interceptores, type safety con generics |
| **Validación** | Zod | v3 | Runtime validation, inference automática |
| **Backend** | Node.js + Express | Express 5 | Stable, middleware ecosystem |
| **TypeScript** | TypeScript | v5 | Type safety en todo el stack |
| **ORM** | Prisma | v5 | DX excelente, migrations, TypeScript-first |
| **Database** | PostgreSQL | v16 | Robusto, relacional, mejor que MongoDB para este caso |
| **Auth** | JWT | - | Stateless, refresh tokens |
| **Docker** | Docker Compose | v2 | Deploy consistente |
| **Testing** | Vitest + RTL | - | Rápido, Vite-native |
| **PWA** | Vite PWA | - | Instalable como app nativa |

---

## 2. Color Palette

```css
/* Tailwind extended theme */
colors: {
  spotify: {
    green: '#1DB954',
    'green-hover': '#1ED760',
    black: '#000000',
    'dark': '#121212',
    'medium': '#181818',
    'light': '#282828',
    'lighter': '#404040',
  },
  text: {
    white: '#FFFFFF',
    light: '#B3B3B3',
    subtle: '#6A6A6A',
  }
}
```

---

## 3. Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Browser)                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React 18 + TypeScript                  │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │  │
│  │  │  Pages  │  │ Zustand │  │ Hooks   │  │  API    │    │  │
│  │  │(Routes) │  │(State)  │  │(Logic)  │  │(Axios)  │    │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │ HTTP                              │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    BACKEND (Node.js)                      │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │  │
│  │  │ Express │  │Prisma  │  │Routes  │  │Middlewares│    │  │
│  │  │ App     │  │ORM     │  │(API)   │  │(Auth,Err)│    │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │  │
│  │                              │                              │  │
│  │                              ▼                              │  │
│  │  ┌──────────────────┐  ┌──────────────────┐              │  │
│  │  │   PostgreSQL     │  │   File Storage   │              │  │
│  │  │   (Database)     │  │   (Uploads)     │              │  │
│  │  └──────────────────┘  └──────────────────┘              │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Modelo de Datos (Prisma Schema)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String
  avatar        String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  playlists     Playlist[]
  likedSongs    LikedSong[]
  followedArtists ArtistFollow[]
}

model Artist {
  id              String    @id @default(cuid())
  name            String
  imageUrl        String?
  bio             String?
  genres          String[]
  monthlyListeners Int      @default(0)
  createdAt       DateTime  @default(now())

  albums          Album[]
  songs           Song[]
  followers       ArtistFollow[]
}

model Album {
  id          String    @id @default(cuid())
  title       String
  coverUrl    String?
  releaseYear Int
  type        AlbumType @default(ALBUM)
  createdAt   DateTime  @default(now())

  artist      Artist    @relation(fields: [artistId], references: [id])
  artistId    String
  songs       Song[]
}

model Song {
  id          String    @id @default(cuid())
  title       String
  duration    Int       // seconds
  trackNumber Int       @default(1)
  audioUrl    String
  createdAt   DateTime  @default(now())

  album       Album     @relation(fields: [albumId], references: [id])
  albumId     String
  artist      Artist    @relation(fields: [artistId], references: [id])
  artistId    String

  likedBy     LikedSong[]
  inPlaylists PlaylistSong[]
}

model Playlist {
  id             String    @id @default(cuid())
  name           String
  description    String?
  coverUrl       String?
  isPublic       Boolean   @default(true)
  isCollaborative Boolean  @default(false)
  isLikedSongs   Boolean   @default(false)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  owner          User      @relation(fields: [ownerId], references: [id])
  ownerId        String
  songs          PlaylistSong[]
}

model PlaylistSong {
  id          String    @id @default(cuid())
  addedAt     DateTime  @default(now())
  position    Int       @default(0)

  playlist    Playlist  @relation(fields: [playlistId], references: [id], onDelete: Cascade)
  playlistId  String
  song        Song      @relation(fields: [songId], references: [id], onDelete: Cascade)
  songId      String

  @@unique([playlistId, songId])
}

model LikedSong {
  id        String    @id @default(cuid())
  addedAt   DateTime  @default(now())

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  song      Song      @relation(fields: [songId], references: [id], onDelete: Cascade)
  songId    String

  @@unique([userId, songId])
}

model ArtistFollow {
  id        String    @id @default(cuid())
  createdAt DateTime  @default(now())

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  artist    Artist    @relation(fields: [artistId], references: [id], onDelete: Cascade)
  artistId  String

  @@unique([userId, artistId])
}

enum AlbumType {
  ALBUM
  SINGLE
  EP
}
```

---

## 5. API Endpoints

### Auth
```
POST   /api/auth/register     - Registro
POST   /api/auth/login        - Login
POST   /api/auth/refresh      - Refresh token
POST   /api/auth/logout       - Logout
GET    /api/auth/me           - Usuario actual
```

### Users
```
GET    /api/users/:id         - Perfil
PUT    /api/users/:id         - Editar perfil
GET    /api/users/:id/playlists - Playlists del usuario
```

### Songs
```
GET    /api/songs             - Listar (paginado)
GET    /api/songs/:id         - Detalle
GET    /api/songs/search?q=   - Buscar
```

### Albums
```
GET    /api/albums            - Listar
GET    /api/albums/:id        - Con canciones
GET    /api/albums/:id/songs  - Solo canciones
```

### Artists
```
GET    /api/artists           - Listar
GET    /api/artists/:id       - Perfil completo
GET    /api/artists/:id/top-songs - Top songs
GET    /api/artists/:id/albums    - Discografía
```

### Playlists
```
GET    /api/playlists         - Mis playlists
POST   /api/playlists         - Crear
GET    /api/playlists/:id     - Detalle
PUT    /api/playlists/:id     - Editar
DELETE /api/playlists/:id     - Eliminar
POST   /api/playlists/:id/songs - Agregar canción
DELETE /api/playlists/:id/songs/:songId - Quitar canción
```

### Likes
```
POST   /api/likes/:songId     - Dar like
DELETE /api/likes/:songId     - Quitar like
GET    /api/likes             - Mis canciones liked
GET    /api/likes/:songId/check - Check if liked
```

---

## 6. Frontend Routes

```typescript
// Routes
const routes = {
  auth: {
    login: '/login',
    register: '/register',
  },
  main: {
    home: '/',
    search: '/search',
    library: '/library',
  },
  detail: {
    album: '/album/:id',
    artist: '/artist/:id',
    playlist: '/playlist/:id',
  },
  profile: {
    index: '/profile',
    edit: '/profile/edit',
  },
}
```

---

## 7. Component Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui base
│   │   ├── button
│   │   ├── input
│   │   ├── card
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── Sidebar/
│   │   ├── TopBar/
│   │   ├── MainContent/
│   │   └── PlayerBar/
│   │
│   ├── player/
│   │   ├── PlaybackControls/
│   │   ├── ProgressBar/
│   │   ├── VolumeControl/
│   │   └── QueueDrawer/
│   │
│   └── content/
│       ├── ContentCard/
│       ├── Section/
│       ├── TrackRow/
│       └── ArtistCard/
│
├── pages/
│   ├── Home/
│   ├── Search/
│   ├── Library/
│   ├── Album/
│   ├── Artist/
│   ├── Playlist/
│   ├── Profile/
│   ├── Login/
│   └── Register/
│
├── stores/                   # Zustand stores
│   ├── authStore.ts
│   ├── playerStore.ts
│   └── libraryStore.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── usePlayer.ts
│   └── useDebounce.ts
│
├── api/
│   ├── client.ts            # Axios instance
│   ├── auth.ts
│   ├── songs.ts
│   └── ...
│
└── lib/
    ├── utils.ts
    └── constants.ts
```

---

## 8. Features Implementadas

### Fase 1: MVP
- [x] Registro/Login con JWT
- [x] Exploración de Home
- [x] Detalle de álbum con canciones
- [x] Detalle de artista con discografía
- [x] Crear/Editar/Eliminar playlists
- [x] Sistema de likes (corazón)
- [x] Reproducción de audio (HTML5 Audio)
- [x] Controles: play, pause, next, prev
- [x] Progress bar con seek
- [x] Control de volumen
- [x] Shuffle y Repeat
- [x] Búsqueda global
- [x] Responsive design

### Fase 2: Enhancements
- [ ] Keyboard shortcuts
- [ ] Queue management
- [ ] Continue listening (recently played)
- [ ] Collaborative playlists
- [ ] Share functionality

---

## 9. Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sonyduck"

# JWT
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:5173"
```

---

## 10. Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd backend && npm run build",
    "build:frontend": "cd frontend && npm run build",
    "db:migrate": "cd backend && npx prisma migrate dev",
    "db:seed": "cd backend && npx prisma db seed",
    "db:studio": "cd backend && npx prisma studio",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down"
  }
}
```

---

*Versión 2.0 - 2026-07-09*
*Stack Modernizado con TypeScript, Prisma, Zustand, Docker*
