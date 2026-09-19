/** Barra superior: navegación atrás/adelante y menú del usuario (cerrar sesión). */

import { ChevronLeft, ChevronRight, Bell, Settings, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { cn, getInitials, getRandomGradient } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

/** Barra superior con el menú de la cuenta. */
export function TopBar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-gradient-to-r from-sonyduck-black/80 via-sonyduck-dark/80 to-sonyduck-black/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40 border-b border-sonyduck-border/50">
      <div className="flex items-center gap-2">
        <button onClick={() => window.history.back()} className="p-2 rounded-full bg-sonyduck-black/50 hover:bg-sonyduck-light transition-all duration-200">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button onClick={() => window.history.forward()} className="p-2 rounded-full bg-sonyduck-black/50 hover:bg-sonyduck-light transition-all duration-200">
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full hover:bg-sonyduck-light transition-colors text-text-subtle hover:text-white relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-sonyduck-red rounded-full" />
        </button>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)} className={cn('flex items-center gap-2 p-1 pr-3 rounded-full transition-all duration-200', showMenu ? 'bg-sonyduck-light' : 'hover:bg-sonyduck-light/50')}>
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br', getRandomGradient())}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(user?.name || 'U')
              )}
            </div>
            <span className="text-sm font-medium text-white max-w-[100px] truncate">{user?.name}</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-sonyduck-medium rounded-xl shadow-2xl border border-sonyduck-border overflow-hidden">
              <div className="p-3 border-b border-sonyduck-border">
                <p className="text-white font-medium">{user?.name}</p>
                <p className="text-text-subtle text-sm">{user?.email}</p>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-light hover:text-white hover:bg-sonyduck-light transition-colors">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Profile</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-light hover:text-white hover:bg-sonyduck-light transition-colors">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Settings</span>
                </button>
              </div>
              <div className="p-2 border-t border-sonyduck-border">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sonyduck-red hover:bg-sonyduck-red/10 transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}