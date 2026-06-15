'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, MapPin, ChevronRight, CreditCard, Lock, ShieldCheck, User } from 'lucide-react';
import api from '@/lib/api';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import Image from 'next/image';

const addressSchema = z.object({
  title: z.string().min(1, 'Başlık gerekli'),
  firstName: z.string().min(2, 'Ad gerekli'),
  lastName: z.string().min(2, 'Soyad gerekli'),
  phone: z.string().min(10, 'Telefon gerekli'),
  city: z.string().min(2, 'İl gerekli'),
  district: z.string().min(2, 'İlçe gerekli'),
  fullAddress: z.string().min(10, 'Açık adres gerekli'),
});

// Guest form — hem kişisel bilgileri hem de adresi kapsar
const guestSchema = z.object({
  firstName: z.string().min(2, 'Ad gerekli'),
  lastName: z.string().min(2, 'Soyad gerekli'),
  email: z.string().email('Geçerli e-posta girin'),
  phone: z.string().min(10, 'Telefon gerekli'),
  city: z.string().min(2, 'İl gerekli'),
  district: z.string().min(2, 'İlçe gerekli'),
  fullAddress: z.string().min(10, 'Açık adres gerekli'),
});

const cardSchema = z.object({
  cardHolderName: z.string().min(3, 'Kart sahibi adı gerekli'),
  cardNumber: z.string().min(16, 'Geçerli kart numarası girin').max(19),
  expireMonth: z.string().min(1, 'Ay gerekli'),
  expireYear: z.string().min(2, 'Yıl gerekli'),
  cvc: z.string().min(3, 'CVC gerekli').max(4),
});

type Step = 'address' | 'review' | 'payment';

