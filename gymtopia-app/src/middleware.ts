import { NextRequest, NextResponse } from 'next/server'
import { setSecurityHeaders, validateAPIRequest, logSecurityEvent } from '@/lib/middleware/security'

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