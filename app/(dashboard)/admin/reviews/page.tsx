import { prisma } from '@/lib/prisma'
import { toggleReviewPublic, deleteReviewAction } from '@/app/actions/admin'

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      order: {
        select: {
          orderNumber: true,
          serviceType: {
            select: {
              name: true,
              icon: true,
            },
          },
        },
      },
    },
  })

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Customer Reviews</h1>
        <div className="text-sm text-slate-500">{reviews.length} reviews total</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-6 py-4 font-semibold text-slate-600">Customer / Order</th>
              <th className="text-left px-6 py-4 font-semibold text-slate-600">Service</th>
              <th className="text-left px-6 py-4 font-semibold text-slate-600">Rating</th>
              <th className="text-left px-6 py-4 font-semibold text-slate-600">Comment</th>
              <th className="text-left px-6 py-4 font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                  No reviews left by customers yet.
                </td>
              </tr>
            ) : (
              reviews.map(review => (
                <tr key={review.id} className={`hover:bg-slate-50/80 transition-colors ${!review.isPublic ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{review.user?.name || 'Anonymous'}</div>
                    <div className="text-xs text-slate-400 font-mono mb-1">{review.user?.email}</div>
                    <div className="inline-block text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      Order: #{review.order?.orderNumber.slice(0, 8).toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    <span className="mr-1">{review.order?.serviceType?.icon}</span>
                    {review.order?.serviceType?.name || 'Unknown Service'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-0.5 text-amber-400 font-bold">
                      {'★'.repeat(review.rating)}
                      <span className="text-slate-300">{'★'.repeat(5 - review.rating)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs break-words font-normal italic">
                    {review.comment ? `"${review.comment}"` : <span className="text-slate-300 not-italic">No comment left</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-semibold ${review.isPublic ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {review.isPublic ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <form action={toggleReviewPublic.bind(null, review.id, !review.isPublic)}>
                        <button className="text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg transition-colors">
                          {review.isPublic ? 'Hide' : 'Publish'}
                        </button>
                      </form>
                      <form action={deleteReviewAction.bind(null, review.id)} onSubmit={(e) => {
                        if (!confirm('Are you sure you want to permanently delete this review?')) e.preventDefault()
                      }}>
                        <button className="text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition-colors">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
