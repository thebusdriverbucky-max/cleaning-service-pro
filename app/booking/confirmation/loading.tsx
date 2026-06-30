// File: app/booking/confirmation/loading.tsx
// Мгновенный fallback UI во время загрузки server component confirmation page.
// В комбинации с useTransition в BookingForm это даёт плавный визуальный фидбэк
// и позволяет NextTopLoader корректно отработать переход.
export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <div className="text-6xl mb-4 animate-pulse">⏳</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Confirming your booking…</h1>
        <p className="text-slate-500 mb-6">Please wait a moment while we finalize the details.</p>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    </main>
  )
}
