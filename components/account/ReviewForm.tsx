'use client'

import { useState } from 'react'
import { createReviewAction } from '@/app/actions/reviews'

type Props = {
  orderId: string
}

export default function ReviewForm({ orderId }: Props) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createReviewAction(orderId, rating, comment)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-sm font-medium">
        🎉 Thank you! Your review has been submitted successfully.
      </div>
    )
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="mt-4 w-full md:w-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold px-4 py-2 rounded-lg transition-colors border border-emerald-200"
      >
        ⭐ Leave a Review
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-800 text-sm">How was your cleaning?</h4>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          Cancel
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-slate-500 mr-1">Rating:</span>
        {[1, 2, 3, 4, 5].map(num => (
          <button
            key={num}
            type="button"
            onClick={() => setRating(num)}
            className="text-2xl transition-transform hover:scale-110 focus:outline-none"
          >
            <span className={num <= rating ? 'text-amber-400' : 'text-slate-300'}>★</span>
          </button>
        ))}
      </div>

      <div>
        <textarea
          rows={2}
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your experience (optional)..."
          className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400"
        />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
