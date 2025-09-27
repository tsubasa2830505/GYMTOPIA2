import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { setSecurityHeaders, validateAPIRequest, logSecurityEvent } from '@/lib/middleware/security'

// Public paths that don't require authentication
const publicPaths = [
  '/auth/login',
  '/auth/signup',
  '/auth/reset-password',
  '/auth/callback',
  '/auth/verify-email',
  // ジム検索・閲覧機能（ログインなしでアクセス可能）
  '/',
  '/map',
  '/search',
  '/search/results',
  '/gyms'
]

export async function middleware(request: NextRequest) {
  // Create response
  let response = NextResponse.next()

  // API routes security validation
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Validate API request for security threats
    const securityValidation = await validateAPIRequest(request)
    if (securityValidation) {
      // Log security event
      logSecurityEvent('Blocked malicious request', request, {
        reason: 'Security validation failed'
      })
      return securityValidation
    }
  }

  // Check authentication for protected routes
  const pathname = request.nextUrl.pathname
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  if (!isPublicPath && !pathname.startsWith('/api/') && !pathname.startsWith('/_next/')) {
    try {
      // Create Supabase middleware client
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options)
              })
            },
          },
        }
      )

      // Get session
      const { data: { session }, error } = await supabase.auth.getSession()

      // If no session and not on a public path, redirect to login
      if (!session || error) {
        const redirectUrl = new URL('/auth/login', request.url)
        redirectUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      console.error('Middleware auth error:', error)
      // On error, redirect to login as a safety measure
      const redirectUrl = new URL('/auth/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If user is authenticated and trying to access auth pages (not public content), redirect to home
  if (isPublicPath && pathname.startsWith('/auth/') && pathname !== '/auth/callback') {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options)
              })
            },
          },
        }
      )
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      console.error('Middleware redirect error:', error)
    }
  }

  // Set security headers for all requests
  response = setSecurityHeaders(response)

  // Log successful request processing for monitoring
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.nextUrl.pathname}`)
  }

  return response
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}