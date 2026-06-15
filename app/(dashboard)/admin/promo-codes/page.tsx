import { prisma } from '@/lib/prisma'
import { togglePromoCode } from '@/app/actions/admin'

export default async function AdminPromoCodesPage() {
  const codes = await prisma.promoCode.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Promo Codes</h1>

      {/* Create form */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Create Promo Code</h2>
        <form action={async (formData: FormData) => {
          'use server'
          const { createPromoCode } = await import('@/app/actions/admin')
          await createPromoCode({
            code: formData.get('code') as string,
            discountPercent: parseFloat(formData.get('discountPercent') as string),
            maxUses: formData.get('maxUses') ? parseInt(formData.get('maxUses') as string) : undefined,
            expiresAt: formData.get('expiresAt') as string || undefined,
          })
        }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Code *</label>
            <input name="code" required placeholder="SUMMER20" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Discount % *</label>
            <input name="discountPercent" required type="number" min="1" max="100" placeholder="20" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Max Uses</label>
            <input name="maxUses" type="number" min="1" placeholder="∞" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Expires</label>
            <input name="expiresAt" type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="col-span-2 md:col-span-4">
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
              Create Code
            </button>
          </div>
        </form>
      </div>

      {/* Codes list */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Code</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Discount</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Used / Max</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Expires</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {codes.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">No promo codes yet</td></tr>
            ) : (
              codes.map(code => (
                <tr key={code.id} className={`hover:bg-slate-50 ${!code.isActive ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3 font-mono font-semibold text-emerald-700">{code.code}</td>
                  <td className="px-4 py-3 font-bold">{code.discountValue}%</td>
                  <td className="px-4 py-3 tabular-nums">
                    {code.usedCount} / {code.maxUses ?? '∞'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${code.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {code.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form action={togglePromoCode.bind(null, code.id, !code.isActive)}>
                      <button className="text-xs border border-slate-200 text-slate-600 px-3 py-1 rounded-lg hover:bg-slate-50">
                        {code.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
