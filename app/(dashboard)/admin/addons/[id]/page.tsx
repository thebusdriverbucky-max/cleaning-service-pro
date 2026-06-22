import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { updateAddon, deleteAddon } from '@/app/actions/admin'

export default async function EditAddonPage({ params }: { params: { id: string } }) {
  const addon = await prisma.serviceAddon.findUnique({
    where: { id: params.id }
  })

  if (!addon) redirect('/admin/addons')

  const services = await prisma.serviceType.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true }
  })

  async function handleUpdate(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const icon = formData.get('icon') as string
    const serviceTypeId = formData.get('serviceTypeId') as string
    const isActive = formData.get('isActive') === 'on'
    
    await updateAddon(params.id, {
      name,
      description: description || null,
      price,
      icon: icon || null,
      isActive,
      serviceTypeId: serviceTypeId || null,
    })
    redirect('/admin/addons')
  }

  async function handleDelete() {
    'use server'
    await deleteAddon(params.id)
    redirect('/admin/addons')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/addons" className="text-slate-500 hover:text-slate-900">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit Add-on</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <form action={handleUpdate} className="space-y-5">
          <div className="flex items-center gap-2 mb-4">
            <input type="checkbox" id="isActive" name="isActive" defaultChecked={addon.isActive} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-900">Active (Visible to customers)</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input type="text" name="name" defaultValue={addon.name} required className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
            <input type="text" name="description" defaultValue={addon.description || ''} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
              <input type="number" name="price" defaultValue={addon.price} step="0.01" required className="w-full border border-slate-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Icon (Emoji)</label>
              <input type="text" name="icon" defaultValue={addon.icon || ''} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Linked Service</label>
            <select name="serviceTypeId" defaultValue={addon.serviceTypeId || ''} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white">
              <option value="">Global (Available for all services)</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">If selected, this add-on will only appear when booking this specific service.</p>
          </div>

          <div className="pt-4 border-t border-slate-200 flex gap-3">
            <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors">
              Save Changes
            </button>
            <button formAction={handleDelete} formNoValidate className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors">
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
