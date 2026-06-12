'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Package, User, MapPin, CreditCard, Truck,
  ExternalLink, Copy, CheckCheck, MessageCircle, ClipboardList,
  ChevronDown, AlertCircle, Check,
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

// ─── Sabitler ────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING:        { label: 'Ödeme Bekleniyor',       color: 'text-yellow-700', bg: 'bg-yellow-50',  border: 'border-yellow-200' },
  CONFIRMED:      { label: 'Ödeme Alındı',           color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200'   },
  PREPARING:      { label: 'Tedarikçiye İletildi',   color: 'text-orange-700', bg: 'bg-orange-50',  border: 'border-orange-200' },
  SHIPPED:        { label: 'Kargoda',                color: 'text-violet-700', bg: 'bg-violet-50',  border: 'border-violet-200' },
  DELIVERED:      { label: 'Teslim Edildi',          color: 'text-green-700',  bg: 'bg-green-50',   border: 'border-green-200'  },
  CANCELLED:      { label: 'İptal Edildi',           color: 'text-gray-600',   bg: 'bg-gray-100',   border: 'border-gray-200'   },
  REFUNDED:       { label: 'İade Edildi',            color: 'text-pink-700',   bg: 'bg-pink-50',    border: 'border-pink-200'   },
  PAYMENT_FAILED: { label: 'Ödeme Başarısız',        color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200'    },
};

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED'];

const CARGO_OPTIONS = [
  'SÜRAT KARGO', 'YURTİÇİ KARGO', 'ARAS KARGO',
  'PTT KARGO', 'GEMEN KARGO', 'GELİVER KARGO',
];

// ─── Yardımcı bileşenler ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.PENDING;
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${m.color} ${m.bg} ${m.border}`}>
      {m.label}
    </span>
  );
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-1.5 shrink-0 text-gray-300 hover:text-brand-500 transition-colors"
    >
      {copied ? <CheckCheck size={13} className="text-green-500" /> : <Copy size={13} />}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-gray-50 py-2.5 last:border-0">
      <span className="w-20 shrink-0 text-xs text-gray-400">{label}</span>
      <span className="flex-1 text-sm font-medium text-gray-800 text-right">{value}</span>
      <CopyBtn value={value} />
    </div>
  );
}

// ─── Onay Modalı ─────────────────────────────────────────────────────────────

function ConfirmDialog({
  title, description, confirmLabel, onConfirm, onCancel, danger = false,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${danger ? 'bg-red-100' : 'bg-blue-100'}`}>
          <AlertCircle size={24} className={danger ? 'text-red-600' : 'text-blue-600'} />
        </div>
        <h3 className="mb-1 text-base font-bold text-gray-900">{title}</h3>
        <p className="mb-6 text-sm text-gray-500">{description}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Vazgeç
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => api.get(`/admin/orders/${id}`).then(r => r.data.data),
  });

  const updateStatus = useMutation({
    mutationFn: (payload: any) => api.patch(`/orders/${id}/status`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-order', id] });
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Sipariş durumu güncellendi.');
      setConfirm(null);
    },
  });

  // Durum değiştirme için seçili değer + onay dialogu
  const [selectedStatus, setSelectedStatus] = useState('');
  const [confirm, setConfirm] = useState<null | { status: string; label: string; danger?: boolean }>(null);
  const [cargoForm, setCargoForm] = useState({ cargoTrackingNo: '', cargoCompany: 'SÜRAT KARGO' });

  if (isLoading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded-xl bg-gray-200" />
      <div className="grid lg:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-gray-200" />)}
      </div>
    </div>
  );
  if (!order) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
      <Package size={48} className="mb-3 opacity-30" />
      <p className="font-medium">Sipariş bulunamadı</p>
    </div>
  );

  const addr = order.address;
  const user = order.user;
  const currentStep = STATUS_FLOW.indexOf(order.status);
  const total = Number(order.total).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });

  // WhatsApp linki
  const rawPhone = user?.phone?.replace(/\D/g, '');
  const waPhone = rawPhone
    ? rawPhone.startsWith('0') ? '90' + rawPhone.slice(1)
    : rawPhone.startsWith('90') ? rawPhone : '90' + rawPhone
    : null;
  const waLink = waPhone
    ? `https://wa.me/${waPhone}?text=${encodeURIComponent(`Merhaba ${user.firstName}, Venta Premium siparişiniz (#${order.orderNumber}) için ödemenizi aldık. En kısa sürede kargoya vereceğiz. Takip numaranızı paylaşacağız 🙏`)}`
    : null;

  const handleStatusChange = () => {
    if (!selectedStatus || selectedStatus === order.status) return;
    const isDanger = selectedStatus === 'CANCELLED' || selectedStatus === 'REFUNDED';
    setConfirm({ status: selectedStatus, label: STATUS_META[selectedStatus]?.label ?? selectedStatus, danger: isDanger });
  };

  return (
    <>
      {/* Onay dialogu */}
      {confirm && (
        <ConfirmDialog
          title="Durum değiştirilsin mi?"
          description={`Sipariş durumu "${STATUS_META[order.status]?.label}" → "${confirm.label}" olarak değiştirilecek. Bu işlem bildirimleri tetikleyebilir.`}
          confirmLabel="Evet, Değiştir"
          danger={confirm.danger}
          onConfirm={() => updateStatus.mutate({ status: confirm.status })}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="space-y-5">
        {/* Başlık */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Sipariş #{order.orderNumber}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(order.createdAt).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
          </div>
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors">
              <MessageCircle size={15} /> WhatsApp
            </a>
          )}
        </div>

        {/* Durum akışı */}
        {!['CANCELLED','REFUNDED','PAYMENT_FAILED'].includes(order.status) && (
          <div className="card p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Sipariş Akışı</p>
            <div className="relative flex items-center justify-between">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100" />
              <div
                className="absolute top-4 left-0 h-0.5 bg-brand-500 transition-all duration-500"
                style={{ width: `${Math.max(0, currentStep / (STATUS_FLOW.length - 1)) * 100}%` }}
              />
              {STATUS_FLOW.map((s, i) => {
                const done = i < currentStep;
                const active = i === currentStep;
                return (
                  <div key={s} className="z-10 flex flex-col items-center gap-1.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                      done   ? 'border-brand-600 bg-brand-600 text-white' :
                      active ? 'border-brand-500 bg-brand-500 text-white shadow-md shadow-brand-200' :
                               'border-gray-200 bg-white text-gray-400'
                    }`}>
                      {done ? <Check size={14} /> : i + 1}
                    </div>
                    <span className={`hidden sm:block text-[11px] font-medium text-center leading-tight max-w-[80px] ${
                      i <= currentStep ? 'text-brand-600' : 'text-gray-400'
                    }`}>
                      {STATUS_META[s]?.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Sol — İçerik */}
          <div className="lg:col-span-2 space-y-5">

            {/* Ürünler */}
            <div className="card">
              <div className="border-b px-5 py-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2"><Package size={16} /> Sipariş Kalemleri</h2>
              </div>
              <div className="divide-y divide-gray-50 px-5">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 py-3.5">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      {item.product?.thumbnail
                        ? <Image
                            src={item.product.thumbnail.startsWith('http') ? item.product.thumbnail : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1','')}${item.product.thumbnail}`}
                            alt={item.productName} width={56} height={56} className="h-full w-full object-cover"
                          />
                        : <div className="flex h-full items-center justify-center text-2xl">📦</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-gray-800">{item.productName}</p>
                      {item.productSku && <p className="mt-0.5 text-xs text-gray-400">SKU: {item.productSku}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">× {item.quantity}</p>
                      <p className="font-bold text-gray-900">
                        {Number(item.total).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t bg-gray-50/60 px-5 py-3 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Ara Toplam</span>
                  <span>{Number(order.subtotal).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 border-t pt-2">
                  <span>Toplam</span>
                  <span>{total}</span>
                </div>
              </div>
            </div>

            {/* Tedarikçi Sipariş Formu */}
            {['CONFIRMED', 'PREPARING'].includes(order.status) && addr && (
              <div className="card border-2 border-orange-200">
                <div className="flex items-center justify-between border-b border-orange-100 bg-orange-50 px-5 py-4">
                  <h2 className="font-bold text-orange-900 flex items-center gap-2">
                    <ClipboardList size={16} /> xmltedarik.com — Sipariş Bilgileri
                  </h2>
                  <a href="https://www.xmltedarik.com" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-orange-700 hover:underline">
                    Panele Git <ExternalLink size={11} />
                  </a>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <p className="rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-700 border border-orange-100">
                    Aşağıdaki bilgileri xmltedarik sipariş formuna kopyalayın. Sağdaki ikon ile kopyalayabilirsiniz.
                  </p>
                  <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-1">
                    <InfoRow label="Ad" value={addr.firstName || user?.firstName || ''} />
                    <InfoRow label="Soyad" value={addr.lastName || user?.lastName || ''} />
                    <InfoRow label="E-posta" value={user?.email || ''} />
                    <InfoRow label="Telefon" value={addr.phone || user?.phone || ''} />
                    <InfoRow label="İl" value={addr.city || ''} />
                    <InfoRow label="İlçe" value={addr.district || ''} />
                    <InfoRow label="Adres" value={addr.fullAddress || ''} />
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold text-gray-600">Kargo Seçeneği (xmltedarik'te seçin):</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="rounded-xl border-2 border-orange-300 bg-orange-50 p-3">
                        <p className="text-xs font-bold text-orange-800">✓ DROPSHIPPING-PEŞİN ÖDEME [SÜRAT]</p>
                        <p className="mt-0.5 text-xs text-orange-600">149 TL — Kargo bizden ödenir</p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 opacity-60">
                        <p className="text-xs font-bold text-gray-600">DROPSHIPPING-ALICI ÖDER [SÜRAT]</p>
                        <p className="mt-0.5 text-xs text-gray-400">Ücretsiz — Kapıda ödeme</p>
                      </div>
                    </div>
                  </div>

                  {order.status === 'CONFIRMED' && (
                    <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-3">
                      <p className="text-xs font-semibold text-orange-800 mb-2">Tedarikçiye ilettikten sonra:</p>
                      <button
                        onClick={() => setConfirm({ status: 'PREPARING', label: 'Tedarikçiye İletildi' })}
                        className="w-full rounded-lg bg-orange-500 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
                      >
                        Tedarikçiye İletildi Olarak İşaretle
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Kargo takip */}
            {['CONFIRMED', 'PREPARING'].includes(order.status) && (
              <div className="card">
                <div className="border-b px-5 py-4">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2"><Truck size={16} /> Kargo Takip Bilgisi</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Tedarikçi kargoya verince takip numarasını girin.</p>
                </div>
                <div className="px-5 py-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Kargo Firması</label>
                      <select
                        value={cargoForm.cargoCompany}
                        onChange={e => setCargoForm(f => ({ ...f, cargoCompany: e.target.value }))}
                        className="input"
                      >
                        {CARGO_OPTIONS.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Takip Numarası</label>
                      <input
                        value={cargoForm.cargoTrackingNo}
                        onChange={e => setCargoForm(f => ({ ...f, cargoTrackingNo: e.target.value }))}
                        className="input"
                        placeholder="123456789"
                      />
                    </div>
                  </div>
                  <button
                    disabled={!cargoForm.cargoTrackingNo || updateStatus.isPending}
                    onClick={() => setConfirm({ status: 'SHIPPED', label: 'Kargoda' })}
                    className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Truck size={15} /> Kargoya Verildi
                  </button>
                </div>
              </div>
            )}

            {/* Kargo bilgisi — zaten girilmişse */}
            {order.status === 'SHIPPED' && order.cargoCompany && (
              <div className="card border border-violet-200 bg-violet-50/40">
                <div className="px-5 py-4">
                  <h2 className="font-bold text-violet-900 flex items-center gap-2 mb-3"><Truck size={16} /> Kargo Bilgisi</h2>
                  <p className="text-sm text-violet-800">Firma: <span className="font-semibold">{order.cargoCompany}</span></p>
                  {order.cargoTrackingNo && (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-violet-800">Takip No: <span className="font-mono font-semibold">{order.cargoTrackingNo}</span></p>
                      <CopyBtn value={order.cargoTrackingNo} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sağ — Müşteri, adres, durum */}
          <div className="space-y-4">

            {/* Müşteri */}
            <div className="card">
              <div className="border-b px-5 py-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2"><User size={15} /> Müşteri</h2>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold">
                    {user?.firstName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <span>{user.phone}</span>
                    <CopyBtn value={user.phone} />
                  </div>
                )}
                {waLink && (
                  <a href={waLink} target="_blank" rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors">
                    <MessageCircle size={14} /> WhatsApp'tan Yaz
                  </a>
                )}
              </div>
            </div>

            {/* Teslimat Adresi */}
            {addr && (
              <div className="card">
                <div className="border-b px-5 py-4">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2"><MapPin size={15} /> Teslimat Adresi</h2>
                </div>
                <div className="px-5 py-4 text-sm text-gray-700 space-y-1">
                  <p className="text-xs text-gray-400 font-medium">{addr.title}</p>
                  <p className="font-semibold">{addr.firstName} {addr.lastName}</p>
                  <p>{addr.phone}</p>
                  <p className="mt-1 text-gray-600">{addr.fullAddress}</p>
                  <p className="text-gray-600">{addr.district}, {addr.city}</p>
                  {addr.postalCode && <p className="text-xs text-gray-400">{addr.postalCode}</p>}
                </div>
              </div>
            )}

            {/* Ödeme */}
            <div className="card">
              <div className="border-b px-5 py-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2"><CreditCard size={15} /> Ödeme</h2>
              </div>
              <div className="px-5 py-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Yöntem</span>
                  <span className="font-medium">
                    {order.paymentMethod === 'BANK_TRANSFER' ? 'Havale / IBAN' : order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tutar</span>
                  <span className="font-bold text-gray-900">{total}</span>
                </div>
              </div>
            </div>

            {/* Durum Değiştir */}
            <div className="card">
              <div className="border-b px-5 py-4">
                <h2 className="font-bold text-gray-900">Durum Değiştir</h2>
                <p className="text-xs text-gray-400 mt-0.5">Seçim yaptıktan sonra onay gerekir.</p>
              </div>
              <div className="px-5 py-4 space-y-3">
                <select
                  value={selectedStatus || order.status}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="input text-sm"
                >
                  <option value="" disabled>Durum seçin...</option>
                  {Object.entries(STATUS_META).map(([k, v]) => (
                    <option key={k} value={k} disabled={k === order.status}>
                      {k === order.status ? `● ${v.label} (mevcut)` : v.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleStatusChange}
                  disabled={!selectedStatus || selectedStatus === order.status || updateStatus.isPending}
                  className="w-full rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Durumu Güncelle
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
