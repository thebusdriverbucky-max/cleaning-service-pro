'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { OrderStatus } from '@prisma/client'

// ─── AUTH GUARD ───────────────────────────────────────────
// Все server actions в этом файле — административные.
// Middleware защищает только страницы /admin, но НЕ server actions,
// поэтому каждый action обязан явно проверять сессию и роль.
async function requireAdmin() {
  const session = await auth() as any
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Forbidden: admin access required')
  }
  return session
}

// Допустимые значения статуса заказа (enum из Prisma)
const VALID_ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
]

function parseOrderStatus(value: string): OrderStatus | null {
  const upper = (value || '').toUpperCase()
  return VALID_ORDER_STATUSES.includes(upper as OrderStatus)
    ? (upper as OrderStatus)
    : null
}

// ---- ORDERS ----

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin()

  const parsed = parseOrderStatus(status)
  if (!parsed) {
    throw new Error(`Invalid order status: ${status}`)
  }

  await prisma.cleaningOrder.update({
    where: { id: orderId },
    data: {
      status: parsed,
      ...(parsed === 'COMPLETED' ? { completedAt: new Date() } : {}),
      ...(parsed === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
      ...(parsed === 'CONFIRMED' ? { confirmedAt: new Date() } : {}),
      ...(parsed === 'IN_PROGRESS' ? { startedAt: new Date() } : {}),
    },
  })
  revalidatePath('/admin/orders')
  revalidatePath('/admin')
}

export async function assignCleanerToOrder(orderId: string, cleanerId: string | null) {
  await requireAdmin()
  // Assuming cleanerId is the ID of the CleanerProfile
  await prisma.cleaningOrder.update({
    where: { id: orderId },
    data: { cleanerId: cleanerId },
  })
  revalidatePath('/admin/orders')
}

export async function assignCleaner(orderId: string, formData: FormData) {
  'use server'
  await requireAdmin()
  const cleanerId = formData.get('cleanerId') as string
  if (!cleanerId) return
  await prisma.cleaningOrder.update({
    where: { id: orderId },
    data: { cleanerId },
  })
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin/orders')
}

// ---- CLEANERS ----

export async function createCleaner(data: {
  name: string
  email: string
  phone: string
  bio?: string
}) {
  await requireAdmin()
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
    include: { cleanerProfile: true }
  })

  if (existing) {
    if (existing.cleanerProfile) {
      throw new Error('User with this email already exists and is already a cleaner')
    }

    await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: 'CLEANER',
        name: data.name || existing.name,
        phone: data.phone || existing.phone,
        isActive: true,
        cleanerProfile: {
          create: {
            bio: data.bio
          }
        }
      }
    })
  } else {
    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: 'CLEANER',
        isActive: true,
        cleanerProfile: {
          create: {
            bio: data.bio
          }
        }
      },
    })
  }
  revalidatePath('/admin/cleaners')
}

export async function toggleCleanerActive(cleanerId: string, isActive: boolean) {
  await requireAdmin()
  await prisma.user.update({
    where: { id: cleanerId },
    data: { isActive },
  })
  revalidatePath('/admin/cleaners')
}

export async function deleteCleaner(cleanerId: string) {
  await requireAdmin()
  await prisma.user.update({
    where: { id: cleanerId },
    data: { isActive: false },
  })
  revalidatePath('/admin/cleaners')
}

// ---- SERVICES CMS ----

export async function createService(data: {
  name: string
  slug: string
  description: string
  icon: string
  basePrice: number
  pricePerSqm?: number | null
  minArea?: number | null
  maxArea?: number | null
  durationHours: number
  sortOrder: number
  pricePerBedroom?: number | null
  pricePerBathroom?: number | null
  pricePerKitchen?: number | null
}) {
  await requireAdmin()
  await prisma.serviceType.create({ data })
  revalidatePath('/admin/services')
  revalidatePath('/services')
  revalidatePath('/')
}

export async function updateService(id: string, data: Partial<{
  name: string
  description: string
  icon: string
  basePrice: number
  pricePerSqm: number | null
  minArea: number | null
  maxArea: number | null
  durationHours: number
  sortOrder: number
  isActive: boolean
  pricePerBedroom: number | null
  pricePerBathroom: number | null
  pricePerKitchen: number | null
}>) {
  await requireAdmin()
  await prisma.serviceType.update({ where: { id }, data })
  revalidatePath('/admin/services')
  revalidatePath('/services')
  revalidatePath('/')
}

export async function deleteService(id: string) {
  await requireAdmin()
  await prisma.serviceType.update({
    where: { id },
    data: { isActive: false },
  })
  revalidatePath('/admin/services')
}

// ---- ADDONS ----

export async function createAddon(data: {
  name: string
  description?: string
  price: number
  icon?: string
  serviceTypeId?: string | null
}) {
  await requireAdmin()
  await prisma.serviceAddon.create({ data })
  revalidatePath('/admin/addons')
  revalidatePath('/booking')
}

export async function updateAddon(id: string, data: Partial<{
  name: string
  description: string | null
  price: number
  icon: string | null
  isActive: boolean
  serviceTypeId: string | null
}>) {
  await requireAdmin()
  await prisma.serviceAddon.update({ where: { id }, data })
  revalidatePath('/admin/addons')
  revalidatePath('/booking')
}

export async function deleteAddon(id: string) {
  await requireAdmin()
  await prisma.serviceAddon.delete({ where: { id } })
  revalidatePath('/admin/addons')
  revalidatePath('/booking')
}

// ---- PROMO CODES ----

export async function createPromoCode(data: {
  code: string
  discountPercent: number
  maxUses?: number
  expiresAt?: string
}) {
  await requireAdmin()
  await prisma.promoCode.create({
    data: {
      code: data.code.toUpperCase(),
      discountType: 'percent',
      discountValue: data.discountPercent,
      maxUses: data.maxUses ?? null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: true,
      usedCount: 0,
    },
  })
  revalidatePath('/admin/promo-codes')
}

export async function togglePromoCode(id: string, isActive: boolean) {
  await requireAdmin()
  await prisma.promoCode.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/promo-codes')
}

// ---- SITE SETTINGS ----

export async function updateSetting(key: string, value: string) {
  await requireAdmin()
  const { invalidateSettingsCache } = await import('@/lib/settings')
  await prisma.siteSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
  invalidateSettingsCache()
  revalidatePath('/')
  revalidatePath('/admin/settings')
}

export async function bulkUpdateSettings(settings: Record<string, string>) {
  await requireAdmin()
  const { invalidateSettingsCache } = await import('@/lib/settings')
  await Promise.all(
    Object.entries(settings).map(([key, value]) =>
      prisma.siteSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  )
  invalidateSettingsCache()
  revalidatePath('/')
  revalidatePath('/admin/settings')
}

// ---- REVIEWS ----

export async function toggleReviewPublic(id: string, isPublic: boolean) {
  await requireAdmin()
  await prisma.review.update({ where: { id }, data: { isPublic } })
  revalidatePath('/admin/reviews')
}

export async function deleteReviewAction(id: string) {
  await requireAdmin()
  await prisma.review.delete({ where: { id } })
  revalidatePath('/admin/reviews')
}
