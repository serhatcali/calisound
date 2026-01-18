# Security Documentation

## Overview

This document outlines the security measures implemented in the CALI Sound application.

## Security Features

### 1. Input Validation & Sanitization

- All user inputs are validated using the `validateObject`, `validateString`, and `validateNumber` functions from `lib/security.ts`
- XSS protection through input sanitization (removes `<`, `>`, `javascript:`, event handlers)
- Email and URL format validation
- Length limits on all string inputs
- Pattern matching for specific input types

### 2. SQL Injection Protection

- **Supabase uses parameterized queries** - All database queries are automatically protected against SQL injection
- No raw SQL queries are executed
- All inputs are sanitized before being passed to database operations

### 3. Rate Limiting

- **Global API rate limiting**: 100 requests per minute per IP
- **Sensitive endpoints**: 10 requests per minute (login, contact, newsletter, comments)
- **Admin login**: 5 attempts per 15 minutes
- Rate limit headers included in responses (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)

### 4. Security Headers

The following security headers are set via middleware:

- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Permissions-Policy` - Restricts browser features
- `Strict-Transport-Security` - Forces HTTPS (in production)

### 5. CORS Protection

- CORS headers only set for allowed origins
- Allowed origins configured in `middleware.ts`
- Credentials allowed only for trusted origins

### 6. Authentication & Authorization

- Admin routes protected with session-based authentication
- 2FA support for admin accounts
- Session tokens stored in HTTP-only cookies
- Password validation and hashing (via `lib/admin-auth.ts`)

### 7. Error Handling

- Generic error messages returned to clients (no sensitive information exposed)
- Detailed errors logged server-side only
- Database errors not exposed to clients

### 8. API Route Security

#### Public Routes (with rate limiting):
- `/api/contact` - Contact form submissions
- `/api/newsletter/subscribe` - Newsletter subscriptions
- `/api/comments` - Comment submissions
- `/api/search` - Search functionality

#### Protected Routes (require admin authentication):
- `/api/admin/*` - All admin routes require authentication

### 9. Environment Variables

- Sensitive data stored in environment variables
- `.env.local` file excluded from version control
- Public variables prefixed with `NEXT_PUBLIC_`
- Private variables never exposed to client

## Security Best Practices

### For Developers

1. **Always validate and sanitize inputs** using `lib/security.ts` utilities
2. **Use parameterized queries** - Never concatenate user input into SQL
3. **Implement rate limiting** for all public endpoints
4. **Never expose sensitive errors** to clients
5. **Use HTTPS** in production
6. **Keep dependencies updated** - Regularly update npm packages
7. **Review logs** for suspicious activity

### For Deployment

1. **Set secure environment variables** in production
2. **Enable HTTPS** (automatic on Vercel)
3. **Configure CORS** properly for your domain
4. **Monitor rate limiting** and adjust if needed
5. **Set up error monitoring** (Sentry is configured)
6. **Regular security audits** of dependencies

## Rate Limiting Configuration

Rate limits can be adjusted in `middleware.ts`:

```typescript
// Global API rate limit
rateLimit(clientIP, {
  windowMs: 60000, // 1 minute
  maxRequests: 100, // 100 requests per minute
})

// Sensitive endpoints
rateLimit(`${clientIP}:${pathname}`, {
  windowMs: 60000, // 1 minute
  maxRequests: 10, // 10 requests per minute
})

// Admin login
rateLimit(`admin-login:${clientIP}`, {
  windowMs: 900000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
})
```

## Security Checklist

- [x] Input validation and sanitization
- [x] SQL injection protection (Supabase parameterized queries)
- [x] XSS protection
- [x] Rate limiting
- [x] Security headers
- [x] CORS configuration
- [x] Authentication & authorization
- [x] Error handling (no sensitive data exposure)
- [x] HTTPS enforcement (via hosting provider)
- [x] Environment variable security
- [ ] Regular security audits (recommended)
- [ ] Dependency vulnerability scanning (recommended)

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. **Do not** create a public GitHub issue
2. Email security concerns to the project maintainer
3. Include detailed information about the vulnerability
4. Allow time for the issue to be addressed before public disclosure

## Updates

This document should be reviewed and updated regularly as security measures evolve.
