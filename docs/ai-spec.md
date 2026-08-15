# 🎵 SONYDUCK AI SYSTEM - Especificación Técnica

> Sistema de Inteligencia Artificial para recomendaciones personalizadas y análisis de gustos musicales.

---

## 1. Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SONYDUCK AI ENGINE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  INPUT LAYER          PROCESSING LAYER         OUTPUT LAYER         │
│  ───────────         ───────────────         ───────────          │
│                                                                     │
│  User Actions ────▶  AI Services  ───────▶  Personalized          │
│  • Likes              • Analyzer        • Sections                │
│  • Plays              • Recommender     • Playlists                │
│  • Skips              • Mood           • Insights                 │
│  • Searches           • Generator       • Discover                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Stack Tecnológico de IA

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| Profile Analyzer | Scoring Algorithm | Analiza historial de usuario |
| Recommendation Engine | Content-Based + Collaborative | Recomendaciones híbridas |
| Mood Detector | Tags predefinidos + ML scoring | Detecta estado de ánimo |
| Smart Playlists | Rule-based + Randomness | Playlists inteligentes |
| Audio Features | Metadata + Web Audio API | Análisis de audio |

---

## 3. Modelos de Datos de IA

### 3.1 Song con Features de IA

```typescript
interface SongFeatures {
  // Audio Features (extraídos o estimados)
  tempo: number;           // BPM (60-200)
  energy: number;          // 0-1 (baja a alta energía)
  danceability: number;     // 0-1 (qué tan bailable)
  valence: number;          // 0-1 (negativo a positivo/emocional)
  acousticness: number;    // 0-1 (acústico a electrónico)
  
  // Metadata enriquecida
  mood: Mood[];
  tags: string[];
  language: string;
  instrumental: boolean;
  
  // Era y contexto
  decade: string;
  occasion: Occasion[];
}

type Mood = 'happy' | 'energetic' | 'chill' | 'sad' | 'romantic' | 'epic' | 'dark' | 'peaceful' | 'angry' | 'nostalgic';
type Occasion = 'party' | 'study' | 'workout' | 'chill' | 'commute' | 'focus' | 'sleep' | 'romance';
```

### 3.2 User Taste Profile

```typescript
interface UserTasteProfile {
  userId: string;
  
  // Análisis de géneros
  topGenres: { genre: string; score: number }[];
  
  // Análisis de artistas
  topArtists: { artistId: string; score: number }[];
  
  // Preferencias musicales
  moodPreference: Mood;
  energyPreference: number;
  
  // Temporal
  preferredDecade: string;
  
  // Listening patterns
  avgSessionDuration: number;
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  
  // Freshness
  lastUpdated: Date;
  dataPoints: number;
}
```

---

## 4. Algoritmos de Recomendación

### 4.1 Content-Based Filtering

```typescript
// Calcula similitud entre canciones basada en features
function calculateSongSimilarity(song1: Song, song2: Song): number {
  const genreWeight = 0.3;
  const moodWeight = 0.25;
  const energyWeight = 0.2;
  const tempoWeight = 0.15;
  const decadeWeight = 0.1;
  
  // Similitud de géneros (Jaccard)
  const genreSim = jaccardSimilarity(song1.genres, song2.genres);
  
  // Similitud de moods (Jaccard)
  const moodSim = jaccardSimilarity(song1.moods, song2.moods);
  
  // Similitud de energía (euclidiana normalizada)
  const energySim = 1 - Math.abs(song1.energy - song2.energy);
  
  // Similitud de tempo (euclidiana normalizada)
  const tempoSim = 1 - Math.abs(song1.tempo - song2.tempo) / 140;
  
  // Similitud de década
  const decadeSim = song1.decade === song2.decade ? 1 : 0;
  
  return (
    genreWeight * genreSim +
    moodWeight * moodSim +
    energyWeight * energySim +
    tempoWeight * tempoSim +
    decadeWeight * decadeSim
  );
}
```

