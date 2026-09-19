/**
 * Página /discover: elige un estado de ánimo y la IA recomienda canciones
 * (GET /api/ai/mood/:mood/songs).
 */

import { useState } from 'react';
import { Sparkles, Sun, CloudRain, Brain, Zap, Coffee, Heart, Moon, Play } from 'lucide-react';
import { api } from '@/lib/api';
import { usePlayerStore } from '@/stores/playerStore';

const moods = [
  { id: 'happy', name: 'Alegre', icon: Sun, color: 'text-yellow-400', gradient: 'from-yellow-500/20 to-orange-500/20' },
  { id: 'chill', name: 'Chill', icon: Coffee, color: 'text-amber-400', gradient: 'from-amber-500/20 to-stone-500/20' },
  { id: 'focus', name: 'Focus', icon: Brain, color: 'text-purple-400', gradient: 'from-purple-500/20 to-pink-500/20' },
  { id: 'energetic', name: 'Energia', icon: Zap, color: 'text-red-400', gradient: 'from-red-500/20 to-orange-500/20' },
  { id: 'sad', name: 'Triste', icon: CloudRain, color: 'text-blue-400', gradient: 'from-blue-500/20 to-indigo-500/20' },
  { id: 'romantic', name: 'Romantica', icon: Heart, color: 'text-pink-400', gradient: 'from-pink-500/20 to-rose-500/20' },
  { id: 'nostalgic', name: 'Nostalgica', icon: Moon, color: 'text-indigo-400', gradient: 'from-indigo-500/20 to-slate-500/20' },
  { id: 'epic', name: 'Epica', icon: Sparkles, color: 'text-fuchsia-400', gradient: 'from-fuchsia-500/20 to-purple-500/20' },
];

/** Selector de ánimo + recomendaciones. */
export function DiscoverPage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { playSong } = usePlayerStore();

  const handleMoodSelect = async (moodId: string) => {
    setSelectedMood(moodId);
    setIsLoading(true);
    try {
      const res = await api.get(`/ai/mood/${moodId}/songs?limit=20`);
      setRecommendations(res.data.data?.songs || []);
    } catch (e) {
      console.error(e);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-6 space-y-8 px-2 md:px-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-sonyduck-red to-red-700 rounded-xl">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">AI Discover</h1>
          <p className="text-text-subtle">Musica personalizada para ti</p>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-bold text-white mb-4">Como te sientes hoy?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {moods.map((mood) => {
            const Icon = mood.icon;
            const isSelected = selectedMood === mood.id;
            return (
              <button key={mood.id} onClick={() => handleMoodSelect(mood.id)}
                className={`p-4 rounded-xl transition-all border ${isSelected ? 'border-sonyduck-red ring-2 ring-sonyduck-red/30' : 'border-transparent hover:border-white/20'} bg-gradient-to-br ${mood.gradient}`}>
                <Icon className={`w-8 h-8 ${mood.color} mx-auto mb-2`} />
                <p className="text-white text-sm font-medium text-center">{mood.name}</p>
              </button>
            );
          })}
        </div>
      </section>

      {selectedMood && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">
            Canciones para estado: {moods.find(m => m.id === selectedMood)?.name}
          </h2>
          {isLoading ? (
            <div className="space-y-2">{Array.from({length: 5}).map((_, i) => <div key={i} className="h-14 skeleton rounded-lg" />)}</div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-1">
              {recommendations.slice(0, 15).map((song: any, i: number) => (
                <button key={song.id} onClick={() => playSong(song, recommendations)} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-sonyduck-medium text-left">
                  <span className="text-text-subtle w-6 text-center">{i + 1}</span>
                  <img src={song.album?.coverUrl || `https://picsum.photos/seed/${song.id}/60/60`} alt="" className="w-10 h-10 rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{song.title}</p>
                    <p className="text-sm text-text-subtle truncate">{song.artist?.name}</p>
                  </div>
                  <Play className="w-4 h-4 text-text-subtle" fill="currentColor" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-sonyduck-medium rounded-xl">
              <Sparkles className="w-12 h-12 text-text-subtle mx-auto mb-3" />
              <p className="text-text-subtle">No hay recomendaciones para ese mood. Prueba otro!</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}