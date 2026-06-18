import Link from 'next/link'
import { auth } from '@/lib/auth'
import { getSetting } from '@/lib/settings'

export default async function Navbar() {
  const [session, siteName, siteLogo] = await Promise.all([
    auth(),
    getSetting('site_name', 'CleanFlow'),
    getSetting('site_logo', ''),
  ])

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
          {siteLogo ? (
            <img src={siteLogo} alt={siteName} className="h-8 max-w-[150px] object-contain" />
          ) : (
            <>
              <span className="text-2xl">🫧</span>
              {siteName}
            </>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/services" className="hover:text-slate-900 transition-colors">Services</Link>
          <Link href="/booking" className="hover:text-slate-900 transition-colors">Pricing</Link>
          <Link href="/#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</Link>
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link href="/account/orders" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden md:block">
                My Orders
              </Link>
              {session.user?.email?.includes('admin') || (session.user as any)?.role === 'ADMIN' ? (
                <Link href="/admin" className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                  Admin
                </Link>
              ) : null}
            </>
          ) : (
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden md:block">
              Sign In
            </Link>
          )}
          <Link href="/booking" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
            Book Now
          </Link>
        </div>
      </div>
    </header>
  )
}