### 4.2 Scoring Algorithm para Perfil de Usuario

```typescript
// Ponderación para análisis de gustos
const ACTION_WEIGHTS = {
  PLAY: 1,      // Escuchó completa
  LIKE: 3,      // Dio like
  SKIP: -1,     // Saltó antes de 30s
  SEARCH: 2,    // Buscó directamente
  PLAYLIST: 2,  // Agregó a playlist
};

function calculateUserScore(actions: UserAction[]): UserTasteProfile {
  const genreScores: Record<string, number> = {};
  const artistScores: Record<string, number> = {};
  const moodScores: Record<string, number> = {};
  
  for (const action of actions) {
    const weight = ACTION_WEIGHTS[action.type];
    const song = action.song;
    
    // Acumular scores de géneros
    for (const genre of song.genres) {
      genreScores[genre] = (genreScores[genre] || 0) + weight;
    }
    
    // Acumular scores de artistas
    artistScores[song.artistId] = 
      (artistScores[song.artistId] || 0) + weight;
    
    // Acumular scores de moods
    for (const mood of song.moods) {
      moodScores[mood] = (moodScores[mood] || 0) + weight;
    }
  }
  
  // Ordenar y normalizar
  const topGenres = Object.entries(genreScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre, score]) => ({ genre, score: normalize(score) }));
  
  // ... similar para artists y moods
  
  return {
    topGenres,
    topArtists,
    moodPreference: getTop(moodScores),
    // ...
  };
}
```

---

## 5. API Endpoints de IA

### Recomendaciones
```
GET /api/ai/recommendations
GET /api/ai/recommendations/made-for-you
GET /api/ai/recommendations/similar-to?songId=xxx
GET /api/ai/recommendations/discover?genre=rock
```

### Mood
```
GET /api/ai/mood/playlists?mood=chill
GET /api/ai/mood/detect (basado en hora y patrones)
```

### Perfil
```
GET /api/ai/profile
GET /api/ai/profile/insights
```

---

## 6. Sistema de Audio

### 6.1 Formatos Soportados
- MP3 (preferido)
- OGG/Vorbis
- FLAC (alta calidad)
- AAC

### 6.2 Extracción de Features de Audio

```typescript
// Usando Web Audio API para análisis en cliente
async function extractAudioFeatures(audioUrl: string): Promise<AudioFeatures> {
  const audioContext = new AudioContext();
  const response = await fetch(audioUrl);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // Análisis FFT para energía y tempo estimado
  const data = audioBuffer.getChannelData(0);
  const features = analyzeAudioData(data);
  
  return {
    energy: features.energy,
    tempo: estimateTempo(features),
    danceability: features.danceability,
    valence: features.valence,
  };
}
```

### 6.3 Metadata de Canciones (Pre-calculada)

Para el MVP, usamos metadata pre-calculada:

```typescript
const SONG_FEATURES_DB = {
  'come-together': {
    tempo: 108,
    energy: 0.7,
    danceability: 0.5,
    valence: 0.6,
    mood: ['epic', 'nostalgic'],
    tags: ['classic-rock', 'guitar', 'drums'],
    decade: '60s',
    occasion: ['party', 'workout'],
  },
  // ...
};
```

---

## 7. Playlists Inteligentes

### 7.1 Tipos de Playlists Generadas

| Tipo | Descripción | Algoritmo |
|------|-------------|-----------|
| Made for You | Personalizadas según historial | Collaborative + Content |
| Mood Mix | Basadas en estado de ánimo | Content-Based |
| Discover Weekly | Nuevos artistas similares | Collaborative Filtering |
| Daily Mix | Mix de genres favoritos | Rule-based + Shuffle |
| Time Capsule | Songs de era preferida | Decade filter + Random |

### 7.2 Generador de Playlists

