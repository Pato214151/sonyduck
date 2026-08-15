import { create } from 'zustand';
import type { Song, RepeatMode } from '@/types';
import { shuffleArray } from '@/lib/utils';

interface PlayerState {
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
  audioElement: HTMLAudioElement | null;

  // Actions
  playSong: (song: Song, queue?: Song[]) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  setAudioElement: (audio: HTMLAudioElement) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  clearQueue: () => void;
}

const DEFAULT_VOLUME = 0.7;

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  queue: [],
  queueIndex: 0,
  progress: 0,
  duration: 0,
  volume: DEFAULT_VOLUME,
  isMuted: false,
  isShuffled: false,
  repeatMode: 'off',
  audioElement: null,

  setAudioElement: (audio: HTMLAudioElement) => {
    audio.volume = DEFAULT_VOLUME;
    audio.addEventListener('timeupdate', () => {
      set({ progress: audio.currentTime });
    });
    audio.addEventListener('loadedmetadata', () => {
      set({ duration: audio.duration });
    });
    audio.addEventListener('ended', () => {
      const { repeatMode, next } = get();
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        next();
      }
    });
    audio.addEventListener('error', () => {
      console.error('Audio playback error');
      get().next();
    });
    set({ audioElement: audio });
  },

  playSong: (song: Song, queue?: Song[]) => {
    const state = get();
    let newQueue = queue || state.queue;
    let newIndex = newQueue.findIndex(s => s.id === song.id);

    if (newIndex === -1) {
      newQueue = [song, ...newQueue];
      newIndex = 0;
    }

    // Shuffle if enabled
    if (state.isShuffled && queue) {
      const currentSong = newQueue[newIndex];
      const otherSongs = newQueue.filter((_, i) => i !== newIndex);
      newQueue = [currentSong, ...shuffleArray(otherSongs)];
      newIndex = 0;
    }

    set({
      currentSong: song,
      queue: newQueue,
      queueIndex: newIndex,
      isPlaying: true,
      progress: 0,
    });

    const audio = state.audioElement;
    if (audio) {
      audio.src = song.audioUrl;
      audio.play().catch(console.error);
    }
  },

  play: () => {
    const audio = get().audioElement;
    if (audio && get().currentSong) {
      audio.play().catch(console.error);
      set({ isPlaying: true });
    }
  },

  pause: () => {
    const audio = get().audioElement;
    if (audio) {
      audio.pause();
    }
    set({ isPlaying: false });
  },

  togglePlay: () => {
    if (get().isPlaying) {
      get().pause();
    } else {
      get().play();
    }
  },

  next: () => {
    const { queue, queueIndex, repeatMode } = get();
    const hasNext = queueIndex < queue.length - 1;

    if (hasNext) {
      const nextIndex = queueIndex + 1;
      const nextSong = queue[nextIndex];
      set({ currentSong: nextSong, queueIndex: nextIndex, progress: 0 });
      const audio = get().audioElement;
      if (audio) {
        audio.src = nextSong.audioUrl;
        audio.play().catch(console.error);
      }
    } else if (repeatMode === 'all' && queue.length > 0) {
      const firstSong = queue[0];
      set({ currentSong: firstSong, queueIndex: 0, progress: 0 });
      const audio = get().audioElement;
      if (audio) {
        audio.src = firstSong.audioUrl;
        audio.play().catch(console.error);
      }
    } else {
      set({ isPlaying: false });
    }
  },

  previous: () => {
    const { queue, queueIndex, progress } = get();
    
    // If more than 3 seconds played, restart current song
    if (progress > 3) {
      const audio = get().audioElement;
      if (audio) {
        audio.currentTime = 0;
        set({ progress: 0 });
      }
      return;
    }

    if (queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      const prevSong = queue[prevIndex];
      set({ currentSong: prevSong, queueIndex: prevIndex, progress: 0 });
      const audio = get().audioElement;
      if (audio) {
        audio.src = prevSong.audioUrl;
        audio.play().catch(console.error);
      }
    } else if (queue.length > 0) {
      const lastSong = queue[queue.length - 1];
      set({ currentSong: lastSong, queueIndex: queue.length - 1, progress: 0 });
      const audio = get().audioElement;
      if (audio) {
        audio.src = lastSong.audioUrl;
        audio.play().catch(console.error);
      }
    }
  },

  seek: (time: number) => {
    const audio = get().audioElement;
    if (audio) {
      audio.currentTime = time;
      set({ progress: time });
    }
  },

  setVolume: (volume: number) => {
    const audio = get().audioElement;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (audio) {
      audio.volume = clampedVolume;
    }
    set({ volume: clampedVolume, isMuted: clampedVolume === 0 });
  },

  toggleMute: () => {
    const audio = get().audioElement;
    const { isMuted, volume } = get();
    
    if (isMuted) {
      if (audio) audio.volume = volume;
      set({ isMuted: false });
    } else {
      if (audio) audio.volume = 0;
      set({ isMuted: true });
    }
  },

  toggleShuffle: () => {
    const { isShuffled, queue, currentSong } = get();
    let newQueue: Song[];

    if (!isShuffled && queue.length > 1) {
      const currentSongIndex = queue.findIndex(s => s.id === currentSong?.id);
      const otherSongs = queue.filter((_, i) => i !== currentSongIndex);
      newQueue = currentSong ? [currentSong, ...shuffleArray(otherSongs)] : queue;
    } else {
      newQueue = [...queue].sort((a, b) => a.trackNumber - b.trackNumber);
    }

    const newIndex = newQueue.findIndex(s => s.id === currentSong?.id);
    set({ isShuffled: !isShuffled, queue: newQueue, queueIndex: Math.max(0, newIndex) });
  },

  cycleRepeatMode: () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(get().repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    set({ repeatMode: modes[nextIndex] });
  },

  setProgress: (progress: number) => {
    set({ progress });
  },

  setDuration: (duration: number) => {
    set({ duration });
  },

  clearQueue: () => {
    const audio = get().audioElement;
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    set({
      currentSong: null,
      queue: [],
      queueIndex: 0,
      isPlaying: false,
      progress: 0,
      duration: 0,
    });
  },
}));
