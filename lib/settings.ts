import { prisma } from '@/lib/prisma'

export async function getSiteSettings(): Promise<Record<string, string>> {
  const settings = await prisma.siteSettings.findMany()
  return Object.fromEntries(settings.map(s => [s.key, s.value]))
}

export async function getSetting(key: string, fallback = ''): Promise<string> {
  const setting = await prisma.siteSettings.findUnique({ where: { key } })
  return setting?.value ?? fallback
}
