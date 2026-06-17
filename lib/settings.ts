import { prisma } from '@/lib/prisma'

let settingsCache: Record<string, string> | null = null
let cacheTime = 0
const CACHE_TTL = 60 * 1000 // 1 minute

export async function getSettings(): Promise<Record<string, string>> {
  const now = Date.now()
  if (settingsCache && now - cacheTime < CACHE_TTL) {
    return settingsCache
  }
  const rows = await prisma.siteSettings.findMany()
  settingsCache = Object.fromEntries(rows.map(r => [r.key, r.value]))
  cacheTime = now
  return settingsCache
}

export function s(settings: Record<string, string>, key: string, fallback = ''): string {
  return settings[key] || fallback
}

export function invalidateSettingsCache() {
  settingsCache = null
}

export async function getSiteSettings(): Promise<Record<string, string>> {
  return getSettings()
}

export async function getSetting(key: string, fallback = ''): Promise<string> {
  const settings = await getSettings()
  return settings[key] ?? fallback
}
