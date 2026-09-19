/**
 * Cabeceras HTTP de seguridad con Helmet (CSP, HSTS, anti-clickjacking,
 * no-sniff, referrer policy).
 */

import helmet from 'helmet';

// Enhanced security headers with Helmet
export const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      mediaSrc: ["'self'", "https:"],
      connectSrc: ["'self'", "https://picsum.photos", "https://www.soundhelix.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  
  // Prevent clickjacking
  frameguard: {
    action: 'deny',
  },
  
  // XSS Protection (deprecated, but kept for older browser support)
  xssFilter: false,
  
  // Hide X-Powered-By header
  hidePoweredBy: true,
  
  // Force HTTPS
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  // Prevent MIME type sniffing
  noSniff: true,
  
  // Referrer policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
});
