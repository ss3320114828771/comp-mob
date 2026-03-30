import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// ==================== Configuration ====================

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/products',
  '/products/:path*',
  '/about',
  '/contact',
  '/login',
  '/register',
  '/api/auth',
  '/api/products',
  '/api/products/:path*',
  '/api/upload',
  '/api/email',
  '/_next',
  '/favicon.ico',
  '/images',
  '/uploads',
]

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/cart',
  '/checkout',
  '/profile',
  '/orders',
  '/wishlist',
  '/api/cart',
  '/api/orders',
  '/api/user',
]

// Admin only routes
const adminRoutes = [
  '/admin',
  '/admin/:path*',
  '/api/admin',
  '/api/products/create',
  '/api/products/update',
  '/api/products/delete',
]

// API routes that should handle CORS
const apiRoutes = [
  '/api/:path*',
]

// ==================== Helper Functions ====================

/**
 * Check if path matches pattern
 */
function matchesPattern(path: string, pattern: string): boolean {
  // Convert pattern to regex
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.')
    .replace(/:\w+/g, '[^/]+')
  
  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(path)
}

/**
 * Check if path is public
 */
function isPublicRoute(path: string): boolean {
  return publicRoutes.some(pattern => matchesPattern(path, pattern))
}

/**
 * Check if path is protected
 */
function isProtectedRoute(path: string): boolean {
  return protectedRoutes.some(pattern => matchesPattern(path, pattern))
}

/**
 * Check if path is admin only
 */
function isAdminRoute(path: string): boolean {
  return adminRoutes.some(pattern => matchesPattern(path, pattern))
}

/**
 * Check if path is API route
 */
function isApiRoute(path: string): boolean {
  return apiRoutes.some(pattern => matchesPattern(path, pattern))
}

/**
 * Get token from request
 */
function getToken(request: NextRequest): string | null {
  // Check cookie first
  let token = request.cookies.get('auth_token')?.value
  
  // Check authorization header
  if (!token) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }
  }
  
  return token || null
}

/**
 * Verify token and get user info
 */
async function verifyAuthToken(token: string) {
  try {
    const decoded = await verifyToken(token)
    return decoded
  } catch {
    return null
  }
}

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  // Try different headers that might contain the real IP
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  
  // Fallback to a default or use request's nextUrl hostname
  return request.nextUrl.hostname || 'unknown'
}

// ==================== Security Headers ====================

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  
  // Content Security Policy (CSP)
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: http:",
      "font-src 'self'",
      "connect-src 'self' https://*.google-analytics.com https://*.vercel.live",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  )
  
  // Additional security headers
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  return response
}

/**
 * Add CORS headers for API routes
 */
function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}

// ==================== Rate Limiting ====================

// Simple in-memory rate limiting (for development)
// In production, use a proper rate limiting service like Upstash or Redis
const rateLimit = new Map<string, { count: number; timestamp: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requests per minute

/**
 * Check rate limit
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimit.get(ip)
  
  if (!record) {
    rateLimit.set(ip, { count: 1, timestamp: now })
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 }
  }
  
  if (now - record.timestamp > RATE_LIMIT_WINDOW) {
    // Reset window
    rateLimit.set(ip, { count: 1, timestamp: now })
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 }
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }
  
  record.count++
  rateLimit.set(ip, record)
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count }
}

// ==================== Main Middleware ====================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getClientIp(request)
  
  // ==================== Rate Limiting ====================
  // Apply rate limiting to API routes
  if (isApiRoute(pathname)) {
    const { allowed, remaining } = checkRateLimit(ip)
    
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: 60,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(Date.now() + RATE_LIMIT_WINDOW),
          },
        }
      )
    }
  }
  
  // ==================== Authentication ====================
  const token = getToken(request)
  let user = null
  
  if (token) {
    user = await verifyAuthToken(token)
  }
  
  // Check if route requires authentication
  const isPublic = isPublicRoute(pathname)
  const isProtected = isProtectedRoute(pathname)
  const isAdmin = isAdminRoute(pathname)
  
  // Handle protected routes
  if (isProtected && !isPublic) {
    if (!token || !user) {
      // Redirect to login
      const url = new URL('/login', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }
  
  // Handle admin routes
  if (isAdmin && !isPublic) {
    if (!token || !user) {
      const url = new URL('/login', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
    
    if (user.role !== 'ADMIN') {
      // Redirect non-admin users to home
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  // ==================== Redirect Authenticated Users ====================
  // Redirect logged-in users away from login/register pages
  if (token && user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // ==================== Response ====================
  const response = NextResponse.next()
  
  // Add security headers
  addSecurityHeaders(response)
  
  // Add CORS headers for API routes
  if (isApiRoute(pathname)) {
    addCorsHeaders(response)
  }
  
  // Add custom headers
  response.headers.set('X-Powered-By', 'TechShop')
  response.headers.set('X-Request-ID', Math.random().toString(36).substring(2, 15))
  
  // Add user info to headers (for server components)
  if (user) {
    response.headers.set('X-User-Id', user.userId)
    response.headers.set('X-User-Role', user.role)
  }
  
  return response
}

// ==================== Configuration ====================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - images folder
     * - uploads folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|images|uploads).*)',
  ],
}

// ==================== Helper Functions for Route Handlers ====================

/**
 * Get user from request (for use in API routes)
 */
export async function getUserFromRequest(request: NextRequest) {
  const token = getToken(request)
  if (!token) return null
  
  try {
    const user = await verifyAuthToken(token)
    return user
  } catch {
    return null
  }
}

/**
 * Check if user is admin (for use in API routes)
 */
export async function isUserAdmin(request: NextRequest): Promise<boolean> {
  const user = await getUserFromRequest(request)
  return user?.role === 'ADMIN'
}

/**
 * Require authentication for API routes
 */
export async function requireAuth(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return {
      authorized: false,
      response: new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    }
  }
  return { authorized: true, user }
}

/**
 * Require admin role for API routes
 */
export async function requireAdmin(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return auth
  
  if (auth.user?.role !== 'ADMIN') {
    return {
      authorized: false,
      response: new NextResponse(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    }
  }
  
  return { authorized: true, user: auth.user }
}