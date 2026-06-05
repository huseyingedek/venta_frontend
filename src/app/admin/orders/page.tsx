'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700', PAYMENT_PENDING: 'bg-yellow-100 text-yellow-700',
  PAYMENT_FAILED: 'bg-red-100 text-red-700', CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-orange-100 text-orange-700', SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-gray-100 text-gray-600',
  REFUNDED: 'bg-pink-100 text-pink-700',
};
const statusLabels: Record<string, string> = {
  PENDING: 'Bekliyor', PAYMENT_PENDING: 'Ödeme Bekleniyor', PAYMENT_FAILED: 'Ödeme Başarısız',
  CONFIRMED: 'Onaylandı', PREPARING: 'Hazırlanıyor', SHIPPED: 'Kargoda',
  DELIVERED: 'Teslim Edildi', CANCELLED: 'İptal Edildi', REFUNDED: 'İade Edildi',
};
const nextStatusMap: Record<string, string> = {
  PENDING: 'CONFIRMED', CONFIRMED: 'PREPARING', PREPARING: 'SHIPPED', SHIPPED: 'DELIVERED',
};

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, page],
    queryFn: () => api.get('/admin/orders', { params: { status: statusFilter || undefined, page, limit: 20 } }).then(r => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Sipariş durumu güncellendi.'); },
  });

  const orders = data?.data || [];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Siparişler</h1>

      {/* Filtre */}
      <div className="card p-4 flex flex-wrap gap-3">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">Tüm Siparişler</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">Sipariş No</th>
                <th className="px-5 py-3">Müşteri</th>
                <th className="px-5 py-3">Ürün Sayısı</th>
                <th className="px-5 py-3">Toplam</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3">Tarih</th>
                <th className="px-5 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((_, j) => <td key={j} className="px-5 py-4"><div className="animate-pulse h-4 bg-gray-100 rounded" /></td>)}</tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">Sipariş bulunamadı</td></tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-mono text-xs font-medium text-brand-600">#{order.orderNumber}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{order.user.firstName} {order.user.lastName}</p>
                      <p className="text-xs text-gray-400">{order.user.email}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{order.items?.length || 0} ürün</td>
                    <td className="px-5 py-3 font-semibold">
                      {Number(order.total).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${statusColors[order.status]}`}>{statusLabels[order.status]}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-5 py-3">
                      {nextStatusMap[order.status] && (
                        <button
                          onClick={() => updateStatus.mutate({ id: order.id, status: nextStatusMap[order.status] })}
                          className="btn-outline text-xs py-1 px-2.5"
                        >
                          → {statusLabels[nextStatusMap[order.status]]}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data?.pagination?.pages > 1 && (
          <div className="flex items-center justify-between border-t px-5 py-3 text-sm text-gray-500">
            <span>{data.pagination.total} sipariş</span>
            <div className="flex gap-1">
              {[...Array(data.pagination.pages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`h-7 w-7 rounded text-xs font-medium ${page === i + 1 ? 'bg-brand-600 text-white' : 'hover:bg-gray-100'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
