/**
 * Secure Session Management
 * Implements cryptographically secure session tokens with rotation
 */

import { cookies } from 'next/headers'
import crypto from 'crypto'

// SESSION_SECRET must be set in production!
// If not set, generate a warning and use a random value (sessions will be invalidated on restart)
const SESSION_SECRET = process.env.SESSION_SECRET || (() => {
  // Only show warning during runtime, not during build
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
    console.error('⚠️ CRITICAL: SESSION_SECRET not set in production! Sessions will be invalidated on restart.')
  }
  return crypto.randomBytes(32).toString('hex')
})()
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 days in seconds
const SESSION_COOKIE_NAME = 'admin_session'
const CSRF_COOKIE_NAME = 'admin_csrf'

interface SessionData {
  userId: string
  ipAddress: string
  userAgent: string
  createdAt: number
  lastActivity: number
}

/**
 * Generate cryptographically secure session token
 */
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Generate CSRF token
 */
function generateCSRFToken(): string {
  return crypto.randomBytes(16).toString('hex')
}

/**
 * Create encrypted session data
 */
function encryptSessionData(data: SessionData): string {
  const algorithm = 'aes-256-gcm'
  const key = crypto.scryptSync(SESSION_SECRET, 'salt', 32)
  const iv = crypto.randomBytes(16)
  
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), 'utf8'),
    cipher.final(),
  ])
  
  const authTag = cipher.getAuthTag()
  
  // Return: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

/**
 * Decrypt session data
 */
function decryptSessionData(encrypted: string): SessionData | null {
  try {
    const algorithm = 'aes-256-gcm'
    const key = crypto.scryptSync(SESSION_SECRET, 'salt', 32)
    
    const parts = encrypted.split(':')
    if (parts.length !== 3) return null
    
    const iv = Buffer.from(parts[0], 'hex')
    const authTag = Buffer.from(parts[1], 'hex')
    const encryptedData = Buffer.from(parts[2], 'hex')
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    decipher.setAuthTag(authTag)
    
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ])
    
    return JSON.parse(decrypted.toString('utf8'))
  } catch (error) {
    console.error('Session decryption error:', error)
    return null
  }
}

/**
 * Create secure session
 */
export async function createSession(
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<{ sessionToken: string; csrfToken: string }> {
  const sessionToken = generateSessionToken()
  const csrfToken = generateCSRFToken()
  
  const sessionData: SessionData = {
    userId,
    ipAddress,
    userAgent: userAgent.substring(0, 500), // Limit length
    createdAt: Date.now(),
    lastActivity: Date.now(),
  }
  
  const encryptedData = encryptSessionData(sessionData)
  
  // Store session in cookie (encrypted)
  const cookieStore = await cookies()
  
  // Check if we're in production with HTTPS
  const isProduction = process.env.NODE_ENV === 'production'
  const isSecure = isProduction && process.env.VERCEL_ENV !== undefined
  
  cookieStore.set(SESSION_COOKIE_NAME, encryptedData, {
    httpOnly: true, // Prevent XSS
    secure: isSecure, // HTTPS only in production
    sameSite: 'strict', // CSRF protection
    maxAge: SESSION_DURATION,
    path: '/',
    // Don't set domain - let browser handle it
  })
  
  console.log('[Session] Setting session cookie:', {
    name: SESSION_COOKIE_NAME,
    hasValue: !!encryptedData,
    secure: isSecure,
    maxAge: SESSION_DURATION,
  })
  
  // Store CSRF token in separate cookie
  cookieStore.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false, // Must be readable by JavaScript for CSRF checks
    secure: isSecure,
    sameSite: 'strict',
    maxAge: SESSION_DURATION,
    path: '/',
  })
  
  console.log('[Session] Setting CSRF cookie:', {
    name: CSRF_COOKIE_NAME,
    hasValue: !!csrfToken,
    secure: isSecure,
  })
  
  return { sessionToken: encryptedData, csrfToken }
}

/**
 * Verify session
 */
export async function verifySession(
  request?: Request
): Promise<{ valid: boolean; sessionData?: SessionData; error?: string }> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
    
    if (!sessionCookie?.value) {
      return { valid: false, error: 'No session found' }
    }
    
    const sessionData = decryptSessionData(sessionCookie.value)
    
    if (!sessionData) {
      return { valid: false, error: 'Invalid session' }
    }
    
    // Check session expiration
    const now = Date.now()
    const sessionAge = now - sessionData.createdAt
    const maxAge = SESSION_DURATION * 1000 // Convert to milliseconds
    
    if (sessionAge > maxAge) {
      return { valid: false, error: 'Session expired' }
    }
    
    // Check last activity (force re-authentication after 24 hours of inactivity)
    const inactivityLimit = 24 * 60 * 60 * 1000 // 24 hours
    if (now - sessionData.lastActivity > inactivityLimit) {
      return { valid: false, error: 'Session inactive too long' }
    }
    
    // Verify IP address if request is available (optional but recommended)
    if (request) {
      const clientIP = getClientIP(request)
      // Allow IP changes (user might be on mobile network)
      // But log it for security monitoring
      if (clientIP !== sessionData.ipAddress) {
        console.warn(`[Security] IP address changed for session: ${sessionData.userId}`)
        // Optionally invalidate session on IP change:
        // return { valid: false, error: 'IP address changed' }
      }
    }
    
    // Update last activity
    sessionData.lastActivity = now
    const updatedEncrypted = encryptSessionData(sessionData)
    cookieStore.set(SESSION_COOKIE_NAME, updatedEncrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION,
      path: '/',
    })
    
    return { valid: true, sessionData }
  } catch (error) {
    console.error('Session verification error:', error)
    return { valid: false, error: 'Session verification failed' }
  }
}

/**
 * Verify CSRF token
 */
export async function verifyCSRFToken(token: string): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const csrfCookie = cookieStore.get(CSRF_COOKIE_NAME)
    
    if (!csrfCookie?.value || !token) {
      return false
    }
    
    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(csrfCookie.value),
      Buffer.from(token)
    )
  } catch (error) {
    console.error('CSRF verification error:', error)
    return false
  }
}

/**
 * Get CSRF token
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const csrfCookie = cookieStore.get(CSRF_COOKIE_NAME)
  return csrfCookie?.value || null
}

/**
 * Destroy session
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  cookieStore.delete(CSRF_COOKIE_NAME)
}

/**
 * Rotate session (create new session, invalidate old one)
 */
export async function rotateSession(
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<{ sessionToken: string; csrfToken: string }> {
  await destroySession()
  return createSession(userId, ipAddress, userAgent)
}

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
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
