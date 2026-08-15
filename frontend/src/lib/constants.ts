export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  LIBRARY: '/library',
  ALBUM: '/album',
  ARTIST: '/artist',
  PLAYLIST: '/playlist',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;

export const KEYBOARD_SHORTCUTS = {
  PLAY_PAUSE: ' ',
  NEXT: 'ArrowRight',
  PREVIOUS: 'ArrowLeft',
  VOLUME_UP: 'ArrowUp',
  VOLUME_DOWN: 'ArrowDown',
  MUTE: 'm',
  SHUFFLE: 's',
} as const;
