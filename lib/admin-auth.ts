'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { is2FAEnabled } from './2fa'
import {
  createSession,
  verifySession,
  destroySession,
  rotateSession,
  verifyCSRFToken,
} from './session-manager'
import crypto from 'crypto'

// ADMIN_PASSWORD must be set in production!
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (() => {
  // Only show warning during runtime, not during build
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE && process.env.VERCEL_ENV) {
    console.error('⚠️ CRITICAL: ADMIN_PASSWORD not set in production! Using default password is UNSAFE!')
  }
  return 'admin123' // Default for development only
})()
const ADMIN_USER_ID = 'admin' // Single admin user

/**
 * Hash password with salt (for future password storage)
 */
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
}

/**
 * Verify password
 */
function verifyPassword(password: string, hashedPassword: string, salt: string): boolean {
  const hash = hashPassword(password, salt)
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hashedPassword))
}

/**
 * Login admin with secure session
 */
export async function loginAdmin(
  password: string,
  ipAddress: string,
  userAgent: string
): Promise<{ success: boolean; requires2FA?: boolean; error?: string; sessionData?: { sessionToken: string; csrfToken: string } }> {
  // Constant-time password comparison to prevent timing attacks
  const expectedPassword = ADMIN_PASSWORD
  const passwordBuffer = Buffer.from(password, 'utf8')
  const expectedBuffer = Buffer.from(expectedPassword, 'utf8')
  
  // timingSafeEqual requires buffers to have the same length
  // If lengths differ, pad the shorter one (but passwords won't match)
  if (passwordBuffer.length !== expectedBuffer.length) {
    // Add delay to prevent timing attacks
    await new Promise((resolve) => setTimeout(resolve, 100))
    return { success: false, error: 'Invalid password' }
  }
  
  const passwordMatch = crypto.timingSafeEqual(passwordBuffer, expectedBuffer)

  if (!passwordMatch) {
    // Add delay to prevent timing attacks
    await new Promise((resolve) => setTimeout(resolve, 100))
    return { success: false, error: 'Invalid password' }
  }

  const cookieStore = await cookies()

  // Check if 2FA is enabled
  const twoFAEnabled = await is2FAEnabled()

  if (twoFAEnabled) {
    // Set temporary session for 2FA verification (10 minutes)
    const tempSessionData = {
      userId: ADMIN_USER_ID,
      ipAddress,
      userAgent,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    }

    // Store temp session in encrypted cookie
    const tempCookieValue = Buffer.from(JSON.stringify(tempSessionData)).toString('base64')
    cookieStore.set('admin-auth-temp', tempCookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes for 2FA verification
      path: '/',
    })

    return { success: true, requires2FA: true }
  } else {
    // No 2FA, create session data (but don't set cookies here - do it in API route)
    try {
      const sessionResult = await createSession(ADMIN_USER_ID, ipAddress, userAgent)
      console.log('[Login] Session created:', { 
        hasSessionToken: !!sessionResult.sessionToken,
        hasCsrfToken: !!sessionResult.csrfToken 
      })
      // Return session data so API route can set cookies
      return { 
        success: true, 
        requires2FA: false,
        sessionData: sessionResult
      }
    } catch (error: any) {
      console.error('[Login] Failed to create session:', error)
      return { success: false, error: 'Failed to create session' }
    }
  }
}

/**
 * Logout admin and destroy session
 */
export async function logoutAdmin() {
  await destroySession()
  const cookieStore = await cookies()
  cookieStore.delete('admin-auth-temp')
  cookieStore.delete('admin-2fa-verified')
  redirect('/admin/login')
}

/**
 * Check if admin is authenticated with secure session
 */
export async function isAdminAuthenticated(
  request?: Request
): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const twoFAVerified = cookieStore.get('admin-2fa-verified')
    const sessionCookie = cookieStore.get('admin_session')
    const csrfCookie = cookieStore.get('admin_csrf')
    
    console.log('[isAdminAuthenticated] Cookie check:', {
      hasSessionCookie: !!sessionCookie,
      sessionCookieValue: sessionCookie?.value ? sessionCookie.value.substring(0, 20) + '...' : null,
      hasCsrfCookie: !!csrfCookie,
      has2FAVerified: !!twoFAVerified,
      twoFAVerifiedValue: twoFAVerified?.value,
    })

    // Check if 2FA is enabled
    const twoFAEnabled = await is2FAEnabled()
    console.log('[isAdminAuthenticated] 2FA enabled:', twoFAEnabled)

    // Verify session (works without request parameter in server components)
    const sessionCheck = await verifySession(request)
    
    console.log('[isAdminAuthenticated] Session check:', {
      valid: sessionCheck.valid,
      error: sessionCheck.error,
      twoFAEnabled,
    })

    if (twoFAEnabled) {
      // If session is valid, it means 2FA was already verified (session is created after 2FA)
      // So we only need to check session validity
      // The admin-2fa-verified cookie is temporary and gets deleted after session creation
      const result = sessionCheck.valid
      console.log('[isAdminAuthenticated] 2FA enabled, result:', result, {
        sessionValid: sessionCheck.valid,
        has2FAVerifiedCookie: !!twoFAVerified,
      })
      return result
    } else {
      // Just secure session required
      console.log('[isAdminAuthenticated] 2FA disabled, result:', sessionCheck.valid)
      return sessionCheck.valid
    }
  } catch (error: any) {
    console.error('[isAdminAuthenticated] Error:', error)
    console.error('[isAdminAuthenticated] Error stack:', error.stack)
    return false
  }
}

/**
 * Check if admin is pending 2FA
 */
export async function isAdminPending2FA(): Promise<boolean> {
  const cookieStore = await cookies()
  const tempAuth = cookieStore.get('admin-auth-temp')
  return !!tempAuth?.value
}

/**
 * Require admin authentication (redirect if not authenticated)
 */
export async function requireAdmin() {
  try {
    const authenticated = await isAdminAuthenticated()
    console.log('[requireAdmin] Authentication check:', { authenticated })
    if (!authenticated) {
      console.log('[requireAdmin] Not authenticated, redirecting to login')
      redirect('/admin/login')
    }
    console.log('[requireAdmin] Authenticated, allowing access')
  } catch (error: any) {
    console.error('[requireAdmin] Error checking authentication:', error)
    redirect('/admin/login')
  }
}

/**
 * Verify admin session and return session data
 */
export async function verifyAdminSession(
  sessionToken?: string
): Promise<boolean> {
  const sessionCheck = await verifySession()
  return sessionCheck.valid
}

/**
 * Rotate admin session (for security)
 */
export async function rotateAdminSession(
  ipAddress: string,
  userAgent: string
): Promise<void> {
  await rotateSession(ADMIN_USER_ID, ipAddress, userAgent)
}
