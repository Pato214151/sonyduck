# Database Schema - MongoDB

## Colecciones

---

## 1. User

```javascript
// backend/src/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
  },
  
  password: {
    type: String,
    required: [true, 'Contraseña es requerida'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    select: false // No incluir por defecto en queries
  },
  
  name: {
    type: String,
    required: [true, 'Nombre es requerido'],
    trim: true,
    minlength: [1, 'El nombre no puede estar vacío'],
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  
  avatar: {
    type: String,
    default: null
  },
  
  refreshToken: {
    type: String,
    select: false
  },
  
  likedSongs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  
  followedArtists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist'
  }]
  
}, {
  timestamps: true
});

// Índices
userSchema.index({ email: 1 });
userSchema.index({ name: 'text' });

// Hash password antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Eliminar campos sensibles al convertir a JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
```

**Ejemplo de documento:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "julian@example.com",
  "password": "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY8vQ4.YMiu",
  "name": "Julian",
  "avatar": "/uploads/images/avatar-507f1f77.jpg",
  "likedSongs": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
  "followedArtists": ["507f1f77bcf86cd799439014"],
  "createdAt": "2026-07-09T10:00:00.000Z",
  "updatedAt": "2026-07-09T12:30:00.000Z"
}
```

---

## 2. Artist

```javascript
// backend/src/models/Artist.js

const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nombre del artista es requerido'],
    trim: true,
    maxlength: [200, 'El nombre no puede exceder 200 caracteres']
  },
  
  imageUrl: {
    type: String,
    default: null
  },
  
  bio: {
    type: String,
    default: '',
    maxlength: [2000, 'La bio no puede exceder 2000 caracteres']
  },
  
  genres: [{
    type: String,
    trim: true
  }],
  
  monthlyListeners: {
    type: Number,
    default: 0
  }
  
}, {
  timestamps: true
});

// Índice para búsqueda de texto
artistSchema.index({ name: 'text', bio: 'text' });
artistSchema.index({ name: 1 });

module.exports = mongoose.model('Artist', artistSchema);
```

**Ejemplo de documento:**
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "name": "The Beatles",
  "imageUrl": "/uploads/images/beatles.jpg",
  "bio": "The Beatles fueron una banda de rock británica formada en Liverpool en 1960.",
  "genres": ["Rock", "Pop", "Psychedelic Rock"],
  "monthlyListeners": 45000000,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-07-09T10:00:00.000Z"
}
```

---

## 3. Album

```javascript
// backend/src/models/Album.js

const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Título del álbum es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  
  coverUrl: {
    type: String,
    default: null
  },
  
  releaseYear: {
    type: Number,
    required: [true, 'Año de lanzamiento es requerido'],
    min: [1900, 'El año debe ser mayor a 1900'],
    max: [2030, 'El año no puede ser mayor a 2030']
  },
  
  type: {
    type: String,
    enum: ['album', 'single', 'ep'],
    default: 'album'
  },
  
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: [true, 'Artista es requerido']
  },
  
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }]
  
}, {
  timestamps: true
});

// Índices
albumSchema.index({ title: 1 });
albumSchema.index({ artist: 1 });
albumSchema.index({ releaseYear: -1 });
albumSchema.index({ title: 'text' });

// Virtual para duración total del álbum
albumSchema.virtual('totalDuration').get(function() {
  // Se calculará manualmente o con aggregation
  return 0;
});

// Método para obtener el álbum con canciones populate
albumSchema.methods.getPopulatedAlbum = async function() {
  return this.populate([
    { path: 'songs', select: 'title duration trackNumber' },
    { path: 'artist', select: 'name imageUrl' }
  ]);
};

module.exports = mongoose.model('Album', albumSchema);
```

