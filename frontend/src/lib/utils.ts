/** Funciones de ayuda para la interfaz. */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Une clases de Tailwind resolviendo conflictos (clsx + tailwind-merge). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Segundos → "m:ss". */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/** Segundos → "X hr Y min" (duración total de una playlist). */
export function formatTotalDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} hr ${mins} min`;
  }
  return `${mins} min`;
}

/** Números grandes abreviados (1.2K, 3.4M). */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/** Copia desordenada de un arreglo (Fisher-Yates). */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Iniciales de un nombre para los avatares sin foto. */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Degradado de colores al azar para portadas sin imagen. */
export function getRandomGradient(): string {
  const gradients = [
    'from-purple-900 to-blue-900',
    'from-green-900 to-teal-900',
    'from-red-900 to-orange-900',
    'from-pink-900 to-purple-900',
    'from-yellow-900 to-red-900',
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
}
