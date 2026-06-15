'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { CheckCircle, Package, Home, Loader2, ShoppingBag } from 'lucide-react';
import api from '@/lib/api';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const { data: order } = useQuery({
    queryKey: ['order-success', orderId],
    queryFn: () => api.get(`/orders/${orderId}`).then(r => r.data.data),
    enabled: !!orderId,
  });

  return (
    <div className="container py-16 max-w-lg mx-auto text-center">
      <div className="card p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={40} className="text-green-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Siparişiniz Alındı!</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Siparişiniz başarıyla oluşturuldu. En kısa sürede hazırlanıp kargoya verilecektir.
        </p>

        {order && (
          <div className="rounded-2xl bg-gray-50 p-5 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sipariş No</span>
              <span className="font-mono font-bold text-brand-600">#{order.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ürün Sayısı</span>
              <span className="font-medium">{order.items?.length} ürün</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Toplam Tutar</span>
              <span className="font-bold text-gray-900">
                {Number(order.total).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ödeme Yöntemi</span>
              <span className="font-medium text-green-600">Kredi / Banka Kartı</span>
            </div>
          </div>
        )}

        <div className="rounded-xl bg-brand-50 border border-brand-200 p-4 mb-6 text-left">
          <p className="text-sm font-semibold text-brand-800 mb-1">Sonraki Adımlar</p>
          <p className="text-xs text-brand-700 leading-relaxed">
            Siparişiniz onaylandıktan sonra tedarikçimize iletilir ve hazırlanmaya başlanır.
            Kargoya verildiğinde takip numarası e-posta ile tarafınıza bildirilir.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/account/orders" className="btn-primary gap-2 justify-center">
            <Package size={16} /> Siparişlerimi Görüntüle
          </Link>
          <Link href="/shop" className="btn-outline gap-2 justify-center">
            <ShoppingBag size={16} /> Alışverişe Devam Et
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 size={32} className="animate-spin text-brand-500" /></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
