'use client';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-orange-100 text-orange-700', SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-gray-100 text-gray-600',
  PAYMENT_FAILED: 'bg-red-100 text-red-700', REFUNDED: 'bg-pink-100 text-pink-700',
};
const statusLabels: Record<string, string> = {
  PENDING: '⏳ Bekliyor', CONFIRMED: '✅ Onaylandı', PREPARING: '📦 Hazırlanıyor',
  SHIPPED: '🚚 Kargoda', DELIVERED: '✓ Teslim Edildi', CANCELLED: '✗ İptal',
  PAYMENT_FAILED: '✗ Ödeme Başarısız', REFUNDED: '↩ İade Edildi',
};

export default function OrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => { if (!isAuthenticated) router.push('/auth/login'); }, [isAuthenticated]);

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get('/orders').then(r => r.data.data),
    enabled: isAuthenticated,
  });

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/account" className="text-sm text-gray-500 hover:text-brand-600">Hesabım</Link>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-sm font-medium">Siparişlerim</span>
      </div>
      <h1 className="mb-6 text-2xl font-bold">Siparişlerim</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-16 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : !data?.length ? (
        <div className="card py-20 text-center">
          <Package size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-600">Henüz siparişiniz yok</p>
          <p className="mt-1 text-sm text-gray-400">İlk siparişinizi vermek için alışverişe başlayın.</p>
          <Link href="/shop" className="btn-primary mt-5 inline-flex">Alışverişe Başla</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((order: any) => (
            <div key={order.id} className="card p-5">
              {/* Başlık */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="font-mono text-sm font-semibold text-gray-700">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge text-xs px-3 py-1 ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                  <span className="font-bold text-gray-900">
                    {Number(order.total).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                </div>
              </div>

              {/* Ürünler */}
              <div className="flex flex-wrap gap-3 mb-3">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                    <div className="h-8 w-8 rounded-lg overflow-hidden bg-white shrink-0">
                      {item.product?.thumbnail ? (
                        <Image
                          src={item.product.thumbnail.startsWith('http') ? item.product.thumbnail : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${item.product.thumbnail}`}
                          alt={item.productName} width={32} height={32} className="h-full w-full object-cover"
                        />
                      ) : <div className="flex h-full items-center justify-center text-sm">📦</div>}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700 max-w-[150px] truncate">{item.productName}</p>
                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Kargo */}
              {order.cargoTrackingNo && (
                <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm text-blue-700">
                  🚚 Kargo: <span className="font-semibold">{order.cargoCompany}</span> — Takip No: <span className="font-mono font-semibold">{order.cargoTrackingNo}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
