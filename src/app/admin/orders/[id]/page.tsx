'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, User, MapPin, CreditCard, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

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
const statusFlow = ['PENDING','CONFIRMED','PREPARING','SHIPPED','DELIVERED'];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => api.get(`/admin/orders/${id}`).then(r => r.data.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ status, cargoTrackingNo, cargoCompany }: any) =>
      api.patch(`/orders/${id}/status`, { status, cargoTrackingNo, cargoCompany }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-order', id] });
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Sipariş durumu güncellendi.');
    },
  });

  const [cargoForm, setCargoForm] = React.useState({ cargoTrackingNo: '', cargoCompany: '' });

  if (isLoading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i=><div key={i} className="h-32 rounded-2xl bg-gray-200"/>)}</div>
    </div>
  );

  if (!order) return <div className="text-center py-20 text-gray-400">Sipariş bulunamadı.</div>;

  const currentStepIndex = statusFlow.indexOf(order.status);

  return (
    <div className="space-y-5">
      {/* Başlık */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Sipariş #{order.orderNumber}</h1>
          <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleString('tr-TR')}</p>
        </div>
        <span className={`ml-auto badge text-sm px-3 py-1 ${statusColors[order.status]}`}>
          {statusLabels[order.status]}
        </span>
      </div>

      {/* Durum akışı */}
      {!['CANCELLED','REFUNDED','PAYMENT_FAILED'].includes(order.status) && (
        <div className="card p-5">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-brand-500 z-0 transition-all"
              style={{ width: `${Math.max(0, (currentStepIndex / (statusFlow.length - 1)) * 100)}%` }}
            />
            {statusFlow.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-1 z-10">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  i < currentStepIndex ? 'bg-brand-600 border-brand-600 text-white' :
                  i === currentStepIndex ? 'bg-brand-500 border-brand-500 text-white' :
                  'bg-white border-gray-200 text-gray-400'
                }`}>
                  {i < currentStepIndex ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i <= currentStepIndex ? 'text-brand-600' : 'text-gray-400'}`}>
                  {statusLabels[s]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Sol — Ürünler */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="font-bold mb-4 flex items-center gap-2"><Package size={16} /> Sipariş Kalemleri</h2>
            <div className="space-y-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <div className="h-14 w-14 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                    {item.product?.thumbnail ? (
                      <Image
                        src={item.product.thumbnail.startsWith('http') ? item.product.thumbnail : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1','')}${item.product.thumbnail}`}
                        alt={item.productName} width={56} height={56} className="h-full w-full object-cover"
                      />
                    ) : <div className="h-full w-full flex items-center justify-center text-xl">📦</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 line-clamp-1">{item.productName}</p>
                    {item.productSku && <p className="text-xs text-gray-400">SKU: {item.productSku}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{Number(item.unitPrice).toLocaleString('tr-TR', { style:'currency', currency:'TRY' })}</p>
                    <p className="text-xs text-gray-400">× {item.quantity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-800">{Number(item.total).toLocaleString('tr-TR', { style:'currency', currency:'TRY' })}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Tutar özeti */}
            <div className="mt-4 space-y-1.5 border-t pt-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Ara Toplam</span>
                <span>{Number(order.subtotal).toLocaleString('tr-TR', { style:'currency', currency:'TRY' })}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>KDV (%{order.taxRate || 18})</span>
                <span>{Number(order.tax).toLocaleString('tr-TR', { style:'currency', currency:'TRY' })}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Kargo</span>
                <span>{order.shippingCost > 0 ? Number(order.shippingCost).toLocaleString('tr-TR', { style:'currency', currency:'TRY' }) : 'Ücretsiz'}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 border-t pt-2">
                <span>Toplam</span>
                <span>{Number(order.total).toLocaleString('tr-TR', { style:'currency', currency:'TRY' })}</span>
              </div>
            </div>
          </div>

          {/* Kargo güncelleme */}
          {order.status === 'CONFIRMED' || order.status === 'PREPARING' ? (
            <div className="card p-5">
              <h2 className="font-bold mb-4 flex items-center gap-2"><Truck size={16} /> Kargoya Ver</h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="label">Kargo Firması</label>
                  <input value={cargoForm.cargoCompany} onChange={e => setCargoForm(f=>({...f, cargoCompany: e.target.value}))} className="input" placeholder="Yurtiçi Kargo" />
                </div>
                <div>
                  <label className="label">Takip No</label>
                  <input value={cargoForm.cargoTrackingNo} onChange={e => setCargoForm(f=>({...f, cargoTrackingNo: e.target.value}))} className="input" placeholder="123456789" />
                </div>
              </div>
              <button
                onClick={() => updateStatus.mutate({ status: 'SHIPPED', ...cargoForm })}
                disabled={updateStatus.isPending}
                className="btn-primary gap-2"
              >
                <Truck size={15} /> Kargoya Ver
              </button>
            </div>
          ) : null}
        </div>

        {/* Sağ — Müşteri, Adres, Durum */}
        <div className="space-y-4">
          {/* Müşteri */}
          <div className="card p-5">
            <h2 className="font-bold mb-3 flex items-center gap-2"><User size={15} /> Müşteri</h2>
            <p className="font-medium text-gray-800">{order.user?.firstName} {order.user?.lastName}</p>
            <p className="text-sm text-gray-500">{order.user?.email}</p>
            {order.user?.phone && <p className="text-sm text-gray-500">{order.user.phone}</p>}
          </div>

          {/* Adres */}
          {order.address && (
            <div className="card p-5">
              <h2 className="font-bold mb-3 flex items-center gap-2"><MapPin size={15} /> Teslimat Adresi</h2>
              <p className="font-medium text-sm">{order.address.title}</p>
              <p className="text-sm text-gray-600 mt-1">{order.address.fullName}</p>
              <p className="text-sm text-gray-600">{order.address.address}</p>
              <p className="text-sm text-gray-600">{order.address.district}, {order.address.city} {order.address.postalCode}</p>
              {order.address.phone && <p className="text-sm text-gray-600">{order.address.phone}</p>}
            </div>
          )}

          {/* Ödeme + Kargo */}
          <div className="card p-5">
            <h2 className="font-bold mb-3 flex items-center gap-2"><CreditCard size={15} /> Ödeme</h2>
            <p className="text-sm text-gray-600">Yöntem: <span className="font-medium">{order.paymentMethod}</span></p>
            {order.paymentId && <p className="text-xs text-gray-400 mt-1 font-mono">ID: {order.paymentId}</p>}
            {order.cargoCompany && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-gray-600">Kargo: <span className="font-medium">{order.cargoCompany}</span></p>
                {order.cargoTrackingNo && <p className="text-sm text-gray-600">Takip: <span className="font-mono font-medium">{order.cargoTrackingNo}</span></p>}
              </div>
            )}
          </div>

          {/* Durum değiştir */}
          <div className="card p-5">
            <h2 className="font-bold mb-3">Durum Güncelle</h2>
            <div className="space-y-2">
              {Object.entries(statusLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => updateStatus.mutate({ status: key })}
                  disabled={order.status === key || updateStatus.isPending}
                  className={`w-full rounded-xl px-3 py-2 text-sm font-medium text-left transition-colors ${
                    order.status === key ? `${statusColors[key]} cursor-default` : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {order.status === key ? '● ' : ''}{label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// React import eksikse
import React from 'react';
