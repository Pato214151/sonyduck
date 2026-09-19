/**
 * Manejo centralizado de errores.
 * Toda respuesta de error sale con el formato { success: false, error: { code, message } }.
 */

import { Request, Response, NextFunction } from 'express';

/** Error "esperado" con código HTTP y código propio (ej: 404 NOT_FOUND). */
export class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Convierte cualquier error en una respuesta JSON. Los errores de Prisma por
 * valor duplicado (P2002) salen como 409; lo demás como 500.
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'A record with this value already exists',
        },
      });
    }
  }

  // Default error
  return res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Something went wrong' 
        : err.message,
    },
  });
};

/** Envuelve un handler async para que sus errores lleguen a errorHandler. */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
