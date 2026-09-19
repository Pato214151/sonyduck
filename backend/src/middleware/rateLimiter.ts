/**
 * Límites de peticiones por IP (express-rate-limit) para frenar abusos:
 * general, login/registro, cambios de contraseña y endpoints de IA.
 */

import rateLimit from 'express-rate-limit';

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { 
    success: false, 
    error: { 
      code: 'RATE_LIMIT', 
      message: 'Too many requests, please try again later.' 
    } 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth endpoints (login, register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Only 10 attempts per window
  message: { 
    success: false, 
    error: { 
      code: 'TOO_MANY_REQUESTS', 
      message: 'Too many authentication attempts. Please try again in 15 minutes.' 
    } 
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Stricter limiter for password-related actions
export const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Only 5 password attempts
  message: { 
    success: false, 
    error: { 
      code: 'TOO_MANY_REQUESTS', 
      message: 'Too many password attempts. Please try again in 1 hour.' 
    } 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI endpoints rate limiter (prevent abuse)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 AI requests per minute
  message: { 
    success: false, 
    error: { 
      code: 'AI_RATE_LIMIT', 
      message: 'Too many AI requests. Please slow down.' 
    } 
  },
  standardHeaders: true,
  legacyHeaders: false,
});
