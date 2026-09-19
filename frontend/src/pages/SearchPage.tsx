/** Página /search: busca canciones, artistas y álbumes a la vez. */

import { useEffect, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import Link from '@/components/Link';
import { api } from '@/lib/api';
import { usePlayerStore } from '@/stores/playerStore';

/** Búsqueda con los resultados agrupados por tipo. */
export function SearchPage() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const { playSong } = usePlayerStore();

  useEffect(() => {
    if (query.length < 2) return;
    const timer = setTimeout(async () => {
      try {
        const [songsRes, artistsRes, albumsRes] = await Promise.all([
          api.get(`/songs/search?q=${query}`),
          api.get(`/artists/search?q=${query}`),
          api.get(`/albums/search?q=${query}`),
        ]);
        setSongs(songsRes.data.data?.songs || []);
        setArtists(artistsRes.data.data?.artists || []);
        setAlbums(albumsRes.data.data?.albums || []);
      } catch (e) { console.error(e); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="py-6">
      <div className="relative mb-8 max-w-2xl">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-subtle" />
        <input type="text" placeholder="Busca canciones, artistas, albums..." value={query} onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-sonyduck-medium text-white pl-12 pr-4 py-3 rounded-full border border-sonyduck-border focus:border-sonyduck-red outline-none" />
      </div>

      {query.length < 2 ? (
        <div className="text-center py-16">
          <SearchIcon className="w-16 h-16 text-text-subtle mx-auto mb-4" />
          <p className="text-text-subtle">Empieza a buscar tu musica favorita</p>
        </div>
      ) : (
        <div className="space-y-8">
          {songs.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-white mb-3">Canciones</h2>
              <div className="space-y-1">
                {songs.slice(0, 10).map((song: any) => (
                  <button key={song.id} onClick={() => playSong(song, songs)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sonyduck-medium text-left">
                    <img src={song.album?.coverUrl || `https://picsum.photos/seed/${song.id}/60/60`} className="w-10 h-10 rounded" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{song.title}</p>
                      <p className="text-sm text-text-subtle truncate">{song.artist?.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
          {artists.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-white mb-3">Artistas</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {artists.slice(0, 8).map((artist: any) => (
                  <Link key={artist.id} to={`/artist/${artist.id}`} className="bg-sonyduck-medium p-4 rounded-xl hover:bg-sonyduck-light text-center">
                    <img src={artist.imageUrl || `https://picsum.photos/seed/${artist.id}/200/200`} className="w-full aspect-square rounded-full object-cover mb-3" alt="" />
                    <p className="font-bold text-white truncate">{artist.name}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {albums.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-white mb-3">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {albums.slice(0, 10).map((album: any) => (
                  <Link key={album.id} to={`/album/${album.id}`} className="bg-sonyduck-medium p-4 rounded-xl hover:bg-sonyduck-light">
                    <img src={album.coverUrl || `https://picsum.photos/seed/${album.id}/200/200`} className="w-full aspect-square rounded-lg object-cover mb-3" alt="" />
                    <p className="font-bold text-white truncate">{album.title}</p>
                    <p className="text-sm text-text-subtle truncate">{album.artist?.name}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {songs.length === 0 && artists.length === 0 && albums.length === 0 && (
            <p className="text-text-subtle text-center py-8">No se encontraron resultados</p>
          )}
        </div>
      )}
    </div>
  );
}