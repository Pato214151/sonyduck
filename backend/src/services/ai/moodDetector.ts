// @ts-nocheck
// AI Service - Mood Detector
// Detecta el estado de ánimo del usuario basado en hora, patrones y songs

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type Mood = 'happy' | 'energetic' | 'chill' | 'sad' | 'romantic' | 
                   'epic' | 'dark' | 'peaceful' | 'angry' | 'nostalgic' | 'neutral';

export interface MoodProfile {
  primary: Mood;
  secondary: Mood[];
  confidence: number;
  reason: string;
  suggestedActivities: string[];
}

// Time-based mood patterns
const TIME_MOODS: Record<string, Mood> = {
  morning: 'energetic',
  afternoon: 'chill',
  evening: 'happy',
  night: 'romantic',
};

// Mood descriptions and activities
const MOOD_INFO: Record<Mood, { description: string; activities: string[]; color: string }> = {
  happy: {
    description: 'Feeling good!',
    activities: ['Celebrating', 'Dancing', 'Sharing with friends'],
    color: '#FFD700',
  },
  energetic: {
    description: 'Full of energy!',
    activities: ['Working out', 'Starting new projects', 'Going for a run'],
    color: '#FF6B6B',
  },
  chill: {
    description: 'Relaxing vibes',
    activities: ['Studying', 'Reading', 'Casual listening'],
    color: '#4ECDC4',
  },
  sad: {
    description: 'Taking it easy',
    activities: ['Reflecting', 'Processing emotions', 'Self-care'],
    color: '#5B6DCD',
  },
  romantic: {
    description: 'Feeling the love',
    activities: ['Date night', 'Quality time', 'Dreaming'],
    color: '#FF69B4',
  },
  epic: {
    description: 'Feeling epic!',
    activities: ['Adventure', 'Conquering goals', 'Epic movie soundtrack vibes'],
    color: '#9B59B6',
  },
  dark: {
    description: 'Moody and introspective',
    activities: ['Deep thinking', 'Artistic pursuits', 'Contemplation'],
    color: '#2C3E50',
  },
  peaceful: {
    description: 'At peace',
    activities: ['Meditation', 'Nature', 'Quiet time'],
    color: '#27AE60',
  },
  angry: {
    description: 'Need to let it out',
    activities: ['Punching bag', 'Aggressive workout', 'Driving fast'],
    color: '#E74C3C',
  },
  nostalgic: {
    description: 'Missing the past',
    activities: ['Remembering good times', 'Looking at photos', 'Classic songs'],
    color: '#DAA520',
  },
  neutral: {
    description: 'Balanced mood',
    activities: ['Everyday activities', 'Background music', 'Discovery'],
    color: '#95A5A6',
  },
};

/**
 * Detecta el estado de ánimo actual del usuario
 */
