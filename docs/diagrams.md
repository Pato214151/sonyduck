# Diagrama de Clases - SonYDuck

## 1. Modelo Entidad-Relación (DER)

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│    User     │       │    Playlist     │       │    Song     │
├─────────────┤       ├─────────────────┤       ├─────────────┤
│ _id         │──┐    │ _id             │    ┌──│ _id         │
│ email       │  │    │ name            │    │  │ title       │
│ password    │  │    │ description     │    │  │ duration    │
│ name        │  │    │ coverUrl        │    │  │ trackNumber │
│ avatar      │  │    │ owner ──────────┼────┘  │ audioUrl    │
│ createdAt   │  │    │ songs[]         │───────│ album       │
│ updatedAt   │  │    │ isPublic        │    │  │ artist      │
└─────────────┘  │    │ isCollaborative │    │  │ createdAt   │
      │          │    │ createdAt       │    │  └─────────────┘
      │          │    │ updatedAt       │    │
      │          │    └─────────────────┘    │
      │          │                            │
      │          │    ┌─────────────────┐     │
      │          │    │   LikedSong     │     │
      │          │    ├─────────────────┤     │
      │          └────│ user            │     │
                     │ song ────────────┼─────┘
                     │ addedAt          │
                     └─────────────────┘

┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│   Artist    │       │     Album       │       │    Song     │
├─────────────┤       ├─────────────────┤       ├─────────────┤
│ _id         │───────│ _id             │───────│ _id         │
│ name        │       │ title           │       │ title       │
│ imageUrl    │       │ coverUrl        │       │ ...         │
│ bio         │       │ releaseYear     │       └─────────────┘
│ genres[]    │       │ type            │
│ createdAt   │       │ artist ─────────┘
└─────────────┘       │ songs[]         │
                      │ createdAt       │
                      └─────────────────┘
