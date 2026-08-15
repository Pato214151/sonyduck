import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { usePlayerStore } from '@/stores/playerStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { DucklabBadge } from '@/components/layout/DucklabBadge';
import { PlayerBar } from '@/components/player/PlayerBar';
import { AuthPage } from '@/pages/AuthPage';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { AlbumPage } from '@/pages/AlbumPage';
import { ArtistPage } from '@/pages/ArtistPage';
import { PlaylistPage } from '@/pages/PlaylistPage';
import { LikedSongsPage } from '@/pages/LikedSongsPage';
import { LibraryPage } from '@/pages/LibraryPage';
import { DiscoverPage } from '@/pages/DiscoverPage';
import { SpotifyCallback } from '@/pages/SpotifyCallback';

function AppContent() {
  const { isAuthenticated, fetchUser } = useAuthStore();
  const setAudioElement = usePlayerStore((state) => state.setAudioElement);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      setAudioElement(audioRef.current);
    }
  }, [setAudioElement]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="flex flex-col h-screen bg-sonyduck-dark overflow-hidden">
      <audio ref={audioRef} preload="metadata" />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-sonyduck-medium/20 via-sonyduck-dark to-sonyduck-dark">
          <TopBar />
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="max-w-screen-xl mx-auto px-2 md:px-6 pb-32">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/liked" element={<LikedSongsPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/spotify-callback" element={<SpotifyCallback />} />
                <Route path="/album/:id" element={<AlbumPage />} />
                <Route path="/artist/:id" element={<ArtistPage />} />
                <Route path="/playlist/:id" element={<PlaylistPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>

      <PlayerBar />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DucklabBadge />
      <AppContent />
    </BrowserRouter>
  );
}