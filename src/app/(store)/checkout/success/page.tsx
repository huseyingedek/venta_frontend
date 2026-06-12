'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { CheckCircle, Package, Home, Loader2, MessageCircle, Copy } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const IBAN = process.env.NEXT_PUBLIC_IBAN || 'TR00 0000 0000 0000 0000 0000 00';
const IBAN_NAME = process.env.NEXT_PUBLIC_IBAN_NAME || 'Venta Premium';
const ADMIN_WHATSAPP = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const { data: order } = useQuery({
    queryKey: ['order-success', orderId],
    queryFn: () => api.get(`/orders/${orderId}`).then(r => r.data.data),
    enabled: !!orderId,
  });

  const copyIban = () => {
    navigator.clipboard.writeText(IBAN.replace(/\s/g, ''));
    toast.success('IBAN kopyalandı!');
  };

  const waLink = ADMIN_WHATSAPP
    ? `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(`Merhaba, ${order?.orderNumber ? '#' + order.orderNumber + ' numaralı siparişim' : 'siparişim'} hakkında bilgi almak istiyorum.`)}`
    : null;

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
          En kısa sürede WhatsApp üzerinden sizinle iletişime geçeceğiz.
        </p>

        {order && (
          <div className="rounded-2xl bg-gray-50 p-5 mb-5 text-left space-y-2">
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
          </div>
        )}

        {/* IBAN Bilgisi */}
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-4 text-left">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Ödeme Bilgileri</p>
          <p className="text-xs text-blue-700 mb-3">Siparişinizi onaylamak için aşağıdaki IBAN'a ödeme yapabilirsiniz:</p>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-gray-500 mb-0.5">Alıcı Adı</p>
            <p className="font-semibold text-gray-800 text-sm mb-3">{IBAN_NAME}</p>
            <p className="text-xs text-gray-500 mb-0.5">IBAN</p>
            <div className="flex items-center gap-2">
              <p className="font-mono font-bold text-gray-900 text-sm flex-1">{IBAN}</p>
              <button onClick={copyIban} className="text-blue-600 hover:text-blue-800 transition-colors">
                <Copy size={16} />
              </button>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">* Açıklama kısmına sipariş numaranızı yazmanızı öneririz.</p>
        </div>

        {/* WhatsApp */}
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 mb-6 text-left flex items-start gap-3">
          <MessageCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-green-800 mb-1">WhatsApp Destek</p>
            <p className="text-green-700 text-xs">Ödemenizi yaptıktan sonra dekontu WhatsApp üzerinden bize iletebilirsiniz.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="btn-primary gap-2 justify-center bg-green-600 hover:bg-green-700 border-green-600">
              <MessageCircle size={16} /> WhatsApp'tan Yaz
            </a>
          )}
          <Link href="/account/orders" className="btn-outline gap-2 justify-center">
            <Package size={16} /> Siparişlerimi Görüntüle
          </Link>
          <Link href="/shop" className="btn-outline gap-2 justify-center">
            <Home size={16} /> Alışverişe Devam Et
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