```

---

## 2. Diagrama de Clases UML (Backend - Node.js + Mongoose)

### Clase User
```javascript
┌─────────────────────────────────────────┐
│               <<Schema>>                │
│                 User                    │
├─────────────────────────────────────────┤
│ - _id: ObjectId                         │
│ - email: String [unique, required]       │
│ - password: String [required, min:8]    │
│ - name: String [required, max:50]       │
│ - avatar: String [default: null]        │
│ - refreshToken: String                 │
│ - createdAt: Date                      │
│ - updatedAt: Date                      │
├─────────────────────────────────────────┤
│ + comparePassword(candidate)            │
│ + toJSON()                              │
└─────────────────────────────────────────┘
```

### Clase Song
```javascript
┌─────────────────────────────────────────┐
│               <<Schema>>                │
│                 Song                    │
├─────────────────────────────────────────┤
│ - _id: ObjectId                         │
│ - title: String [required, max:200]    │
│ - duration: Number [seconds]            │
│ - trackNumber: Number                   │
│ - audioUrl: String [required]           │
│ - album: ObjectId [ref: Album]         │
│ - artist: ObjectId [ref: Artist]       │
│ - createdAt: Date                      │
├─────────────────────────────────────────┤
│ + toSafeObject()                        │
└─────────────────────────────────────────┘
```

### Clase Album
```javascript
┌─────────────────────────────────────────┐
│               <<Schema>>                │
│                Album                    │
├─────────────────────────────────────────┤
│ - _id: ObjectId                         │
│ - title: String [required, max:200]    │
│ - coverUrl: String                      │
│ - releaseYear: Number                  │
│ - type: String [enum: album|single|ep] │
│ - artist: ObjectId [ref: Artist]        │
│ - songs: ObjectId[] [ref: Song]         │
│ - createdAt: Date                      │
├─────────────────────────────────────────┤
│ + getTotalDuration()                    │
│ + toSafeObject()                        │
└─────────────────────────────────────────┘
```

### Clase Artist
```javascript
┌─────────────────────────────────────────┐
│               <<Schema>>                │
│                Artist                   │
├─────────────────────────────────────────┤
│ - _id: ObjectId                         │
│ - name: String [required, max:200]     │
│ - imageUrl: String                      │
│ - bio: String                           │
│ - genres: String[]                      │
│ - createdAt: Date                      │
├─────────────────────────────────────────┤
│ + toSafeObject()                        │
└─────────────────────────────────────────┘
```

### Clase Playlist
```javascript
┌─────────────────────────────────────────┐
│               <<Schema>>                │
│              Playlist                   │
├─────────────────────────────────────────┤
│ - _id: ObjectId                         │
│ - name: String [required, max:200]     │
│ - description: String                   │
│ - coverUrl: String                     │
│ - owner: ObjectId [ref: User]           │
│ - songs: ObjectId[] [ref: Song]         │
│ - isPublic: Boolean [default: true]    │
│ - isCollaborative: Boolean [default: false]
│ - createdAt: Date                      │
│ - updatedAt: Date                      │
├─────────────────────────────────────────┤
│ + addSong(songId)                       │
│ + removeSong(songId)                    │
│ + reorderSongs(from, to)               │
│ + toSafeObject()                        │
└─────────────────────────────────────────┘
```

### Clase LikedSong
```javascript
┌─────────────────────────────────────────┐
│               <<Schema>>                │
│             LikedSong                   │
├─────────────────────────────────────────┤
│ - _id: ObjectId                         │
│ - user: ObjectId [ref: User]            │
│ - song: ObjectId [ref: Song]            │
│ - addedAt: Date                        │
├─────────────────────────────────────────┤
│ + unique: [user, song]                  │
└─────────────────────────────────────────┘
```

---

## 3. Diagrama de Componentes (Frontend - React)

### Jerarquía de Componentes

```
App
├── AuthProvider (Context)
│   └── AuthRoute / LoginPage / RegisterPage
│
├── AppLayout
│   ├── Sidebar
│   │   ├── Logo
│   │   ├── NavItem
│   │   ├── NavSection
│   │   ├── PlaylistList
│   │   └── CreatePlaylistButton
│   │
│   ├── MainContent
│   │   ├── TopBar
│   │   │   ├── NavigationArrows
│   │   │   └── SearchBar
│   │   │
│   │   ├── Router (React Router)
│   │   │   ├── HomePage
│   │   │   │   ├── Section
│   │   │   │   │   └── CardGrid
│   │   │   │   │       └── ContentCard
│   │   │   │   │
│   │   │   ├── SearchPage
│   │   │   │   ├── SearchInput
│   │   │   │   └── SearchResults (Tabs)
│   │   │   │
│   │   │   ├── AlbumPage
│   │   │   │   ├── AlbumHeader
│   │   │   │   └── Tracklist
│   │   │   │       └── TrackRow
│   │   │   │
│   │   │   ├── ArtistPage
│   │   │   │   ├── ArtistHeader
│   │   │   │   ├── PopularTracks
│   │   │   │   └── Discography
│   │   │   │
│   │   │   ├── PlaylistPage
│   │   │   │   ├── PlaylistHeader
│   │   │   │   └── PlaylistTracklist
│   │   │   │
│   │   │   ├── LibraryPage
│   │   │   │   └── PlaylistGrid
│   │   │   │
│   │   │   └── ProfilePage
│   │   │       └── ProfileHeader
│   │   │
│   │   └── ScrollContainer
│   │
│   └── PlayerBar
│       ├── NowPlaying
│       ├── PlaybackControls
│       ├── ProgressBar
│       └── VolumeControl
│
└── ModalProvider (Context)
    ├── CreatePlaylistModal
    ├── AddToPlaylistModal
    ├── ConfirmDialog
    └── Toast
