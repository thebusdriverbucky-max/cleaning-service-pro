import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      serviceSlug, areaSize, roomCount, scheduledDate, scheduledTime,
      addressStreet, addressCity, addressPostal, specialRequests, accessNotes,
      paymentMethod, totalPrice, name, email, phone,
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
        discount: 0,
        totalPrice: parseFloat(totalPrice) || service.basePrice,
        status: 'PENDING',
      },
    })

    // If CASH — return directly
    if (paymentMethod === 'CASH') {
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
          unit_amount: Math.round(parseFloat(totalPrice) * 100),
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
