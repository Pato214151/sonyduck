import { Request, Response, NextFunction } from 'express';
import validator from 'validator';
import { AuthRequest } from './auth.js';

// Sanitize string input - removes dangerous characters
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return validator.escape(
    validator.trim(input)
  );
};

// Sanitize email
export const sanitizeEmail = (email: string): string => {
  return validator.normalizeEmail(email) || email;
};

// Validate and sanitize search query
export const sanitizeSearchQuery = (query: string): string => {
  if (!query || typeof query !== 'string') return '';
  
  // Remove potentially dangerous characters but allow unicode and common search chars
  return query
    .slice(0, 200) // Limit length
    .replace(/[<>'"&]/g, '') // Remove dangerous chars
    .trim();
};

// Middleware to sanitize request body
export const sanitizeBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body) {
    // Only sanitize string fields that might contain user input
    const fieldsToSanitize = ['name', 'description', 'title'];
    
    for (const field of fieldsToSanitize) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = sanitizeString(req.body[field]);
      }
    }
  }
  next();
};

// Sanitize query parameters for search endpoints
export const sanitizeQuery = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.query.q && typeof req.query.q === 'string') {
    req.query.q = sanitizeSearchQuery(req.query.q);
  }
  if (req.query.search && typeof req.query.search === 'string') {
    req.query.search = sanitizeSearchQuery(req.query.search);
  }
  next();
};

// Validate content length to prevent DoS
export const validateContentLength = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  const maxLength = 10 * 1024; // 10KB max body size
  
  if (contentLength > maxLength) {
    return res.status(413).json({
      success: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request body too large',
      },
    });
  }
  next();
};
