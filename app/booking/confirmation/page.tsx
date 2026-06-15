import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { order?: string; session_id?: string }
}) {
  const order = searchParams.order
    ? await prisma.cleaningOrder.findUnique({
      where: { orderNumber: searchParams.order },
      include: { serviceType: true, user: true },
    })
    : null

  if (!order) {
    return (
      <main className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Order not found</h1>
          <Link href="/booking" className="text-emerald-600 underline">Try again</Link>
        </div>
      </main>
    )
  }

  // If paid via Stripe — update payment status
  if (searchParams.session_id && order.paymentStatus === 'UNPAID') {
    await prisma.cleaningOrder.update({
      where: { id: order.id },
      data: { paymentStatus: 'PAID', paidAt: new Date(), status: 'CONFIRMED' },
    })
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <div className="text-6xl mb-4">
          {order.paymentMethod === 'CASH' ? '✅' : '🎉'}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {order.paymentMethod === 'CASH' ? 'Booking Confirmed!' : 'Payment Successful!'}
        </h1>
        <p className="text-slate-500 mb-6">
          {order.paymentMethod === 'CASH'
            ? 'Your booking is confirmed. Our team will arrive at the scheduled time. Please have cash ready.'
            : 'Your payment is confirmed. We\'ll see you soon!'}
        </p>

        <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-slate-500">Order #</span>
            <span className="font-mono font-medium">{order.orderNumber.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Service</span>
            <span className="font-medium">{order.serviceType.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date</span>
            <span className="font-medium">
              {new Date(order.scheduledDate).toLocaleDateString()} at {order.scheduledTime}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Address</span>
            <span className="font-medium text-right">{order.addressStreet}, {order.addressCity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total</span>
            <span className="font-bold text-emerald-600">${order.totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment</span>
            <span className="font-medium">
              {order.paymentMethod === 'CASH' ? '💵 Cash on site' : '💳 Paid online'}
            </span>
          </div>
        </div>

        <Link href="/" className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors">
          Back to Home
        </Link>
      </div>
    </main>
  )
}
