'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ServiceType = {
  id: string
  slug: string
  name: string
  icon: string | null
  basePrice: number
  pricePerSqm: number | null
  durationHours: number
}

type Props = {
  services: ServiceType[]
  defaultService?: string
}

export default function BookingForm({ services, defaultService }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    serviceSlug: defaultService || services[0]?.slug || '',
    areaSize: '',
    roomCount: '',
    scheduledDate: '',
    scheduledTime: '10:00',
    addressStreet: '',
    addressCity: '',
    addressPostal: '',
    specialRequests: '',
    accessNotes: '',
    paymentMethod: 'STRIPE' as 'STRIPE' | 'CASH',
    // contact (for guests)
    name: '',
    email: '',
    phone: '',
  })

  const selectedService = services.find(s => s.slug === form.serviceSlug)

  const calcPrice = () => {
    if (!selectedService) return 0
    if (selectedService.pricePerSqm && form.areaSize) {
      return Math.max(
        selectedService.basePrice,
        parseFloat(form.areaSize) * selectedService.pricePerSqm
      )
    }
    return selectedService.basePrice
  }

  const totalPrice = calcPrice()

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, totalPrice }),
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
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900 text-lg mb-4">Choose a Service</h2>
            <div className="grid grid-cols-1 gap-3">
              {services.map(service => (
                <label
                  key={service.slug}
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${form.serviceSlug === service.slug
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="service"
                    value={service.slug}
                    checked={form.serviceSlug === service.slug}
                    onChange={() => update('serviceSlug', service.slug)}
                    className="sr-only"
                  />
                  <span className="text-3xl">{service.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{service.name}</div>
                    <div className="text-sm text-slate-500">~{service.durationHours}h</div>
                  </div>
                  <div className="text-emerald-600 font-bold">from ${service.basePrice}</div>
                </label>
              ))}
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
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900 text-lg mb-4">Booking Details</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Area (m²)</label>
                <input
                  type="number"
                  placeholder="e.g. 75"
                  value={form.areaSize}
                  onChange={e => update('areaSize', e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rooms</label>
                <input
                  type="number"
                  placeholder="e.g. 3"
                  value={form.roomCount}
                  onChange={e => update('roomCount', e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={form.scheduledDate}
                  onChange={e => update('scheduledDate', e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time *</label>
                <select
                  value={form.scheduledTime}
                  onChange={e => update('scheduledTime', e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Street Address *</label>
              <input
                type="text"
                required
                placeholder="123 Main St, Apt 4B"
                value={form.addressStreet}
                onChange={e => update('addressStreet', e.target.value)}
                className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  placeholder="10001"
                  value={form.addressPostal}
                  onChange={e => update('addressPostal', e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Special Requests</label>
              <textarea
                rows={2}
                placeholder="Any specific areas to focus on, pets, allergies..."
                value={form.specialRequests}
                onChange={e => update('specialRequests', e.target.value)}
                className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(1)} className="flex-1 border border-slate-200 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-50 transition-colors">
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
          <div className="space-y-5">
            <h2 className="font-semibold text-slate-900 text-lg mb-4">Contact & Payment</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => update('name', e.target.value)}
                className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => update('email', e.target.value)}
                className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Payment method toggle */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-colors ${form.paymentMethod === 'STRIPE' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="payment" value="STRIPE" checked={form.paymentMethod === 'STRIPE'} onChange={() => update('paymentMethod', 'STRIPE')} className="sr-only" />
                  <span className="text-2xl">💳</span>
                  <span className="font-medium text-sm text-slate-900">Pay Online</span>
                  <span className="text-xs text-slate-500">Stripe · Secure</span>
                </label>
                <label className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-colors ${form.paymentMethod === 'CASH' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="payment" value="CASH" checked={form.paymentMethod === 'CASH'} onChange={() => update('paymentMethod', 'CASH')} className="sr-only" />
                  <span className="text-2xl">💵</span>
                  <span className="font-medium text-sm text-slate-900">Cash on Site</span>
                  <span className="text-xs text-slate-500">Pay when we arrive</span>
                </label>
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="font-semibold text-slate-900 mb-3">Order Summary</div>
              <div className="flex justify-between text-slate-600">
                <span>{selectedService?.name}</span>
                <span>${selectedService?.basePrice}</span>
              </div>
              {form.areaSize && selectedService?.pricePerSqm && (
                <div className="flex justify-between text-slate-600">
                  <span>{form.areaSize}m² × ${selectedService.pricePerSqm}/m²</span>
                  <span>${(parseFloat(form.areaSize) * selectedService.pricePerSqm).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Date</span>
                <span>{form.scheduledDate} at {form.scheduledTime}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-slate-900 text-base">
                <span>Total</span>
                <span className="text-emerald-600">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="text-xs text-slate-500">
                Payment: {form.paymentMethod === 'STRIPE' ? '💳 Online via Stripe' : '💵 Cash on arrival'}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-slate-200 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-50 transition-colors">
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !form.name || !form.email}
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

