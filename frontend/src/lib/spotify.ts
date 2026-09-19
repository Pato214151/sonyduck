// Integración con Spotify vía OAuth PKCE (flujo público, sin client secret).
// Solo LEE tus canciones guardadas (scope user-library-read) e importa sus
// METADATOS. Spotify no permite descargar el audio, así que en la app se usa
// audio demo (SoundHelix) como placeholder.

export const SPOTIFY_REDIRECT_URI = `${window.location.origin}/spotify-callback`;
const SCOPE = 'user-library-read';

const CLIENT_ID_KEY = 'spotify_client_id';
const VERIFIER_KEY = 'spotify_verifier';

/** Client ID de Spotify: el de .env (VITE_SPOTIFY_CLIENT_ID) o el guardado en el navegador. */
export function getClientId(): string {
  return (import.meta.env.VITE_SPOTIFY_CLIENT_ID as string) || localStorage.getItem(CLIENT_ID_KEY) || '';
}
/** Guarda el Client ID de Spotify en el navegador. */
export function setClientId(id: string) {
  localStorage.setItem(CLIENT_ID_KEY, id.trim());
}

export interface ImportTrack {
  title: string;
  artist: string;
  album: string;
  coverUrl?: string;
  durationMs: number;
  spotifyId: string;
}

/** Texto aleatorio para el verificador PKCE. */
function randomString(len: number): string {
  const arr = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(arr, (b) => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}

/** Hash SHA-256 (para el challenge PKCE). */
async function sha256(plain: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(plain));
}

/** Codifica bytes en base64 apto para URL. */
function base64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Paso 1: redirige a Spotify para autorizar
export async function startSpotifyAuth(): Promise<void> {
  const clientId = getClientId();
  if (!clientId) throw new Error('Falta el Client ID de Spotify');

  const verifier = randomString(64);
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  const challenge = base64url(await sha256(verifier));

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SCOPE,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Paso 2 (en el callback): intercambia el código por un access token
export async function exchangeCodeForToken(code: string): Promise<string> {
  const clientId = getClientId();
  const verifier = sessionStorage.getItem(VERIFIER_KEY) || '';

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    code_verifier: verifier,
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(json.error_description || json.error || 'No se pudo obtener el token de Spotify');
  }
  return json.access_token as string;
}

// Paso 3: trae todas tus canciones guardadas (paginado)
export async function fetchLikedTracks(
  accessToken: string,
  onProgress?: (count: number) => void
): Promise<ImportTrack[]> {
  const tracks: ImportTrack[] = [];
  let url: string | null = 'https://api.spotify.com/v1/me/tracks?limit=50';

  while (url) {
    const r: Response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!r.ok) throw new Error(`Spotify API respondió ${r.status}`);
    const j = await r.json();
    for (const item of j.items || []) {
      const t = item.track;
      if (!t) continue;
      tracks.push({
        title: t.name,
        artist: (t.artists || []).map((a: any) => a.name).join(', ') || 'Desconocido',
        album: t.album?.name || 'Sencillo',
        coverUrl: t.album?.images?.[0]?.url,
        durationMs: t.duration_ms || 0,
        spotifyId: t.id || '',
      });
    }
    onProgress?.(tracks.length);
    url = j.next;
    if (tracks.length >= 2000) break;
  }
  return tracks;
}
