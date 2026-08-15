import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Mail, Lock, User, Sparkles, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: 'demo@sonyduck.com', password: 'Demo1234' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Algo salio mal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sonyduck-black via-sonyduck-dark to-sonyduck-red/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sonyduck-red to-sonyduck-red-dark rounded-full mb-4 shadow-red-glow">
            <Music className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">SonYDuck</h1>
          <p className="text-text-subtle">Tu musica, tu momento</p>
        </div>

        <div className="bg-sonyduck-medium rounded-2xl p-8 shadow-2xl border border-sonyduck-border">
          <h2 className="text-2xl font-bold text-white mb-2">{isLogin ? 'Iniciar sesion' : 'Crear cuenta'}</h2>
          <p className="text-text-subtle mb-6">{isLogin ? 'Bienvenido de vuelta' : 'Unete a SonYDuck'}</p>

          {error && <div className="mb-4 p-3 bg-sonyduck-red/20 border border-sonyduck-red rounded-lg text-sonyduck-red text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-subtle" />
                <input type="text" placeholder="Nombre" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-sonyduck-black text-white pl-11 pr-4 py-3 rounded-lg border border-sonyduck-border focus:border-sonyduck-red outline-none" />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-subtle" />
              <input type="email" placeholder="Email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-sonyduck-black text-white pl-11 pr-4 py-3 rounded-lg border border-sonyduck-border focus:border-sonyduck-red outline-none" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-subtle" />
              <input type="password" placeholder="Contrasena" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-sonyduck-black text-white pl-11 pr-4 py-3 rounded-lg border border-sonyduck-border focus:border-sonyduck-red outline-none" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-sonyduck-red hover:bg-sonyduck-red-hover text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Cargando...' : (<>{isLogin ? 'Entrar' : 'Crear cuenta'} <ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-text-subtle hover:text-white text-sm">
              {isLogin ? 'No tienes cuenta? Creala' : 'Ya tienes cuenta? Inicia sesion'}
            </button>
          </div>

          {isLogin && (
            <div className="mt-4 p-3 bg-sonyduck-black/50 rounded-lg text-xs text-text-subtle">
              <Sparkles className="w-3 h-3 inline mr-1 text-sonyduck-red" />
              Demo: <span className="text-white">demo@sonyduck.com / Demo1234</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}