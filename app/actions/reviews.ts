'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createReviewAction(orderId: string, rating: number, comment?: string) {
  const session = await auth()
  if (!session?.user?.email) throw new Error('Unauthorized')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) throw new Error('User not found')

  const order = await prisma.cleaningOrder.findUnique({
    where: { id: orderId },
  })

  if (!order || order.userId !== user.id) {
    throw new Error('Order not found or access denied')
  }

  if (order.status !== 'COMPLETED') {
    throw new Error('Can only review completed orders')
  }

  // Check if already reviewed
  const existing = await prisma.review.findUnique({
    where: { orderId },
  })
  if (existing) {
    throw new Error('This order is already reviewed')
  }

  await prisma.review.create({
    data: {
      orderId,
      userId: user.id,
      rating,
      comment: comment || null,
      isPublic: true,
    },
  })

  revalidatePath('/account/orders')
  revalidatePath('/admin/reviews')
}
