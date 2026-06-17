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

  // ── Homepage CMS Settings ──
  const homepageSettings = [
    // Hero section
    { key: 'hero_badge', value: '🫧 Professional Cleaning', description: 'Small badge text above hero title' },
    { key: 'hero_title_line1', value: 'Spotless Spaces,', description: 'Hero title line 1' },
    { key: 'hero_title_line2', value: 'Happy Places', description: 'Hero title line 2 (accent color)' },
    { key: 'hero_subtitle', value: 'Book professional cleaning services in minutes. Trusted cleaners, flexible scheduling, and a spotless guarantee.', description: 'Hero subtitle text' },
    { key: 'hero_cta_primary', value: 'Book a Cleaning', description: 'Hero primary button text' },
    { key: 'hero_cta_secondary', value: 'View Services', description: 'Hero secondary button text' },

    // Trust stats bar
    { key: 'stat1_value', value: '1,000+', description: 'Stat 1 number' },
    { key: 'stat1_label', value: 'Happy Customers', description: 'Stat 1 label' },
    { key: 'stat2_value', value: '4.9★', description: 'Stat 2 number' },
    { key: 'stat2_label', value: 'Average Rating', description: 'Stat 2 label' },
    { key: 'stat3_value', value: '5,000+', description: 'Stat 3 number' },
    { key: 'stat3_label', value: 'Cleanings Done', description: 'Stat 3 label' },
    { key: 'stat4_value', value: '100%', description: 'Stat 4 number' },
    { key: 'stat4_label', value: 'Satisfaction Guaranteed', description: 'Stat 4 label' },

    // Services section
    { key: 'services_title', value: 'Our Cleaning Services', description: 'Services section title' },
    { key: 'services_subtitle', value: 'From regular home cleaning to deep cleans and move-in/out services', description: 'Services section subtitle' },
    { key: 'services_cta', value: 'Book This Service', description: 'Services card CTA button text' },

    // How it works section
    { key: 'howitworks_title', value: 'How It Works', description: 'How it works section title' },
    { key: 'howitworks_step1_title', value: 'Book Online', description: 'Step 1 title' },
    { key: 'howitworks_step1_desc', value: 'Choose your service, select a date and time that works for you.', description: 'Step 1 description' },
    { key: 'howitworks_step2_title', value: 'We Show Up', description: 'Step 2 title' },
    { key: 'howitworks_step2_desc', value: 'Our professional cleaners arrive on time with all supplies needed.', description: 'Step 2 description' },
    { key: 'howitworks_step3_title', value: 'Enjoy Clean Space', description: 'Step 3 title' },
    { key: 'howitworks_step3_desc', value: 'Relax and enjoy your spotlessly clean home or office.', description: 'Step 3 description' },

    // Trust section
    { key: 'trust_title', value: 'Why Choose Us', description: 'Trust section title' },
    { key: 'trust_item1_title', value: 'Background-Checked Cleaners', description: 'Trust item 1 title' },
    { key: 'trust_item1_desc', value: 'Every cleaner is thoroughly vetted and background-checked.', description: 'Trust item 1 desc' },
    { key: 'trust_item2_title', value: 'Flexible Scheduling', description: 'Trust item 2 title' },
    { key: 'trust_item2_desc', value: 'Book same-day, next-day, or recurring appointments.', description: 'Trust item 2 desc' },
    { key: 'trust_item3_title', value: 'Satisfaction Guarantee', description: 'Trust item 3 title' },
    { key: 'trust_item3_desc', value: 'Not happy? We\'ll re-clean for free within 24 hours.', description: 'Trust item 3 desc' },
    { key: 'trust_item4_title', value: 'Eco-Friendly Products', description: 'Trust item 4 title' },
    { key: 'trust_item4_desc', value: 'We use safe, environmentally-friendly cleaning products.', description: 'Trust item 4 desc' },

    // CTA section
    { key: 'cta_title', value: 'Ready for a Spotless Home?', description: 'Bottom CTA section title' },
    { key: 'cta_subtitle', value: 'Join thousands of satisfied customers. Book your first cleaning today.', description: 'Bottom CTA subtitle' },
    { key: 'cta_button', value: 'Book Your First Cleaning', description: 'Bottom CTA button text' },

    // Footer
    { key: 'footer_tagline', value: 'Professional cleaning services you can trust.', description: 'Footer tagline' },
    { key: 'company_name', value: 'CleanFlow', description: 'Company name (used across site)' },
    { key: 'company_phone', value: '', description: 'Company phone number' },
    { key: 'company_email', value: '', description: 'Company contact email' },
    { key: 'company_address', value: '', description: 'Company address' },
  ]

  for (const s of homepageSettings) {
    await prisma.siteSettings.upsert({
      where: { key: s.key },
      update: {},  // Don't overwrite existing values on re-seed
      create: s,
    })
  }
  console.log(`✅ Seeded ${homepageSettings.length} homepage CMS settings`)

  console.log('✅ Seed completed')
}

main().catch(console.error).finally(() => prisma.$disconnect())
