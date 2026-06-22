import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      serviceSlug, areaSize, roomCount, scheduledDate, scheduledTime,
      addressStreet, addressCity, addressPostal, specialRequests, accessNotes,
      paymentMethod, name, email, phone, promoCode,
    } = body

    if (!serviceSlug || !scheduledDate || !addressStreet || !addressCity || !email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const service = await prisma.serviceType.findUnique({ where: { slug: serviceSlug } })
    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

    // Find or create user by email
    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      user = await prisma.user.create({
        data: { email, name, phone: phone || null, role: 'CUSTOMER' },
      })
    }

    let calculatedTotalPrice = service.basePrice
    if (service.pricePerSqm && areaSize) {
      const minArea = service.minArea || 0
      const area = Math.max(parseFloat(areaSize), minArea)
      calculatedTotalPrice = service.pricePerSqm * area
    }

    let calculatedDiscount = 0
    let promoIdToIncrement: string | null = null

    if (promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCode.toUpperCase() },
      })
      if (promo && promo.isActive) {
        const isNotExpired = !promo.expiresAt || new Date(promo.expiresAt) >= new Date()
        const isUnderLimit = !promo.maxUses || promo.usedCount < promo.maxUses
        if (isNotExpired && isUnderLimit) {
          calculatedDiscount = parseFloat(((calculatedTotalPrice * promo.discountValue) / 100).toFixed(2))
          calculatedTotalPrice = Math.max(0, parseFloat((calculatedTotalPrice - calculatedDiscount).toFixed(2)))
          promoIdToIncrement = promo.id
        } else {
          return NextResponse.json({ error: 'Promo code is expired or usage limit reached' }, { status: 400 })
        }
      } else {
        return NextResponse.json({ error: 'Promo code is invalid or inactive' }, { status: 400 })
      }
    }

    const order = await prisma.cleaningOrder.create({
      data: {
        userId: user.id,
        serviceTypeId: service.id,
        areaSize: areaSize ? parseFloat(areaSize) : null,
        roomCount: roomCount ? parseInt(roomCount) : null,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        addressStreet,
        addressCity,
        addressPostal: addressPostal || null,
        specialRequests: specialRequests || null,
        accessNotes: accessNotes || null,
        paymentMethod: paymentMethod === 'CASH' ? 'CASH' : 'STRIPE',
        paymentStatus: 'UNPAID',
        basePrice: service.basePrice,
        discount: calculatedDiscount,
        totalPrice: calculatedTotalPrice,
        status: 'PENDING',
      },
    })

    if (promoIdToIncrement) {
      await prisma.promoCode.update({
        where: { id: promoIdToIncrement },
        data: { usedCount: { increment: 1 } },
      })
    }

    if (phone && user.id) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phone },
      })
    }

    if (paymentMethod === 'CASH') {
      // Send confirmation email for cash orders
      try {
        const fullOrder = await prisma.cleaningOrder.findUnique({
          where: { id: order.id },
          include: { user: true, serviceType: true },
        })
        if (fullOrder) {
          const { sendEmail } = await import('@/lib/email')
          await sendEmail({
            to: email,
            subject: `📋 Booking Received — ${service.name}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>✅ Booking Received!</h2>
              <p>Hi ${name}, your cleaning booking has been received.</p>
              <p><strong>Order:</strong> #${order.orderNumber.slice(0, 8).toUpperCase()}</p>
              <p><strong>Service:</strong> ${service.icon} ${service.name}</p>
              <p><strong>Date:</strong> ${scheduledDate} at ${scheduledTime}</p>
              <p><strong>Address:</strong> ${addressStreet}, ${addressCity}</p>
              <p><strong>Total:</strong> $${calculatedTotalPrice.toFixed(2)} — 💵 Cash on arrival</p>
              <p style="color: #64748b; font-size: 14px;">Our team will confirm your booking shortly.</p>
            </div>
          `,
          })
          // Notify admin
          const adminEmail = process.env.ADMIN_EMAIL
          if (adminEmail) {
            await sendEmail({
              to: adminEmail,
              subject: `🆕 New Cash Order #${order.orderNumber.slice(0, 8).toUpperCase()}`,
              html: `<p>New cash booking from ${name} (${email})</p>
                   <p>Service: ${service.name} | Date: ${scheduledDate} ${scheduledTime}</p>
                   <p>Address: ${addressStreet}, ${addressCity}</p>
                   <p>Total: $${calculatedTotalPrice.toFixed(2)}</p>
                   <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders">View in Admin →</a>`,
            })
          }
        }
      } catch (emailErr) {
        console.error('Email failed (non-critical):', emailErr)
      }
      return NextResponse.json({ orderNumber: order.orderNumber })
    }

    // If STRIPE — create checkout session
    const stripe = (await import('stripe')).default
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' as any })

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: service.name,
            description: `${scheduledDate} at ${scheduledTime} — ${addressStreet}, ${addressCity}`,
          },
          unit_amount: Math.round(calculatedTotalPrice * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/confirmation?order=${order.orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking?cancelled=1`,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
    })

    await prisma.cleaningOrder.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    })

    return NextResponse.json({ orderNumber: order.orderNumber, checkoutUrl: session.url })
  } catch (err: any) {
    console.error('[booking/create]', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}

