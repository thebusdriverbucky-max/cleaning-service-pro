import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default async function AccountOrdersPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) redirect('/login')

  const orders = await prisma.cleaningOrder.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      serviceType: { select: { name: true, icon: true } },
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">My Orders</h2>
        <Link href="/booking" className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + New Booking
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">🧹</div>
          <h3 className="font-semibold text-slate-900 mb-2">No orders yet</h3>
          <p className="text-slate-500 text-sm mb-6">Book your first cleaning and it will appear here.</p>
          <Link href="/booking" className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm">
            Book a Cleaning
          </Link>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-xs text-slate-400">
                    #{order.orderNumber.slice(0, 8).toUpperCase()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status] || 'bg-slate-100 text-slate-600'}`}>
                    {order.status}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.paymentMethod === 'STRIPE' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {order.paymentMethod === 'STRIPE' ? '💳 Paid' : '💵 Cash'}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900">
                  {order.serviceType?.icon} {order.serviceType?.name}
                </h3>
                <div className="text-sm text-slate-500 mt-1 space-y-0.5">
                  <div>📅 {new Date(order.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {order.scheduledTime}</div>
                  <div>📍 {order.addressStreet}, {order.addressCity}</div>
                  {order.areaSize && <div>📐 {order.areaSize}m²</div>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xl font-bold text-slate-900 tabular-nums">${order.totalPrice.toFixed(2)}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            {order.specialRequests && (
              <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-500">
                💬 {order.specialRequests}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