```

### Estados de Componentes Clave

#### PlayerBar
```
┌──────────────────────────────────────────────────────────┐
│ State:                                                   │
│ - currentSong: Song | null                              │
│ - isPlaying: boolean                                    │
│ - queue: Song[]                                          │
│ - queueIndex: number                                    │
│ - progress: number (seconds)                            │
│ - volume: number (0-100)                                │
│ - isShuffled: boolean                                   │
│ - repeatMode: 'off' | 'all' | 'one'                    │
│ - isMuted: boolean                                      │
├──────────────────────────────────────────────────────────┤
│ Actions:                                                │
│ + play()                                                │
│ + pause()                                               │
│ + next()                                                │
│ + previous()                                            │
│ + seek(seconds)                                         │
│ + setVolume(level)                                      │
│ + toggleShuffle()                                       │
│ + cycleRepeatMode()                                     │
│ + setQueue(songs, startIndex?)                         │
└──────────────────────────────────────────────────────────┘
```

#### Sidebar
```
┌──────────────────────────────────────────────────────────┐
│ State:                                                   │
│ - playlists: Playlist[]                                 │
│ - isCollapsed: boolean                                  │
│ - activeSection: 'home' | 'search' | 'library'         │
├──────────────────────────────────────────────────────────┤
│ Props:                                                  │
│ - onNavigate(route)                                    │
│ - onCreatePlaylist()                                    │
└──────────────────────────────────────────────────────────┘
```

#### ContentCard
```
┌──────────────────────────────────────────────────────────┐
│ State:                                                   │
│ - isHovered: boolean                                    │
├──────────────────────────────────────────────────────────┤
│ Props:                                                   │
│ - type: 'album' | 'artist' | 'playlist' | 'song'        │
│ - id: string                                            │
│ - title: string                                         │
│ - subtitle: string                                       │
│ - imageUrl: string                                       │
│ - onClick()                                             │
│ - onContextMenu()                                       │
├──────────────────────────────────────────────────────────┤
│ Hover Behavior:                                          │
│ - Scale: 1.0 → 1.05                                     │
│ - Shadow: elevation → high                              │
│ - Play button: hidden → visible (opacity 0→1)           │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Diagrama de Flujo - Autenticación

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Login     │────▶│   Validate   │────▶│  JWT Issue   │
│    Page      │     │   Input      │     │  (tokens)    │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                     │
       │                    ▼                     │
       │             ┌──────────────┐            │
       │             │  Errors?     │            │
       │             └──────────────┘            │
       │                    │ No                 │ Yes
       │                    ▼                    │
       │             ┌──────────────┐            │
       │             │  Store JWT   │            │
       │             │  (localStorage)          │
       │             └──────────────┘            │
       │                    │                   │
       │                    ▼                   ▼
       │             ┌──────────────┐     ┌──────────────┐
       │             │   Redirect   │     │  Show Error  │
       │             │   to Home    │     │   (Toast)    │
       │             └──────────────┘     └──────────────┘
```

---

## 5. Diagrama de Secuencia - Reproducir Canción

```
User          React              API              MongoDB
 │               │                 │                 │
 │  Click Play   │                 │                 │
 │──────────────▶│                 │                 │
 │               │                 │                 │
 │               │  GET /songs/:id │                 │
 │               │────────────────▶│                 │
 │               │                 │  Query song     │
 │               │                 │────────────────▶│
 │               │                 │◀────────────────│
 │               │                 │                 │
 │               │◀────────────────│  Song data      │
 │               │                 │                 │
 │               │  Set state:     │                 │
 │               │  currentSong,   │                 │
 │               │  isPlaying      │                 │
 │               │                 │                 │
 │  UI Update    │                 │                 │
 │◀──────────────│                 │                 │
 │               │                 │                 │
```

---

## 6. Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React Application                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │  │
│  │  │  Components │  │   Context   │  │    Hooks    │     │  │
│  │  │  (Views)    │  │   (State)   │  │  (Logic)    │     │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS (JSON)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER (Node.js)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      Express App                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │  │
│  │  │  Middleware │  │  Routes     │  │ Controllers │     │  │
│  │  │  - Auth     │  │  /api/*     │  │  - Auth     │     │  │
│  │  │  - CORS     │  │             │  │  - Songs    │     │  │
│  │  │  - RateLimit│  │             │  │  - Albums   │     │  │
│  │  │  - Errors   │  │             │  │  - Playlists│     │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                 │
│                              ▼                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                       MongoDB                             │  │
│  │  Collections: users, songs, albums, artists, playlists   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                 │
│                              ▼                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   File Storage                            │  │
│  │  /uploads/audio/*.mp3, /uploads/images/*.jpg               │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

*Diagramas generados: 2026-07-09*