export async function detectUserMood(userId: string): Promise<MoodProfile> {
  const now = new Date();
  const timeOfDay = getTimeOfDay(now);

  // Get recent listening history (last 2 hours)
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const recentSessions = await prisma.listeningSession.findMany({
    where: {
      userId,
      createdAt: { gte: twoHoursAgo },
    },
    include: { song: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // Calculate skip rate
  const skipRate = recentSessions.filter(s => s.action === 'skip').length / 
                   (recentSessions.length || 1);

  // Calculate repeat rate
  const songIds = recentSessions.map(s => s.songId);
  const repeatCount = songIds.filter((id, i) => songIds.indexOf(id) < i).length;
  const repeatRate = repeatCount / (songIds.length || 1);

  // Analyze recent songs
  const recentMoods = recentSessions.map(s => s.song.moods).flat();
  const moodCounts: Record<string, number> = {};
  for (const mood of recentMoods) {
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  }

  // Calculate average energy from recent songs
  const avgEnergy = recentSessions.length > 0
    ? recentSessions.reduce((acc, s) => acc + (s.song.energy || 0.5), 0) / recentSessions.length
    : 0.5;

  // Calculate average valence (emotional tone)
  const avgValence = recentSessions.length > 0
    ? recentSessions.reduce((acc, s) => acc + (s.song.valence || 0.5), 0) / recentSessions.length
    : 0.5;

  // Detect mood based on all factors
  let primaryMood: Mood = 'neutral';
  let confidence = 0.5;
  let reason = '';

  // High skip rate suggests dissatisfaction
  if (skipRate > 0.5) {
    primaryMood = 'sad';
    confidence = 0.7;
    reason = 'You\'ve been skipping a lot of songs';
  }
  // High repeat rate suggests nostalgia
  else if (repeatRate > 0.3) {
    primaryMood = 'nostalgic';
    confidence = 0.7;
    reason = 'You\'ve been replaying some songs';
  }
  // High energy + high valence = happy
  else if (avgEnergy > 0.7 && avgValence > 0.6) {
    primaryMood = 'happy';
    confidence = 0.8;
    reason = 'You\'re in an upbeat mood!';
  }
  // High energy + low valence = angry
  else if (avgEnergy > 0.7 && avgValence < 0.3) {
    primaryMood = 'angry';
    confidence = 0.6;
    reason = 'High energy, intense mood';
  }
  // Low energy + low valence = sad
  else if (avgEnergy < 0.4 && avgValence < 0.4) {
    primaryMood = 'sad';
    confidence = 0.6;
    reason = ' mellow mood detected';
  }
  // Low energy + high valence = peaceful
  else if (avgEnergy < 0.4 && avgValence > 0.5) {
    primaryMood = 'peaceful';
    confidence = 0.7;
    reason = 'Relaxing and content';
  }
  // High energy = energetic
  else if (avgEnergy > 0.7) {
    primaryMood = 'energetic';
    confidence = 0.7;
    reason = 'You\'re feeling energetic!';
  }
  // Epic songs dominating
  else if (recentMoods.includes('epic')) {
    primaryMood = 'epic';
    confidence = 0.6;
    reason = 'You\'re in the mood for something grand';
  }
  // Default to time-based mood
  else {
    primaryMood = TIME_MOODS[timeOfDay] || 'neutral';
    confidence = 0.5;
    reason = `Typical ${timeOfDay} listening`;
  }

  // Get secondary moods from recent songs
  const sortedMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([mood]) => mood as Mood)
    .filter(m => m !== primaryMood)
    .slice(0, 2);

  return {
    primary: primaryMood,
    secondary: sortedMoods,
    confidence,
    reason,
    suggestedActivities: MOOD_INFO[primaryMood].activities,
  };
}

/**
 * Sugiere playlists basadas en el mood detectado
 */
export async function suggestMoodPlaylists(
  mood: Mood,
  userId: string
): Promise<{ name: string; description: string; mood: Mood }[]> {
  const suggestions: { name: string; description: string; mood: Mood }[] = [];

  // Base playlists for each mood
  switch (mood) {
    case 'happy':
      suggestions.push(
        { name: 'Feel Good Hits', description: 'Songs to keep your spirits up', mood: 'happy' },
        { name: 'Upbeat Indie', description: 'Indie tracks to make you smile', mood: 'happy' }
      );
      break;
    case 'energetic':
      suggestions.push(
        { name: 'Power Workout', description: 'High energy for your session', mood: 'energetic' },
        { name: 'Electronic Beats', description: 'Pumping electronic tracks', mood: 'energetic' }
      );
      break;
    case 'chill':
      suggestions.push(
        { name: 'Chill Vibes', description: 'Relaxing beats for any moment', mood: 'chill' },
        { name: 'Lo-Fi Beats', description: 'Perfect background music', mood: 'chill' }
      );
      break;
    case 'sad':
      suggestions.push(
        { name: 'Melancholy', description: 'Beautiful sad songs', mood: 'sad' },
        { name: 'Rainy Day', description: 'Perfect for gray skies', mood: 'sad' }
      );
      break;
    case 'romantic':
      suggestions.push(
        { name: 'Love Songs', description: 'Heartfelt romantic tracks', mood: 'romantic' },
        { name: 'Date Night', description: 'Set the mood', mood: 'romantic' }
      );
      break;
    case 'epic':
      suggestions.push(
        { name: 'Epic Soundtracks', description: 'Grand and powerful music', mood: 'epic' },
        { name: 'Cinematic', description: 'Score-worthy anthems', mood: 'epic' }
      );
      break;
    case 'peaceful':
      suggestions.push(
        { name: 'Peaceful Piano', description: 'Calm and serene', mood: 'peaceful' },
        { name: 'Nature Sounds', description: 'Serene and grounding', mood: 'peaceful' }
      );
      break;
    case 'nostalgic':
      suggestions.push(
        { name: 'Throwback', description: 'Classic hits from the past', mood: 'nostalgic' },
        { name: 'Early 2000s', description: 'Remember when...', mood: 'nostalgic' }
      );
      break;
    default:
      suggestions.push(
        { name: 'Daily Mix 1', description: 'Your personalized mix', mood: 'neutral' }
      );
  }

  return suggestions;
}

/**
 * Obtiene la hora del día
 */
function getTimeOfDay(date: Date): string {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Obtiene información de un mood
 */
export function getMoodInfo(mood: Mood) {
  return MOOD_INFO[mood];
}
