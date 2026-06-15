import Link from 'next/link'
export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🧹</div>
        <h1 className="text-4xl font-bold text-slate-900 mb-3">404</h1>
        <h2 className="text-xl font-semibold text-slate-700 mb-3">Page not found</h2>
        <p className="text-slate-500 mb-8">Looks like this page got cleaned up. Let's get you back on track.</p>
        <Link href="/" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors inline-block">
          Go Home
        </Link>
      </div>
    </main>
  )
}
