import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateOrderPrice } from '@/lib/prices'
import { checkRateLimit } from '@/lib/rate-limit'
import { escapeHtml } from '@/lib/utils'
import { z } from 'zod'

// ─── Zod-схема валидации входных данных ───────────────────
const bookingSchema = z.object({
  serviceSlug: z.string().min(1).max(100),
  frequency: z.enum(['ONE_TIME', 'WEEKLY', 'BIWEEKLY', 'MONTHLY']).default('ONE_TIME'),
  areaSize: z.union([z.string(), z.number()]).optional(),
  bedroomsCount: z.union([z.string(), z.number()]).optional(),
  bathroomsCount: z.union([z.string(), z.number()]).optional(),
  kitchensCount: z.union([z.string(), z.number()]).optional(),
  selectedAddonIds: z.array(z.string().max(100)).max(50).optional(),
  addons: z.array(z.string().max(100)).max(50).optional(),
  scheduledDate: z.string().min(1).max(50),
  scheduledTime: z.string().min(1).max(10),
  addressStreet: z.string().min(1).max(300),
  addressCity: z.string().min(1).max(100),
  addressPostal: z.string().max(30).optional(),
  specialRequests: z.string().max(2000).optional(),
  accessNotes: z.string().max(1000).optional(),
  paymentMethod: z.enum(['STRIPE', 'CASH']).default('STRIPE'),
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  phone: z.string().min(5).max(30),
  promoCode: z.string().max(50).optional(),
})

