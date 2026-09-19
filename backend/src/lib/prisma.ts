/**
 * Cliente único de Prisma (acceso a la base de datos).
 * En desarrollo se guarda en `global` para que el hot-reload no abra
 * conexiones nuevas cada vez que cambia un archivo.
 */

import { PrismaClient } from '@prisma/client';

declare global {
  // Prevent multiple instances of Prisma Client in development
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn']
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
