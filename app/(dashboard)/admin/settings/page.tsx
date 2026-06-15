import { getSiteSettings } from '@/lib/settings'
import { bulkUpdateSettings } from '@/app/actions/admin'

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings()

  const settingsGroups = [
    {
      title: 'General',
      fields: [
        { key: 'site_name', label: 'Site Name', type: 'text' },
        { key: 'site_phone', label: 'Phone', type: 'tel' },
        { key: 'site_email', label: 'Email', type: 'email' },
        { key: 'site_address', label: 'Office Address', type: 'text' },
        { key: 'currency', label: 'Currency Code (e.g. USD)', type: 'text' },
        { key: 'currency_symbol', label: 'Currency Symbol (e.g. $)', type: 'text' },
      ],
    },
    {
      title: 'Homepage Content',
      fields: [
        { key: 'hero_title', label: 'Hero Title', type: 'text' },
        { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'text' },
      ],
    },
  ]

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Site Settings</h1>

      <form action={async (formData: FormData) => {
        'use server'
        const { bulkUpdateSettings } = await import('@/app/actions/admin')
        const data: Record<string, string> = {}
        const allKeys = [
          'site_name', 'site_phone', 'site_email', 'site_address', 'currency', 'currency_symbol',
          'hero_title', 'hero_subtitle',
        ]
        for (const key of allKeys) {
          const value = formData.get(key)
          if (value !== null) data[key] = value as string
        }
        await bulkUpdateSettings(data)
      }} className="space-y-8">
        {settingsGroups.map(group => (
          <div key={group.title} className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-semibold text-slate-900 mb-5">{group.title}</h2>
            <div className="space-y-4">
              {group.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
                  <input
                    name={field.key}
                    type={field.type}
                    defaultValue={settings[field.key] || ''}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
          Save All Settings
        </button>
      </form>
    </div>
  )
}
