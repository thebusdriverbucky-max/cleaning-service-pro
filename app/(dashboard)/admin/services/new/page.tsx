import { createService } from '@/app/actions/admin'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default function NewServicePage() {
  async function handleSubmit(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const icon = formData.get('icon') as string
    const basePrice = parseFloat(formData.get('basePrice') as string)
    const pricePerSqmVal = formData.get('pricePerSqm') as string
    const pricePerSqm = pricePerSqmVal ? parseFloat(pricePerSqmVal) : undefined
    const durationHours = parseFloat(formData.get('durationHours') as string)
    const sortOrder = parseInt(formData.get('sortOrder') as string)

    await createService({
      name,
      slug,
      description,
      icon,
      basePrice,
      pricePerSqm,
      durationHours,
      sortOrder,
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
        <h1 className="text-xl font-bold text-slate-900">Add New Service</h1>
      </div>

      <form action={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Service Name *</label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. Standard Cleaning"
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Slug (URL identifier) *</label>
            <input
              name="slug"
              type="text"
              required
              placeholder="e.g. standard"
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Description *</label>
            <textarea
              name="description"
              rows={3}
              required
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
              placeholder="e.g. 🧹"
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Base Price ($) *</label>
            <input
              name="basePrice"
              type="number"
              step="0.01"
              required
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
              placeholder="e.g. 0.8"
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
            Create Service
          </button>
        </div>
      </form>
    </div>
  )
}
