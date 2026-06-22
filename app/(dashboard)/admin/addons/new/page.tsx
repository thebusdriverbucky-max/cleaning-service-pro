import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createAddon } from '@/app/actions/admin'

export default async function NewAddonPage() {
  const services = await prisma.serviceType.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true }
  })

  async function handleSubmit(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const icon = formData.get('icon') as string
    const serviceTypeId = formData.get('serviceTypeId') as string
    
    await createAddon({
      name,
      description,
      price,
      icon,
      serviceTypeId: serviceTypeId || null,
    })
    redirect('/admin/addons')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/addons" className="text-slate-500 hover:text-slate-900">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Create New Add-on</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <form action={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input type="text" name="name" required className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="e.g. Inside Fridge" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
            <input type="text" name="description" className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="Brief details about the extra service" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
              <input type="number" name="price" step="0.01" required className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Icon (Emoji)</label>
              <input type="text" name="icon" className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="🧊" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Linked Service</label>
            <select name="serviceTypeId" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white">
              <option value="">Global (Available for all services)</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">If selected, this add-on will only appear when booking this specific service.</p>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors">
              Create Add-on
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
