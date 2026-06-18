import { prisma } from '@/lib/prisma'

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { orders: true } },
    },
  })

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500 text-sm mt-1">{customers.length} registered customers</p>
        </div>
      </div>

      {/* Customers List */}
      <div className="space-y-3">
        {customers.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-xl">
            <div className="text-4xl mb-2">👥</div>
            No customers yet.
          </div>
        ) : (
          customers.map(customer => (
            <div key={customer.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                {(customer.name || customer.email || 'C').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">{customer.name || 'Unnamed Customer'}</div>
                <div className="text-sm text-slate-500">{customer.email} {customer.phone && `· ${customer.phone}`}</div>
                <div className="text-xs text-slate-400 mt-0.5">Joined {new Date(customer.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-slate-900 tabular-nums">{customer._count.orders}</div>
                <div className="text-xs text-slate-400">orders</div>
              </div>
              <div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${customer.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {customer.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
