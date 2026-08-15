import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Play } from 'lucide-react';
import Link from '@/components/Link';
import { api } from '@/lib/api';
import { usePlayerStore } from '@/stores/playerStore';
import { formatNumber } from '@/lib/utils';

export function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<any>(null);
  const [albums, setAlbums] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { playSong } = usePlayerStore();

  useEffect(() => {
    Promise.all([
      api.get(`/artists/${id}`),
      api.get(`/albums?artistId=${id}`).catch(() => ({ data: { data: { albums: [] } } })),
    ]).then(([artistRes, albumsRes]) => {
      setArtist(artistRes.data.data);
      setAlbums(albumsRes.data.data?.albums || []);
      const allSongs = (artistRes.data.data?.topSongs || []).concat([]);
      setSongs(allSongs);
    }).catch(e => console.error(e)).finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <div className="p-6"><div className="h-64 skeleton rounded-2xl" /></div>;
  if (!artist) return <div className="p-6 text-white">Artista no encontrado</div>;

  return (
    <div className="py-6">
      <div className="flex items-end gap-6 mb-8 bg-gradient-to-b from-sonyduck-red/30 to-transparent p-6 rounded-2xl">
        <img src={artist.imageUrl || `https://picsum.photos/seed/${artist.id}/300/300`} alt={artist.name} className="w-48 h-48 rounded-full shadow-2xl" />
        <div>
          <p className="text-text-subtle text-sm">ARTISTA</p>
          <h1 className="text-5xl font-bold text-white mb-3">{artist.name}</h1>
          <p className="text-text-subtle">{formatNumber(artist.monthlyListeners)} oyentes mensuales</p>
          {artist.bio && <p className="text-text-light mt-2 max-w-xl">{artist.bio}</p>}
        </div>
      </div>

      {songs.length > 0 && (
        <button onClick={() => playSong(songs[0], songs)} className="mb-6 bg-sonyduck-red hover:bg-sonyduck-red-hover text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 shadow-red-glow">
          <Play className="w-5 h-5" fill="white" /> Reproducir
        </button>
      )}

      {albums.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Albums</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {albums.map((album: any) => (
              <Link key={album.id} to={`/album/${album.id}`} className="bg-sonyduck-medium p-4 rounded-xl hover:bg-sonyduck-light">
                <img src={album.coverUrl || `https://picsum.photos/seed/${album.id}/200/200`} className="w-full aspect-square rounded-lg object-cover mb-3" alt="" />
                <p className="font-bold text-white truncate">{album.title}</p>
                <p className="text-sm text-text-subtle">{album.releaseYear}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}