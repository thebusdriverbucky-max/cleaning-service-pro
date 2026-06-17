import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PUBLIC_PATHS = ['/', '/services', '/booking', '/auth', '/api/auth', '/api/booking', '/api/webhooks', '/_next', '/favicon', '/robots', '/sitemap']
const ADMIN_PATHS = ['/admin']
const LICENSE_BYPASS_PATHS = ['/license-required', '/api/auth', '/_next', '/favicon']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ══════════════════════════════════
  // 1. LICENSE CHECK (первый приоритет)
  // ══════════════════════════════════
  const isBypassPath = LICENSE_BYPASS_PATHS.some(p => pathname.startsWith(p))

  if (!isBypassPath) {
    const licenseKey = process.env.LICENSE_KEY || ''
    const isDev = process.env.NODE_ENV === 'development'
    const isLicensed = isDev || (licenseKey && isValidLicenseFormat(licenseKey))

    if (!isLicensed) {
      // Only block non-API routes to avoid breaking webhooks
      if (!pathname.startsWith('/api/')) {
        return NextResponse.redirect(new URL('/license-required', req.url))
      }
    }
  }

  // ══════════════════════════════════
  // 2. AUTH CHECK for admin routes
  // ══════════════════════════════════
  const isAdminPath = ADMIN_PATHS.some(p => pathname.startsWith(p))

  if (isAdminPath) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET } as any)

    if (!token) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url))
    }

    if ((token as any).role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // ══════════════════════════════════
  // 3. AUTH CHECK for account routes
  // ══════════════════════════════════
  if (pathname.startsWith('/account')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET } as any)
    if (!token) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url))
    }
  }

  return NextResponse.next()
}

function isValidLicenseFormat(key: string): boolean {
  if (key.startsWith('DEV-')) return true
  return /^CLEAN-[A-F0-9]{8}-[A-F0-9]{8}-[A-F0-9]{8}$/.test(key)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
