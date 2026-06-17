import { getSiteSettings } from '@/lib/settings'
import { bulkUpdateSettings } from '@/app/actions/admin'
import Link from 'next/link'

type Props = {
  searchParams: { tab?: string }
}

export default async function AdminSettingsPage({ searchParams }: Props) {
  const settings = await getSiteSettings()
  const currentTab = searchParams.tab || 'general'

  const generalFields = [
    { key: 'site_name', label: 'Site Name', type: 'text' },
    { key: 'site_phone', label: 'Phone', type: 'tel' },
    { key: 'site_email', label: 'Email', type: 'email' },
    { key: 'site_address', label: 'Office Address', type: 'text' },
    { key: 'currency', label: 'Currency Code (e.g. USD)', type: 'text' },
    { key: 'currency_symbol', label: 'Currency Symbol (e.g. $)', type: 'text' },
  ]

  const contentGroups = [
    {
      label: '🦸 Hero Section',
      fields: [
        { key: 'hero_badge', label: 'Badge Text', type: 'text' },
        { key: 'hero_title_line1', label: 'Title Line 1', type: 'text' },
        { key: 'hero_title_line2', label: 'Title Line 2 (Accent Color)', type: 'text' },
        { key: 'hero_subtitle', label: 'Subtitle', type: 'textarea' },
        { key: 'hero_cta_primary', label: 'Primary CTA Button', type: 'text' },
        { key: 'hero_cta_secondary', label: 'Secondary CTA Button', type: 'text' },
      ],
    },
    {
      label: '📊 Stats Bar',
      fields: [
        { key: 'stat1_value', label: 'Stat 1 Value (e.g. 1,000+)', type: 'text' },
        { key: 'stat1_label', label: 'Stat 1 Label (e.g. Happy Customers)', type: 'text' },
        { key: 'stat2_value', label: 'Stat 2 Value (e.g. 4.9★)', type: 'text' },
        { key: 'stat2_label', label: 'Stat 2 Label (e.g. Average Rating)', type: 'text' },
        { key: 'stat3_value', label: 'Stat 3 Value (e.g. 5,000+)', type: 'text' },
        { key: 'stat3_label', label: 'Stat 3 Label (e.g. Cleanings Done)', type: 'text' },
        { key: 'stat4_value', label: 'Stat 4 Value (e.g. 100%)', type: 'text' },
        { key: 'stat4_label', label: 'Stat 4 Label (e.g. Satisfaction Guaranteed)', type: 'text' },
      ],
    },
    {
      label: '🧹 Services Section',
      fields: [
        { key: 'services_title', label: 'Services Title', type: 'text' },
        { key: 'services_subtitle', label: 'Services Subtitle', type: 'textarea' },
        { key: 'services_cta', label: 'Services Card CTA Text (e.g. Book This Service)', type: 'text' },
      ],
    },
    {
      label: '📋 How It Works',
      fields: [
        { key: 'howitworks_title', label: 'Section Title', type: 'text' },
        { key: 'howitworks_step1_title', label: 'Step 1 Title', type: 'text' },
        { key: 'howitworks_step1_desc', label: 'Step 1 Description', type: 'textarea' },
        { key: 'howitworks_step2_title', label: 'Step 2 Title', type: 'text' },
        { key: 'howitworks_step2_desc', label: 'Step 2 Description', type: 'textarea' },
        { key: 'howitworks_step3_title', label: 'Step 3 Title', type: 'text' },
        { key: 'howitworks_step3_desc', label: 'Step 3 Description', type: 'textarea' },
      ],
    },
    {
      label: '🛡️ Trust Section',
      fields: [
        { key: 'trust_title', label: 'Section Title', type: 'text' },
        { key: 'trust_item1_title', label: 'Item 1 Title', type: 'text' },
        { key: 'trust_item1_desc', label: 'Item 1 Description', type: 'textarea' },
        { key: 'trust_item2_title', label: 'Item 2 Title', type: 'text' },
        { key: 'trust_item2_desc', label: 'Item 2 Description', type: 'textarea' },
        { key: 'trust_item3_title', label: 'Item 3 Title', type: 'text' },
        { key: 'trust_item3_desc', label: 'Item 3 Description', type: 'textarea' },
        { key: 'trust_item4_title', label: 'Item 4 Title', type: 'text' },
        { key: 'trust_item4_desc', label: 'Item 4 Description', type: 'textarea' },
      ],
    },
    {
      label: '📣 CTA Section',
      fields: [
        { key: 'cta_title', label: 'CTA Title', type: 'text' },
        { key: 'cta_subtitle', label: 'CTA Subtitle', type: 'textarea' },
        { key: 'cta_button', label: 'CTA Button Text', type: 'text' },
      ],
    },
    {
      label: '🏢 Company Info',
      fields: [
        { key: 'company_name', label: 'Company Name', type: 'text' },
        { key: 'company_phone', label: 'Company Phone', type: 'text' },
        { key: 'company_email', label: 'Company Email', type: 'text' },
        { key: 'company_address', label: 'Company Address', type: 'text' },
        { key: 'footer_tagline', label: 'Footer Tagline', type: 'text' },
      ],
    },
  ]

  async function handleGeneralSave(formData: FormData) {
    'use server'
    const data: Record<string, string> = {}
    const keys = ['site_name', 'site_phone', 'site_email', 'site_address', 'currency', 'currency_symbol']
    for (const key of keys) {
      const val = formData.get(key)
      if (val !== null) data[key] = val as string
    }
    await bulkUpdateSettings(data)
  }

  async function handleContentSave(formData: FormData) {
    'use server'
    const data: Record<string, string> = {}
    const keys = [
      'hero_badge', 'hero_title_line1', 'hero_title_line2', 'hero_subtitle', 'hero_cta_primary', 'hero_cta_secondary',
      'stat1_value', 'stat1_label', 'stat2_value', 'stat2_label', 'stat3_value', 'stat3_label', 'stat4_value', 'stat4_label',
      'services_title', 'services_subtitle', 'services_cta',
      'howitworks_title', 'howitworks_step1_title', 'howitworks_step1_desc', 'howitworks_step2_title', 'howitworks_step2_desc', 'howitworks_step3_title', 'howitworks_step3_desc',
      'trust_title', 'trust_item1_title', 'trust_item1_desc', 'trust_item2_title', 'trust_item2_desc', 'trust_item3_title', 'trust_item3_desc', 'trust_item4_title', 'trust_item4_desc',
      'cta_title', 'cta_subtitle', 'cta_button',
      'company_name', 'company_phone', 'company_email', 'company_address', 'footer_tagline'
    ]
    for (const key of keys) {
      const val = formData.get(key)
      if (val !== null) data[key] = val as string
    }
    await bulkUpdateSettings(data)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Site Settings</h1>
          <p className="text-sm text-slate-500">Configure global website details and public pages content.</p>
        </div>

        {/* Tabs navigation */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <Link
            href="/admin/settings?tab=general"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${currentTab === 'general'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            ⚙️ General Settings
          </Link>
          <Link
            href="/admin/settings?tab=content"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${currentTab === 'content'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            📝 Page Content (CMS)
          </Link>
        </div>
      </div>

      {currentTab === 'general' ? (
        <form action={handleGeneralSave} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
              ⚙️ General Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {generalFields.map(field => (
                <div key={field.key} className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">{field.label}</label>
                  <input
                    name={field.key}
                    type={field.type}
                    defaultValue={settings[field.key] || ''}
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-md shadow-emerald-500/10 hover:shadow-lg"
            >
              Save General Settings
            </button>
          </div>
        </form>
      ) : (
        <form action={handleContentSave} className="space-y-8">
          {contentGroups.map(group => (
            <div key={group.label} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                {group.label}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {group.fields.map(field => (
                  <div key={field.key} className={`space-y-1 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {field.label}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        name={field.key}
                        rows={3}
                        defaultValue={settings[field.key] || ''}
                        className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y transition-shadow"
                      />
                    ) : (
                      <input
                        name={field.key}
                        type="text"
                        defaultValue={settings[field.key] || ''}
                        className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-md shadow-emerald-500/10 hover:shadow-lg"
            >
              Save Content Changes
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
