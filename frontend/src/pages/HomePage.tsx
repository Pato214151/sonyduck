/** Página de inicio: álbumes, artistas y canciones destacadas. */

import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import Link from '@/components/Link';
import { api } from '@/lib/api';
import { usePlayerStore } from '@/stores/playerStore';
import { formatNumber } from '@/lib/utils';
import type { Song, Album, Artist } from '@/types';

/** Carga en paralelo álbumes, artistas y canciones. */
export function HomePage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { playSong } = usePlayerStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [albumsRes, artistsRes, songsRes] = await Promise.all([
          api.get('/albums?limit=6'),
          api.get('/artists?limit=6'),
          api.get('/songs?limit=10'),
        ]);
        setAlbums(albumsRes.data.data?.albums || []);
        setArtists(artistsRes.data.data?.artists || []);
        setSongs(songsRes.data.data?.songs || []);
      } catch (error) {
        console.error('Error fetching:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const playAll = () => {
    if (songs.length > 0) playSong(songs[0], songs);
  };

  if (isLoading) {
    return (
      <div className="py-6 space-y-8">
        <div className="h-12 w-64 skeleton rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square skeleton rounded-lg" />
              <div className="h-4 w-3/4 skeleton rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-1">Buenas noches</h1>
          <p className="text-text-subtle">Tu musica personalizada</p>
        </div>
        {songs.length > 0 && (
          <button onClick={playAll} className="bg-sonyduck-red hover:bg-sonyduck-red-hover text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-red-glow">
            <Play className="w-5 h-5" fill="white" /> Reproducir
          </button>
        )}
      </div>

      {albums.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Albums destacados</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {albums.map((album) => (
              <Link key={album.id} to={`/album/${album.id}`} className="bg-sonyduck-medium p-4 rounded-xl hover:bg-sonyduck-light transition-all group">
                <img src={album.coverUrl || `https://picsum.photos/seed/${album.id}/300/300`} alt={album.title} className="w-full aspect-square rounded-lg object-cover mb-3" />
                <h3 className="font-bold text-white truncate">{album.title}</h3>
                <p className="text-sm text-text-subtle truncate">{album.artist?.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {artists.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Artistas populares</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {artists.map((artist) => (
              <Link key={artist.id} to={`/artist/${artist.id}`} className="bg-sonyduck-medium p-4 rounded-xl hover:bg-sonyduck-light transition-all text-center">
                <img src={artist.imageUrl || `https://picsum.photos/seed/${artist.id}/300/300`} alt={artist.name} className="w-full aspect-square rounded-full object-cover mb-3" />
                <h3 className="font-bold text-white truncate">{artist.name}</h3>
                <p className="text-xs text-text-subtle">{formatNumber(artist.monthlyListeners)} oyentes</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {songs.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Canciones recientes</h2>
          <div className="space-y-1">
            {songs.slice(0, 8).map((song, i) => (
              <button key={song.id} onClick={() => playSong(song, songs)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sonyduck-medium transition-colors text-left group">
                <span className="text-text-subtle w-6 text-center">{i + 1}</span>
                <img src={song.album?.coverUrl || `https://picsum.photos/seed/${song.id}/60/60`} alt={song.title} className="w-10 h-10 rounded" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{song.title}</p>
                  <p className="text-sm text-text-subtle truncate">{song.artist?.name}</p>
                </div>
                <Play className="w-4 h-4 text-text-subtle opacity-0 group-hover:opacity-100" fill="currentColor" />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}