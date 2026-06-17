import Link from 'next/link'

export default function LicenseRequiredPage() {
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Logo */}
        <div className="text-6xl mb-6">🫧</div>
        <h1 className="text-3xl font-bold text-white mb-3">CleanFlow Pro</h1>
        <p className="text-slate-400 mb-10 text-lg">Production-Ready Cleaning Service Platform</p>

        {/* License card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-left mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 text-xl">
              🔑
            </div>
            <div>
              <h2 className="text-white font-semibold">License Required</h2>
              <p className="text-slate-400 text-sm">This application requires a valid license key</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <p>To activate this template, add your license key to the <code className="bg-slate-700 px-1.5 py-0.5 rounded text-emerald-400">.env</code> file:</p>

            <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm border border-slate-700">
              <span className="text-slate-500"># .env</span><br />
              <span className="text-emerald-400">LICENSE_KEY</span>
              <span className="text-white">=</span>
              <span className="text-yellow-300">NEO-XXXXXXXX-XXXXXXXX-XXXXXXXX</span>
            </div>

            <p className="text-slate-400">Your license key was delivered to your email after purchase on <span className="text-white font-medium">OwnYourWebsite.app</span></p>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-left mb-8">
          <h3 className="text-white font-semibold mb-4 text-sm">Activation Steps</h3>
          <ol className="space-y-3 text-sm text-slate-300">
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">1</span>
              Check your email for the license key (format: <code className="text-emerald-400">CLEAN-XXXX-XXXX-XXXX</code>)
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">2</span>
              Open your <code className="bg-slate-700 px-1 rounded">.env</code> file and add: <code className="text-yellow-300">LICENSE_KEY=your-key-here</code>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">3</span>
              Restart the server: <code className="bg-slate-700 px-1 rounded">npm run dev</code> or redeploy on Vercel
            </li>
          </ol>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://www.ownyourwebsite.app"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Purchase License →
          </a>
          <a
            href="mailto:support@ownyourwebsite.app"
            className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-8 py-3 rounded-xl transition-colors"
          >
            Contact Support
          </a>
        </div>
        <p className="text-slate-600 text-xs mt-6">CleanFlow Pro · Powered by OwnYourWebsite.app</p>
      </div>
    </main>
  )
}