**Ejemplo de documento:**
```json
{
  "_id": "507f1f77bcf86cd799439030",
  "title": "Abbey Road",
  "coverUrl": "/uploads/images/abbey-road.jpg",
  "releaseYear": 1969,
  "type": "album",
  "artist": "507f1f77bcf86cd799439020",
  "songs": [
    "507f1f77bcf86cd799439040",
    "507f1f77bcf86cd799439041",
    "507f1f77bcf86cd799439042"
  ],
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-07-09T10:00:00.000Z"
}
```

---

## 4. Song

```javascript
// backend/src/models/Song.js

const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Título de la canción es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  
  duration: {
    type: Number,
    required: [true, 'Duración es requerida'],
    min: [1, 'La duración debe ser al menos 1 segundo']
    // Duración en segundos
  },
  
  trackNumber: {
    type: Number,
    default: 1
  },
  
  audioUrl: {
    type: String,
    required: [true, 'URL de audio es requerida']
  },
  
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
    required: [true, 'Álbum es requerido']
  },
  
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: [true, 'Artista es requerido']
  }
  
}, {
  timestamps: true
});

// Índices
songSchema.index({ title: 1 });
songSchema.index({ album: 1 });
songSchema.index({ artist: 1 });
songSchema.index({ title: 'text' });

// Virtual para formato de duración (MM:SS)
songSchema.virtual('formattedDuration').get(function() {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Método seguro para enviar al cliente
songSchema.methods.toSafeObject = function() {
  return {
    _id: this._id,
    title: this.title,
    duration: this.duration,
    trackNumber: this.trackNumber,
    audioUrl: this.audioUrl,
    album: this.album,
    artist: this.artist
  };
};

module.exports = mongoose.model('Song', songSchema);
```

**Ejemplo de documento:**
```json
{
  "_id": "507f1f77bcf86cd799439040",
  "title": "Come Together",
  "duration": 259,
  "trackNumber": 1,
  "audioUrl": "/uploads/audio/come-together.mp3",
  "album": "507f1f77bcf86cd799439030",
  "artist": "507f1f77bcf86cd799439020",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-07-09T10:00:00.000Z"
}
```

---

## 5. Playlist

```javascript
// backend/src/models/Playlist.js

const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nombre de playlist es requerido'],
    trim: true,
    maxlength: [200, 'El nombre no puede exceder 200 caracteres']
  },
  
  description: {
    type: String,
    default: '',
    maxlength: [300, 'La descripción no puede exceder 300 caracteres']
  },
  
  coverUrl: {
    type: String,
    default: null
    // Si es null, se genera un gradient basado en el nombre
  },
  
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Propietario es requerido']
  },
  
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  
  isPublic: {
    type: Boolean,
    default: true
  },
  
  isCollaborative: {
    type: Boolean,
    default: false
  },
  
  isLikedSongs: {
    type: Boolean,
    default: false
    // Flag especial para la playlist "Me gusta"
  }
  
}, {
  timestamps: true
});

// Índices
playlistSchema.index({ name: 1 });
playlistSchema.index({ owner: 1 });
playlistSchema.index({ isPublic: 1 });
playlistSchema.index({ name: 'text', description: 'text' });

// Método para agregar canción
playlistSchema.methods.addSong = async function(songId) {
  if (!this.songs.includes(songId)) {
    this.songs.push(songId);
    await this.save();
  }
  return this;
};

// Método para eliminar canción
playlistSchema.methods.removeSong = async function(songId) {
  this.songs = this.songs.filter(id => !id.equals(songId));
  await this.save();
  return this;
};

// Método para reordenar canciones
playlistSchema.methods.reorderSongs = async function(fromIndex, toIndex) {
  const song = this.songs.splice(fromIndex, 1)[0];
  this.songs.splice(toIndex, 0, song);
  await this.save();
  return this;
};

module.exports = mongoose.model('Playlist', playlistSchema);
```

