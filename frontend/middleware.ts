import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode("django-insecure-$_q)*y(1q3=%oq9&$uzlp%7awjpki-puni*xnmil(ad#5@et+g")

export async function middleware(request: NextRequest) {
  console.log('[middleware] Request URL:', request.url)
  const { nextUrl, cookies } = request
  const pathname = nextUrl.pathname

  const isAuthPage = pathname === '/auth' || pathname === '/login'
  const isDashboard = pathname.startsWith('/dashboard')
  const isAdmin = pathname.startsWith('/admin')

  const accessToken = cookies.get('access_token')?.value
console.log('[middleware] Access Token:', accessToken)
  if (!accessToken) {
    if (isAuthPage) return NextResponse.next()
    return redirectToAuth(request)
  }

  try {
    console.log('[middleware] Validating access token:', accessToken)
    const { payload } = await jwtVerify(accessToken, secret)
    const userRole = payload?.role as 'Admin' | 'Client' | 'Lawyer'

    if (isAuthPage) return redirectToDashboard(userRole, request)

    if (
      (pathname.startsWith('/dashboard/client') && userRole !== 'Client') ||
      (pathname.startsWith('/dashboard/lawyer') && userRole !== 'Lawyer') ||
      (pathname.startsWith('/dashboard/admin') && userRole !== 'Admin')
    ) {
      return redirectToDashboard(userRole, request)
    }

    return NextResponse.next()
  } catch (err) {
    console.warn('[middleware] Invalid access token:', err)
    const response = redirectToAuth(request)
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
    return response
  }
}

// Helper functions
function redirectToAuth(request: NextRequest) {
  return NextResponse.redirect(new URL('/auth', request.url))
}

function redirectToDashboard(role: string, request: NextRequest) {
  return NextResponse.redirect(new URL(getDashboardPath(role), request.url))
}

function getDashboardPath(role: string): string {
  switch (role) {
    case 'Admin':
      return '/admin'
    case 'Client':
      return '/dashboard/client'
    case 'Lawyer':
      return '/dashboard/lawyer'
    default:
      return '/auth'
  }
}
// IMPORTANT: This config must be exported from middleware.ts, not next.config.ts
export const config = {
  matcher: [
    /**
     * Apply middleware to all routes except:
     * - / (homepage)
     * - /auth and /login
     * - /blog and subroutes
     * - /services
     * - /library
     * - /airag
     * - Static files
     * - API routes
     * - Next.js internals (_next/*)
     */
    '/((?!api/|_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|blog.*|services|library|airag|auth|login|$).*)',
  ],
}
