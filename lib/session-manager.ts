/**
 * Secure Session Management
 * Implements cryptographically secure session tokens with rotation
 */

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
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
    console.log('[decryptSessionData] Starting decryption, encrypted length:', encrypted.length)
    console.log('[decryptSessionData] Encrypted preview:', encrypted.substring(0, 50) + '...')
    
    const algorithm = 'aes-256-gcm'
    const key = crypto.scryptSync(SESSION_SECRET, 'salt', 32)
    console.log('[decryptSessionData] Key generated, length:', key.length)
    
    const parts = encrypted.split(':')
    console.log('[decryptSessionData] Split parts count:', parts.length)
    if (parts.length !== 3) {
      console.error('[decryptSessionData] Invalid format: expected 3 parts, got', parts.length)
      return null
    }
    
    const iv = Buffer.from(parts[0], 'hex')
    const authTag = Buffer.from(parts[1], 'hex')
    const encryptedData = Buffer.from(parts[2], 'hex')
    console.log('[decryptSessionData] Parsed parts:', {
      ivLength: iv.length,
      authTagLength: authTag.length,
      encryptedDataLength: encryptedData.length,
    })
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    decipher.setAuthTag(authTag)
    
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ])
    
    console.log('[decryptSessionData] Decrypted successfully, length:', decrypted.length)
    const parsed = JSON.parse(decrypted.toString('utf8'))
    console.log('[decryptSessionData] Parsed session data:', {
      userId: parsed.userId,
      hasIpAddress: !!parsed.ipAddress,
      hasUserAgent: !!parsed.userAgent,
    })
    
    return parsed
  } catch (error: any) {
    console.error('[decryptSessionData] Decryption error:', error.message)
    console.error('[decryptSessionData] Error stack:', error.stack)
    console.error('[decryptSessionData] Error name:', error.name)
    return null
  }
}

/**
 * Create secure session data (without setting cookies)
 * Cookies should be set in API route using setSessionCookies()
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
  
  console.log('[Session] Created session data:', {
    userId,
    hasSessionToken: !!encryptedData,
    hasCsrfToken: !!csrfToken,
    tokenLength: encryptedData.length,
  })
  
  // Don't set cookies here - they should be set in API route using setSessionCookies()
  return { sessionToken: encryptedData, csrfToken }
}

/**
 * Set session cookies in NextResponse
 * This is needed because cookies() API in server actions doesn't always work in API routes
 */
export function setSessionCookies(
  response: NextResponse,
  sessionToken: string,
  csrfToken: string
): void {
  if (!sessionToken || !csrfToken) {
    console.error('[Session] Missing session or CSRF token:', {
      hasSessionToken: !!sessionToken,
      hasCsrfToken: !!csrfToken,
    })
    return
  }
  
  const isProduction = process.env.NODE_ENV === 'production'
  const isVercel = !!process.env.VERCEL
  // In development, don't use secure cookies (localhost doesn't support secure)
  const isSecure = isProduction && isVercel
  
  console.log('[Session] Setting cookies with config:', {
    isProduction,
    isVercel,
    isSecure,
    sessionCookieName: SESSION_COOKIE_NAME,
    csrfCookieName: CSRF_COOKIE_NAME,
    maxAge: SESSION_DURATION,
    sessionTokenLength: sessionToken?.length,
    csrfTokenLength: csrfToken?.length,
  })
  
  // Set session cookie
  try {
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: SESSION_DURATION,
      path: '/',
    })
    console.log('[Session] Session cookie set successfully')
  } catch (error: any) {
    console.error('[Session] Error setting session cookie:', error)
  }
  
  // Set CSRF cookie
  try {
    response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: false,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: SESSION_DURATION,
      path: '/',
    })
    console.log('[Session] CSRF cookie set successfully')
  } catch (error: any) {
    console.error('[Session] Error setting CSRF cookie:', error)
  }
  
  // Verify cookies were set
  const sessionCookie = response.cookies.get(SESSION_COOKIE_NAME)
  const csrfCookie = response.cookies.get(CSRF_COOKIE_NAME)
  
  console.log('[Session] Cookies set in response:', {
    sessionCookieSet: !!sessionCookie,
    csrfCookieSet: !!csrfCookie,
    sessionCookieValue: sessionCookie?.value?.substring(0, 20) + '...',
    csrfCookieValue: csrfCookie?.value,
  })
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
    
    console.log('[verifySession] Cookie check:', {
      hasSessionCookie: !!sessionCookie,
      cookieValueLength: sessionCookie?.value?.length,
      cookieValuePreview: sessionCookie?.value ? sessionCookie.value.substring(0, 50) + '...' : null,
    })
    
    if (!sessionCookie?.value) {
      console.log('[verifySession] No session cookie found')
      return { valid: false, error: 'No session found' }
    }
    
    console.log('[verifySession] Attempting to decrypt session data...')
    const sessionData = decryptSessionData(sessionCookie.value)
    
    console.log('[verifySession] Decrypt result:', {
      hasSessionData: !!sessionData,
      userId: sessionData?.userId,
      createdAt: sessionData?.createdAt ? new Date(sessionData.createdAt).toISOString() : null,
      lastActivity: sessionData?.lastActivity ? new Date(sessionData.lastActivity).toISOString() : null,
    })
    
    if (!sessionData) {
      console.error('[verifySession] Failed to decrypt session data')
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
      const { getClientIP } = await import('@/lib/security')
      const clientIP = getClientIP(request)
      // Allow IP changes (user might be on mobile network)
      // But log it for security monitoring
      if (clientIP !== sessionData.ipAddress) {
        console.warn(`[Security] IP address changed for session: ${sessionData.userId}`)
        // Optionally invalidate session on IP change:
        // return { valid: false, error: 'IP address changed' }
      }
    }
    
    // Update last activity (but don't update cookie in server components)
    // Cookie updates should be done via API routes
    sessionData.lastActivity = now
    
    // Note: In server components, cookies().set() doesn't work
    // Session activity update should be done via API route or middleware
    // For now, just return valid without updating cookie
    
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
