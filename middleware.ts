import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { verifyLicenseToken, fetchLicenseValidation, LICENSE_COOKIE_NAME } from '@/lib/license'

const ADMIN_PATHS = ['/admin']
const LICENSE_SKIP_PATHS = [
  '/license-required',
  '/api/auth',
  '/api/webhooks',
  '/_next',
  '/favicon',
  '/robots',
  '/sitemap',
]

async function licenseMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname

  // Skip check for system paths
  if (LICENSE_SKIP_PATHS.some(p => pathname.startsWith(p))) {
    return null
  }

  // Check existing JWT cookie
  const cookieToken = request.cookies.get(LICENSE_COOKIE_NAME)?.value
  if (cookieToken && cookieToken !== 'grace') {
    const isValid = await verifyLicenseToken(cookieToken)
    if (isValid) return null // Valid JWT — allow through
  }

  // Cookie missing or expired — fetch from license server
  const { valid, token, grace } = await fetchLicenseValidation()

  if (!valid) {
    // Only block non-API routes to avoid breaking webhooks or API requests
    if (pathname.startsWith('/api/')) {
      return null
    }
    const url = request.nextUrl.clone()
    url.pathname = '/license-required'
    return NextResponse.redirect(url)
  }

  // Valid — set/refresh cookie and continue
  const response = NextResponse.next()

  if (token) {
    // Full JWT from server — valid 24h
    response.cookies.set(LICENSE_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 48, // 48h (grace period if server goes down)
      path: '/',
    })
  } else if (grace) {
    // Server unreachable — short grace cookie
    response.cookies.set(LICENSE_COOKIE_NAME, 'grace', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 6, // 6h grace
      path: '/',
    })
  }

  return response
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ══════════════════════════════════
  // 1. LICENSE CHECK (первый приоритет)
  // ══════════════════════════════════
  const licenseResponse = await licenseMiddleware(req)

  // If it's a redirect (e.g. to /license-required), return it immediately
  if (licenseResponse && licenseResponse.status !== 200) {
    return licenseResponse
  }

  // Helper function to merge license cookies into a redirect response if needed
  const withLicenseCookies = (res: NextResponse) => {
    if (licenseResponse) {
      licenseResponse.cookies.getAll().forEach(cookie => {
        res.cookies.set(cookie.name, cookie.value, {
          httpOnly: cookie.httpOnly,
          secure: cookie.secure,
          sameSite: cookie.sameSite,
          maxAge: cookie.maxAge,
          path: cookie.path,
        })
      })
    }
    return res
  }

  // ══════════════════════════════════
  // 2. AUTH CHECK for admin routes
  // ══════════════════════════════════
  const isAdminPath = ADMIN_PATHS.some(p => pathname.startsWith(p))

  if (isAdminPath) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET } as any)

    if (!token) {
      const redirectRes = NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url))
      return withLicenseCookies(redirectRes)
    }

    if ((token as any).role !== 'ADMIN') {
      const redirectRes = NextResponse.redirect(new URL('/', req.url))
      return withLicenseCookies(redirectRes)
    }
  }

  // ══════════════════════════════════
  // 3. AUTH CHECK for account routes
  // ══════════════════════════════════
  if (pathname.startsWith('/account')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET } as any)
    if (!token) {
      const redirectRes = NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url))
      return withLicenseCookies(redirectRes)
    }
  }

  return licenseResponse || NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
