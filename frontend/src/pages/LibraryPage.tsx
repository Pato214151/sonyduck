/** Página /library: tus playlists, artistas que sigues y el panel de importar música. */

import { useCallback, useEffect, useState } from 'react';
import { Plus, ListMusic } from 'lucide-react';
import Link from '@/components/Link';
import { api } from '@/lib/api';
import { ImportPanel } from '@/components/ImportPanel';

/** Biblioteca del usuario. */
export function LibraryPage() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    Promise.all([
      api.get('/playlists?limit=50'),
      api.get('/artists/following').catch(() => ({ data: { data: { artists: [] } } })),
    ]).then(([playlistsRes, artistsRes]) => {
      setPlaylists(playlistsRes.data.data?.playlists || []);
      setArtists(artistsRes.data.data?.artists || []);
    }).catch(e => console.error(e)).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (isLoading) {
    return <div className="p-6 space-y-4">{Array.from({length: 5}).map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>;
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6 px-2 md:px-6">
        <h1 className="text-3xl font-bold text-white">Tu Biblioteca</h1>
        <button className="bg-sonyduck-red hover:bg-sonyduck-red-hover text-white p-3 rounded-full shadow-red-glow">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <ImportPanel onImported={load} />

      <div className="px-2 md:px-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-3">Playlists</h2>
        {playlists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {playlists.map(playlist => (
              <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="bg-sonyduck-medium p-4 rounded-xl hover:bg-sonyduck-light transition group">
                {playlist.coverUrl ? (
                  <img src={playlist.coverUrl} alt={playlist.name} className="w-full aspect-square rounded-lg object-cover mb-3" />
                ) : (
                  <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-sonyduck-red/30 to-purple-600/30 flex items-center justify-center mb-3">
                    <ListMusic className="w-12 h-12 text-sonyduck-red" />
                  </div>
                )}
                <h3 className="font-bold text-white truncate">{playlist.name}</h3>
                <p className="text-text-subtle text-sm truncate">{playlist.songCount || 0} canciones</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-sonyduck-medium rounded-xl">
            <p className="text-text-subtle">Aun no tienes playlists</p>
          </div>
        )}
      </div>

      <div className="px-2 md:px-6">
        <h2 className="text-xl font-bold text-white mb-3">Artistas que sigues</h2>
        {artists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {artists.map((artist: any) => (
              <Link key={artist.id} to={`/artist/${artist.id}`} className="bg-sonyduck-medium p-4 rounded-xl hover:bg-sonyduck-light text-center">
                <img src={artist.imageUrl || `https://picsum.photos/seed/${artist.id}/200/200`} alt={artist.name} className="w-full aspect-square rounded-full object-cover mb-3" />
                <p className="font-bold text-white truncate">{artist.name}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-sonyduck-medium rounded-xl">
            <p className="text-text-subtle">Aun no sigues artistas</p>
          </div>
        )}
      </div>
    </div>
  );
}