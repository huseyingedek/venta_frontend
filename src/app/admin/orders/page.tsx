'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Search, ChevronRight, MessageCircle, ExternalLink, Filter } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  PENDING:        'bg-yellow-50 text-yellow-700 border-yellow-200',
  PAYMENT_PENDING:'bg-yellow-50 text-yellow-700 border-yellow-200',
  PAYMENT_FAILED: 'bg-red-50 text-red-700 border-red-200',
  CONFIRMED:      'bg-blue-50 text-blue-700 border-blue-200',
  PREPARING:      'bg-orange-50 text-orange-700 border-orange-200',
  SHIPPED:        'bg-violet-50 text-violet-700 border-violet-200',
  DELIVERED:      'bg-green-50 text-green-700 border-green-200',
  CANCELLED:      'bg-gray-100 text-gray-500 border-gray-200',
  REFUNDED:       'bg-pink-50 text-pink-700 border-pink-200',
};
const statusLabels: Record<string, string> = {
  PENDING:        'Ödeme Bekleniyor',
  PAYMENT_PENDING:'Ödeme Bekleniyor',
  PAYMENT_FAILED: 'Ödeme Başarısız',
  CONFIRMED:      'Ödeme Alındı',
  PREPARING:      'Tedarikçiye İletildi',
  SHIPPED:        'Kargoda',
  DELIVERED:      'Teslim Edildi',
  CANCELLED:      'İptal Edildi',
  REFUNDED:       'İade Edildi',
};

// Aksiyon gerektiren durumlar — turuncu vurgu
const actionRequired = new Set(['PENDING', 'CONFIRMED']);

function buildWaLink(order: any) {
  const phone = order.user?.phone?.replace(/\D/g, '');
  if (!phone) return null;
  const waPhone = phone.startsWith('0') ? '90' + phone.slice(1) : phone.startsWith('90') ? phone : '90' + phone;
  const total = Number(order.total).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
  const text = `Merhaba ${order.user.firstName}, Venta Premium siparişiniz (#${order.orderNumber}) alındı 🎉\n\nToplam tutar: ${total}\n\nÖdemenizi aşağıdaki IBAN'a yapabilirsiniz:\nAlıcı: Venta Premium\nIBAN: ${process.env.NEXT_PUBLIC_IBAN || ''}\n\nAçıklama: ${order.orderNumber}\n\nTeşekkürler! 🙏`;
  return `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`;
}

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, page],
    queryFn: () =>
      api.get('/admin/orders', {
        params: { status: statusFilter || undefined, page, limit: 25 },
      }).then(r => r.data),
  });

  const orders: any[] = data?.data ?? [];
  const pagination = data?.pagination;

  const filtered = search.trim()
    ? orders.filter(o =>
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        `${o.user?.firstName} ${o.user?.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(search.toLowerCase()),
      )
    : orders;

  const pendingCount = orders.filter(o => actionRequired.has(o.status)).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Siparişler</h1>
          {pendingCount > 0 && (
            <p className="mt-0.5 text-sm text-orange-600 font-medium">
              {pendingCount} sipariş aksiyon bekliyor
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Sipariş no, müşteri adı veya e-posta..."
            className="input pl-9 text-sm"
          />
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {[
            { value: '', label: 'Tümü' },
            { value: 'PENDING', label: 'Ödeme Bekleniyor' },
            { value: 'CONFIRMED', label: 'Ödeme Alındı' },
            { value: 'PREPARING', label: 'Tedarikçide' },
            { value: 'SHIPPED', label: 'Kargoda' },
            { value: 'DELIVERED', label: 'Teslim' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => { setStatusFilter(opt.value); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === opt.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3.5">Sipariş</th>
                <th className="px-5 py-3.5">Müşteri</th>
                <th className="px-5 py-3.5">Ürün</th>
                <th className="px-5 py-3.5">Tutar</th>
                <th className="px-5 py-3.5">Durum</th>
                <th className="px-5 py-3.5">Tarih</th>
                <th className="px-5 py-3.5 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 animate-pulse rounded bg-gray-100" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="text-gray-400">
                      <Filter size={32} className="mx-auto mb-2 opacity-40" />
                      <p className="font-medium">Sipariş bulunamadı</p>
                      <p className="text-xs mt-1">Filtreleri değiştirmeyi deneyin</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((order: any) => {
                  const waLink = buildWaLink(order);
                  const needsAction = actionRequired.has(order.status);
                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors ${needsAction ? 'bg-orange-50/40 hover:bg-orange-50' : 'hover:bg-gray-50/60'}`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {needsAction && (
                            <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0 animate-pulse" />
                          )}
                          <span className="font-mono text-xs font-semibold text-brand-600">#{order.orderNumber}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-800 text-sm">{order.user?.firstName} {order.user?.lastName}</p>
                        <p className="text-xs text-gray-400">{order.user?.email}</p>
                        {order.user?.phone && <p className="text-xs text-gray-400">{order.user.phone}</p>}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">{order.items?.length ?? 0} ürün</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900">
                        {Number(order.total).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {statusLabels[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              title="WhatsApp'tan yaz"
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                            >
                              <MessageCircle size={13} />
                            </a>
                          )}
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                          >
                            Detay <ChevronRight size={12} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t px-5 py-3">
            <p className="text-sm text-gray-500">
              Toplam <span className="font-semibold text-gray-700">{pagination.total}</span> sipariş
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 rounded-lg text-xs font-medium hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              {[...Array(Math.min(pagination.pages, 7))].map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                      page === p ? 'bg-brand-600 text-white' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="h-8 w-8 rounded-lg text-xs font-medium hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
