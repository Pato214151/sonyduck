/** Barra lateral: navegación principal y lista de playlists del usuario. */

import { useState, useEffect } from 'react';
import { Home, Search, Library, Plus, Heart, Music, ChevronRight, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Link from '@/components/Link';
import { cn, getInitials, getRandomGradient } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Search', path: '/search' },
];

/** Menú de navegación y playlists. */
export function Sidebar() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const res = await api.get('/playlists?limit=20');
        setPlaylists(res.data.data?.playlists || []);
      } catch (error) {
        console.error('Failed to fetch playlists:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaylists();
  }, []);

  return (
    <aside className="w-64 bg-sonyduck-black flex flex-col h-full border-r border-sonyduck-border">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-sonyduck-red to-sonyduck-red-dark rounded-full flex items-center justify-center group-hover:shadow-red-glow transition-shadow">
            <Music className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">SonYDuck</span>
        </Link>
      </div>

      <nav className="px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-sonyduck-medium text-white'
                  : 'text-text-light hover:text-white hover:bg-sonyduck-light'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 px-3">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-text-subtle text-sm font-semibold uppercase tracking-wider">
            Your Library
          </span>
          <button className="p-1 text-text-subtle hover:text-white transition-colors rounded-full hover:bg-sonyduck-light">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        <Link
          to="/liked"
          className={cn(
            'flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200',
            location.pathname === '/liked'
              ? 'bg-sonyduck-medium text-white'
              : 'text-text-light hover:text-white hover:bg-sonyduck-light'
          )}
        >
          <div className="w-5 h-5 bg-gradient-to-br from-sonyduck-red to-purple-600 rounded-full flex items-center justify-center">
            <Heart className="w-3 h-3 text-white" fill="white" />
          </div>
          <span className="font-medium">Liked Songs</span>
        </Link>

        <Link
          to="/library"
          className={cn(
            'flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200',
            location.pathname === '/library'
              ? 'bg-sonyduck-medium text-white'
              : 'text-text-light hover:text-white hover:bg-sonyduck-light'
          )}
        >
          <Library className="w-5 h-5" />
          <span className="font-medium">Your Playlists</span>
        </Link>
      </div>

      <div className="mt-4 px-3">
        <Link
          to="/discover"
          className="flex items-center gap-3 px-3 py-3 rounded-lg bg-gradient-to-r from-sonyduck-red/20 to-transparent border border-sonyduck-red/30 hover:from-sonyduck-red/30 transition-all duration-200"
        >
          <Sparkles className="w-5 h-5 text-sonyduck-red" />
          <div>
            <span className="font-medium text-white text-sm">Discover</span>
            <p className="text-xs text-text-subtle">AI-Powered Mixes</p>
          </div>
          <ChevronRight className="w-4 h-4 text-text-subtle ml-auto" />
        </Link>
      </div>

      <div className="flex-1 mt-4 px-3 overflow-y-auto no-scrollbar">
        <div className="space-y-0.5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <div className="w-10 h-10 bg-sonyduck-medium rounded-md skeleton" />
                <div className="flex-1">
                  <div className="h-4 w-24 skeleton rounded mb-1" />
                  <div className="h-3 w-16 skeleton rounded" />
                </div>
              </div>
            ))
          ) : (
            playlists.map((playlist) => (
              <Link
                key={playlist.id}
                to={`/playlist/${playlist.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-light hover:text-white hover:bg-sonyduck-light transition-all duration-200 group"
              >
                {playlist.coverUrl ? (
                  <img src={playlist.coverUrl} alt={playlist.name} className="w-10 h-10 rounded-md object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-sonyduck-medium rounded-md flex items-center justify-center">
                    <Music className="w-4 h-4 text-text-subtle" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{playlist.name}</p>
                  <p className="text-xs text-text-subtle">
                    {playlist.isLikedSongs ? 'Playlist' : `${playlist.songCount || 0} songs`}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>

        <button className="flex items-center gap-4 px-3 py-3 text-text-light hover:text-white transition-colors w-full mt-2 rounded-lg hover:bg-sonyduck-light">
          <div className="w-8 h-8 bg-sonyduck-medium rounded-full flex items-center justify-center border border-dashed border-sonyduck-lighter">
            <Plus className="w-4 h-4" />
          </div>
          <span className="font-medium">Create Playlist</span>
        </button>
      </div>

      <div className="p-3 border-t border-sonyduck-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sonyduck-light transition-colors cursor-pointer">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br',
            getRandomGradient()
          )}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(user?.name || 'U')
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-white font-medium truncate block">{user?.name}</span>
            <span className="text-xs text-text-subtle">Premium</span>
          </div>
        </div>
      </div>
    </aside>
  );
}