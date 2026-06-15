import { prisma } from '@/lib/prisma'
import { createCleaner, toggleCleanerActive } from '@/app/actions/admin'

export default async function AdminCleanersPage() {
  const cleaners = await prisma.user.findMany({
    where: { role: 'CLEANER' },
    orderBy: { createdAt: 'desc' },
    include: {
      cleanerProfile: {
        include: {
          _count: { select: { orders: true } }
        }
      },
    },
  })

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cleaners</h1>
          <p className="text-slate-500 text-sm mt-1">{cleaners.length} cleaners registered</p>
        </div>
      </div>

      {/* Add Cleaner Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Add New Cleaner</h2>
        <form action={async (formData: FormData) => {
          'use server'
          const { createCleaner } = await import('@/app/actions/admin')
          await createCleaner({
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            bio: formData.get('bio') as string,
          })
        }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
            <input name="name" required type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <input name="email" required type="email" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input name="phone" type="tel" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bio / Notes</label>
            <input name="bio" type="text" placeholder="Specializations, experience..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
              Add Cleaner
            </button>
          </div>
        </form>
      </div>

      {/* Cleaners List */}
      <div className="space-y-3">
        {cleaners.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-xl">
            <div className="text-4xl mb-2">🧹</div>
            No cleaners yet. Add your first team member above.
          </div>
        ) : (
          cleaners.map(cleaner => (
            <div key={cleaner.id} className={`bg-white border rounded-xl p-4 flex items-center gap-4 ${!cleaner.isActive ? 'opacity-60' : 'border-slate-200'}`}>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold flex-shrink-0">
                {(cleaner.name || 'C').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">{cleaner.name}</div>
                <div className="text-sm text-slate-500">{cleaner.email} {cleaner.phone && `· ${cleaner.phone}`}</div>
                {cleaner.cleanerProfile?.bio && <div className="text-xs text-slate-400 mt-0.5">{cleaner.cleanerProfile.bio}</div>}
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-slate-900 tabular-nums">{cleaner.cleanerProfile?._count.orders || 0}</div>
                <div className="text-xs text-slate-400">orders</div>
              </div>
              <div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${cleaner.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {cleaner.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <form action={toggleCleanerActive.bind(null, cleaner.id, !cleaner.isActive)}>
                <button className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  {cleaner.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
