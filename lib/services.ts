import { prisma } from '@/lib/prisma'

export async function getActiveServices() {
  return prisma.serviceType.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getServiceBySlug(slug: string) {
  return prisma.serviceType.findUnique({ where: { slug } })
}