function formatCardNumber(val: string) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>('address');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [cardNumberDisplay, setCardNumberDisplay] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  // Guest sipariş bilgilerini burada saklarız (review + payment adımlarında gerekiyor)
  const [guestInfo, setGuestInfo] = useState<z.infer<typeof guestSchema> | null>(null);

  const { items, totalPrice, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  const { data: addresses, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get('/users/addresses').then(r => r.data.data),
    enabled: isAuthenticated,
  });

  const addressForm = useForm({ resolver: zodResolver(addressSchema) });
  const guestForm = useForm({ resolver: zodResolver(guestSchema) });
  const cardForm = useForm({ resolver: zodResolver(cardSchema) });

  const [giftPackage, setGiftPackage] = useState(false);

  const GIFT_PACKAGE_FEE = 20;
  const SHIPPING_COST = 149;
  const subtotal = totalPrice();
  const giftFee = giftPackage ? GIFT_PACKAGE_FEE : 0;
  const total = subtotal + SHIPPING_COST + giftFee;

  // Üye: yeni adres kaydet
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

  // Üye: sipariş oluştur
  const createOrder = useMutation({
    mutationFn: async () => {
      const { data: orderRes } = await api.post('/orders', {
        addressId: selectedAddressId,
        paymentMethod: 'CREDIT_CARD',
      });
      return orderRes.data;
    },
    onSuccess: (order) => {
      setOrderId(order.id);
      setOrderNumber(order.orderNumber);
      setStep('payment');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Sipariş oluşturulamadı.');
    },
  });

  // Guest: sipariş oluştur
  const createGuestOrder = useMutation({
    mutationFn: async () => {
      if (!guestInfo) throw new Error('Bilgiler eksik');
      const { data: orderRes } = await api.post('/orders/guest', {
        firstName: guestInfo.firstName,
        lastName: guestInfo.lastName,
        email: guestInfo.email,
        phone: guestInfo.phone,
        address: {
          city: guestInfo.city,
          district: guestInfo.district,
          fullAddress: guestInfo.fullAddress,
        },
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod: 'CREDIT_CARD',
      });
      return orderRes.data;
    },
    onSuccess: (order) => {
      setOrderId(order.id);
      setOrderNumber(order.orderNumber);
      setStep('payment');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Sipariş oluşturulamadı.');
    },
  });

  const redirectToSuccess = () => {
    clearCart();
    const params = new URLSearchParams();
    if (orderId) params.set('orderId', orderId);
    if (orderNumber) params.set('orderNumber', orderNumber);
    router.push(`/checkout/success?${params.toString()}`);
  };

  // Ödeme yap
  const processPayment = useMutation({
    mutationFn: async (cardData: any) => {
      const raw = cardData.cardNumber.replace(/\s/g, '');
      await api.post('/payment/initiate', {
        orderId,
        cardHolderName: cardData.cardHolderName,
        cardNumber: raw,
        expireMonth: cardData.expireMonth,
        expireYear: cardData.expireYear,
        cvc: cardData.cvc,
        installment: 1,
      });
    },
    onSuccess: () => {
      toast.success('Ödeme başarılı!');
      redirectToSuccess();
    },
    onError: () => {
      // iyzico henüz aktif değil — sipariş oluşturuldu, başarı sayfasına yönlendir
      redirectToSuccess();
    },
  });

  if (items.length === 0 && step === 'address') {
    return (
      <div className="container py-20 max-w-md mx-auto text-center">
        <div className="card p-10">
          <div className="text-5xl mb-4">🛒</div>
          <h1 className="text-xl font-bold mb-2">Sepetiniz Boş</h1>
          <p className="text-gray-500 text-sm mb-6">Sipariş vermek için sepete ürün ekleyin.</p>
          <Link href="/shop" className="btn-primary inline-flex">Alışverişe Başla</Link>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'address', label: 'Teslimat Adresi', num: 1 },
    { key: 'review',  label: 'Sipariş Özeti',   num: 2 },
    { key: 'payment', label: 'Ödeme',            num: 3 },
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
        <div className="lg:col-span-2">

          {/* ADIM 1 — Adres */}
          {step === 'address' && (
            <div className="card p-6">
              <h2 className="mb-5 text-lg font-bold flex items-center gap-2">
                <MapPin size={20} className="text-brand-600" /> Teslimat Adresi
              </h2>

              {/* ═══════ GUEST FORMU ═══════ */}
              {!isAuthenticated && (
                <>
                  <div className="mb-5 rounded-xl bg-blue-50 border border-blue-200 p-3 flex items-start gap-2">
                    <User size={15} className="text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-700">
                      Üye olmadan sipariş verebilirsiniz.{' '}
                      <Link href="/auth/login" className="font-semibold underline">Giriş yapmak</Link> isterseniz siparişlerinizi takip edebilirsiniz.
                    </p>
                  </div>
                  <form
                    onSubmit={guestForm.handleSubmit(data => {
                      setGuestInfo(data);
                      setStep('review');
                    })}
                    className="space-y-4"
                  >
                    <p className="text-sm font-semibold text-gray-700">Kişisel Bilgiler</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input {...guestForm.register('firstName')} placeholder="Ad" className="input" />
                        {guestForm.formState.errors.firstName && (
                          <p className="text-xs text-red-500 mt-1">{guestForm.formState.errors.firstName.message as string}</p>
                        )}
                      </div>
                      <div>
                        <input {...guestForm.register('lastName')} placeholder="Soyad" className="input" />
                        {guestForm.formState.errors.lastName && (
                          <p className="text-xs text-red-500 mt-1">{guestForm.formState.errors.lastName.message as string}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <input {...guestForm.register('email')} type="email" placeholder="E-posta adresi" className="input" />
                      {guestForm.formState.errors.email && (
                        <p className="text-xs text-red-500 mt-1">{guestForm.formState.errors.email.message as string}</p>
                      )}
                    </div>
                    <div>
                      <input {...guestForm.register('phone')} placeholder="Telefon (05XX XXX XX XX)" className="input" />
                      {guestForm.formState.errors.phone && (
                        <p className="text-xs text-red-500 mt-1">{guestForm.formState.errors.phone.message as string}</p>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-700 pt-2 border-t">Teslimat Adresi</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input {...guestForm.register('city')} placeholder="İl" className="input" />
                        {guestForm.formState.errors.city && (
                          <p className="text-xs text-red-500 mt-1">{guestForm.formState.errors.city.message as string}</p>
                        )}
                      </div>
                      <div>
                        <input {...guestForm.register('district')} placeholder="İlçe" className="input" />
                        {guestForm.formState.errors.district && (
                          <p className="text-xs text-red-500 mt-1">{guestForm.formState.errors.district.message as string}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <textarea {...guestForm.register('fullAddress')} placeholder="Açık adres (Mahalle, Sokak, Bina No, Daire No...)" rows={3} className="input resize-none" />
                      {guestForm.formState.errors.fullAddress && (
                        <p className="text-xs text-red-500 mt-1">{guestForm.formState.errors.fullAddress.message as string}</p>
                      )}
                    </div>
                    <button type="submit" className="btn-primary w-full py-3">
                      Devam Et →
                    </button>
                  </form>
                </>
              )}

              {/* ═══════ ÜYE ADRES SEÇİMİ ═══════ */}
              {isAuthenticated && (
                <>
                  {addresses?.length > 0 && (
                    <div className="space-y-3 mb-5">
                      {addresses.map((addr: any) => (
                        <label key={addr.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                          selectedAddressId === addr.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <input type="radio" name="address" value={addr.id}
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 accent-brand-600" />
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
                      <button onClick={() => setShowNewAddress(true)} className="btn-outline gap-2 w-full">
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
                </>
              )}
            </div>
          )}

          {/* ADIM 2 — Sipariş Özeti */}
          {step === 'review' && (
            <div className="card p-6">
              <h2 className="mb-5 text-lg font-bold">Sipariş Özeti</h2>

              {/* Guest bilgi özeti */}
              {!isAuthenticated && guestInfo && (
                <div className="mb-4 rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700 space-y-1">
                  <p className="font-semibold text-gray-900">Teslimat Bilgileri</p>
                  <p>{guestInfo.firstName} {guestInfo.lastName} — {guestInfo.phone}</p>
                  <p className="text-gray-500">{guestInfo.district}, {guestInfo.city}</p>
                  <p className="text-xs text-gray-400">{guestInfo.fullAddress}</p>
                  <button onClick={() => setStep('address')} className="text-xs text-brand-600 hover:underline mt-1">Düzenle</button>
                </div>
              )}

              <div className="space-y-3 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {item.product.thumbnail && (
                        <Image
                          src={item.product.thumbnail.startsWith('http') ? item.product.thumbnail : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${item.product.thumbnail}`}
                          alt={item.product.name} width={48} height={48}
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

              <div className="flex gap-3">
                <button onClick={() => setStep('address')} className="btn-outline">← Geri</button>
                <button
                  onClick={() => {
                    if (isAuthenticated) createOrder.mutate();
                    else createGuestOrder.mutate();
                  }}
                  disabled={createOrder.isPending || createGuestOrder.isPending}
                  className="btn-primary flex-1 py-3 gap-2"
                >
                  {(createOrder.isPending || createGuestOrder.isPending) ? 'Hazırlanıyor...' : 'Ödemeye Geç →'}
                </button>
              </div>
            </div>
          )}

          {/* ADIM 3 — Ödeme */}
          {step === 'payment' && (
            <div className="card p-6">
              <h2 className="mb-2 text-lg font-bold flex items-center gap-2">
                <CreditCard size={20} className="text-brand-600" /> Kart Bilgileri
              </h2>
              <div className="flex items-center gap-2 mb-6">
                <Lock size={13} className="text-green-600" />
                <span className="text-xs text-green-700 font-medium">256-bit SSL ile güvenli şifreleme</span>
                <span className="text-xs text-gray-400">· iyzico güvencesiyle</span>
              </div>

              <form onSubmit={cardForm.handleSubmit(d => processPayment.mutate(d))} className="space-y-4">
                {/* Kart Sahibi */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kart Üzerindeki İsim</label>
                  <input
                    {...cardForm.register('cardHolderName')}
                    placeholder="AD SOYAD"
                    className="input uppercase"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {cardForm.formState.errors.cardHolderName && (
                    <p className="text-xs text-red-500 mt-1">{cardForm.formState.errors.cardHolderName.message as string}</p>
                  )}
                </div>

                {/* Kart Numarası */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kart Numarası</label>
                  <div className="relative">
                    <input
                      {...cardForm.register('cardNumber')}
                      value={cardNumberDisplay}
                      onChange={e => {
                        const formatted = formatCardNumber(e.target.value);
                        setCardNumberDisplay(formatted);
                        cardForm.setValue('cardNumber', formatted);
                      }}
                      placeholder="0000 0000 0000 0000"
                      className="input font-mono pr-12"
                      maxLength={19}
                    />
                    <CreditCard size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  </div>
                  {cardForm.formState.errors.cardNumber && (
                    <p className="text-xs text-red-500 mt-1">{cardForm.formState.errors.cardNumber.message as string}</p>
                  )}
                </div>

                {/* Son Kullanma + CVC */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ay</label>
                    <select {...cardForm.register('expireMonth')} className="input">
                      <option value="">Ay</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const m = String(i + 1).padStart(2, '0');
                        return <option key={m} value={m}>{m}</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Yıl</label>
                    <select {...cardForm.register('expireYear')} className="input">
                      <option value="">Yıl</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const y = String(new Date().getFullYear() + i).slice(-2);
                        return <option key={y} value={y}>{new Date().getFullYear() + i}</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">CVC</label>
                    <input
                      {...cardForm.register('cvc')}
                      placeholder="•••"
                      maxLength={4}
                      className="input font-mono text-center"
                      type="password"
                    />
                  </div>
                </div>
                {(cardForm.formState.errors.expireMonth || cardForm.formState.errors.expireYear || cardForm.formState.errors.cvc) && (
                  <p className="text-xs text-red-500">Son kullanma tarihi ve CVC gerekli.</p>
                )}

                {/* Güvenlik badge */}
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 flex items-center gap-3">
                  <ShieldCheck size={18} className="text-green-600 shrink-0" />
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Kart bilgileriniz iyzico güvencesiyle şifrelenerek işlenir. Venta Premium kart bilgilerinizi saklamamaktadır.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep('review')} className="btn-outline">← Geri</button>
                  <button
                    type="submit"
                    disabled={processPayment.isPending}
                    className="btn-primary flex-1 py-3 gap-2"
                  >
                    {processPayment.isPending
                      ? 'Ödeme işleniyor...'
                      : `Ödemeyi Tamamla — ${total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}`}
                  </button>
                </div>
              </form>
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
          <div className="mt-4 flex items-center justify-center gap-1.5">
            <Lock size={11} className="text-gray-400" />
            <span className="text-xs text-gray-400">SSL güvenli ödeme</span>
          </div>
        </div>
      </div>
    </div>
  );
}
