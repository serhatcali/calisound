/**
 * Security utilities for input validation, sanitization, and rate limiting
 */

// Rate limiting store (in-memory, for production use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

/**
 * Rate limiting middleware
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions = { windowMs: 60000, maxRequests: 10 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = identifier
  const record = rateLimitStore.get(key)

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    // 1% chance to clean up
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k)
      }
    }
  }

  if (!record || record.resetTime < now) {
    // New window or expired
    const resetTime = now + options.windowMs
    rateLimitStore.set(key, { count: 1, resetTime })
    return { allowed: true, remaining: options.maxRequests - 1, resetTime }
  }

  if (record.count >= options.maxRequests) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }

  // Increment count
  record.count++
  rateLimitStore.set(key, record)
  return {
    allowed: true,
    remaining: options.maxRequests - record.count,
    resetTime: record.resetTime,
  }
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Check various headers for IP (in order of preference)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  return 'unknown'
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers (onclick=, etc.)
    .trim()
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') {
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim()) && email.length <= 254
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
  if (typeof url !== 'string') {
    return false
  }

  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Validate and sanitize string input
 */
export function validateString(
  input: unknown,
  options: {
    minLength?: number
    maxLength?: number
    required?: boolean
    pattern?: RegExp
  } = {}
): { valid: boolean; value?: string; error?: string } {
  if (input === null || input === undefined) {
    if (options.required) {
      return { valid: false, error: 'Field is required' }
    }
    return { valid: true, value: '' }
  }

  if (typeof input !== 'string') {
    return { valid: false, error: 'Invalid input type' }
  }

  const sanitized = sanitizeInput(input)
  const trimmed = sanitized.trim()

  if (options.required && trimmed.length === 0) {
    return { valid: false, error: 'Field is required' }
  }

  if (options.minLength && trimmed.length < options.minLength) {
    return {
      valid: false,
      error: `Minimum length is ${options.minLength} characters`,
    }
  }

  if (options.maxLength && trimmed.length > options.maxLength) {
    return {
      valid: false,
      error: `Maximum length is ${options.maxLength} characters`,
    }
  }

  if (options.pattern && !options.pattern.test(trimmed)) {
    return { valid: false, error: 'Invalid format' }
  }

  return { valid: true, value: trimmed }
}

/**
 * Validate number input
 */
export function validateNumber(
  input: unknown,
  options: {
    min?: number
    max?: number
    required?: boolean
    integer?: boolean
  } = {}
): { valid: boolean; value?: number; error?: string } {
  if (input === null || input === undefined) {
    if (options.required) {
      return { valid: false, error: 'Field is required' }
    }
    return { valid: true }
  }

  const num = typeof input === 'string' ? parseFloat(input) : Number(input)

  if (isNaN(num)) {
    return { valid: false, error: 'Invalid number' }
  }

  if (options.integer && !Number.isInteger(num)) {
    return { valid: false, error: 'Must be an integer' }
  }

  if (options.min !== undefined && num < options.min) {
    return { valid: false, error: `Minimum value is ${options.min}` }
  }

  if (options.max !== undefined && num > options.max) {
    return { valid: false, error: `Maximum value is ${options.max}` }
  }

  return { valid: true, value: num }
}

/**
 * Validate and sanitize object input
 */
export function validateObject<T extends Record<string, unknown>>(
  input: unknown,
  schema: Record<
    string,
    {
      type: 'string' | 'number' | 'boolean' | 'email' | 'url'
      required?: boolean
      minLength?: number
      maxLength?: number
      min?: number
      max?: number
      pattern?: RegExp
    }
  >
): { valid: boolean; value?: T; errors?: Record<string, string> } {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { valid: false, errors: { _: 'Invalid input format' } }
  }

  const obj = input as Record<string, unknown>
  const result: Record<string, unknown> = {}
  const errors: Record<string, string> = {}

  for (const [key, rules] of Object.entries(schema)) {
    const value = obj[key]

    if (rules.required && (value === null || value === undefined)) {
      errors[key] = 'Field is required'
      continue
    }

    if (value === null || value === undefined) {
      continue
    }

    switch (rules.type) {
      case 'string':
        const strValidation = validateString(value, {
          minLength: rules.minLength,
          maxLength: rules.maxLength,
          pattern: rules.pattern,
        })
        if (!strValidation.valid) {
          errors[key] = strValidation.error || 'Invalid string'
        } else {
          result[key] = strValidation.value
        }
        break

      case 'number':
        const numValidation = validateNumber(value, {
          min: rules.min,
          max: rules.max,
        })
        if (!numValidation.valid) {
          errors[key] = numValidation.error || 'Invalid number'
        } else {
          result[key] = numValidation.value
        }
        break

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors[key] = 'Must be a boolean'
        } else {
          result[key] = value
        }
        break

      case 'email':
        if (!isValidEmail(String(value))) {
          errors[key] = 'Invalid email format'
        } else {
          result[key] = sanitizeInput(String(value))
        }
        break

      case 'url':
        if (!isValidURL(String(value))) {
          errors[key] = 'Invalid URL format'
        } else {
          result[key] = sanitizeInput(String(value))
        }
        break
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  return { valid: true, value: result as T }
}

/**
 * Generate CSRF token (simple implementation)
 * For production, use a more robust solution
 */
export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) {
    return false
  }
  return token === expectedToken && token.length === 64
}

/**
 * Check if request is from same origin
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')

  if (!origin && !referer) {
    return false
  }

  if (origin) {
    try {
      const originURL = new URL(origin)
      return originURL.hostname === host
    } catch {
      return false
    }
  }

  if (referer) {
    try {
      const refererURL = new URL(referer)
      return refererURL.hostname === host
    } catch {
      return false
    }
  }

  return false
}

/**
 * Security headers
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'Strict-Transport-Security':
      'max-age=31536000; includeSubDomains; preload',
  }
}
