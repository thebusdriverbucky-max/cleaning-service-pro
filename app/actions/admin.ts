'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ---- ORDERS ----

export async function updateOrderStatus(orderId: string, status: string) {
  await prisma.cleaningOrder.update({
    where: { id: orderId },
    data: {
      status: status as any,
      ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
    },
  })
  revalidatePath('/admin/orders')
  revalidatePath('/admin')
}

export async function assignCleanerToOrder(orderId: string, cleanerId: string | null) {
  // Assuming cleanerId is the ID of the CleanerProfile
  await prisma.cleaningOrder.update({
    where: { id: orderId },
    data: { cleanerId: cleanerId },
  })
  revalidatePath('/admin/orders')
}

export async function assignCleaner(orderId: string, formData: FormData) {
  'use server'
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
  await prisma.user.update({
    where: { id: cleanerId },
    data: { isActive },
  })
  revalidatePath('/admin/cleaners')
}

export async function deleteCleaner(cleanerId: string) {
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
  pricePerSqm?: number
  durationHours: number
  sortOrder: number
}) {
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
  durationHours: number
  sortOrder: number
  isActive: boolean
}>) {
  await prisma.serviceType.update({ where: { id }, data })
  revalidatePath('/admin/services')
  revalidatePath('/services')
  revalidatePath('/')
}

export async function deleteService(id: string) {
  await prisma.serviceType.update({
    where: { id },
    data: { isActive: false },
  })
  revalidatePath('/admin/services')
}

// ---- PROMO CODES ----

export async function createPromoCode(data: {
  code: string
  discountPercent: number
  maxUses?: number
  expiresAt?: string
}) {
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
  await prisma.promoCode.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/promo-codes')
}

// ---- SITE SETTINGS ----

export async function updateSetting(key: string, value: string) {
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
  await prisma.review.update({ where: { id }, data: { isPublic } })
  revalidatePath('/admin/reviews')
}

export async function deleteReviewAction(id: string) {
  await prisma.review.delete({ where: { id } })
  revalidatePath('/admin/reviews')
}
