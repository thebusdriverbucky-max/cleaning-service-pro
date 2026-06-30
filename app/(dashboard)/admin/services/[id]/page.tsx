import { prisma } from '@/lib/prisma'
import { updateService } from '@/app/actions/admin'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

type Props = {
  params: { id: string }
}

export default async function EditServicePage({ params }: Props) {
  const service = await prisma.serviceType.findUnique({
    where: { id: params.id },
  })

  if (!service) notFound()

  async function handleSubmit(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const icon = formData.get('icon') as string
    const basePrice = parseFloat(formData.get('basePrice') as string)
    const pricePerSqmVal = formData.get('pricePerSqm') as string
    const pricePerSqm = pricePerSqmVal ? parseFloat(pricePerSqmVal) : null
    const minAreaVal = formData.get('minArea') as string
    const minArea = minAreaVal ? parseFloat(minAreaVal) : null
    const maxAreaVal = formData.get('maxArea') as string
    const maxArea = maxAreaVal ? parseFloat(maxAreaVal) : null
    const durationHours = parseFloat(formData.get('durationHours') as string)
    const sortOrder = parseInt(formData.get('sortOrder') as string)
    const pricePerBedroomVal = formData.get('pricePerBedroom') as string
    const pricePerBedroom = pricePerBedroomVal ? parseFloat(pricePerBedroomVal) : null
    const pricePerBathroomVal = formData.get('pricePerBathroom') as string
    const pricePerBathroom = pricePerBathroomVal ? parseFloat(pricePerBathroomVal) : null
    const pricePerKitchenVal = formData.get('pricePerKitchen') as string
    const pricePerKitchen = pricePerKitchenVal ? parseFloat(pricePerKitchenVal) : null

    await updateService(params.id, {
      name,
      description,
      icon,
      basePrice,
      pricePerSqm,
      minArea,
      maxArea,
      durationHours,
      sortOrder,
      pricePerBedroom,
      pricePerBathroom,
      pricePerKitchen,
    })

    redirect('/admin/services')
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/services" className="text-slate-400 hover:text-slate-600 transition-colors">
          ← Services
        </Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-xl font-bold text-slate-900">Edit Service: {service.name}</h1>
      </div>

      <form action={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Service Name *</label>
            <input
              name="name"
              type="text"
              required
              defaultValue={service.name}
              placeholder="e.g. Standard Cleaning"
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 opacity-60">Slug (URL identifier) * [Cannot edit]</label>
            <input
              name="slug"
              type="text"
              disabled
              defaultValue={service.slug}
              className="w-full bg-slate-50 text-slate-500 border border-slate-200 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Description *</label>
            <textarea
              name="description"
              rows={3}
              required
              defaultValue={service.description || ''}
              placeholder="Provide a description of the cleaning service..."
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Icon / Emoji *</label>
            <input
              name="icon"
              type="text"
              required
              defaultValue={service.icon || ''}
              placeholder="e.g. 🧹, ✨, 🧽"
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-slate-400 mt-1">For best results, use an emoji. It looks great on all devices.</p>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Base Price ($) *</label>
            <input
              name="basePrice"
              type="number"
              step="0.01"
              required
              defaultValue={service.basePrice}
              placeholder="e.g. 80"
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Price per m² ($)
              <span className="text-xs text-slate-400 block font-normal">Leave empty for flat-rate pricing</span>
            </label>
            <input
              name="pricePerSqm"
              type="number"
              step="0.01"
              defaultValue={service.pricePerSqm ?? ''}
              placeholder="e.g. 0.8"
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Min Area (m²)
              <span className="text-xs text-slate-400 block font-normal">Minimum area charged (e.g. 20)</span>
            </label>
            <input
              name="minArea"
              type="number"
              step="0.01"
              defaultValue={service.minArea ?? ''}
              placeholder="e.g. 20"
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Max Area (m²)
              <span className="text-xs text-slate-400 block font-normal">Maximum allowed area (optional)</span>
            </label>
            <input
              name="maxArea"
              type="number"
              step="0.01"
              defaultValue={service.maxArea ?? ''}
              placeholder="e.g. 500"
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Price per Bedroom ($)
              <span className="text-xs text-slate-400 block font-normal">Leave empty/0 to disable counter</span>
            </label>
            <input
              name="pricePerBedroom"
              type="number"
              step="0.01"
              defaultValue={service.pricePerBedroom ?? ''}
              placeholder="e.g. 25"
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Price per Bathroom ($)
              <span className="text-xs text-slate-400 block font-normal">Leave empty/0 to disable counter</span>
            </label>
            <input
              name="pricePerBathroom"
              type="number"
              step="0.01"
              defaultValue={service.pricePerBathroom ?? ''}
              placeholder="e.g. 30"
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Price per Kitchen ($)
              <span className="text-xs text-slate-400 block font-normal">Leave empty/0 to disable counter</span>
            </label>
            <input
              name="pricePerKitchen"
              type="number"
              step="0.01"
              defaultValue={service.pricePerKitchen ?? ''}
              placeholder="e.g. 40"
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Duration (hours) *</label>
            <input
              name="durationHours"
              type="number"
              step="0.5"
              required
              defaultValue={service.durationHours}
              placeholder="e.g. 3"
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Sort Order *</label>
            <input
              name="sortOrder"
              type="number"
              required
              defaultValue={service.sortOrder}
              placeholder="e.g. 1"
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Link href="/admin/services" className="border border-slate-200 text-slate-700 font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors">
            Cancel
          </Link>
          <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
