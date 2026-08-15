# Estructura de Carpetas - SonYDuck

```
sonyduck/
│
├── frontend/                          # React Application
│   │
│   ├── public/                        # Archivos estáticos públicos
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   │
│   ├── src/                          # Código fuente principal
│   │   │
│   │   ├── assets/                   # Recursos estáticos
│   │   │   ├── images/              # Imágenes globales
│   │   │   │   ├── logo.svg
│   │   │   │   ├── logo-text.svg
│   │   │   │   └── placeholder-album.svg
│   │   │   │
│   │   │   └── icons/               # Iconos SVG inline
│   │   │       ├── PlayIcon.jsx
│   │   │       ├── PauseIcon.jsx
│   │   │       ├── NextIcon.jsx
│   │   │       ├── PrevIcon.jsx
│   │   │       ├── ShuffleIcon.jsx
│   │   │       ├── RepeatIcon.jsx
│   │   │       ├── HeartIcon.jsx
│   │   │       ├── HeartFilledIcon.jsx
│   │   │       ├── VolumeIcon.jsx
│   │   │       ├── VolumeMuteIcon.jsx
│   │   │       ├── SearchIcon.jsx
│   │   │       ├── HomeIcon.jsx
│   │   │       ├── LibraryIcon.jsx
│   │   │       ├── PlusIcon.jsx
│   │   │       ├── MoreIcon.jsx
│   │   │       ├── SettingsIcon.jsx
│   │   │       ├── LogoutIcon.jsx
│   │   │       ├── UserIcon.jsx
│   │   │       ├── PlaylistIcon.jsx
│   │   │       ├── AlbumIcon.jsx
│   │   │       ├── ArtistIcon.jsx
│   │   │       └── ClockIcon.jsx
│   │   │
│   │   ├── components/              # Componentes React reutilizables
│   │   │   │
│   │   │   ├── ui/                  # Componentes UI base
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.jsx
│   │   │   │   │   ├── Button.module.css
│   │   │   │   │   └── index.js
│   │   │   │   │
│   │   │   │   ├── Input/
│   │   │   │   │   ├── Input.jsx
│   │   │   │   │   ├── Input.module.css
│   │   │   │   │   └── index.js
│   │   │   │   │
│   │   │   │   ├── Modal/
│   │   │   │   │   ├── Modal.jsx
│   │   │   │   │   ├── Modal.module.css
│   │   │   │   │   └── index.js
│   │   │   │   │
│   │   │   │   ├── Toast/
│   │   │   │   │   ├── Toast.jsx
│   │   │   │   │   ├── Toast.module.css
│   │   │   │   │   ├── ToastContainer.jsx
│   │   │   │   │   └── index.js
│   │   │   │   │
│   │   │   │   ├── Skeleton/
│   │   │   │   │   ├── Skeleton.jsx
│   │   │   │   │   ├── Skeleton.module.css
│   │   │   │   │   └── index.js
│   │   │   │   │
│   │   │   │   └── Card/
│   │   │   │       ├── Card.jsx
│   │   │   │       ├── Card.module.css
│   │   │   │       └── index.js
│   │   │   │
│   │   │   ├── layout/              # Componentes de layout principal
│   │   │   │   ├── AppLayout/
│   │   │   │   │   ├── AppLayout.jsx
│   │   │   │   │   ├── AppLayout.module.css
│   │   │   │   │   └── index.js
│   │   │   │   │
│   │   │   │   ├── Sidebar/
│   │   │   │   │   ├── Sidebar.jsx
│   │   │   │   │   ├── Sidebar.module.css
│   │   │   │   │   └── index.js
│   │   │   │   │
│   │   │   │   ├── TopBar/
│   │   │   │   │   ├── TopBar.jsx
│   │   │   │   │   ├── TopBar.module.css
│   │   │   │   │   └── index.js
│   │   │   │   │
│   │   │   │   └── MainContent/
│   │   │   │       ├── MainContent.jsx
│   │   │   │       ├── MainContent.module.css
│   │   │   │       └── index.js
│   │   │   │
│   │   │   ├── player/               # Componentes del reproductor
│   │   │   │   ├── PlayerBar/
│   │   │   │   │   ├── PlayerBar.jsx
│   │   │   │   │   ├── PlayerBar.module.css
│   │   │   │   │   └── index.js
│   │   │   │   │
│   │   │   │   ├── NowPlaying/
│   │   │   │   │   ├── NowPlaying.jsx
│   │   │   │   │   ├── NowPlaying.module.css
│   │   │   │   │   └── index.js
│   │   │   │   │
│   │   │   │   ├── PlaybackControls/
│   │   │   │   │   ├── PlaybackControls.jsx
│   │   │   │   │   ├── PlaybackControls.module.css
│   │   │   │   │   └── index.js
│   │   │   │   │
│   │   │   │   ├── ProgressBar/
│   │   │   │   │   ├── ProgressBar.jsx
│   │   │   │   │   ├── ProgressBar.module.css
│   │   │   │   │   └── index.js
│   │   │   │   │
│   │   │   │   └── VolumeControl/
│   │   │   │       ├── VolumeControl.jsx
│   │   │   │       ├── VolumeControl.module.css
│   │   │   │       └── index.js
│   │   │   │
│   │   │   ├── content/             # Componentes de contenido
│   │   │   │   ├── Section/
│   │   │   │   │   ├── Section.jsx
│   │   │   │   │   ├── Section.module.css
│   │   │   │   │   └── index.js
│   │   │   │   │
│   │   │   │   ├── ContentCard/
│   │   │   │   │   ├── ContentCard.jsx
│   │   │   │   │   ├── ContentCard.module.css
│   │   │   │   │   └── index.js
│   │   │   │   │
│   │   │   │   ├── TrackRow/
│   │   │   │   │   ├── TrackRow.jsx
│   │   │   │   │   ├── TrackRow.module.css
│   │   │   │   │   └── index.js
│   │   │   │   │
│   │   │   │   └── CardGrid/
│   │   │   │       ├── CardGrid.jsx
│   │   │   │       ├── CardGrid.module.css
│   │   │   │       └── index.js
│   │   │   │
│   │   │   ├── auth/                # Componentes de autenticación
│   │   │   │   ├── AuthForm/
│   │   │   │   │   ├── AuthForm.jsx
│   │   │   │   │   ├── AuthForm.module.css
│   │   │   │   │   └── index.js
│   │   │   │   │
│   │   │   │   └── UserMenu/
│   │   │   │       ├── UserMenu.jsx
│   │   │   │       ├── UserMenu.module.css
│   │   │   │       └── index.js
│   │   │   │
│   │   │   └── playlist/            # Componentes de playlist
│   │   │       ├── PlaylistHeader/
│   │   │       │   ├── PlaylistHeader.jsx
│   │   │       │   ├── PlaylistHeader.module.css
│   │   │       │   └── index.js
│   │   │       │
│   │   │       ├── PlaylistTracklist/
│   │   │       │   ├── PlaylistTracklist.jsx
│   │   │       │   ├── PlaylistTracklist.module.css
│   │   │       │   └── index.js
│   │   │       │
│   │   │       ├── CreatePlaylistModal/
│   │   │       │   ├── CreatePlaylistModal.jsx
│   │   │       │   ├── CreatePlaylistModal.module.css
│   │   │       │   └── index.js
│   │   │       │
│   │   │       └── AddToPlaylistModal/
│   │   │           ├── AddToPlaylistModal.jsx
│   │   │           ├── AddToPlaylistModal.module.css
│   │   │           └── index.js
│   │   │
│   │   ├── pages/                   # Páginas/Rutas principales
│   │   │   ├── HomePage/
│   │   │   │   ├── HomePage.jsx
│   │   │   │   ├── HomePage.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── SearchPage/
│   │   │   │   ├── SearchPage.jsx
│   │   │   │   ├── SearchPage.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── LibraryPage/
│   │   │   │   ├── LibraryPage.jsx
│   │   │   │   ├── LibraryPage.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── AlbumPage/
│   │   │   │   ├── AlbumPage.jsx
│   │   │   │   ├── AlbumPage.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── ArtistPage/
│   │   │   │   ├── ArtistPage.jsx
│   │   │   │   ├── ArtistPage.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── PlaylistPage/
│   │   │   │   ├── PlaylistPage.jsx
│   │   │   │   ├── PlaylistPage.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── ProfilePage/
│   │   │   │   ├── ProfilePage.jsx
│   │   │   │   ├── ProfilePage.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── LoginPage/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── LoginPage.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   └── RegisterPage/
│   │   │       ├── RegisterPage.jsx
│   │   │       ├── RegisterPage.module.css
│   │   │       └── index.js
│   │   │
│   │   ├── context/                 # Context API (Estado global)
│   │   │   ├── AuthContext.jsx
│   │   │   ├── PlayerContext.jsx
│   │   │   ├── LibraryContext.jsx
│   │   │   └── ToastContext.jsx
│   │   │
│   │   ├── hooks/                   # Custom Hooks
│   │   │   ├── useAuth.js
│   │   │   ├── usePlayer.js
│   │   │   ├── useDebounce.js
│   │   │   ├── useLocalStorage.js
│   │   │   ├── useKeyboardShortcuts.js
│   │   │   └── useClickOutside.js
│   │   │
│   │   ├── services/               # Servicios/API calls
│   │   │   ├── api.js              # Instancia de Axios
│   │   │   ├── authService.js
│   │   │   ├── userService.js
│   │   │   ├── songService.js
│   │   │   ├── albumService.js
│   │   │   ├── artistService.js
│   │   │   └── playlistService.js
│   │   │
│   │   ├── utils/                   # Utilidades
│   │   │   ├── formatTime.js        # Formato de duración
│   │   │   ├── formatDate.js       # Formato de fechas
│   │   │   ├── generateId.js       # Generador de IDs
│   │   │   ├── shuffleArray.js     # Fisher-Yates shuffle
│   │   │   └── constants.js         # Constantes globales
│   │   │
│   │   ├── styles/                 # Estilos globales
│   │   │   ├── variables.css       # Variables CSS (colores, espaciado)
│   │   │   ├── global.css          # Reset y estilos base
│   │   │   └── animations.css      # Keyframes y animaciones
│   │   │
│   │   ├── App.jsx                 # Componente raíz
│   │   ├── App.css
│   │   └── main.jsx                 # Entry point
│   │
│   ├── .env                        # Variables de entorno
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
│
├── backend/                          # Node.js + Express API
│   │
│   ├── src/
│   │   │
│   │   ├── config/                 # Configuración
│   │   │   ├── database.js         # Conexión MongoDB
│   │   │   ├── jwt.js              # Configuración JWT
│   │   │   └── env.js              # Variables de entorno validadas
│   │   │
│   │   ├── models/                 # Mongoose Models
│   │   │   ├── User.js
│   │   │   ├── Song.js
│   │   │   ├── Album.js
│   │   │   ├── Artist.js
│   │   │   ├── Playlist.js
│   │   │   └── LikedSong.js
│   │   │
│   │   ├── controllers/            # Lógica de negocio
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── songController.js
│   │   │   ├── albumController.js
│   │   │   ├── artistController.js
│   │   │   ├── playlistController.js
│   │   │   └── likeController.js
│   │   │
│   │   ├── routes/                 # Definición de rutas
│   │   │   ├── index.js            # Router principal
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── songRoutes.js
│   │   │   ├── albumRoutes.js
│   │   │   ├── artistRoutes.js
│   │   │   ├── playlistRoutes.js
│   │   │   └── likeRoutes.js
│   │   │
│   │   ├── middleware/             # Middlewares
│   │   │   ├── auth.js             # Verificación JWT
│   │   │   ├── errorHandler.js     # Manejo global de errores
│   │   │   ├── rateLimiter.js      # Rate limiting
│   │   │   ├── validator.js        # Validación de inputs
│   │   │   └── cors.js             # CORS config
│   │   │
│   │   ├── services/               # Servicios/Utilidades
│   │   │   ├── emailService.js     # (futuro: envío de emails)
│   │   │   └── storageService.js   # Manejo de archivos
│   │   │
│   │   ├── utils/                  # Utilidades
│   │   │   ├── AppError.js         # Clase de errores personalizados
│   │   │   ├── catchAsync.js       # Wrapper para async/await
│   │   │   └── passwordUtils.js    # Hashing de passwords
│   │   │
│   │   ├── data/                   # Seed data
│   │   │   └── seed.js             # Script de datos iniciales
│   │   │
│   │   ├── app.js                  # Express app setup
│   │   └── server.js               # Entry point (server startup)
│   │
│   ├── uploads/                    # Archivos subidos
│   │   ├── audio/                  # MP3s, etc.
│   │   └── images/                 # Covers, avatars
│   │
│   ├── .env                        # Variables de entorno
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
│
├── docs/                            # Documentación
│   ├── SPEC.md                     # Especificación del proyecto
│   ├── diagrams.md                 # Diagramas UML
│   ├── user-stories.md             # Historias de usuario
│   ├── database-schema.md          # Schema de MongoDB (este archivo)
│   ├── api-endpoints.md            # Documentación de API
│   └── project-structure.md        # Estructura de carpetas
│
│
├── .gitignore
├── README.md                        # README principal
├── package.json                     # Workspace root (opcional)
└── SPEC.md
```

