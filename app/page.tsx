import Link from 'next/link'
import { getSettings, s } from '@/lib/settings'
import { getActiveServices } from '@/lib/services'

export default async function HomePage() {
  const settings = await getSettings()
  const services = await getActiveServices()

  return (
    <main>
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-teal-50/20 to-white text-slate-900 py-24 px-4 overflow-hidden border-b border-slate-100">
        {/* Floating Decorative Elements */}
        <div className="absolute top-12 left-10 text-6xl opacity-15 select-none pointer-events-none animate-bounce" style={{ animationDuration: '4s' }}>🫧</div>
        <div className="absolute bottom-16 left-1/4 text-5xl opacity-10 select-none pointer-events-none animate-pulse">✨</div>
        <div className="absolute top-20 right-16 text-7xl opacity-15 select-none pointer-events-none animate-bounce" style={{ animationDuration: '6s' }}>🧹</div>
        <div className="absolute bottom-12 right-1/4 text-6xl opacity-10 select-none pointer-events-none animate-pulse">🧽</div>
        <div className="absolute top-1/2 left-8 text-5xl opacity-10 select-none pointer-events-none animate-pulse">💧</div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block bg-emerald-100 text-emerald-800 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-emerald-200">
            {s(settings, 'hero_badge', '🫧 Professional Cleaning')}
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight text-slate-900">
            {s(settings, 'hero_title_line1', 'Spotless Spaces,')}{' '}
            <span className="text-emerald-500">{s(settings, 'hero_title_line2', 'Happy Places')}</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {s(settings, 'hero_subtitle', 'Book professional cleaning services in minutes. Trusted cleaners, flexible scheduling, and a spotless guarantee.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:shadow-lg hover:shadow-emerald-500/20 shadow-md duration-200"
            >
              {s(settings, 'hero_cta_primary', 'Book a Cleaning')}
            </Link>
            <Link
              href="/services"
              className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-8 py-4 rounded-xl text-lg transition-all border border-slate-200 shadow-sm duration-200"
            >
              {s(settings, 'hero_cta_secondary', 'View Services')}
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST BADGES / STATS BAR */}
      <section className="bg-slate-50 border-b py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: '🛡️', index: 1, fallbackVal: '1,000+', fallbackLabel: 'Happy Customers' },
            { icon: '⭐', index: 2, fallbackVal: '4.9★', fallbackLabel: 'Average Rating' },
            { icon: '♻️', index: 3, fallbackVal: '5,000+', fallbackLabel: 'Cleanings Done' },
            { icon: '💳', index: 4, fallbackVal: '100%', fallbackLabel: 'Satisfaction Guaranteed' },
          ].map(item => (
            <div key={item.index} className="flex flex-col items-center gap-2">
              <span className="text-3xl">{item.icon}</span>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900">{s(settings, `stat${item.index}_value`, item.fallbackVal)}</span>
                <span className="text-sm font-medium text-slate-500">{s(settings, `stat${item.index}_label`, item.fallbackLabel)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {s(settings, 'services_title', 'Our Cleaning Services')}
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              {s(settings, 'services_subtitle', 'From regular home cleaning to deep cleans and move-in/out services')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <Link
                key={service.id}
                href={`/booking?service=${service.slug}`}
                className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">{service.description}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-emerald-600 font-bold text-lg">
                      from ${service.basePrice}
                    </span>
                    <span className="text-slate-400 text-sm">~{service.durationHours}h</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 text-sm text-emerald-600 font-semibold group-hover:underline flex items-center justify-between">
                    <span>{s(settings, 'services_cta', 'Book This Service')}</span>
                    <span>→</span>
                  </div>
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
      <section className="bg-slate-50 py-20 px-4 border-t border-b border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-14">
            {s(settings, 'howitworks_title', 'How It Works')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: s(settings, 'howitworks_step1_title', 'Book Online'),
                desc: s(settings, 'howitworks_step1_desc', 'Choose your service, select a date and time that works for you.'),
              },
              {
                step: '2',
                title: s(settings, 'howitworks_step2_title', 'We Show Up'),
                desc: s(settings, 'howitworks_step2_desc', 'Our professional cleaners arrive on time with all supplies needed.'),
              },
              {
                step: '3',
                title: s(settings, 'howitworks_step3_title', 'Enjoy Clean Space'),
                desc: s(settings, 'howitworks_step3_desc', 'Relax and enjoy your spotlessly clean home or office.'),
              },
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

      {/* TRUST SECTION (Why Choose Us) */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-14">
            {s(settings, 'trust_title', 'Why Choose Us')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: s(settings, 'trust_item1_title', 'Background-Checked Cleaners'),
                desc: s(settings, 'trust_item1_desc', 'Every cleaner is thoroughly vetted and background-checked.'),
                icon: '🛡️',
              },
              {
                title: s(settings, 'trust_item2_title', 'Flexible Scheduling'),
                desc: s(settings, 'trust_item2_desc', 'Book same-day, next-day, or recurring appointments.'),
                icon: '📅',
              },
              {
                title: s(settings, 'trust_item3_title', 'Satisfaction Guarantee'),
                desc: s(settings, 'trust_item3_desc', "Not happy? We'll re-clean for free within 24 hours."),
                icon: '⭐',
              },
              {
                title: s(settings, 'trust_item4_title', 'Eco-Friendly Products'),
                desc: s(settings, 'trust_item4_desc', 'We use safe, environmentally-friendly cleaning products.'),
                icon: '🌿',
              },
            ].map((item, index) => (
              <div key={index} className="flex gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-1">{item.title}</h3>
                  <p className="text-slate-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-emerald-600 py-16 px-4 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          {s(settings, 'cta_title', 'Ready for a Spotless Home?')}
        </h2>
        <p className="text-emerald-100 mb-8 text-lg">
          {s(settings, 'cta_subtitle', 'Join thousands of satisfied customers. Book your first cleaning today.')}
        </p>
        <Link
          href="/booking"
          className="bg-white text-emerald-700 font-bold px-10 py-4 rounded-xl text-lg hover:bg-emerald-50 transition-colors inline-block"
        >
          {s(settings, 'cta_button', 'Book Your First Cleaning')}
        </Link>
      </section>
    </main>
  )
}
