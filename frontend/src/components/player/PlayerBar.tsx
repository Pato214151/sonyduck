/**
 * Barra del reproductor fija abajo: canción actual, like, controles,
 * barra de progreso arrastrable y volumen. Lee y controla el playerStore.
 */

import { useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, SkipForward as SkipFwd10, SkipBack as SkipBwd10 } from 'lucide-react';
import { usePlayerStore } from '@/stores/playerStore';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

/** Controles de reproducción de la canción actual. */
export function PlayerBar() {
  const { currentSong, isPlaying, progress, duration, volume, isMuted, togglePlay, next, previous, seek, setVolume, toggleMute } = usePlayerStore();
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (currentSong) {
      api.get(`/songs/${currentSong.id}`).then(res => {
        setIsLiked(res.data.data?.isLiked || false);
      }).catch(() => {});
    }
  }, [currentSong]);

  const handleLike = async () => {
    if (!currentSong) return;
    try {
      if (isLiked) {
        await api.delete(`/likes/songs/${currentSong.id}`);
        setIsLiked(false);
      } else {
        await api.post(`/likes/songs/${currentSong.id}`);
        setIsLiked(true);
      }
    } catch (e) { console.error(e); }
  };

  if (!currentSong) {
    return (
      <div className="h-20 bg-sonyduck-black border-t border-sonyduck-border flex items-center justify-center">
        <p className="text-text-subtle text-sm">Selecciona una cancion para reproducir</p>
      </div>
    );
  }

  const seekFromClientX = (clientX: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    seek(pct * duration);
  };

  const handleSeekMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    seekFromClientX(e.clientX, bar);
    const onMove = (ev: MouseEvent) => seekFromClientX(ev.clientX, bar);
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <div className="h-20 bg-sonyduck-black border-t border-sonyduck-border flex items-center px-4">
      {/* Song info */}
      <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
        <img src={currentSong.album?.coverUrl || `https://picsum.photos/seed/${currentSong.id}/60/60`} alt={currentSong.title} className="w-14 h-14 rounded" />
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate text-sm">{currentSong.title}</p>
          <p className="text-text-subtle text-xs truncate">{currentSong.artist?.name}</p>
        </div>
        <button onClick={handleLike} className={cn('p-2 rounded-full transition', isLiked ? 'text-sonyduck-red' : 'text-text-subtle hover:text-white')}>
          <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1 max-w-2xl">
        <div className="flex items-center gap-2">
          <button onClick={() => seek(Math.max(0, progress - 10))} className="text-text-subtle hover:text-white p-2">
            <SkipBwd10 className="w-4 h-4" />
          </button>
          <button onClick={previous} className="text-text-subtle hover:text-white p-2">
            <SkipBack className="w-5 h-5" />
          </button>
          <button onClick={togglePlay} className="p-3 bg-white rounded-full hover:scale-105 transition">
            {isPlaying ? <Pause className="w-5 h-5 text-black" fill="black" /> : <Play className="w-5 h-5 text-black" fill="black" />}
          </button>
          <button onClick={next} className="text-text-subtle hover:text-white p-2">
            <SkipForward className="w-5 h-5" />
          </button>
          <button onClick={() => seek(Math.min(duration, progress + 10))} className="text-text-subtle hover:text-white p-2">
            <SkipFwd10 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-text-subtle w-10 text-right">{formatDuration(progress)}</span>
          <div onMouseDown={handleSeekMouseDown} className="flex-1 h-1 bg-sonyduck-medium rounded-full cursor-pointer group">
            <div className="h-full bg-white rounded-full group-hover:bg-sonyduck-red transition" style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }} />
          </div>
          <span className="text-xs text-text-subtle w-10">{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="w-1/4 flex items-center justify-end gap-2 min-w-[120px]">
        <button onClick={toggleMute} className="text-text-subtle hover:text-white p-2">
          {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-24 accent-sonyduck-red" />
      </div>
    </div>
  );
}