**Ejemplo de documento:**
```json
{
  "_id": "507f1f77bcf86cd799439050",
  "name": "Chill Vibes",
  "description": "Canciones relajantes para estudiar o descansar",
  "coverUrl": null,
  "owner": "507f1f77bcf86cd799439011",
  "songs": [
    "507f1f77bcf86cd799439040",
    "507f1f77bcf86cd799439041"
  ],
  "isPublic": true,
  "isCollaborative": false,
  "isLikedSongs": false,
  "createdAt": "2026-07-01T10:00:00.000Z",
  "updatedAt": "2026-07-09T15:00:00.000Z"
}
```

**Playlist "Me gusta" especial:**
```json
{
  "_id": "507f1f77bcf86cd799439060",
  "name": "Me gusta",
  "description": "Tus canciones favoritas",
  "coverUrl": null,
  "owner": "507f1f77bcf86cd799439011",
  "songs": ["507f1f77bcf86cd799439040", "507f1f77bcf86cd799439042"],
  "isPublic": false,
  "isCollaborative": false,
  "isLikedSongs": true,
  "createdAt": "2026-07-01T10:00:00.000Z",
  "updatedAt": "2026-07-09T20:00:00.000Z"
}
```

---

## 6. LikedSong (Alternativa - Usar array en User)

> **Nota:** Para el MVP, el campo `likedSongs` en el modelo `User` es suficiente.
> Esta colección `LikedSong` es para tracking detallado si se necesita.

```javascript
// backend/src/models/LikedSong.js

const mongoose = require('mongoose');

const likedSongSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true
  },
  
  addedAt: {
    type: Date,
    default: Date.now
  }
  
}, {
  timestamps: true
});

// Índice único compuesto para evitar duplicados
likedSongSchema.index({ user: 1, song: 1 }, { unique: true });

// Índice para queries por usuario
likedSongSchema.index({ user: 1, addedAt: -1 });

module.exports = mongoose.model('LikedSong', likedSongSchema);
```

---

## Relaciones entre Colecciones

```
┌─────────┐       ┌─────────┐       ┌─────────┐
│  User   │       │Playlist │       │  Song   │
└────┬────┘       └────┬────┘       └────┬────┘
     │                 │                 │
     │ owns            │ contains        │ belongs to
     │                 │                 │
     ▼                 ▼                 ▼
┌─────────────────────────────────────────────────┐
│              Relationships Diagram               │
├─────────────────────────────────────────────────┤
│                                                 │
│   User ──────── owns ────────► Playlist          │
│     │                               │           │
│     │ follows                       │ contains  │
│     ▼                               ▼           │
│   Artist ◄─────── created ────────── Song        │
│                               │                 │
│                               │ in              │
│                               ▼                 │
│                             Album ────────► Artist
│                               │                 │
│                               │ contains        │
│                               ▼                 │
│                             Song ◄──────────────┘
│                               │
│   LikedSong ◄────── likes ────► User + Song
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Seed Data - Datos Iniciales

```javascript
// backend/src/data/seed.js

const mongoose = require('mongoose');
const { Artist, Album, Song } = require('../models');

// Artistas de ejemplo
const artists = [
  {
    name: 'The Beatles',
    imageUrl: '/uploads/images/beatles.jpg',
    bio: 'Legendaria banda británica de rock.',
    genres: ['Rock', 'Pop'],
    monthlyListeners: 45000000
  },
  {
    name: 'Queen',
    imageUrl: '/uploads/images/queen.jpg',
    bio: 'Banda británica de rock formada en 1970.',
    genres: ['Rock', 'Hard Rock'],
    monthlyListeners: 38000000
  },
  {
    name: 'Daft Punk',
    imageUrl: '/uploads/images/daft-punk.jpg',
    bio: 'Dúo francés de música electrónica.',
    genres: ['Electronic', 'House'],
    monthlyListeners: 25000000
  }
];

