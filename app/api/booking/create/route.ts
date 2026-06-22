import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateOrderPrice } from '@/lib/prices'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      serviceSlug, areaSize, scheduledDate, scheduledTime,
      addressStreet, addressCity, addressPostal, specialRequests, accessNotes,
      paymentMethod, name, email, phone, promoCode,
      bedroomsCount, bathroomsCount, kitchensCount, frequency, addons
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

    // Load add-ons from database to prevent price tampering
    let selectedAddons: any[] = []
    if (addons && Array.isArray(addons) && addons.length > 0) {
      selectedAddons = await prisma.serviceAddon.findMany({
        where: { id: { in: addons } }
      })
    }

    // Load promo code
    let validPromoCode = null;
    let promoIdToIncrement: string | null = null;

    if (promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCode.toUpperCase() },
      })
      if (promo && promo.isActive) {
        const isNotExpired = !promo.expiresAt || new Date(promo.expiresAt) >= new Date()
        const isUnderLimit = !promo.maxUses || promo.usedCount < promo.maxUses
        if (isNotExpired && isUnderLimit) {
          validPromoCode = promo;
          promoIdToIncrement = promo.id;
        } else {
          return NextResponse.json({ error: 'Promo code is expired or usage limit reached' }, { status: 400 })
        }
      } else {
        return NextResponse.json({ error: 'Promo code is invalid or inactive' }, { status: 400 })
      }
    }

    // Calculate Prices
    const pricing = calculateOrderPrice({
      service: {
        basePrice: service.basePrice,
        pricePerSqm: service.pricePerSqm,
        minArea: service.minArea,
        pricePerBedroom: service.pricePerBedroom,
        pricePerBathroom: service.pricePerBathroom,
        pricePerKitchen: service.pricePerKitchen,
      },
      areaSize: areaSize ? parseFloat(areaSize) : undefined,
      bedroomsCount: bedroomsCount ? parseInt(bedroomsCount) : 0,
      bathroomsCount: bathroomsCount ? parseInt(bathroomsCount) : 0,
      kitchensCount: kitchensCount ? parseInt(kitchensCount) : 0,
      addons: selectedAddons,
      frequency: frequency || 'ONE_TIME',
      promoCode: validPromoCode,
    });

    const parsedBedrooms = bedroomsCount ? parseInt(bedroomsCount) : 0;
    const parsedBathrooms = bathroomsCount ? parseInt(bathroomsCount) : 0;
    const parsedKitchens = kitchensCount ? parseInt(kitchensCount) : 0;
    const legacyRoomCount = parsedBedrooms + parsedBathrooms + parsedKitchens;

    // Serialize addons to save historical price info
    const serializedAddons = selectedAddons.map(a => ({
      id: a.id,
      name: a.name,
      price: a.price,
      icon: a.icon
    }));

    const order = await prisma.cleaningOrder.create({
      data: {
        userId: user.id,
        serviceTypeId: service.id,
        areaSize: areaSize ? parseFloat(areaSize) : null,
        roomCount: legacyRoomCount > 0 ? legacyRoomCount : null,
        bedroomsCount: parsedBedrooms,
        bathroomsCount: parsedBathrooms,
        kitchensCount: parsedKitchens,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        frequency: frequency || 'ONE_TIME',
        addons: serializedAddons,
        addressStreet,
        addressCity,
        addressPostal: addressPostal || null,
        specialRequests: specialRequests || null,
        accessNotes: accessNotes || null,
        paymentMethod: paymentMethod === 'CASH' ? 'CASH' : 'STRIPE',
        paymentStatus: 'UNPAID',
        basePrice: pricing.subtotal,
        discount: pricing.totalDiscount,
        totalPrice: pricing.totalPrice,
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
      try {
        const fullOrder = await prisma.cleaningOrder.findUnique({
          where: { id: order.id },
          include: { user: true, serviceType: true },
        })
        if (fullOrder) {
          const { sendEmail } = await import('@/lib/email')

          let roomsText = [];
          if (parsedBedrooms) roomsText.push(`${parsedBedrooms} Bedrooms`);
          if (parsedBathrooms) roomsText.push(`${parsedBathrooms} Bathrooms`);
          if (parsedKitchens) roomsText.push(`${parsedKitchens} Kitchens`);
          const roomsString = roomsText.length > 0 ? roomsText.join(', ') : 'Base configuration';

          const addonsString = selectedAddons.length > 0
            ? selectedAddons.map(a => `${a.icon || ''} ${a.name}`).join(', ')
            : 'None';

          await sendEmail({
            to: email,
            subject: `📋 Booking Received — ${service.name}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>✅ Booking Received!</h2>
              <p>Hi ${name}, your cleaning booking has been received.</p>
              <p><strong>Order:</strong> #${order.orderNumber.slice(0, 8).toUpperCase()}</p>
              <p><strong>Service:</strong> ${service.icon} ${service.name}</p>
              <p><strong>Frequency:</strong> ${frequency || 'ONE_TIME'}</p>
              <p><strong>Rooms:</strong> ${roomsString}</p>
              <p><strong>Add-ons:</strong> ${addonsString}</p>
              <p><strong>Date:</strong> ${scheduledDate} at ${scheduledTime}</p>
              <p><strong>Address:</strong> ${addressStreet}, ${addressCity}</p>
              <p><strong>Total:</strong> $${pricing.totalPrice.toFixed(2)} — 💵 Cash on arrival</p>
              <p style="color: #64748b; font-size: 14px;">Our team will confirm your booking shortly.</p>
            </div>
          `,
          })

          const adminEmail = process.env.ADMIN_EMAIL
          if (adminEmail) {
            await sendEmail({
              to: adminEmail,
              subject: `🆕 New Cash Order #${order.orderNumber.slice(0, 8).toUpperCase()}`,
              html: `<p>New cash booking from ${name} (${email})</p>
                   <p>Service: ${service.name} | Date: ${scheduledDate} ${scheduledTime}</p>
                   <p>Address: ${addressStreet}, ${addressCity}</p>
                   <p>Total: $${pricing.totalPrice.toFixed(2)}</p>
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
            name: `${service.name} (${frequency || 'One Time'})`,
            description: `${scheduledDate} at ${scheduledTime} — ${addressStreet}, ${addressCity}`,
          },
          unit_amount: Math.round(pricing.totalPrice * 100),
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