---

## Convenciones de Nomenclatura

### Archivos de Componentes
```
NombreComponente/
├── NombreComponente.jsx           # Componente principal
├── NombreComponente.module.css    # Estilos scoped
└── index.js                        # Export limpio
```

### Naming de Componentes
- **Archivos:** PascalCase (`PlayerBar.jsx`)
- **Componentes:** PascalCase (`function PlayerBar()`)
- **Hooks:** camelCase con prefijo `use` (`usePlayer.js`)
- **Servicios:** camelCase (`authService.js`)
- **Utils:** camelCase (`formatTime.js`)

### CSS Modules
```css
/* Componente.module.css */
.NombreComponente { }              /* Bloque principal */
.NombreComponente__element { }    /* Elemento hijo */
.NombreComponente--modifier { }  /* Modificador/estado */

/* Uso en JSX */
<div className={styles.NombreComponente}>
<div className={`${styles.NombreComponente} ${styles.active}`}>
```

---

## Archivo `.gitignore` Sugerido

```
# Dependencies
node_modules/
package-lock.json

# Build
dist/
build/

# Environment
.env
.env.local
.env.*.local

# Uploads (no subirlos al repo)
backend/uploads/

# Logs
logs/
*.log
npm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
```

---

*Estructura de proyecto: 2026-07-09*
