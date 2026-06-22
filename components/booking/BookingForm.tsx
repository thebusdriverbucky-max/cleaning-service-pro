'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { calculateOrderPrice } from '@/lib/prices'

type ServiceType = {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  basePrice: number
  pricePerSqm: number | null
  durationHours: number
  minArea?: number | null
  pricePerBedroom: number | null
  pricePerBathroom: number | null
  pricePerKitchen: number | null
}

type AddonType = {
  id: string
  name: string
  description: string | null
  price: number
  icon: string | null
  serviceTypeId: string | null
}

type Props = {
  services: ServiceType[]
  addons: AddonType[]
  defaultService?: string
}

export default function BookingForm({ services, addons, defaultService }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [promoCodeInput, setPromoCodeInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountType: string; discountValue: number } | null>(null)
  const [promoError, setPromoError] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)

  // Accordion state
  const [expandedService, setExpandedService] = useState<string | null>(null)

  const [form, setForm] = useState({
    serviceSlug: defaultService || services[0]?.slug || '',
    frequency: 'ONE_TIME',
    areaSize: '',
    bedroomsCount: 1,
    bathroomsCount: 1,
    kitchensCount: 1,
    selectedAddonIds: [] as string[],
    scheduledDate: '',
    scheduledTime: '10:00',
    addressStreet: '',
    addressCity: '',
    addressPostal: '',
    specialRequests: '',
    accessNotes: '',
    paymentMethod: 'STRIPE' as 'STRIPE' | 'CASH',
    name: '',
    email: '',
    phone: '',
  })

  const selectedService = services.find(s => s.slug === form.serviceSlug)

  const getAvailableAddons = () => {
    if (!selectedService) return []
    return addons.filter(
      a => !a.serviceTypeId || a.serviceTypeId === selectedService.id
    )
  }

  const toggleAddon = (addonId: string) => {
    setForm(prev => {
      const isSelected = prev.selectedAddonIds.includes(addonId)
      if (isSelected) {
        return { ...prev, selectedAddonIds: prev.selectedAddonIds.filter(id => id !== addonId) }
      } else {
        return { ...prev, selectedAddonIds: [...prev.selectedAddonIds, addonId] }
      }
    })
  }

  const selectedAddonsData = getAvailableAddons().filter(a => form.selectedAddonIds.includes(a.id))

  // Calculate prices using shared utility
  const pricing = selectedService ? calculateOrderPrice({
    service: {
      basePrice: selectedService.basePrice,
      pricePerSqm: selectedService.pricePerSqm,
      minArea: selectedService.minArea || 0,
      pricePerBedroom: selectedService.pricePerBedroom,
      pricePerBathroom: selectedService.pricePerBathroom,
      pricePerKitchen: selectedService.pricePerKitchen,
    },
    areaSize: form.areaSize ? parseFloat(form.areaSize) : undefined,
    bedroomsCount: form.bedroomsCount,
    bathroomsCount: form.bathroomsCount,
    kitchensCount: form.kitchensCount,
    addons: selectedAddonsData,
    frequency: form.frequency,
    promoCode: appliedPromo,
  }) : null;

  const handleApplyPromo = async () => {
    if (!promoCodeInput) return
    setPromoLoading(true)
    setPromoError('')
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCodeInput }),
      })
      const data = await res.json()
      if (res.ok && data.valid) {
        setAppliedPromo({
          code: promoCodeInput.toUpperCase(),
          discountType: data.discountType,
          discountValue: data.discountValue,
        })
        setPromoCodeInput('')
      } else {
        setPromoError(data.error || 'Invalid promo code')
      }
    } catch (err) {
      setPromoError('Failed to validate promo code')
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoError('')
  }

  const update = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          addons: form.selectedAddonIds,
          promoCode: appliedPromo?.code || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      if (form.paymentMethod === 'STRIPE' && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        router.push(`/booking/confirmation?order=${data.orderNumber}`)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const frequencies = [
    { value: 'ONE_TIME', label: 'Once', discount: 0 },
    { value: 'WEEKLY', label: 'Weekly', discount: 20 },
    { value: 'BIWEEKLY', label: 'Biweekly', discount: 15 },
    { value: 'MONTHLY', label: 'Monthly', discount: 10 },
  ]

  const Counter = ({ label, value, min = 0, onChange }: { label: string, value: number, min?: number, onChange: (v: number) => void }) => (
    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-transparent">
      <span className="font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition">-</button>
        <span className="w-4 text-center font-medium text-slate-900">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 hover:bg-emerald-200 transition">+</button>
      </div>
    </div>
  )

  return (
    <div className="bg-[#fdfbf7] rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Progress bar */}
      <div className="flex border-b">
        {['Service', 'Details', 'Payment'].map((label, i) => (
          <button
            key={label}
            onClick={() => i + 1 < step && setStep(i + 1)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${step === i + 1
              ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500'
              : step > i + 1
                ? 'text-emerald-600 cursor-pointer hover:bg-slate-50'
                : 'text-slate-400'
              }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* STEP 1 — Service selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-semibold text-slate-900 text-lg mb-4">Choose a Service</h2>
              <div className="grid grid-cols-1 gap-3">
                {services.map(service => (
                  <div key={service.slug} className={`border rounded-xl transition-colors ${form.serviceSlug === service.slug ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-transparent'}`}>
                    <label className="flex items-center gap-4 p-4 cursor-pointer">
                      <input
                        type="radio"
                        name="service"
                        value={service.slug}
                        checked={form.serviceSlug === service.slug}
                        onChange={() => {
                          update('serviceSlug', service.slug)
                          update('selectedAddonIds', []) // Reset addons on service change
                        }}
                        className="sr-only"
                      />
                      <span className="text-3xl">{service.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{service.name}</div>
                        <div className="text-sm text-slate-500">~{service.durationHours}h</div>
                      </div>
                      <div className="text-emerald-600 font-bold">from ${service.basePrice}</div>
                    </label>

                    {/* Accordion for description */}
                    {service.description && (
                      <div className="px-4 pb-3">
                        <button
                          type="button"
                          onClick={() => setExpandedService(expandedService === service.slug ? null : service.slug)}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                        >
                          ℹ️ What is included? {expandedService === service.slug ? '▲' : '▼'}
                        </button>
                        {expandedService === service.slug && (
                          <div className="mt-2 text-sm text-slate-600 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                            {service.description}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 text-lg mb-4">Service Frequency</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {frequencies.map(freq => (
                  <label key={freq.value} className={`relative flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-colors ${form.frequency === freq.value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-transparent hover:border-emerald-300'}`}>
                    <input
                      type="radio"
                      name="frequency"
                      value={freq.value}
                      checked={form.frequency === freq.value}
                      onChange={() => update('frequency', freq.value)}
                      className="sr-only"
                    />
                    <span className="font-medium text-slate-900 text-sm">{freq.label}</span>
                    {freq.discount > 0 ? (
                      <span className="mt-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Save {freq.discount}%</span>
                    ) : (
                      <span className="mt-1 text-xs text-slate-500">No discount</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors mt-4"
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 2 — Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-semibold text-slate-900 text-lg mb-4">Space Details</h2>

              {selectedService?.pricePerSqm ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Area (m²)</label>
                  <input
                    type="number"
                    min={selectedService.minArea || 20}
                    placeholder="e.g. 75"
                    value={form.areaSize}
                    onChange={e => update('areaSize', e.target.value)}
                    className="w-full bg-transparent text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ) : null}

              {/* Room counters */}
              {selectedService?.pricePerBedroom !== null || selectedService?.pricePerBathroom !== null ? (
                <div className="space-y-3">
                  {selectedService?.pricePerBedroom !== null && (
                    <Counter label="Bedrooms" value={form.bedroomsCount} min={1} onChange={(v) => update('bedroomsCount', v)} />
                  )}
                  {selectedService?.pricePerBathroom !== null && (
                    <Counter label="Bathrooms" value={form.bathroomsCount} min={1} onChange={(v) => update('bathroomsCount', v)} />
                  )}
                  {selectedService?.pricePerKitchen !== null && (
                    <Counter label="Kitchens" value={form.kitchensCount} min={0} onChange={(v) => update('kitchensCount', v)} />
                  )}
                </div>
              ) : null}
            </div>

            {/* Addons Section */}
            {getAvailableAddons().length > 0 && (
              <div>
                <h2 className="font-semibold text-slate-900 text-lg mb-4">Customize Your Clean (Add-ons)</h2>
                <div className="grid grid-cols-2 gap-3">
                  {getAvailableAddons().map(addon => {
                    const isSelected = form.selectedAddonIds.includes(addon.id)
                    return (
                      <label key={addon.id} className={`flex flex-col p-3 border rounded-xl cursor-pointer transition-colors ${isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-transparent hover:border-slate-300'}`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleAddon(addon.id)}
                          className="sr-only"
                        />
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{addon.icon}</span>
                          <span className="text-emerald-600 font-medium text-sm">+${addon.price}</span>
                        </div>
                        <span className="font-medium text-slate-900 text-sm">{addon.name}</span>
                        {addon.description && <span className="text-xs text-slate-500 mt-1">{addon.description}</span>}
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            <div>
              <h2 className="font-semibold text-slate-900 text-lg mb-4">Schedule</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={form.scheduledDate}
                    onChange={e => update('scheduledDate', e.target.value)}
                    className="w-full bg-transparent text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time *</label>
                  <select
                    value={form.scheduledTime}
                    onChange={e => update('scheduledTime', e.target.value)}
                    className="w-full bg-transparent text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 text-lg mb-4">Location</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="123 Main St, Apt 4B"
                    value={form.addressStreet}
                    onChange={e => update('addressStreet', e.target.value)}
                    className="w-full bg-transparent text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="New York"
                      value={form.addressCity}
                      onChange={e => update('addressCity', e.target.value)}
                      className="w-full bg-transparent text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      placeholder="10001"
                      value={form.addressPostal}
                      onChange={e => update('addressPostal', e.target.value)}
                      className="w-full bg-transparent text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Access Notes</label>
                  <input
                    type="text"
                    placeholder="Doorbell code, key under mat, etc."
                    value={form.accessNotes}
                    onChange={e => update('accessNotes', e.target.value)}
                    className="w-full bg-transparent text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Special Requests</label>
                  <textarea
                    rows={2}
                    placeholder="Any specific areas to focus on, pets, allergies..."
                    value={form.specialRequests}
                    onChange={e => update('specialRequests', e.target.value)}
                    className="w-full bg-transparent text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(1)} className="flex-1 border border-slate-200 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-50 transition-colors bg-transparent">
                ← Back
              </button>
              <button
                onClick={() => {
                  if (!form.scheduledDate || !form.addressStreet || !form.addressCity) {
                    setError('Please fill in required fields (date, address).')
                    return
                  }
                  setError('')
                  setStep(3)
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Continue →
              </button>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </div>
        )}

        {/* STEP 3 — Payment */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-semibold text-slate-900 text-lg mb-4">Contact & Payment</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  className="w-full bg-transparent text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  className="w-full bg-transparent text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  className="w-full bg-transparent text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-slate-500 mt-1">We'll use this to confirm your appointment</p>
              </div>
            </div>

            {/* Payment method toggle */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-colors ${form.paymentMethod === 'STRIPE' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-transparent hover:border-slate-300'}`}>
                  <input type="radio" name="payment" value="STRIPE" checked={form.paymentMethod === 'STRIPE'} onChange={() => update('paymentMethod', 'STRIPE')} className="sr-only" />
                  <span className="text-2xl">💳</span>
                  <span className="font-medium text-sm text-slate-900">Pay Online</span>
                  <span className="text-xs text-slate-500">Stripe · Secure</span>
                </label>
                <label className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-colors ${form.paymentMethod === 'CASH' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-transparent hover:border-slate-300'}`}>
                  <input type="radio" name="payment" value="CASH" checked={form.paymentMethod === 'CASH'} onChange={() => update('paymentMethod', 'CASH')} className="sr-only" />
                  <span className="text-2xl">💵</span>
                  <span className="font-medium text-sm text-slate-900">Cash on Site</span>
                  <span className="text-xs text-slate-500">Pay when we arrive</span>
                </label>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Promo Code</label>
              {appliedPromo ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm text-emerald-800 font-medium">
                  <span>🏷️ {appliedPromo.code}</span>
                  <button type="button" onClick={handleRemovePromo} className="text-emerald-600 hover:text-emerald-800 text-xs font-bold">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. SUMMER20)"
                    value={promoCodeInput}
                    onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-transparent text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoCodeInput}
                    className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    {promoLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
              {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
            </div>

            {/* Order summary */}
            {pricing && (
              <div className="bg-emerald-50/50 rounded-xl p-4 space-y-3 text-sm border border-emerald-100">
                <div className="font-semibold text-slate-900 mb-2">Order Summary</div>

                <div className="flex justify-between text-slate-700">
                  <span>Base Service ({selectedService?.name})</span>
                  <span>${pricing.baseServicePrice.toFixed(2)}</span>
                </div>

                {pricing.roomsPrice > 0 && (
                  <div className="flex justify-between text-slate-600 pl-4 border-l-2 border-emerald-200 ml-1">
                    <span>Rooms Configuration</span>
                    <span>+${pricing.roomsPrice.toFixed(2)}</span>
                  </div>
                )}

                {selectedAddonsData.map(addon => (
                  <div key={addon.id} className="flex justify-between text-slate-600 pl-4 border-l-2 border-emerald-200 ml-1">
                    <span>Add-on: {addon.name}</span>
                    <span>+${addon.price.toFixed(2)}</span>
                  </div>
                ))}

                {(pricing.roomsPrice > 0 || pricing.addonsPrice > 0) && (
                  <div className="flex justify-between text-slate-800 font-medium pt-2 border-t border-emerald-100">
                    <span>Subtotal</span>
                    <span>${pricing.subtotal.toFixed(2)}</span>
                  </div>
                )}

                {pricing.frequencyDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Frequency Discount ({pricing.frequencyDiscountPercent}%)</span>
                    <span>-${pricing.frequencyDiscountAmount.toFixed(2)}</span>
                  </div>
                )}

                {appliedPromo && pricing.promoDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Promo Discount ({appliedPromo.code})</span>
                    <span>-${pricing.promoDiscountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 text-xs pt-1">
                  <span>Date</span>
                  <span>{form.scheduledDate || 'Not set'} at {form.scheduledTime}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-slate-900 text-lg">
                  <span>Total</span>
                  <span className="text-emerald-600">${pricing.totalPrice.toFixed(2)}</span>
                </div>
                <div className="text-xs text-slate-500 text-center">
                  Payment: {form.paymentMethod === 'STRIPE' ? '💳 Online via Stripe' : '💵 Cash on arrival'}
                </div>
              </div>
            )}

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(2)} className="flex-1 border border-slate-200 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-50 transition-colors bg-transparent">
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !form.name || !form.email || !form.phone}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {loading ? 'Processing...' : form.paymentMethod === 'STRIPE' ? 'Pay Now →' : 'Confirm Booking →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
