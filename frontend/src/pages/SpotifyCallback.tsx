/**
 * Página a la que vuelve Spotify tras autorizar (/spotify-callback).
 * Cambia el código por un token, trae tus canciones con Me gusta y las
 * importa al backend (POST /api/import/spotify).
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { exchangeCodeForToken, fetchLikedTracks } from '@/lib/spotify';
import { api } from '@/lib/api';

/** Completa el login con Spotify e importa las canciones. */
export function SpotifyCallback() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState('Conectando con Spotify…');
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // evita doble ejecución en StrictMode
    ran.current = true;

    (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const authError = params.get('error');

      if (authError) { setError(true); setMsg(`Spotify devolvió un error: ${authError}`); return; }
      if (!code) { setError(true); setMsg('No se recibió el código de autorización.'); return; }

      try {
        setMsg('Obteniendo permiso…');
        const token = await exchangeCodeForToken(code);

        setMsg('Leyendo tus canciones guardadas…');
        const tracks = await fetchLikedTracks(token, (n) => setMsg(`Leyendo tus canciones… (${n})`));

        if (tracks.length === 0) { setError(true); setMsg('No se encontraron canciones en tus "Me gusta".'); return; }

        setMsg(`Importando ${tracks.length} canciones…`);
        const res = await api.post('/import/spotify', { tracks });
        const { imported, skipped } = res.data.data;

        setDone(true);
        setMsg(`✓ ${imported} canciones importadas${skipped ? `, ${skipped} ya estaban` : ''}. Redirigiendo…`);
        setTimeout(() => navigate('/liked'), 1800);
      } catch (e: any) {
        setError(true);
        setMsg(e?.response?.data?.error?.message || e.message || 'Error al importar de Spotify');
      }
    })();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="mb-4">
        {error ? <AlertCircle className="w-12 h-12 text-sonyduck-red" />
          : done ? <Check className="w-12 h-12 text-[#1DB954]" />
          : <Loader2 className="w-12 h-12 text-[#1DB954] animate-spin" />}
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Importar desde Spotify</h1>
      <p className="text-text-subtle max-w-md">{msg}</p>
      {error && (
        <button onClick={() => navigate('/library')} className="mt-6 bg-sonyduck-red text-white px-4 py-2 rounded-full font-semibold">
          Volver a la biblioteca
        </button>
      )}
    </div>
  );
}