// Álbumes de ejemplo
const albums = [
  {
    title: 'Abbey Road',
    coverUrl: '/uploads/images/abbey-road.jpg',
    releaseYear: 1969,
    type: 'album',
    // artist se asignará dinámicamente
    songs: []
  },
  {
    title: 'A Night at the Opera',
    coverUrl: '/uploads/images/night-opera.jpg',
    releaseYear: 1975,
    type: 'album',
    songs: []
  },
  {
    title: 'Random Access Memories',
    coverUrl: '/uploads/images/ram.jpg',
    releaseYear: 2013,
    type: 'album',
    songs: []
  }
];

// Canciones de ejemplo
const songs = [
  {
    title: 'Come Together',
    duration: 259,
    trackNumber: 1,
    audioUrl: '/uploads/audio/come-together.mp3'
  },
  {
    title: 'Something',
    duration: 183,
    trackNumber: 9,
    audioUrl: '/uploads/audio/something.mp3'
  },
  {
    title: 'Bohemian Rhapsody',
    duration: 354,
    trackNumber: 1,
    audioUrl: '/uploads/audio/bohemian.mp3'
  },
  {
    title: 'Get Lucky',
    duration: 369,
    trackNumber: 1,
    audioUrl: '/uploads/audio/get-lucky.mp3'
  }
];

async function seedDatabase() {
  try {
    // Limpiar datos existentes
    await Artist.deleteMany({});
    await Album.deleteMany({});
    await Song.deleteMany({});
    
    // Crear artistas
    const createdArtists = await Artist.insertMany(artists);
    
    // Crear canciones primero
    const songsWithArtists = songs.map((song, index) => ({
      ...song,
      artist: createdArtists[index % createdArtists.length]._id,
      album: null // Se asignará después
    }));
    const createdSongs = await Song.insertMany(songsWithArtists);
    
    // Crear álbumes con canciones
    const albumsWithSongs = albums.map((album, index) => ({
      ...album,
      artist: createdArtists[index % createdArtists.length]._id,
      songs: createdSongs.slice(index * 2, index * 2 + 2).map(s => s._id)
    }));
    await Album.insertMany(albumsWithSongs);
    
    // Actualizar canciones con album
    for (let i = 0; i < createdSongs.length; i++) {
      createdSongs[i].album = albumsWithSongs[Math.floor(i / 2)]._id;
      await createdSongs[i].save();
    }
    
    console.log('✓ Base de datos poblada exitosamente');
    console.log(`  - ${createdArtists.length} artistas`);
    console.log(`  - ${albumsWithSongs.length} álbumes`);
    console.log(`  - ${createdSongs.length} canciones`);
    
  } catch (error) {
    console.error('Error poblando base de datos:', error);
  }
}

module.exports = seedDatabase;
```

---

## Queries Comunes (Aggregation Pipelines)

### Obtener álbum con canciones populate y duración total

```javascript
async function getAlbumWithDetails(albumId) {
  return await Album.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(albumId) } },
    {
      $lookup: {
        from: 'songs',
        localField: 'songs',
        foreignField: '_id',
        as: 'songsDetails'
      }
    },
    {
      $lookup: {
        from: 'artists',
        localField: 'artist',
        foreignField: '_id',
        as: 'artistDetails'
      }
    },
    {
      $addFields: {
        totalDuration: { $sum: '$songsDetails.duration' },
        artist: { $arrayElemAt: ['$artistDetails', 0] }
      }
    },
    {
      $project: {
        songsDetails: 0,
        artistDetails: 0
      }
    }
  ]);
}
```

### Obtener artista con top songs y discografía

```javascript
async function getArtistFullProfile(artistId) {
  return await Artist.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(artistId) } },
    {
      $lookup: {
        from: 'songs',
        pipeline: [
          { $sort: { trackNumber: 1 } },
          { $limit: 5 }
        ],
        as: 'topSongs'
      }
    },
    {
      $lookup: {
        from: 'albums',
        pipeline: [
          { $sort: { releaseYear: -1 } }
        ],
        as: 'discography'
      }
    }
  ]);
}
```

---

*Schema de base de datos: 2026-07-09*