```typescript
function generateSmartPlaylist(
  user: UserProfile,
  type: PlaylistType,
  options: PlaylistOptions
): Playlist {
  let songs: Song[] = [];
  let reason: string;
  
  switch (type) {
    case 'MADE_FOR_YOU':
      songs = getRecommendationsForUser(user, options.limit);
      reason = `Because you love ${user.topGenres[0].genre} and ${user.topArtists[0].name}`;
      break;
      
    case 'MOOD_MIX':
      songs = getSongsByMood(options.mood, options.limit);
      reason = `Songs for your ${options.mood} mood`;
      break;
      
    case 'DISCOVER':
      songs = getDiscoverForUser(user, options.limit);
      reason = `New artists like ${user.topArtists[0].name}`;
      break;
  }
  
  return {
    id: generateId(),
    name: generatePlaylistName(type),
    description: reason,
    songs,
    type: 'smart',
    createdAt: new Date(),
  };
}
```

---

## 8. Detección de Mood

### 8.1 Factores de Detección

1. **Hora del día**
   - Morning (6-12): energizante, feliz
   - Afternoon (12-18): variado, productivo
   - Evening (18-22): relajante, social
   - Night (22-6): introspectivo, romántico

2. **Patrones de escucha**
   - Songs con skip rápido → triste/irritado
   - Songs repetidos → nostálgico
   - Exploración activa → curioso/interesado

3. **Metadata de songs**
   - Valence alto + energy alto → happy/energetic
   - Valence bajo + energy alto → angry/tense
   - Valence alto + energy bajo → peaceful/romantic
   - Valence bajo + energy bajo → sad/chill

### 8.2 Algoritmo de Detección

```typescript
function detectMood(
  currentTime: Date,
  recentSongs: Song[],
  skipRate: number,
  repeatRate: number
): MoodProfile {
  // Factor de hora
  const timeMood = getTimeMood(currentTime);
  
  // Factor de songs recientes
  const songMood = averageMood(recentSongs);
  
  // Factor de comportamiento
  let behaviorMood: Mood;
  if (skipRate > 0.5) {
    behaviorMood = 'angry';
  } else if (repeatRate > 0.3) {
    behaviorMood = 'nostalgic';
  } else if (recentSongs.length > 10) {
    behaviorMood = 'energetic';
  } else {
    behaviorMood = 'chill';
  }
  
  // Combinar factores (ponderación)
  return {
    primary: weightedVote([timeMood, songMood, behaviorMood]),
    secondary: getSecondaryMoods([timeMood, songMood, behaviorMood]),
    confidence: calculateConfidence([timeMood, songMood, behaviorMood]),
  };
}
```

---

## 9. Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTION                             │
│   Like, Play, Skip, Search, Create Playlist, etc.            │
└─────────────────────────────┬─────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EVENT COLLECTOR                              │
│   Recibe acciones, las registra con timestamp                  │
└─────────────────────────────┬─────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ USER PROFILE    │ │ PLAY HISTORY    │ │ RECOMMENDATION  │
│ ANALYZER       │ │ TRACKER         │ │ ENGINE          │
│                 │ │                 │ │                 │
│ Actualiza       │ │ Registra songs  │ │ Pre-calcula     │
│ gustos cada     │ │ escuchados,      │ │ recomendaciones │
│ acción          │ │ skips, likes     │ │ basadas en      │
│                 │ │                 │ │ perfil          │
└─────────────────┘ └─────────────────┘ └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI SERVICES                               │
│   Recomendaciones, Mood Detection, Smart Playlists              │
└─────────────────────────────┬─────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND                                  │
│   Home Sections, Discover, Mood Playlists, Insights              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Mejoras Futuras

- [ ] Integración con OpenAI para NLP en búsqueda
- [ ] Análisis de letras de canciones (sentiment analysis)
- [ ] Collaborative filtering avanzado (matrix factorization)
- [ ] Deep learning para extracción de features de audio
- [ ] Recomendaciones en tiempo real basadas en contexto

---

*Versión 1.0 - 2026-07-09*
