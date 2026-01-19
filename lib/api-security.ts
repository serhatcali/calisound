/**
 * API Security utilities for protecting admin routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifySession, verifyCSRFToken } from '@/lib/session-manager'
import { isAdminAuthenticated } from '@/lib/admin-auth'

/**
 * Check if user is authenticated as admin with secure session
 */
export async function requireAdminAuth(
  request: NextRequest
): Promise<{ authorized: boolean; response?: NextResponse }> {
  try {
    // Verify secure session
    const sessionCheck = await verifySession(request)

    if (!sessionCheck.valid) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Unauthorized - Invalid session' },
          { status: 401 }
        ),
      }
    }

    // Also check admin authentication (for 2FA support)
    const isAuthenticated = await isAdminAuthenticated(request)

    if (!isAuthenticated) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        ),
      }
    }

    return { authorized: true }
  } catch (error) {
    console.error('Admin auth check error:', error)
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      ),
    }
  }
}

/**
 * Verify CSRF token from request
 */
export async function requireCSRFToken(
  request: NextRequest
): Promise<{ valid: boolean; response?: NextResponse }> {
  try {
    // Only try to parse JSON for methods that have a body
    const method = request.method
    let body = {}
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      try {
        body = await request.json()
      } catch {
        // Body might be empty or not JSON
        body = {}
      }
    }
    const csrfToken = body.csrfToken || request.headers.get('x-csrf-token')

    if (!csrfToken) {
      return {
        valid: false,
        response: NextResponse.json(
          { error: 'CSRF token required' },
          { status: 403 }
        ),
      }
    }

    const isValid = await verifyCSRFToken(csrfToken)

    if (!isValid) {
      return {
        valid: false,
        response: NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        ),
      }
    }

    return { valid: true }
  } catch (error) {
    console.error('CSRF check error:', error)
    return {
      valid: false,
      response: NextResponse.json(
        { error: 'CSRF verification failed' },
        { status: 500 }
      ),
    }
  }
}

/**
 * Wrapper for admin API routes with authentication
 */
export function withAdminAuth(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authCheck = await requireAdminAuth(request)
    if (!authCheck.authorized) {
      return authCheck.response!
    }
    return handler(request)
  }
}

/**
 * Wrapper for admin API routes with authentication + CSRF protection
 * For GET requests, use isAdminAuthenticated directly
 */
export function withAdminAuthAndCSRF(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      // Check authentication
      const authCheck = await requireAdminAuth(request)
      if (!authCheck.authorized) {
        return authCheck.response!
      }

      // Check CSRF token (only for POST, PUT, DELETE, PATCH)
      const method = request.method
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        const csrfCheck = await requireCSRFToken(request)
        if (!csrfCheck.valid) {
          return csrfCheck.response!
        }
      }

      return handler(request)
    } catch (error: any) {
      console.error('withAdminAuthAndCSRF error:', error)
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      )
    }
  }
}
