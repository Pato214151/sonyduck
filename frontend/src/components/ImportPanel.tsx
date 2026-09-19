/**
 * Panel para agregar música: subir MP3 propios (arrastrar y soltar) o
 * conectar Spotify e importar tus canciones con Me gusta.
 */

import { useRef, useState } from 'react';
import { Upload, Music, Check, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getClientId, setClientId, startSpotifyAuth, SPOTIFY_REDIRECT_URI } from '@/lib/spotify';

interface Props {
  onImported?: () => void;
}

/** Lee la duración de un archivo de audio en el navegador antes de subirlo. */
function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const a = document.createElement('audio');
    a.preload = 'metadata';
    a.onloadedmetadata = () => { resolve(a.duration || 0); URL.revokeObjectURL(a.src); };
    a.onerror = () => resolve(0);
    a.src = URL.createObjectURL(file);
  });
}

/** Zona de subida de archivos + botón para conectar con Spotify. */
export function ImportPanel({ onImported }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [clientIdInput, setClientIdInput] = useState('');
  const [showClientId, setShowClientId] = useState(!getClientId());

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('audio/'));
    if (list.length === 0) { setStatus('Selecciona archivos de audio (MP3, WAV, etc.)'); return; }
    setBusy(true);
    const token = useAuthStore.getState().accessToken;
    let ok = 0;
    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      setStatus(`Subiendo ${i + 1}/${list.length}: ${file.name}`);
      try {
        const duration = await getAudioDuration(file);
        const fd = new FormData();
        fd.append('file', file);
        fd.append('title', file.name.replace(/\.[^.]+$/, ''));
        fd.append('duration', String(Math.round(duration)));
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (res.ok) ok++;
        else {
          const j = await res.json().catch(() => ({}));
          setStatus(`Error en ${file.name}: ${j?.error?.message || res.status}`);
        }
      } catch (e: any) {
        setStatus(`Error en ${file.name}: ${e.message}`);
      }
    }
    setBusy(false);
    setStatus(`✓ ${ok} archivo(s) agregado(s) a tu biblioteca y a "Me gusta".`);
    onImported?.();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
  };

  const connectSpotify = async () => {
    try {
      setStatus('Redirigiendo a Spotify…');
      await startSpotifyAuth();
    } catch (e: any) {
      setStatus(e.message);
    }
  };

  const saveClientId = () => {
    if (!clientIdInput.trim()) return;
    setClientId(clientIdInput.trim());
    setShowClientId(false);
    setStatus('Client ID guardado. Ya puedes conectar con Spotify.');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 px-2 md:px-6">
      {/* Subir MP3 */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-6 transition ${
          dragOver ? 'border-sonyduck-red bg-sonyduck-red/10' : 'border-sonyduck-border bg-sonyduck-medium'
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          <Upload className="w-6 h-6 text-sonyduck-red" />
          <h3 className="font-bold text-white text-lg">Subir tu música</h3>
        </div>
        <p className="text-text-subtle text-sm mb-4">
          Arrastra tus archivos MP3/WAV aquí o selecciónalos. Se reproducen de verdad.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="bg-sonyduck-red hover:bg-sonyduck-red-hover disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-full flex items-center gap-2"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />}
          Elegir archivos
        </button>
      </div>

      {/* Conectar Spotify */}
      <div className="rounded-xl bg-sonyduck-medium border border-sonyduck-border p-6">
        <div className="flex items-center gap-3 mb-2">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.38-1.32 9.78-.66 13.5 1.62.36.18.54.78.24 1.2zm.12-3.36C15.24 8.4 8.88 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.32-1.32 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.66-1.56.36z"/></svg>
          <h3 className="font-bold text-white text-lg">Importar de Spotify</h3>
        </div>
        <p className="text-text-subtle text-sm mb-4">
          Trae tus <strong>Me gusta</strong> (título, artista, álbum y portada). El audio es una
          muestra demo — Spotify no permite descargar el audio real.
        </p>

        {showClientId ? (
          <div className="space-y-2">
            <p className="text-xs text-text-subtle">
              Crea una app gratis en{' '}
              <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer" className="text-sonyduck-red underline">developer.spotify.com</a>{' '}
              y registra esta Redirect URI:
            </p>
            <code className="block text-xs bg-sonyduck-dark text-green-400 p-2 rounded break-all">{SPOTIFY_REDIRECT_URI}</code>
            <input
              value={clientIdInput}
              onChange={(e) => setClientIdInput(e.target.value)}
              placeholder="Pega tu Spotify Client ID"
              className="w-full bg-sonyduck-dark border border-sonyduck-border rounded px-3 py-2 text-sm text-white"
            />
            <button onClick={saveClientId} className="bg-white text-black font-semibold px-4 py-2 rounded-full text-sm">Guardar Client ID</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={connectSpotify} className="bg-[#1DB954] hover:brightness-110 text-black font-semibold px-4 py-2 rounded-full flex items-center gap-2">
              <Check className="w-4 h-4" /> Conectar con Spotify
            </button>
            <button onClick={() => setShowClientId(true)} className="text-text-subtle text-xs underline">Cambiar Client ID</button>
          </div>
        )}
      </div>

      {status && (
        <div className="md:col-span-2 flex items-center gap-2 text-sm text-white bg-sonyduck-dark/60 rounded-lg px-4 py-2">
          <AlertCircle className="w-4 h-4 text-sonyduck-red shrink-0" />
          <span>{status}</span>
        </div>
      )}
    </div>
  );
}
