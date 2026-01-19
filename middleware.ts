import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSecurityHeaders, getClientIP, rateLimit } from '@/lib/security'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname
  
  // Add pathname to header for layout to check
  response.headers.set('x-pathname', pathname)
  
  // Apply security headers
  const securityHeaders = getSecurityHeaders()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Performance headers
  if (!pathname.startsWith('/api/')) {
    // Cache static assets
    if (pathname.match(/\.(jpg|jpeg|png|gif|ico|svg|webp|avif|woff|woff2|ttf|eot)$/)) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    }
    // Cache HTML with shorter TTL
    else if (pathname === '/' || pathname.match(/^\/[^/]+$/)) {
      response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    }
  }
  
  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(clientIP, {
      windowMs: 60000, // 1 minute
      maxRequests: 100, // 100 requests per minute
    })
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            ),
            ...securityHeaders,
          },
        }
      )
    }
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '100')
    response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
    response.headers.set(
      'X-RateLimit-Reset',
      String(Math.ceil(rateLimitResult.resetTime / 1000))
    )
  }
  
  // Additional rate limiting for sensitive endpoints
  const sensitiveEndpoints = [
    '/api/admin/login',
    '/api/contact',
    '/api/newsletter/subscribe',
    '/api/comments',
  ]
  
  if (sensitiveEndpoints.some((endpoint) => pathname.startsWith(endpoint))) {
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`${clientIP}:${pathname}`, {
      windowMs: 60000, // 1 minute
      maxRequests: 10, // 10 requests per minute for sensitive endpoints
    })
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            ),
            ...securityHeaders,
          },
        }
      )
    }
  }
  
  // CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL || 'https://calisound.music',
      'http://localhost:3000',
      'http://localhost:3001',
    ]
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // Also match API routes for rate limiting
    '/api/:path*',
  ],
}
