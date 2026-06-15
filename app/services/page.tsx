import Link from 'next/link'
import { getActiveServices } from '@/lib/services'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Services',
  description: 'Professional cleaning services for homes, offices and commercial spaces.',
}

export default async function ServicesPage() {
  const services = await getActiveServices()

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-slate-900 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Cleaning Services</h1>
        <p className="text-slate-300 text-lg max-w-xl mx-auto">
          Professional, reliable, and eco-friendly cleaning for every need.
        </p>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          {services.map(service => (
            <div key={service.id} className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col md:flex-row md:items-center gap-6 hover:border-emerald-400 transition-colors">
              <div className="text-6xl flex-shrink-0">{service.icon}</div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{service.name}</h2>
                <p className="text-slate-500 mb-4">{service.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <span>⏱ ~{service.durationHours} hours</span>
                  {service.pricePerSqm && (
                    <span>📐 ${service.pricePerSqm}/m²</span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-1">from ${service.basePrice}</div>
                <Link
                  href={`/booking?service=${service.slug}`}
                  className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
