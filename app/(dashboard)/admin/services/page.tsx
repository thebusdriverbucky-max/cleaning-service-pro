import { prisma } from '@/lib/prisma'
import { updateService } from '@/app/actions/admin'
import Link from 'next/link'

export default async function AdminServicesPage() {
  const services = await prisma.serviceType.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { orders: true } },
    },
  })

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Services</h1>
        <Link href="/admin/services/new" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
          + Add Service
        </Link>
      </div>

      <div className="space-y-3">
        {services.map(service => (
          <div key={service.id} className={`bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 ${!service.isActive ? 'opacity-60' : ''}`}>
            <div className="text-4xl flex-shrink-0">{service.icon}</div>
            <div className="flex-1">
              <div className="font-semibold text-slate-900">{service.name}</div>
              <div className="text-sm text-slate-500 line-clamp-1">{service.description}</div>
              <div className="flex gap-4 mt-1 text-xs text-slate-400">
                <span>from ${service.basePrice}</span>
                {service.pricePerSqm && <span>${service.pricePerSqm}/m²</span>}
                <span>~{service.durationHours}h</span>
                <span>{service._count.orders} orders</span>
              </div>
            </div>
            <div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {service.isActive ? 'Active' : 'Hidden'}
              </span>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/services/${service.id}`} className="text-xs border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                Edit
              </Link>
              <form action={updateService.bind(null, service.id, { isActive: !service.isActive })}>
                <button className="text-xs border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  {service.isActive ? 'Hide' : 'Show'}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
