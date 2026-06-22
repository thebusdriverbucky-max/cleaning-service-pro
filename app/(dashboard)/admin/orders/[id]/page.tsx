import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { updateOrderStatus, assignCleaner } from '@/app/actions/admin'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.cleaningOrder.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      serviceType: true,
      address: true,
      cleaner: { include: { user: { select: { name: true, email: true, phone: true } } } },
      review: true,
    },
  })

  if (!order) notFound()

  const cleaners = await prisma.cleanerProfile.findMany({
    where: { isAvailable: true },
    include: { user: { select: { name: true, email: true } } },
  })

  const orderNum = order.orderNumber.slice(0, 8).toUpperCase()

  const savedAddons = Array.isArray(order.addons) ? order.addons as Array<{ id: string, name: string, price: number, icon?: string }> : []

  let roomsConfig = []
  if (order.bedroomsCount) roomsConfig.push(`${order.bedroomsCount} Bed`)
  if (order.bathroomsCount) roomsConfig.push(`${order.bathroomsCount} Bath`)
  if (order.kitchensCount) roomsConfig.push(`${order.kitchensCount} Kitchen`)
  const roomsString = roomsConfig.length > 0 ? roomsConfig.join(' • ') : (order.roomCount ? `${order.roomCount} Rooms (Legacy)` : null)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="text-slate-400 hover:text-slate-600 transition-colors">
            ← Orders
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-xl font-bold text-slate-900 font-mono">#{orderNum}</h1>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusColors[order.status]}`}>
            {order.status}
          </span>
        </div>
        <div className="text-sm text-slate-400">
          Created {new Date(order.createdAt).toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">

          {/* Customer */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              👤 Customer
            </h2>
            <div className="space-y-1 text-sm">
              <div className="font-medium text-slate-900 text-base">{order.user?.name || '—'}</div>
              <div className="text-slate-500 flex items-center gap-2">
                📧 <a href={`mailto:${order.user?.email}`} className="hover:text-emerald-600">{order.user?.email}</a>
              </div>
              {order.user?.phone ? (
                <div className="text-slate-500 flex items-center gap-2">
                  📱 <a href={`tel:${order.user.phone}`} className="hover:text-emerald-600">{order.user.phone}</a>
                </div>
              ) : (
                <div className="text-amber-600 text-xs">⚠️ No phone number on file</div>
              )}
            </div>
          </div>

          {/* Service details */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-700 mb-3">🧹 Service Details</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-slate-400 text-xs mb-0.5">Service Type</div>
                <div className="font-medium">{order.serviceType?.icon} {order.serviceType?.name}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs mb-0.5">Frequency</div>
                <div className="font-medium">{order.frequency}</div>
              </div>
              {order.areaSize && (
                <div>
                  <div className="text-slate-400 text-xs mb-0.5">Area</div>
                  <div className="font-medium">{order.areaSize} m²</div>
                </div>
              )}
              {roomsString && (
                <div>
                  <div className="text-slate-400 text-xs mb-0.5">Rooms</div>
                  <div className="font-medium">{roomsString}</div>
                </div>
              )}
              <div>
                <div className="text-slate-400 text-xs mb-0.5">Scheduled Date</div>
                <div className="font-medium">{new Date(order.scheduledDate).toLocaleDateString()} at {order.scheduledTime}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs mb-0.5">Duration (est.)</div>
                <div className="font-medium">{order.serviceType?.durationHours}h</div>
              </div>
            </div>

            {/* Addons List */}
            {savedAddons.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-slate-400 text-xs mb-2">Selected Add-ons</div>
                <ul className="space-y-1">
                  {savedAddons.map((addon, idx) => (
                    <li key={idx} className="flex justify-between text-sm bg-slate-50 px-3 py-1.5 rounded-md">
                      <span className="text-slate-700">{addon.icon} {addon.name}</span>
                      <span className="font-medium text-slate-900">+${addon.price.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {order.specialRequests && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-slate-400 text-xs mb-1">Special Requests</div>
                <div className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{order.specialRequests}</div>
              </div>
            )}
            {order.accessNotes && (
              <div className="mt-3">
                <div className="text-slate-400 text-xs mb-1">Access Notes</div>
                <div className="text-sm text-slate-700 bg-amber-50 border border-amber-100 rounded-lg p-3">🔑 {order.accessNotes}</div>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-700 mb-3">📍 Address</h2>
            <div className="text-sm text-slate-700">
              <div className="font-medium">{order.addressStreet}</div>
              <div className="text-slate-500">{order.addressCity}{order.addressPostal ? `, ${order.addressPostal}` : ''}</div>
            </div>
          </div>

          {/* Review */}
          {order.review && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="font-semibold text-slate-700 mb-3">⭐ Customer Review</h2>
              <div className="flex items-center gap-2 mb-2">
                {'★'.repeat(order.review.rating)}{'☆'.repeat(5 - order.review.rating)}
                <span className="text-slate-400 text-xs">({order.review.rating}/5)</span>
              </div>
              {order.review.comment && <p className="text-sm text-slate-600 italic">"{order.review.comment}"</p>}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Pricing */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-700 mb-3">💰 Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Base + Rooms + Addons)</span>
                <span>${order.basePrice.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Total Discount</span>
                  <span>−${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-3 mt-1 text-base">
                <span>Total Amount</span>
                <span>${order.totalPrice.toFixed(2)}</span>
              </div>

              <div className="pt-3 flex gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${order.paymentMethod === 'STRIPE' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {order.paymentMethod === 'STRIPE' ? '💳 Stripe' : '💵 Cash'}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.paidAt && (
                <div className="text-xs text-slate-400 mt-2">Paid at {new Date(order.paidAt).toLocaleString()}</div>
              )}
            </div>
          </div>

          {/* Status Actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-700 mb-3">⚡ Actions</h2>
            <div className="space-y-2">
              {order.status === 'PENDING' && (
                <form action={updateOrderStatus.bind(null, order.id, 'CONFIRMED')}>
                  <button className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                    ✓ Confirm Order
                  </button>
                </form>
              )}
              {order.status === 'CONFIRMED' && (
                <form action={updateOrderStatus.bind(null, order.id, 'IN_PROGRESS')}>
                  <button className="w-full bg-purple-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors">
                    ▶ Mark In Progress
                  </button>
                </form>
              )}
              {order.status === 'IN_PROGRESS' && (
                <form action={updateOrderStatus.bind(null, order.id, 'COMPLETED')}>
                  <button className="w-full bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                    ✓ Mark Completed
                  </button>
                </form>
              )}
              {!['COMPLETED', 'CANCELLED'].includes(order.status) && (
                <form action={updateOrderStatus.bind(null, order.id, 'CANCELLED')}>
                  <button className="w-full bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                    ✕ Cancel Order
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Assign Cleaner */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-700 mb-3">
              🧹 Assigned Cleaner
            </h2>
            {order.cleaner ? (
              <div className="text-sm mb-3">
                <div className="font-medium text-slate-900">{order.cleaner.user?.name}</div>
                <div className="text-slate-400 text-xs">{order.cleaner.user?.email}</div>
                {order.cleaner.user?.phone && (
                  <div className="text-slate-400 text-xs">📱 {order.cleaner.user.phone}</div>
                )}
                <div className="text-xs text-amber-500 mt-1">⭐ {order.cleaner.rating.toFixed(1)} rating</div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 mb-3">Not assigned yet</p>
            )}
            {cleaners.length > 0 && !['COMPLETED', 'CANCELLED'].includes(order.status) && (
              <form action={assignCleaner.bind(null, order.id)}>
                <select name="cleanerId" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mb-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">— Select cleaner —</option>
                  {cleaners.map(c => (
                    <option key={c.id} value={c.id} selected={c.id === order.cleanerId}>
                      {c.user?.name} (★{c.rating.toFixed(1)})
                    </option>
                  ))}
                </select>
                <button type="submit" className="w-full bg-emerald-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">
                  Assign
                </button>
              </form>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-700 mb-3">📅 Timeline</h2>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex gap-2"><span className="text-slate-400">Created</span><span>{new Date(order.createdAt).toLocaleString()}</span></div>
              {order.confirmedAt && <div className="flex gap-2"><span className="text-blue-400">Confirmed</span><span>{new Date(order.confirmedAt).toLocaleString()}</span></div>}
              {order.startedAt && <div className="flex gap-2"><span className="text-purple-400">Started</span><span>{new Date(order.startedAt).toLocaleString()}</span></div>}
              {order.completedAt && <div className="flex gap-2"><span className="text-green-400">Completed</span><span>{new Date(order.completedAt).toLocaleString()}</span></div>}
              {order.cancelledAt && <div className="flex gap-2"><span className="text-red-400">Cancelled</span><span>{new Date(order.cancelledAt).toLocaleString()}</span></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
