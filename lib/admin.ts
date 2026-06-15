import { prisma } from '@/lib/prisma'

export async function getAdminStats() {
  const [
    totalOrders,
    pendingOrders,
    confirmedOrders,
    completedOrders,
    cancelledOrders,
    totalRevenue,
    paidRevenue,
    totalCustomers,
    totalCleaners,
  ] = await Promise.all([
    prisma.cleaningOrder.count(),
    prisma.cleaningOrder.count({ where: { status: 'PENDING' } }),
    prisma.cleaningOrder.count({ where: { status: 'CONFIRMED' } }),
    prisma.cleaningOrder.count({ where: { status: 'COMPLETED' } }),
    prisma.cleaningOrder.count({ where: { status: 'CANCELLED' } }),
    prisma.cleaningOrder.aggregate({ _sum: { totalPrice: true } }),
    prisma.cleaningOrder.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { totalPrice: true },
    }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.count({ where: { role: 'CLEANER' } }),
  ])

  return {
    totalOrders,
    pendingOrders,
    confirmedOrders,
    completedOrders,
    cancelledOrders,
    totalRevenue: totalRevenue._sum.totalPrice ?? 0,
    paidRevenue: paidRevenue._sum.totalPrice ?? 0,
    totalCustomers,
    totalCleaners,
  }
}

export async function getRecentOrders(limit = 10) {
  return prisma.cleaningOrder.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      serviceType: { select: { name: true, icon: true } },
      cleaner: {
        include: {
          user: { select: { name: true } }
        }
      },
    },
  })
}

export async function getOrdersWithFilters({
  status,
  paymentMethod,
  page = 1,
  limit = 20,
}: {
  status?: string
  paymentMethod?: string
  page?: number
  limit?: number
}) {
  const where: any = {}
  if (status && status !== 'ALL') where.status = status
  if (paymentMethod && paymentMethod !== 'ALL') where.paymentMethod = paymentMethod

  const [orders, total] = await Promise.all([
    prisma.cleaningOrder.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        serviceType: { select: { name: true, icon: true } },
        cleaner: {
          include: {
            user: { select: { name: true } }
          }
        },
      },
    }),
    prisma.cleaningOrder.count({ where }),
  ])

  return { orders, total, pages: Math.ceil(total / limit) }
}
