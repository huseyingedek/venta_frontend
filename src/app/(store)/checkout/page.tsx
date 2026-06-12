'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, MapPin, ChevronRight, MessageCircle } from 'lucide-react';
import api from '@/lib/api';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import Image from 'next/image';

const addressSchema = z.object({
  title: z.string().min(1, 'Başlık gerekli'),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(10),
  city: z.string().min(2),
  district: z.string().min(2),
  fullAddress: z.string().min(10),
});

type Step = 'address' | 'review';

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>('address');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const { items, totalPrice, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  const { data: addresses, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get('/users/addresses').then(r => r.data.data),
    enabled: isAuthenticated,
  });

  const addressForm = useForm({ resolver: zodResolver(addressSchema) });

  const [giftPackage, setGiftPackage] = useState(false);

  const GIFT_PACKAGE_FEE = 20;
  const SHIPPING_COST = 149;
  const subtotal = totalPrice();
  const giftFee = giftPackage ? GIFT_PACKAGE_FEE : 0;
  const total = subtotal + SHIPPING_COST + giftFee;

  // Yeni adres kaydet
  const saveAddress = useMutation({
    mutationFn: (data: any) => api.post('/users/addresses', data),
    onSuccess: async (res) => {
      setSelectedAddressId(res.data.data.id);
      await refetchAddresses();
      setShowNewAddress(false);
      setStep('review');
      toast.success('Adres kaydedildi!');
    },
  });

  // Sipariş oluştur
  const placeOrder = useMutation({
    mutationFn: async () => {
      const { data: orderRes } = await api.post('/orders', {
        addressId: selectedAddressId,
        paymentMethod: 'BANK_TRANSFER',
      });
      return orderRes.data;
    },
    onSuccess: (order) => {
      clearCart();
      router.push(`/checkout/success?orderId=${order.id}`);
      toast.success('Siparişiniz alındı!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Sipariş oluşturulamadı.');
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  if (user && !user.emailVerified) {
    return (
      <div className="container py-20 max-w-md mx-auto text-center">
        <div className="card p-10">
          <div className="text-5xl mb-4">✉️</div>
          <h1 className="text-xl font-bold mb-2">E-posta Doğrulaması Gerekli</h1>
          <p className="text-gray-500 text-sm mb-6">
            Sipariş vermek için e-posta adresinizi doğrulamanız gerekiyor.
            Gelen kutunuzu kontrol edin.
          </p>
          <Link href="/" className="btn-outline inline-flex">Ana Sayfaya Dön</Link>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'address', label: 'Teslimat Adresi', num: 1 },
    { key: 'review', label: 'Sipariş Özeti', num: 2 },
  ];

  return (
    <div className="container py-4 sm:py-8">
      {/* Progress */}
      <div className="mb-6 sm:mb-8 flex items-center justify-center gap-0">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              s.key === step ? 'bg-brand-600 text-white' :
              (steps.findIndex(x => x.key === step) > i) ? 'text-green-600' : 'text-gray-400'
            }`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                s.key === step ? 'bg-white text-brand-600' :
                (steps.findIndex(x => x.key === step) > i) ? 'bg-green-100 text-green-700' : 'bg-gray-100'
              }`}>
                {steps.findIndex(x => x.key === step) > i ? '✓' : s.num}
              </span>
              {s.label}
            </div>
            {i < steps.length - 1 && <ChevronRight size={16} className="mx-1 text-gray-300" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Sol — Ana içerik */}
        <div className="lg:col-span-2">

          {/* ADIM 1 — Adres */}
          {step === 'address' && (
            <div className="card p-6">
              <h2 className="mb-5 text-lg font-bold flex items-center gap-2">
                <MapPin size={20} className="text-brand-600" /> Teslimat Adresi
              </h2>

              {/* Kayıtlı adresler */}
              {addresses?.length > 0 && (
                <div className="space-y-3 mb-5">
                  {addresses.map((addr: any) => (
                    <label key={addr.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                      selectedAddressId === addr.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 accent-brand-600"
                      />
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{addr.title}</p>
                        <p className="text-sm text-gray-600">{addr.firstName} {addr.lastName} — {addr.phone}</p>
                        <p className="text-sm text-gray-500">{addr.district}, {addr.city}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{addr.fullAddress}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Yeni adres formu */}
              {(showNewAddress || !addresses?.length) ? (
                <form onSubmit={addressForm.handleSubmit(d => saveAddress.mutate(d))} className="space-y-4">
                  <p className="text-sm font-semibold text-gray-700 border-t pt-4">Yeni Adres</p>
                  <input {...addressForm.register('title')} placeholder="Adres başlığı (Ev, İş...)" className="input" />
                  <div className="grid grid-cols-2 gap-3">
                    <input {...addressForm.register('firstName')} placeholder="Ad" className="input" />
                    <input {...addressForm.register('lastName')} placeholder="Soyad" className="input" />
                  </div>
                  <input {...addressForm.register('phone')} placeholder="Telefon" className="input" />
                  <div className="grid grid-cols-2 gap-3">
                    <input {...addressForm.register('city')} placeholder="İl" className="input" />
                    <input {...addressForm.register('district')} placeholder="İlçe" className="input" />
                  </div>
                  <textarea {...addressForm.register('fullAddress')} placeholder="Açık adres" rows={3} className="input resize-none" />
                  <div className="flex gap-3">
                    <button type="submit" className="btn-primary flex-1" disabled={saveAddress.isPending}>
                      {saveAddress.isPending ? 'Kaydediliyor...' : 'Adresi Kaydet ve Devam Et'}
                    </button>
                    {addresses?.length > 0 && (
                      <button type="button" onClick={() => setShowNewAddress(false)} className="btn-outline">İptal</button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setShowNewAddress(true)}
                    className="btn-outline gap-2 w-full"
                  >
                    <Plus size={16} /> Yeni Adres Ekle
                  </button>
                  <button
                    onClick={() => { if (selectedAddressId) setStep('review'); else toast.error('Lütfen bir adres seçin.'); }}
                    disabled={!selectedAddressId}
                    className="btn-primary w-full py-3"
                  >
                    Devam Et →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ADIM 2 — Özet ve Sipariş Ver */}
          {step === 'review' && (
            <div className="card p-6">
              <h2 className="mb-5 text-lg font-bold">Sipariş Özeti</h2>

              <div className="space-y-3 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {item.product.thumbnail && (
                        <Image
                          src={item.product.thumbnail.startsWith('http') ? item.product.thumbnail : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${item.product.thumbnail}`}
                          alt={item.product.name}
                          width={48} height={48}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">
                      {(Number(item.product.price) * item.quantity).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </p>
                  </div>
                ))}
              </div>

              {/* Hediye Paketi */}
              <label className="flex items-center gap-3 rounded-xl border-2 border-gray-200 p-3 cursor-pointer hover:border-brand-300 transition-colors mb-4">
                <input type="checkbox" checked={giftPackage} onChange={e => setGiftPackage(e.target.checked)} className="accent-brand-600 w-4 h-4" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">🎁 Hediye Paketi</p>
                  <p className="text-xs text-gray-400">Özel hediye ambalajında gönderilsin</p>
                </div>
                <span className="text-sm font-semibold text-brand-600">+{GIFT_PACKAGE_FEE} TL</span>
              </label>

              <div className="border-t pt-4 space-y-2 text-sm mb-5">
                <div className="flex justify-between text-gray-600">
                  <span>Ürünler Toplamı</span>
                  <span>{subtotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Kargo</span>
                  <span>{SHIPPING_COST.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                </div>
                {giftPackage && (
                  <div className="flex justify-between text-gray-600">
                    <span>🎁 Hediye Paketi</span>
                    <span>{GIFT_PACKAGE_FEE.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold border-t pt-2">
                  <span>Genel Toplam</span>
                  <span>{total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                </div>
                <p className="text-xs text-gray-400 text-center">KDV Dahildir</p>
              </div>

              {/* Ödeme bilgisi */}
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 mb-5 flex items-start gap-3">
                <MessageCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-green-800 mb-1">WhatsApp ile Ödeme</p>
                  <p className="text-green-700">Siparişiniz oluşturulunca sizinle WhatsApp üzerinden iletişime geçeceğiz ve IBAN bilgilerimizi ileteceğiz.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('address')} className="btn-outline">← Geri</button>
                <button
                  onClick={() => placeOrder.mutate()}
                  disabled={placeOrder.isPending}
                  className="btn-primary flex-1 py-3 gap-2"
                >
                  {placeOrder.isPending ? 'Sipariş oluşturuluyor...' : '✓ Siparişi Tamamla'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sağ — Mini özet */}
        <div className="card p-5 h-fit sticky top-24">
          <h3 className="mb-4 font-bold text-gray-800">Sipariş Özeti</h3>
          <div className="space-y-2 text-sm text-gray-600">
            {items.slice(0, 4).map(item => (
              <div key={item.id} className="flex justify-between gap-2">
                <span className="line-clamp-1 flex-1">{item.product.name} x{item.quantity}</span>
                <span className="shrink-0 font-medium">{(Number(item.product.price) * item.quantity).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
              </div>
            ))}
            {items.length > 4 && <p className="text-xs text-gray-400">+{items.length - 4} ürün daha</p>}
          </div>
          <hr className="my-3" />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Ürünler</span>
              <span>{subtotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Kargo</span>
              <span>{SHIPPING_COST.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
            </div>
            {giftPackage && (
              <div className="flex justify-between text-gray-500">
                <span>🎁 Hediye Paketi</span>
                <span>{GIFT_PACKAGE_FEE} TL</span>
              </div>
            )}
          </div>
          <hr className="my-3" />
          <div className="flex justify-between font-bold text-gray-900 text-base">
            <span>Genel Toplam</span>
            <span>{total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">KDV Dahildir</p>
        </div>
      </div>
    </div>
  );
}
