import Link from 'next/link'
import { getSiteSettings } from '@/lib/settings'

export default async function Footer() {
  const settings = await getSiteSettings()

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-4 mt-auto">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 font-bold text-white text-lg mb-3">
            <span>🫧</span> {settings.site_name || 'CleanFlow'}
          </div>
          <p className="text-sm leading-relaxed">
            Professional cleaning services. Book online, pay your way.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Services</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/booking?service=standard" className="hover:text-white transition-colors">Standard Cleaning</Link></li>
            <li><Link href="/booking?service=deep" className="hover:text-white transition-colors">Deep Cleaning</Link></li>
            <li><Link href="/booking?service=move-in-out" className="hover:text-white transition-colors">Move In / Move Out</Link></li>
            <li><Link href="/booking?service=office" className="hover:text-white transition-colors">Office Cleaning</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Contact</h4>
          <ul className="space-y-2 text-sm">
            {settings.site_phone && <li>📞 {settings.site_phone}</li>}
            {settings.site_email && <li>✉️ {settings.site_email}</li>}
            {settings.site_address && <li>📍 {settings.site_address}</li>}
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
        <span>© {new Date().getFullYear()} {settings.site_name || 'CleanFlow'}. All rights reserved.</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  )
}