// Безопасный парсинг числовых полей с границами
function safeParseInt(value: unknown, min: number, max: number, fallback = 0): number {
  const n = typeof value === 'number' ? value : parseInt(String(value))
  if (isNaN(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

function safeParseFloat(value: unknown, min: number, max: number, fallback = 0): number {
  const n = typeof value === 'number' ? value : parseFloat(String(value))
  if (isNaN(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

export async function POST(req: NextRequest) {
  try {
    // ─── RATE LIMIT ───────────────────────────────────────
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
    const { success: rateLimitOk } = await checkRateLimit(`booking:${ip}`, 'orders')
    if (!rateLimitOk) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    // ─── VALIDATE INPUT ───────────────────────────────────
    const rawBody = await req.json()
    const parsed = bookingSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }
    const body = parsed.data

    const {
      serviceSlug, scheduledDate, scheduledTime,
      addressStreet, addressCity, addressPostal, specialRequests, accessNotes,
      paymentMethod, name, email, phone, promoCode,
    } = body

    if (!serviceSlug || !scheduledDate || !addressStreet || !addressCity || !email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ─── VALIDATE DATE (не в прошлом) ─────────────────────
    const scheduledDateObj = new Date(scheduledDate)
    if (isNaN(scheduledDateObj.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (scheduledDateObj < today) {
      return NextResponse.json({ error: 'Scheduled date cannot be in the past' }, { status: 400 })
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
    const addonIds = Array.isArray(body.addons) ? body.addons : (body.selectedAddonIds || [])
    let selectedAddons: any[] = []
    if (addonIds.length > 0) {
      selectedAddons = await prisma.serviceAddon.findMany({
        where: { id: { in: addonIds }, isActive: true }
      })
    }

    // ─── PROMO CODE: атомарная проверка и инкремент ───────
    // Раньше проверка и инкремент были разнесены — race condition.
    // Теперь используем транзакцию с условным обновлением:
    // инкремент выполнится только если лимит ещё не превышен.
    let validPromoCode: any = null

    if (promoCode) {
      const result = await prisma.$transaction(async (tx) => {
        const promo = await tx.promoCode.findUnique({
          where: { code: promoCode.toUpperCase() },
        })

        if (!promo || !promo.isActive) {
          return { error: 'Promo code is invalid or inactive' }
        }

        const isNotExpired = !promo.expiresAt || new Date(promo.expiresAt) >= new Date()
        if (!isNotExpired) {
          return { error: 'Promo code is expired' }
        }

        // Условный инкремент: только если лимит не превышен
        if (promo.maxUses && promo.usedCount >= promo.maxUses) {
          return { error: 'Promo code usage limit reached' }
        }

        // Атомарно увеличиваем счётчик использования
        const updated = await tx.promoCode.updateMany({
          where: {
            id: promo.id,
            // Защита от race: обновляем только если лимит ещё позволяет
            ...(promo.maxUses ? { usedCount: { lt: promo.maxUses } } : {}),
          },
          data: { usedCount: { increment: 1 } },
        })

        // Если ни одна строка не обновлена — значит кто-то успел первым
        if (updated.count === 0) {
          return { error: 'Promo code usage limit reached' }
        }

        return { promo }
      })

      if ('error' in result) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      validPromoCode = result.promo
    }

    // Load settings for discounts
    const { getSiteSettings } = await import('@/lib/settings')
    const settings = await getSiteSettings()
    const discounts = {
      weekly: parseInt(settings['discount_weekly'] || '20', 10),
      biweekly: parseInt(settings['discount_biweekly'] || '15', 10),
      monthly: parseInt(settings['discount_monthly'] || '10', 10),
    }

    // ─── SAFE PARSE COUNTS ────────────────────────────────
    const parsedBedrooms = safeParseInt(body.bedroomsCount, 0, 50, 0)
    const parsedBathrooms = safeParseInt(body.bathroomsCount, 0, 50, 0)
    const parsedKitchens = safeParseInt(body.kitchensCount, 0, 50, 0)
    const parsedAreaSize = body.areaSize
      ? safeParseFloat(body.areaSize, 0, 100000, 0)
      : 0

    // Calculate Prices
    const pricing = calculateOrderPrice({
      service: {
        basePrice: service.basePrice,
        pricePerSqm: service.pricePerSqm,
        minArea: service.minArea,
        maxArea: service.maxArea,
        pricePerBedroom: service.pricePerBedroom,
        pricePerBathroom: service.pricePerBathroom,
        pricePerKitchen: service.pricePerKitchen,
      },
      areaSize: parsedAreaSize > 0 ? parsedAreaSize : undefined,
      bedroomsCount: parsedBedrooms,
      bathroomsCount: parsedBathrooms,
      kitchensCount: parsedKitchens,
      addons: selectedAddons,
      frequency: body.frequency,
      promoCode: validPromoCode,
      discounts,
    });

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
        areaSize: parsedAreaSize > 0 ? parsedAreaSize : null,
        roomCount: legacyRoomCount > 0 ? legacyRoomCount : null,
        bedroomsCount: parsedBedrooms,
        bathroomsCount: parsedBathrooms,
        kitchensCount: parsedKitchens,
        scheduledDate: scheduledDateObj,
        scheduledTime,
        frequency: body.frequency,
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
            ? selectedAddons.map(a => `${escapeHtml(a.icon || '')} ${escapeHtml(a.name)}`).join(', ')
            : 'None';

          // Все пользовательские данные экранируются для защиты от HTML-инъекций
          await sendEmail({
            to: email,
            subject: `📋 Booking Received — ${service.name}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>✅ Booking Received!</h2>
              <p>Hi ${escapeHtml(name)}, your cleaning booking has been received.</p>
              <p><strong>Order:</strong> #${escapeHtml(order.orderNumber.slice(0, 8).toUpperCase())}</p>
              <p><strong>Service:</strong> ${escapeHtml(service.icon)} ${escapeHtml(service.name)}</p>
              <p><strong>Frequency:</strong> ${escapeHtml(body.frequency)}</p>
              <p><strong>Rooms:</strong> ${escapeHtml(roomsString)}</p>
              <p><strong>Add-ons:</strong> ${addonsString}</p>
              <p><strong>Date:</strong> ${escapeHtml(scheduledDate)} at ${escapeHtml(scheduledTime)}</p>
              <p><strong>Address:</strong> ${escapeHtml(addressStreet)}, ${escapeHtml(addressCity)}</p>
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
              html: `<p>New cash booking from ${escapeHtml(name)} (${escapeHtml(email)})</p>
                   <p>Service: ${escapeHtml(service.name)} | Date: ${escapeHtml(scheduledDate)} ${escapeHtml(scheduledTime)}</p>
                   <p>Address: ${escapeHtml(addressStreet)}, ${escapeHtml(addressCity)}</p>
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
            name: `${service.name} (${body.frequency})`,
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
