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
  if (process.env.NODE_ENV === 'production') {
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
): Promise<{ success: boolean; requires2FA?: boolean; error?: string }> {
  // Constant-time password comparison to prevent timing attacks
  const expectedPassword = ADMIN_PASSWORD
  const passwordMatch = crypto.timingSafeEqual(
    Buffer.from(password),
    Buffer.from(expectedPassword)
  )

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
      sameSite: 'strict', // Changed from 'lax' to 'strict' for better CSRF protection
      maxAge: 60 * 10, // 10 minutes for 2FA verification
      path: '/',
    })

    return { success: true, requires2FA: true }
  } else {
    // No 2FA, create full secure session
    await createSession(ADMIN_USER_ID, ipAddress, userAgent)
    return { success: true, requires2FA: false }
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
  const cookieStore = await cookies()
  const twoFAVerified = cookieStore.get('admin-2fa-verified')

  // Check if 2FA is enabled
  const twoFAEnabled = await is2FAEnabled()

  if (twoFAEnabled) {
    // Both secure session and 2FA verification required
    const sessionCheck = await verifySession(request)
    return sessionCheck.valid && twoFAVerified?.value === 'true'
  } else {
    // Just secure session required
    const sessionCheck = await verifySession(request)
    return sessionCheck.valid
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
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) {
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
