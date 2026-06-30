import { getActiveServices } from '@/lib/services'
import { Metadata } from 'next'
import BookingForm from '@/components/booking/BookingForm'
import { prisma } from '@/lib/prisma'

import { getSiteSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Book a Cleaning',
  description: 'Book professional cleaning service online or pay cash on site.',
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: { service?: string }
}) {
  const services = await getActiveServices()
  const addons = await prisma.serviceAddon.findMany({
    where: { isActive: true },
  })
  
  const settings = await getSiteSettings()
  const discounts = {
    weekly: parseInt(settings['discount_weekly'] || '20', 10),
    biweekly: parseInt(settings['discount_biweekly'] || '15', 10),
    monthly: parseInt(settings['discount_monthly'] || '10', 10),
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Book Your Cleaning</h1>
          <p className="text-slate-500">Fill in the details below. Takes less than 2 minutes.</p>
        </div>
        <BookingForm services={services} addons={addons} defaultService={searchParams.service} discounts={discounts} />
      </div>
    </main>
  )
}
