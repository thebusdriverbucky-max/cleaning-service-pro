import { getOrdersWithFilters } from '@/lib/admin'
import Link from 'next/link'
import { updateOrderStatus } from '@/app/actions/admin'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const ORDER_STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string }
}) {
  const { orders, total, pages } = await getOrdersWithFilters({
    status: searchParams.status,
    page: parseInt(searchParams.page || '1'),
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">{total} total orders</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {ORDER_STATUSES.map(s => (
          <Link
            key={s}
            href={s === 'ALL' ? '/admin/orders' : `/admin/orders?status=${s}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${(searchParams.status === s || (!searchParams.status && s === 'ALL'))
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Order</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Service</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Scheduled</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Address</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Total</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Payment</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-16 text-slate-400">
                  <div className="text-4xl mb-2">📋</div>
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono text-emerald-600 hover:underline text-xs">
                      #{order.orderNumber.slice(0, 8).toUpperCase()}
                    </Link>
                    <div className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{order.user?.name || '—'}</div>
                    <div className="text-slate-400 text-xs">{order.user?.phone || order.user?.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span>{order.serviceType?.icon}</span> {order.serviceType?.name}
                    {order.areaSize && <div className="text-xs text-slate-400">{order.areaSize}m²</div>}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    <div className="font-medium">{new Date(order.scheduledDate).toLocaleDateString()}</div>
                    <div className="text-slate-400 text-xs">{order.scheduledTime}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs max-w-32 truncate">
                    {order.addressStreet}, {order.addressCity}
                  </td>
                  <td className="px-4 py-3 font-semibold tabular-nums">${order.totalPrice.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.paymentMethod === 'STRIPE' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                      {order.paymentMethod === 'STRIPE' ? '💳' : '💵'} {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status] || 'bg-slate-100 text-slate-700'}`}>
                      {order.status}
                    </span>
                    {order.cleaner && (
                      <div className="text-xs text-slate-400 mt-1">🧹 {order.cleaner.user?.name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {order.status === 'PENDING' && (
                        <form action={updateOrderStatus.bind(null, order.id, 'CONFIRMED')}>
                          <button className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 w-full">Confirm</button>
                        </form>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <form action={updateOrderStatus.bind(null, order.id, 'IN_PROGRESS')}>
                          <button className="text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600 w-full">Start</button>
                        </form>
                      )}
                      {order.status === 'IN_PROGRESS' && (
                        <form action={updateOrderStatus.bind(null, order.id, 'COMPLETED')}>
                          <button className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 w-full">Complete</button>
                        </form>
                      )}
                      {!['COMPLETED', 'CANCELLED'].includes(order.status) && (
                        <form action={updateOrderStatus.bind(null, order.id, 'CANCELLED')}>
                          <button className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 w-full">Cancel</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex gap-2 justify-center">
          {Array.from({ length: pages }, (_, i) => (
            <Link
              key={i}
              href={`/admin/orders?page=${i + 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${parseInt(searchParams.page || '1') === i + 1
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
