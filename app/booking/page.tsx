import { getActiveServices } from '@/lib/services'
import { Metadata } from 'next'
import BookingForm from '@/components/booking/BookingForm'

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

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Book Your Cleaning</h1>
          <p className="text-slate-500">Fill in the details below. Takes less than 2 minutes.</p>
        </div>
        <BookingForm services={services} defaultService={searchParams.service} />
      </div>
    </main>
  )
}
