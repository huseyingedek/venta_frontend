'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Star, Check, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery<any[]>({
    queryKey: ['admin-reviews', filter],
    queryFn: () => api.get('/admin/reviews', { params: { approved: filter === 'all' ? undefined : filter === 'approved' ? 'true' : 'false' } }).then(r => r.data.data),
  });

  const approve = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/reviews/${id}`, { isApproved: true }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('Yorum onaylandı.'); },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('Yorum silindi.'); },
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Ürün Yorumları</h1>

      <div className="card p-4 flex gap-2">
        {(['pending', 'approved', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${filter === f ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {f === 'pending' ? '⏳ Bekleyenler' : f === 'approved' ? '✅ Onaylananlar' : '📋 Tümü'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="card p-8 text-center text-gray-400">Yükleniyor...</div>
      ) : data.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">Yorum bulunamadı</div>
      ) : (
        <div className="space-y-3">
          {data.map((review: any) => (
            <div key={review.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={13} className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {review.user?.firstName} {review.user?.lastName}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('tr-TR')}</span>
                    {!review.isApproved && <span className="badge bg-yellow-100 text-yellow-700">Onay Bekliyor</span>}
                  </div>
                  <p className="text-xs text-gray-400 mb-1">
                    Ürün: <span className="text-brand-600 font-medium">{review.product?.name}</span>
                  </p>
                  {review.title && <p className="font-medium text-gray-800 text-sm">{review.title}</p>}
                  {review.comment && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.comment}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  {!review.isApproved && (
                    <button
                      onClick={() => approve.mutate(review.id)}
                      className="p-2 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                      title="Onayla"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => { if (confirm('Bu yorum silinsin mi?')) remove.mutate(review.id); }}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
