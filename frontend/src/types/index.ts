// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Artist Types
export interface Artist {
  id: string;
  name: string;
  imageUrl: string | null;
  bio: string | null;
  genres: string[];
  monthlyListeners: number;
  createdAt: string;
  albumCount?: number;
  songCount?: number;
  followerCount?: number;
  isFollowing?: boolean;
}

// Album Types
export type AlbumType = 'ALBUM' | 'SINGLE' | 'EP';

export interface Album {
  id: string;
  title: string;
  coverUrl: string | null;
  releaseYear: number;
  type: AlbumType;
  createdAt: string;
  artist: Pick<Artist, 'id' | 'name' | 'imageUrl'>;
  songs?: Song[];
  songCount?: number;
  totalDuration?: string;
}

// Song Types
export interface Song {
  id: string;
  title: string;
  duration: number;
  trackNumber: number;
  audioUrl: string;
  createdAt: string;
  album: Pick<Album, 'id' | 'title' | 'coverUrl'>;
  artist: Pick<Artist, 'id' | 'name'>;
  isLiked?: boolean;
  likedAt?: string;
}

// Playlist Types
export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  isPublic: boolean;
  isCollaborative: boolean;
  isLikedSongs: boolean;
  createdAt: string;
  updatedAt: string;
  owner: Pick<User, 'id' | 'name'>;
  songs?: Song[];
  songCount?: number;
  totalDuration?: string;
}

// Player Types
export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  queueIndex: number;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: RepeatMode;
}
