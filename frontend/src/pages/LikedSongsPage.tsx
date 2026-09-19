/** Página /liked: canciones con Me gusta. */

import { useEffect, useState } from 'react';
import { Play, Heart } from 'lucide-react';
import { api } from '@/lib/api';
import { usePlayerStore } from '@/stores/playerStore';
import { formatDuration } from '@/lib/utils';

/** Lista y reproduce tus Me gusta. */
export function LikedSongsPage() {
  const [songs, setSongs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { playSong } = usePlayerStore();

  useEffect(() => {
    api.get('/likes/songs').then(res => setSongs(res.data.data?.songs || [])).catch(() => setSongs([])).finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="py-6">
      <div className="flex items-end gap-6 mb-8 bg-gradient-to-b from-purple-700/50 to-transparent p-6 rounded-2xl">
        <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-sonyduck-red to-purple-600 flex items-center justify-center shadow-2xl">
          <Heart className="w-24 h-24 text-white" fill="white" />
        </div>
        <div>
          <p className="text-text-subtle text-sm">PLAYLIST</p>
          <h1 className="text-5xl font-bold text-white mb-3">Tus Me Gusta</h1>
          <p className="text-text-subtle">{songs.length} canciones que amas</p>
        </div>
      </div>

      {songs.length > 0 && (
        <>
          <button onClick={() => playSong(songs[0], songs)} className="mb-6 bg-sonyduck-red hover:bg-sonyduck-red-hover text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 shadow-red-glow">
            <Play className="w-5 h-5" fill="white" /> Reproducir
          </button>
          <div className="space-y-1">
            {songs.map((song: any, i: number) => (
              <button key={song.id} onClick={() => playSong(song, songs)} className="w-full grid grid-cols-[auto_1fr_auto] items-center gap-4 p-3 rounded-lg hover:bg-sonyduck-medium text-left">
                <span className="text-text-subtle w-6 text-center">{i + 1}</span>
                <div className="flex items-center gap-3 min-w-0">
                  <img src={song.album?.coverUrl || `https://picsum.photos/seed/${song.id}/40/40`} className="w-10 h-10 rounded" alt="" />
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{song.title}</p>
                    <p className="text-sm text-text-subtle truncate">{song.artist?.name}</p>
                  </div>
                </div>
                <span className="text-text-subtle text-sm">{formatDuration(song.duration)}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {songs.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-text-subtle mx-auto mb-4" />
          <p className="text-text-subtle">Aun no tienes canciones que te gusten. Dale al corazon en cualquier cancion!</p>
        </div>
      )}
    </div>
  );
}