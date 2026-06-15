import { getAdminStats, getRecentOrders } from '@/lib/admin'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default async function AdminDashboard() {
  const [stats, recentOrders] = await Promise.all([
    getAdminStats(),
    getRecentOrders(8),
  ])

  const kpis = [
    { label: 'Total Orders', value: stats.totalOrders, icon: '📋', color: 'bg-slate-50' },
    { label: 'Pending', value: stats.pendingOrders, icon: '⏳', color: 'bg-yellow-50' },
    { label: 'Completed', value: stats.completedOrders, icon: '✅', color: 'bg-green-50' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: '💰', color: 'bg-emerald-50' },
    { label: 'Paid Online', value: `$${stats.paidRevenue.toFixed(2)}`, icon: '💳', color: 'bg-blue-50' },
    { label: 'Customers', value: stats.totalCustomers, icon: '👤', color: 'bg-indigo-50' },
    { label: 'Cleaners', value: stats.totalCleaners, icon: '🧹', color: 'bg-teal-50' },
    { label: 'Cancelled', value: stats.cancelledOrders, icon: '❌', color: 'bg-red-50' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your cleaning business</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`${kpi.color} rounded-xl p-4 border border-slate-100`}>
            <div className="text-2xl mb-2">{kpi.icon}</div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{kpi.value}</div>
            <div className="text-xs text-slate-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-emerald-600 hover:underline">
            View all →
          </Link>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Order</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Service</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Total</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Payment</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-mono text-emerald-600 hover:underline">
                        #{order.orderNumber.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{order.user?.name || '—'}</div>
                      <div className="text-slate-400 text-xs">{order.user?.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      {order.serviceType?.icon} {order.serviceType?.name}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-600">
                      {new Date(order.scheduledDate).toLocaleDateString()}
                      <span className="text-slate-400 ml-1">{order.scheduledTime}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold tabular-nums text-slate-900">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.paymentMethod === 'STRIPE'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                        }`}>
                        {order.paymentMethod === 'STRIPE' ? '💳 Stripe' : '💵 Cash'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status] || 'bg-slate-100 text-slate-700'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
