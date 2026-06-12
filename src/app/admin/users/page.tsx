'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Search, UserX, UserCheck, ShoppingBag, AlertCircle,
  MoreVertical, Mail, X, ShoppingCart, Heart, Package,
  ChevronRight, Loader2,
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

// ─── Sabitler ────────────────────────────────────────────────────────────────

const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Ödeme Bekleniyor', color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Ödeme Alındı',     color: 'bg-blue-100 text-blue-700' },
  PREPARING: { label: 'Tedarikçide',      color: 'bg-orange-100 text-orange-700' },
  SHIPPED:   { label: 'Kargoda',          color: 'bg-violet-100 text-violet-700' },
  DELIVERED: { label: 'Teslim Edildi',    color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'İptal',            color: 'bg-gray-100 text-gray-500' },
};

// ─── Onay dialogu ─────────────────────────────────────────────────────────────

function ConfirmDialog({ title, description, confirmLabel, onConfirm, onCancel, danger = false }:
  { title: string; description: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${danger ? 'bg-red-100' : 'bg-blue-100'}`}>
          <AlertCircle size={24} className={danger ? 'text-red-600' : 'text-blue-600'} />
        </div>
        <h3 className="mb-1 text-base font-bold text-gray-900">{title}</h3>
        <p className="mb-6 text-sm text-gray-500 leading-relaxed">{description}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Vazgeç</button>
          <button onClick={onConfirm} className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Aksiyon menüsü ───────────────────────────────────────────────────────────

function ActionMenu({ user, onAction }: { user: any; onAction: (type: string, user: any) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
        <MoreVertical size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 w-52 rounded-xl border border-gray-100 bg-white py-1 shadow-xl">
            <button onClick={() => { setOpen(false); onAction('toggleActive', user); }}
              className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-700 hover:bg-green-50'}`}>
              {user.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
              {user.isActive ? 'Hesabı Askıya Al' : 'Hesabı Aktive Et'}
            </button>
            <a href={`mailto:${user.email}`} onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <Mail size={15} /> E-posta Gönder
            </a>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Ürün küçük kartı ─────────────────────────────────────────────────────────

function ProductMini({ product, qty, badge }: { product: any; qty?: number; badge?: string }) {
  const imgSrc = product.thumbnail?.startsWith('http')
    ? product.thumbnail
    : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${product.thumbnail}`;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white border border-gray-100">
        {product.thumbnail
          ? <Image src={imgSrc} alt={product.name} width={48} height={48} className="h-full w-full object-cover" />
          : <div className="flex h-full items-center justify-center text-xl">📦</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-gray-800">{product.name}</p>
        <p className="text-xs text-brand-600 font-semibold mt-0.5">
          {Number(product.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        </p>
      </div>
      {qty && <span className="shrink-0 rounded-full bg-white border border-gray-200 px-2 py-0.5 text-xs font-bold text-gray-600">×{qty}</span>}
      {badge && <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">{badge}</span>}
    </div>
  );
}

// ─── Kullanıcı Detay Drawer ───────────────────────────────────────────────────

function UserDrawer({ user, onClose }: { user: any; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-user-details', user.id],
    queryFn: () => api.get(`/admin/users/${user.id}/details`).then(r => r.data.data),
  });

  const cartTotal = data?.cart?.reduce((sum: number, item: any) =>
    sum + Number(item.product?.price ?? 0) * item.quantity, 0) ?? 0;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 border-b px-6 py-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-lg font-bold">
            {user.firstName?.charAt(0)?.toUpperCase()}{user.lastName?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-gray-400 truncate">{user.email}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 size={28} className="animate-spin text-brand-500" />
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-gray-100">

              {/* Özet stat'lar */}
              <div className="grid grid-cols-3 divide-x divide-gray-100">
                <div className="px-4 py-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{user._count?.orders ?? 0}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Sipariş</p>
                </div>
                <div className="px-4 py-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{data?.cart?.length ?? 0}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Sepette</p>
                </div>
                <div className="px-4 py-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{data?.wishlist?.length ?? 0}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Favori</p>
                </div>
              </div>

              {/* Sepet */}
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingCart size={16} className="text-brand-500" /> Sepet
                  </h3>
                  {data?.cart?.length > 0 && (
                    <span className="text-xs font-semibold text-brand-600">
                      {cartTotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </span>
                  )}
                </div>
                {data?.cart?.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">Sepet boş</p>
                ) : (
                  <div className="space-y-2">
                    {data.cart.map((item: any) => (
                      <ProductMini key={item.id} product={item.product} qty={item.quantity} />
                    ))}
                  </div>
                )}
              </div>

              {/* Favoriler */}
              <div className="px-6 py-5">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <Heart size={16} className="text-red-500" /> Favoriler
                </h3>
                {data?.wishlist?.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">Favori ürün yok</p>
                ) : (
                  <div className="space-y-2">
                    {data.wishlist.map((item: any) => (
                      <ProductMini key={item.id} product={item.product} />
                    ))}
                  </div>
                )}
              </div>

              {/* Son siparişler */}
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Package size={16} className="text-gray-500" /> Son Siparişler
                  </h3>
                  <Link href={`/admin/orders?user=${user.id}`}
                    className="text-xs text-brand-600 hover:underline">
                    Tümü →
                  </Link>
                </div>
                {data?.recentOrders?.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">Henüz sipariş yok</p>
                ) : (
                  <div className="space-y-2">
                    {data.recentOrders.map((order: any) => {
                      const sm = ORDER_STATUS[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600' };
                      return (
                        <Link key={order.id} href={`/admin/orders/${order.id}`}
                          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 hover:bg-gray-100 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-xs font-semibold text-brand-600">#{order.orderNumber}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{order._count?.items} ürün · {new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-gray-800">{Number(order.total).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                            <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${sm.color}`}>{sm.label}</span>
                          </div>
                          <ChevronRight size={14} className="text-gray-300 shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'passive'>('all');
  const [pending, setPending] = useState<null | { type: string; user: any }>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery<any[]>({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then(r => r.data.data),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, ...payload }: any) => api.patch(`/admin/users/${id}`, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Kullanıcı güncellendi.'); setPending(null); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Hata'),
  });

  const filtered = data.filter(u => {
    const matchSearch = !search.trim() ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? u.isActive : !u.isActive);
    return matchSearch && matchStatus;
  });

  return (
    <>
      {pending && (
        <ConfirmDialog
          title={pending.user.isActive ? 'Hesap askıya alınsın mı?' : 'Hesap aktive edilsin mi?'}
          description={pending.user.isActive
            ? `${pending.user.firstName} ${pending.user.lastName} adlı kullanıcının hesabı askıya alınacak.`
            : `${pending.user.firstName} ${pending.user.lastName} adlı kullanıcının hesabı aktifleştirilecek.`}
          confirmLabel={pending.user.isActive ? 'Askıya Al' : 'Aktive Et'}
          danger={pending.user.isActive}
          onConfirm={() => updateUser.mutate({ id: pending!.user.id, isActive: !pending!.user.isActive })}
          onCancel={() => setPending(null)}
        />
      )}

      {selectedUser && (
        <UserDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Müşteriler</h1>
          <p className="mt-0.5 text-sm text-gray-400">Toplam {data.length} kayıtlı kullanıcı · Satıra tıklayarak detay görün</p>
        </div>

        {/* Stat chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Tümü',  value: data.length,                     filter: 'all',     color: 'bg-gray-100 text-gray-700' },
            { label: 'Aktif', value: data.filter(u => u.isActive).length,  filter: 'active',  color: 'bg-green-100 text-green-700' },
            { label: 'Pasif', value: data.filter(u => !u.isActive).length, filter: 'passive', color: 'bg-red-100 text-red-600' },
          ].map(item => (
            <button key={item.filter} onClick={() => setStatusFilter(item.filter as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${item.color} ${statusFilter === item.filter ? 'ring-2 ring-brand-500 ring-offset-1' : 'opacity-70 hover:opacity-100'}`}>
              {item.label}
              <span className="rounded-full bg-white/60 px-1.5 py-0.5 text-xs font-bold">{item.value}</span>
            </button>
          ))}
        </div>

        {/* Arama */}
        <div className="card p-4">
          <div className="relative max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Ad, soyad veya e-posta ile ara..." className="input pl-9 text-sm" />
          </div>
        </div>

        {/* Tablo */}
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3.5">Müşteri</th>
                <th className="px-5 py-3.5">Durum</th>
                <th className="px-5 py-3.5">Sipariş</th>
                <th className="px-5 py-3.5">Kayıt Tarihi</th>
                <th className="px-5 py-3.5 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(5)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 animate-pulse rounded bg-gray-100" /></td>)}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-16 text-center"><Search size={32} className="mx-auto mb-2 text-gray-300" /><p className="text-gray-400">Kullanıcı bulunamadı</p></td></tr>
              ) : (
                filtered.map((u: any) => (
                  <tr key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className="cursor-pointer hover:bg-brand-50/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-sm">
                          {u.firstName?.charAt(0)?.toUpperCase()}{u.lastName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                        {u.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <ShoppingBag size={13} className="text-gray-400" />
                        <span className="font-medium">{u._count?.orders ?? 0}</span>
                        <span className="text-xs text-gray-400">sipariş</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <ActionMenu user={u} onAction={(type, user) => setPending({ type, user })} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {!isLoading && (
            <div className="border-t bg-gray-50/50 px-5 py-3 text-xs text-gray-400">
              {filtered.length} kullanıcı gösteriliyor
            </div>
          )}
        </div>
      </div>
    </>
  );
}
