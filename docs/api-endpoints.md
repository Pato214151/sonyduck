# API Endpoints - SonYDuck

Base URL: `http://localhost:5000/api`

---

## Autenticación

### POST /auth/register
Registrar un nuevo usuario.

**Request Body:**
```json
{
  "name": "Julian",
  "email": "julian@example.com",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Julian",
      "email": "julian@example.com",
      "avatar": null
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errores:**
- `400`: Datos inválidos o email ya registrado

---

### POST /auth/login
Iniciar sesión.

**Request Body:**
```json
{
  "email": "julian@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Julian",
      "email": "julian@example.com",
      "avatar": null
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errores:**
- `401`: Credenciales inválidas

---

### POST /auth/refresh
Renovar access token usando refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### POST /auth/logout
Cerrar sesión (invalidar refresh token).

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

### GET /auth/me
Obtener usuario actual.

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Julian",
    "email": "julian@example.com",
    "avatar": null,
    "likedSongs": ["507f1f77bcf86cd799439012"],
    "followedArtists": [],
    "createdAt": "2026-07-09T10:00:00.000Z"
  }
}
```

---

## Usuarios

### GET /users/:id
Obtener perfil de usuario.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Julian",
    "avatar": null,
    "playlists": ["507f1f77bcf86cd799439050"],
    "followers": 0,
    "following": 0
  }
}
```

---

### PUT /users/:id
Actualizar perfil de usuario.

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**
```json
{
  "name": "Julian Updated",
  "avatar": "http://example.com/new-avatar.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Julian Updated",
    "avatar": "http://example.com/new-avatar.jpg"
  }
}
```

---

### GET /users/:id/playlists
Obtener playlists de un usuario.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "name": "Chill Vibes",
      "coverUrl": null,
      "songCount": 12,
      "isPublic": true
    }
  ]
}
```

---

### GET /users/:id/liked
Obtener canciones favoritas del usuario.

**Headers:** `Authorization: Bearer <accessToken>`

**Query Parameters:**
- `limit` (optional): número de resultados (default: 50)
- `offset` (optional): paginación

**Response (200):**
```json
{
  "success": true,
  "data": {
    "songs": [
      {
        "_id": "507f1f77bcf86cd799439040",
        "title": "Come Together",
        "duration": 259,
        "artist": { "name": "The Beatles" },
        "album": { "title": "Abbey Road", "coverUrl": "..." }
      }
    ],
    "total": 25
  }
}
```

---

## Canciones

### GET /songs
Listar canciones (con paginación).

**Query Parameters:**
- `limit` (optional): default 20
- `offset` (optional): default 0
- `album` (optional): filtrar por álbum
- `artist` (optional): filtrar por artista

**Response (200):**
```json
{
  "success": true,
  "data": {
    "songs": [
      {
        "_id": "507f1f77bcf86cd799439040",
        "title": "Come Together",
        "duration": 259,
        "trackNumber": 1,
        "artist": {
          "_id": "507f1f77bcf86cd799439020",
          "name": "The Beatles"
        },
        "album": {
          "_id": "507f1f77bcf86cd799439030",
          "title": "Abbey Road",
          "coverUrl": "..."
        }
      }
    ],
    "pagination": {
      "total": 100,
      "limit": 20,
      "offset": 0
    }
  }
}
```

---

### GET /songs/:id
Obtener detalle de una canción.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439040",
    "title": "Come Together",
    "duration": 259,
    "trackNumber": 1,
    "audioUrl": "/uploads/audio/come-together.mp3",
    "artist": {
      "_id": "507f1f77bcf86cd799439020",
      "name": "The Beatles",
      "imageUrl": "..."
    },
    "album": {
      "_id": "507f1f77bcf86cd799439030",
      "title": "Abbey Road",
      "coverUrl": "..."
    }
  }
}
```

---

### GET /songs/search
Buscar canciones.

**Query Parameters:**
- `q`: término de búsqueda
- `limit` (optional): default 20

**Response (200):**
```json
{
  "success": true,
  "data": {
    "songs": [
      {
        "_id": "507f1f77bcf86cd799439040",
        "title": "Come Together",
        "artist": { "name": "The Beatles" },
        "album": { "title": "Abbey Road" }
      }
    ],
    "total": 5
  }
}
```

---

## Álbumes

### GET /albums
Listar álbumes.

**Query Parameters:**
- `limit` (optional): default 20
- `offset` (optional): default 0
- `artist` (optional): filtrar por artista
- `type` (optional): album | single | ep

**Response (200):**
```json
{
  "success": true,
  "data": {
    "albums": [
      {
        "_id": "507f1f77bcf86cd799439030",
        "title": "Abbey Road",
        "coverUrl": "...",
        "releaseYear": 1969,
        "type": "album",
        "artist": {
          "_id": "507f1f77bcf86cd799439020",
          "name": "The Beatles"
        },
        "songCount": 17,
        "totalDuration": 2820
      }
    ],
    "pagination": {
      "total": 50,
      "limit": 20,
      "offset": 0
    }
  }
}
```

---

