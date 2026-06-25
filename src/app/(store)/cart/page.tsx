'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, updateItem, removeItem, clearCart, fetchCart, totalPrice } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [coupon, setCoupon] = useState('');

  useEffect(() => {
    // Üye ise sunucu sepetini çek; guest için persist'ten gelen local items zaten var
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  const getImageSrc = (url?: string | null) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${url}`;
  };

  const subtotal = totalPrice();
  const shipping = 149;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <ShoppingBag size={56} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-700">Sepetiniz boş</h2>
        <p className="mt-2 text-gray-500">Beğendiğiniz ürünleri sepete ekleyin.</p>
        <Link href="/shop" className="btn-primary mt-6 inline-flex">Alışverişe Başla</Link>
      </div>
    );
  }

  return (
    <div className="container py-5 sm:py-8">
      <h1 className="mb-6 text-xl sm:text-2xl font-bold">Sepetim ({items.length} ürün)</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Ürün listesi */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const imgSrc = getImageSrc(item.product.thumbnail);
            return (
              <div key={item.id} className="card p-3 sm:p-4 flex gap-3 sm:gap-4">
                {/* Görsel */}
                <Link href={`/product/${item.product.slug ?? item.product.id}`} className="shrink-0">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                    {imgSrc ? (
                      <Image src={imgSrc} alt={item.product.name} width={80} height={80} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">📦</div>
                    )}
                  </div>
                </Link>

                {/* Bilgi */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2">{item.product.name}</h3>
                      {item.variantName && (
                        <p className="mt-0.5 text-xs text-brand-600 font-medium">{item.variantName}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Adet */}
                    <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => {
                          if (item.quantity <= 1) removeItem(item.id);
                          else updateItem(item.id, item.quantity - 1);
                        }}
                        className="px-3 py-1.5 hover:bg-gray-50 transition-colors text-gray-600"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="px-3 py-1.5 hover:bg-gray-50 transition-colors text-gray-600 disabled:opacity-40"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Fiyat */}
                    <p className="text-base font-bold text-gray-900">
                      {(Number(item.product.price) * item.quantity).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Sepeti temizle */}
          <div className="flex justify-end">
            <button onClick={clearCart} className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5">
              <Trash2 size={14} /> Sepeti Temizle
            </button>
          </div>
        </div>

        {/* Sipariş özeti */}
        <div className="space-y-4">
          {/* Kupon */}
          <div className="card p-5">
            <p className="mb-3 text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Tag size={15} className="text-brand-600" /> İndirim Kodu
            </p>
            <div className="flex gap-2">
              <input
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                placeholder="Kupon kodunuz"
                className="input flex-1 text-sm"
              />
              <button className="btn-outline text-sm px-4">Uygula</button>
            </div>
          </div>

          {/* Özet */}
          <div className="card p-5">
            <h2 className="mb-4 text-base font-bold">Sipariş Özeti</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Ürünler Toplamı</span>
                <span>{subtotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Kargo</span>
                <span>149,00 TL</span>
              </div>
              <hr />
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>Genel Toplam</span>
                <span className="text-brand-600">{total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
              </div>
              <p className="text-xs text-gray-400 text-center">KDV Dahildir</p>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="btn-primary mt-5 w-full py-3 text-base gap-2"
            >
              Siparişi Tamamla <ArrowRight size={18} />
            </button>

            <Link href="/shop" className="mt-3 block text-center text-sm text-gray-400 hover:text-brand-600 transition-colors">
              Alışverişe Devam Et
            </Link>
          </div>

          {/* Güven rozetleri */}
          <div className="rounded-2xl bg-gray-50 p-4 text-xs text-gray-500 text-center">
            <p>🔒 256-bit SSL şifreleme ile güvenli ödeme</p>
          </div>
        </div>
      </div>
    </div>
  );
}
