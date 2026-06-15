import Link from 'next/link'
import { getSiteSettings } from '@/lib/settings'
import { getActiveServices } from '@/lib/services'

export default async function HomePage() {
  const settings = await getSiteSettings()
  const services = await getActiveServices()

  return (
    <main>
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-slate-900 to-slate-800 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-emerald-500/20 text-emerald-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-emerald-500/30">
            Trusted by 1,000+ customers
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {settings.hero_title || 'Professional Cleaning, Done Right'}
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            {settings.hero_subtitle || 'Book a trusted cleaning team in minutes. Online payment or cash on site.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
            >
              Book Now
            </Link>
            <Link
              href="/services"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors border border-white/20"
            >
              See Services
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="bg-slate-50 border-b py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: '🛡️', label: 'Insured & Bonded' },
            { icon: '⭐', label: '4.9 Average Rating' },
            { icon: '♻️', label: 'Eco-Friendly Products' },
            { icon: '💳', label: 'Online or Cash Payment' },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <span className="text-3xl">{item.icon}</span>
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Cleaning Services</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              From regular maintenance to deep cleaning — we handle every space.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <Link
                key={service.id}
                href={`/booking?service=${service.slug}`}
                className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-emerald-500 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-600 font-bold text-lg">
                    from ${service.basePrice}
                  </span>
                  <span className="text-slate-400 text-sm">~{service.durationHours}h</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/services" className="text-emerald-600 font-semibold hover:underline">
              View all services & pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-slate-50 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-14">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Choose a Service', desc: 'Select the type of cleaning and enter your address and preferred date.' },
              { step: '2', title: 'Confirm & Pay', desc: 'Pay securely online via Stripe or choose to pay cash on the day of cleaning.' },
              { step: '3', title: 'We Clean', desc: 'Our vetted team arrives on time and leaves your space spotless. Guaranteed.' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-900 text-lg mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-emerald-600 py-16 px-4 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready for a Cleaner Space?</h2>
        <p className="text-emerald-100 mb-8 text-lg">Book online in 2 minutes. No contracts. Cancel anytime.</p>
        <Link
          href="/booking"
          className="bg-white text-emerald-700 font-bold px-10 py-4 rounded-xl text-lg hover:bg-emerald-50 transition-colors inline-block"
        >
          Book Your Cleaning
        </Link>
      </section>
    </main>
  )
}
