import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AddonsPage() {
  const addons = await prisma.serviceAddon.findMany({
    orderBy: { createdAt: 'desc' },
    include: { serviceType: true },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add-ons / Extras</h1>
          <p className="text-slate-500 text-sm mt-1">Manage extra services that can be added to bookings</p>
        </div>
        <Link href="/admin/addons/new" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + Add New
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">Name</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Price</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Linked Service</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
              <th className="px-6 py-4 text-right font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {addons.map(addon => (
              <tr key={addon.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{addon.icon} {addon.name}</div>
                  {addon.description && <div className="text-xs text-slate-500 mt-1 line-clamp-1">{addon.description}</div>}
                </td>
                <td className="px-6 py-4 text-slate-900 font-medium">${addon.price}</td>
                <td className="px-6 py-4">
                  {addon.serviceType ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {addon.serviceType.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-800">
                      Global (All)
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${addon.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                    {addon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/addons/${addon.id}`} className="text-indigo-600 hover:text-indigo-900 font-medium">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {addons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No add-ons found. Create your first one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
