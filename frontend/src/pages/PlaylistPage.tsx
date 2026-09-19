/** Página /playlist/:id: detalle y canciones de una playlist. */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Play } from 'lucide-react';
import { api } from '@/lib/api';
import { usePlayerStore } from '@/stores/playerStore';
import { formatDuration } from '@/lib/utils';

/** Carga y reproduce una playlist. */
export function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { playSong } = usePlayerStore();

  useEffect(() => {
    api.get(`/playlists/${id}`).then(res => setPlaylist(res.data.data)).catch(e => console.error(e)).finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <div className="p-6"><div className="h-64 skeleton rounded-2xl" /></div>;
  if (!playlist) return <div className="p-6 text-white">Playlist no encontrada</div>;

  const songs = playlist.songs || [];
  return (
    <div className="py-6">
      <div className="flex items-end gap-6 mb-8 bg-gradient-to-b from-sonyduck-red/30 to-transparent p-6 rounded-2xl">
        <img src={playlist.coverUrl || `https://picsum.photos/seed/${playlist.id}/300/300`} alt={playlist.name} className="w-48 h-48 rounded-2xl shadow-2xl" />
        <div>
          <p className="text-text-subtle text-sm">PLAYLIST</p>
          <h1 className="text-5xl font-bold text-white mb-3">{playlist.name}</h1>
          <p className="text-text-subtle">{playlist.description}</p>
          <p className="text-text-subtle text-sm mt-1">{songs.length} canciones</p>
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
    </div>
  );
}