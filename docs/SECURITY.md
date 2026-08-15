# 🔒 Security Documentation - SonYDuck

## Overview

This document outlines the security measures implemented in SonYDuck to protect user data and ensure secure operations.

## Implemented Security Measures

### 1. Authentication & Authorization

#### JWT Tokens
- **Access Token**: 15-minute expiration
- **Refresh Token**: 7-day expiration with rotation
- **Algorithm**: HS256 (HMAC SHA-256)
- **Storage**: Tokens stored server-side (refresh) + client-side

```typescript
// Token generation uses strong secrets from environment
jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '15m' })
jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' })
```

#### Password Security
- **Hashing**: bcrypt with cost factor 12
- **Requirements**: 8+ chars, 1 uppercase, 1 number
- **Storage**: Never stored in plain text

### 2. API Security

#### Rate Limiting
| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `/api/auth/*` | 10 requests | 15 min | Prevent brute force |
| `/api/*` | 100 requests | 15 min | General protection |
| `/api/ai/*` | 30 requests | 1 min | Prevent AI abuse |

#### CORS Configuration
```typescript
cors({
  origin: config.frontendUrl, // Whitelist only
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
```

### 3. Input Validation & Sanitization

#### Zod Validation
All user inputs are validated using Zod schemas:

```typescript
registerSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
})
```

#### Input Sanitization
- String escaping for display
- Email normalization
- Search query sanitization (removes dangerous chars)
- Content length validation (max 10KB)

### 4. Security Headers (Helmet)

| Header | Value | Protection |
|--------|-------|------------|
| Content-Security-Policy | Strict whitelist | XSS, injection |
| X-Frame-Options | DENY | Clickjacking |
| X-Content-Type-Options | nosniff | MIME sniffing |
| HSTS | 1 year, preload | HTTPS only |
| Referrer-Policy | strict-origin | Referrer leak |
| X-XSS-Protection | Enabled | XSS in older browsers |

### 5. Database Security

#### Prisma ORM
- Parameterized queries (prevents SQL injection)
- Connection pooling
- Read-only queries where possible

#### Data Protection
- Passwords never returned in API responses
- Sensitive fields use `select` to limit data exposure

### 6. Error Handling

```typescript
// Production: Generic error messages
if (process.env.NODE_ENV === 'production') {
  return res.status(500).json({
    error: { code: 'SERVER_ERROR', message: 'Something went wrong' }
  })
}
```

## Security Checklist

### Development
- [x] Environment variables for all secrets
- [x] No hardcoded credentials
- [x] Secure defaults in Helmet
- [x] Input validation on all endpoints

### Authentication
- [x] Strong password requirements
- [x] JWT with short expiration
- [x] Refresh token rotation
- [x] Rate limiting on auth endpoints
- [x] Generic error messages (prevents user enumeration)

### API
- [x] CORS whitelist
- [x] Rate limiting
- [x] Request size limits
- [x] Input sanitization
- [x] Output encoding

### Database
- [x] Parameterized queries (Prisma)
- [x] Least privilege principle
- [x] No sensitive data in logs

## Environment Variables Required

```env
# JWT Secrets (CRITICAL - use strong random values)
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.com
```

## Recommendations for Production

### 1. HTTPS
Always use HTTPS in production. Configure:
- TLS 1.3
- Strong cipher suites
- HSTS preload

### 2. Database
- Enable SSL connections
- Use connection limits
- Regular backups
- Row-level security (if using PostgreSQL)

### 3. Monitoring
- Log failed authentication attempts
- Monitor rate limit triggers
- Set up alerts for unusual activity

### 4. Additional Measures to Consider
- [ ] Two-factor authentication (2FA)
- [ ] Account lockout after failed attempts
- [ ] Password reset with email verification
- [ ] IP-based access restrictions
- [ ] API key for programmatic access
- [ ] Web Application Firewall (WAF)

## Vulnerability Reporting

If you discover a security vulnerability, please:
1. DO NOT open a public GitHub issue
2. Email the maintainers directly
3. Include details about the vulnerability
4. Allow time for patching before public disclosure

## Dependencies Security

Regularly update dependencies to patch known vulnerabilities:

```bash
npm audit
npm audit fix
```

## Security Timeline

| Date | Change |
|------|--------|
| 2024-01 | Initial security implementation |
| 2024-01 | Added rate limiting |
| 2024-01 | Implemented input sanitization |
| 2024-01 | Security headers with Helmet |

---

**Remember**: Security is an ongoing process. Regular audits and updates are essential.
