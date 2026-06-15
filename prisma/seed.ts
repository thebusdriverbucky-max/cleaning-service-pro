import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const services = [
    {
      slug: 'standard',
      name: 'Standard Cleaning',
      description: 'Regular maintenance cleaning for homes and apartments. Includes dusting, vacuuming, mopping, bathroom and kitchen cleaning.',
      icon: '🧹',
      basePrice: 80,
      pricePerSqm: 0.8,
      durationHours: 3,
      sortOrder: 1,
    },
    {
      slug: 'deep',
      name: 'Deep Cleaning',
      description: 'Thorough top-to-bottom cleaning. Includes all standard services plus inside appliances, cabinets, window sills, baseboards.',
      icon: '✨',
      basePrice: 150,
      pricePerSqm: 1.5,
      durationHours: 6,
      sortOrder: 2,
    },
    {
      slug: 'move-in-out',
      name: 'Move In / Move Out',
      description: 'Complete cleaning for empty properties. Perfect for tenants moving out or new homeowners moving in.',
      icon: '📦',
      basePrice: 200,
      pricePerSqm: 2.0,
      durationHours: 8,
      sortOrder: 3,
    },
    {
      slug: 'office',
      name: 'Office Cleaning',
      description: 'Professional cleaning for offices and commercial spaces. Flexible scheduling including evenings and weekends.',
      icon: '🏢',
      basePrice: 120,
      pricePerSqm: 1.2,
      durationHours: 4,
      sortOrder: 4,
    },
    {
      slug: 'post-renovation',
      name: 'Post-Renovation Cleaning',
      description: 'Specialized cleaning after construction or renovation. Removes dust, debris, paint spots and construction residue.',
      icon: '🔨',
      basePrice: 250,
      pricePerSqm: 2.5,
      durationHours: 8,
      sortOrder: 5,
    },
    {
      slug: 'window',
      name: 'Window Cleaning',
      description: 'Interior and exterior window cleaning for residential and commercial properties.',
      icon: '🪟',
      basePrice: 60,
      pricePerSqm: null,
      durationHours: 2,
      sortOrder: 6,
    },
  ]

  for (const service of services) {
    await prisma.serviceType.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    })
  }

  // Default site settings
  const settings = [
    { key: 'site_name', value: 'CleanFlow', description: 'Site name' },
    { key: 'site_phone', value: '+1 (555) 000-0000', description: 'Contact phone' },
    { key: 'site_email', value: 'hello@cleanflow.com', description: 'Contact email' },
    { key: 'site_address', value: '123 Main St, New York, NY', description: 'Office address' },
    { key: 'hero_title', value: 'Professional Cleaning, Done Right', description: 'Homepage hero title' },
    { key: 'hero_subtitle', value: 'Book a trusted cleaning team in minutes. Online payment or cash on site.', description: 'Homepage hero subtitle' },
    { key: 'currency', value: 'USD', description: 'Currency code' },
    { key: 'currency_symbol', value: '$', description: 'Currency symbol' },
  ]

  for (const setting of settings) {
    await prisma.siteSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }

  console.log('✅ Seed completed')
}

main().catch(console.error).finally(() => prisma.$disconnect())