### GET /albums/:id
Obtener álbum con canciones.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439030",
    "title": "Abbey Road",
    "coverUrl": "...",
    "releaseYear": 1969,
    "type": "album",
    "artist": {
      "_id": "507f1f77bcf86cd799439020",
      "name": "The Beatles",
      "imageUrl": "..."
    },
    "songs": [
      {
        "_id": "507f1f77bcf86cd799439040",
        "title": "Come Together",
        "duration": 259,
        "trackNumber": 1
      },
      {
        "_id": "507f1f77bcf86cd799439041",
        "title": "Something",
        "duration": 183,
        "trackNumber": 9
      }
    ],
    "totalDuration": 2820
  }
}
```

---

### GET /albums/search
Buscar álbumes.

**Query Parameters:**
- `q`: término de búsqueda

**Response (200):**
```json
{
  "success": true,
  "data": {
    "albums": [...]
  }
}
```

---

## Artistas

### GET /artists
Listar artistas.

**Query Parameters:**
- `limit` (optional): default 20
- `offset` (optional): default 0

**Response (200):**
```json
{
  "success": true,
  "data": {
    "artists": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "name": "The Beatles",
        "imageUrl": "...",
        "genres": ["Rock", "Pop"],
        "monthlyListeners": 45000000
      }
    ],
    "pagination": {...}
  }
}
```

---

### GET /artists/:id
Obtener perfil completo de artista.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "name": "The Beatles",
    "imageUrl": "...",
    "bio": "Legendaria banda británica...",
    "genres": ["Rock", "Pop"],
    "monthlyListeners": 45000000,
    "topSongs": [
      {
        "_id": "507f1f77bcf86cd799439040",
        "title": "Come Together",
        "duration": 259
      }
    ],
    "discography": [
      {
        "_id": "507f1f77bcf86cd799439030",
        "title": "Abbey Road",
        "coverUrl": "...",
        "releaseYear": 1969
      }
    ]
  }
}
```

---

### GET /artists/search
Buscar artistas.

**Query Parameters:**
- `q`: término de búsqueda

---

## Playlists

### GET /playlists
Listar playlists (propias + públicas).

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "name": "Chill Vibes",
      "description": "Canciones relajantes",
      "coverUrl": null,
      "songCount": 12,
      "isPublic": true
    }
  ]
}
```

---

### POST /playlists
Crear nueva playlist.

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**
```json
{
  "name": "Mi Playlist",
  "description": "Descripción opcional",
  "isPublic": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439060",
    "name": "Mi Playlist",
    "description": "Descripción opcional",
    "coverUrl": null,
    "owner": "507f1f77bcf86cd799439011",
    "songs": [],
    "isPublic": true,
    "isCollaborative": false
  }
}
```

---

### GET /playlists/:id
Obtener playlist con canciones.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439050",
    "name": "Chill Vibes",
    "description": "Canciones relajantes",
    "coverUrl": null,
    "owner": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Julian"
    },
    "songs": [
      {
        "_id": "507f1f77bcf86cd799439040",
        "title": "Come Together",
        "duration": 259,
        "artist": { "name": "The Beatles" }
      }
    ],
    "isPublic": true,
    "isCollaborative": false,
    "totalDuration": 1240
  }
}
```

---

### PUT /playlists/:id
Actualizar playlist.

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**
```json
{
  "name": "Nuevo Nombre",
  "description": "Nueva descripción",
  "coverUrl": "http://...",
  "isPublic": false
}
```

---

### DELETE /playlists/:id
Eliminar playlist.

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**
```json
{
  "success": true,
  "message": "Playlist eliminada"
}
```

---

### POST /playlists/:id/tracks
Agregar canción(es) a playlist.

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**
```json
{
  "songId": "507f1f77bcf86cd799439040"
}
```

O múltiples:
```json
{
  "songIds": ["507f1f77bcf86cd799439040", "507f1f77bcf86cd799439041"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Canción agregada a la playlist"
}
```

---

### DELETE /playlists/:id/tracks/:songId
Eliminar canción de playlist.

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**
```json
{
  "success": true,
  "message": "Canción eliminada de la playlist"
}
```

---

## Likes (Favoritos)

### POST /users/:userId/like/:songId
Dar like a una canción.

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**
```json
{
  "success": true,
  "message": "Canción agregada a Me gusta"
}
```

---

### DELETE /users/:userId/like/:songId
Quitar like a una canción.

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**
```json
{
  "success": true,
  "message": "Canción eliminada de Me gusta"
}
```

---

### GET /users/:userId/like/:songId/check
Verificar si una canción tiene like.

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "isLiked": true
  }
}
```

---

## Errores Comunes

### Formato de Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El email es requerido",
    "details": [
      { "field": "email", "message": "Email es requerido" }
    ]
  }
}
```

### Códigos de Error
| Código | HTTP Status | Descripción |
|--------|-------------|-------------|
| VALIDATION_ERROR | 400 | Datos de entrada inválidos |
| UNAUTHORIZED | 401 | No autenticado |
| FORBIDDEN | 403 | No autorizado para esta acción |
| NOT_FOUND | 404 | Recurso no encontrado |
| CONFLICT | 409 | Recurso ya existe (ej: email duplicado) |
| RATE_LIMIT | 429 | Demasiadas solicitudes |
| SERVER_ERROR | 500 | Error interno del servidor |

---

## Rate Limiting

- **Autenticación:** 5 requests por minuto por IP
- **General:** 100 requests por minuto por usuario
- **Búsqueda:** 30 requests por minuto por usuario

Los headers de respuesta incluyen:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1623456789
```

---

## Autenticación

Todas las rutas protegidas requieren:
```
Authorization: Bearer <accessToken>
```

El token expira en 15 minutos. Usa `/auth/refresh` para obtener uno nuevo.

---

*API Endpoints: 2026-07-09*
*Total de endpoints: 28*
