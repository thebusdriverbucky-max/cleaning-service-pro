import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: any
  try {
    const stripe = (await import('stripe')).default
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' as any })
    event = stripeClient.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const orderId = session.metadata?.orderId

    if (orderId) {
      const order = await prisma.cleaningOrder.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          paidAt: new Date(),
          status: 'CONFIRMED',
          stripePaymentIntentId: session.payment_intent,
        },
        include: {
          user: true,
          serviceType: true,
        },
      })

      // Send confirmation email
      try {
        await sendOrderConfirmationEmail(order)
      } catch (emailErr) {
        console.error('Email failed (non-critical):', emailErr)
      }
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as any
    const orderId = session.metadata?.orderId
    if (orderId) {
      await prisma.cleaningOrder.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      })
    }
  }

  return NextResponse.json({ received: true })
}

async function sendOrderConfirmationEmail(order: any) {
  const { sendEmail } = await import('@/lib/email')
  await sendEmail({
    to: order.user.email,
    subject: `✅ Booking Confirmed — ${order.serviceType.name}`,
    html: buildConfirmationEmail(order),
  })

  // Notify admin
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `🆕 New Paid Order #${order.orderNumber.slice(0, 8).toUpperCase()} — ${order.serviceType.name}`,
      html: buildAdminNotificationEmail(order),
    })
  }
}

function buildConfirmationEmail(order: any): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
  <div style="background: #059669; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Booking Confirmed! 🎉</h1>
  </div>
  <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px;">Hi ${order.user.name || 'there'},</p>
    <p>Your cleaning has been confirmed and payment received. Here's your booking summary:</p>

    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #64748b;">Order #</td><td style="padding: 6px 0; font-weight: bold; font-family: monospace;">${order.orderNumber.slice(0, 8).toUpperCase()}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Service</td><td style="padding: 6px 0;">${order.serviceType.icon} ${order.serviceType.name}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Date</td><td style="padding: 6px 0;">${new Date(order.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Time</td><td style="padding: 6px 0;">${order.scheduledTime}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Address</td><td style="padding: 6px 0;">${order.addressStreet}, ${order.addressCity}</td></tr>
        <tr style="border-top: 1px solid #e2e8f0;"><td style="padding: 10px 0; font-weight: bold;">Total Paid</td><td style="padding: 10px 0; font-weight: bold; color: #059669; font-size: 18px;">$${order.totalPrice.toFixed(2)}</td></tr>
      </table>
    </div>

    ${order.specialRequests ? `<p style="font-size: 14px; color: #64748b;"><strong>Special requests:</strong> ${order.specialRequests}</p>` : ''}

    <p style="font-size: 14px; color: #64748b;">If you have any questions, reply to this email or contact us directly.</p>
    <p style="font-size: 14px;">See you soon! 🧹</p>
  </div>
</body>
</html>`
}

function buildAdminNotificationEmail(order: any): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>🆕 New Paid Order</h2>
  <p><strong>Order:</strong> #${order.orderNumber.slice(0, 8).toUpperCase()}</p>
  <p><strong>Customer:</strong> ${order.user.name} (${order.user.email}) ${order.user.phone ? `· ${order.user.phone}` : ''}</p>
  <p><strong>Service:</strong> ${order.serviceType.icon} ${order.serviceType.name}</p>
  <p><strong>Date:</strong> ${new Date(order.scheduledDate).toLocaleDateString()} at ${order.scheduledTime}</p>
  <p><strong>Address:</strong> ${order.addressStreet}, ${order.addressCity} ${order.addressPostal || ''}</p>
  ${order.areaSize ? `<p><strong>Area:</strong> ${order.areaSize}m²</p>` : ''}
  ${order.specialRequests ? `<p><strong>Special requests:</strong> ${order.specialRequests}</p>` : ''}
  ${order.accessNotes ? `<p><strong>Access notes:</strong> ${order.accessNotes}</p>` : ''}
  <p><strong>Total:</strong> $${order.totalPrice.toFixed(2)} — 💳 Paid via Stripe</p>
  <hr>
  <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders">View in Admin Dashboard →</a>
</body>
</html>`
}
