import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/auth/login?callbackUrl=/account/orders')

  const navItems = [
    { href: '/account/orders',  label: '📋 My Orders' },
    { href: '/account/profile', label: '👤 Profile' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">My Account</h1>
          <p className="text-slate-500 text-sm">Welcome back, {session.user?.name || session.user?.email}</p>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar nav */}
          <aside className="md:w-48 flex-shrink-0">
            <nav className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          {/* Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
