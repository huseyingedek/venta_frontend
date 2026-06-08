'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Eye, TrendingUp, TrendingDown, Minus, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

const BAYI_INO = 0.30;
const IYZICO_R = 0.0249;
const IYZICO_F = 0.25;

/** Alış fiyatı: satış fiyatının %70'i */
const alis = (satis: number) => satis * (1 - BAYI_INO);

/** Net kar: satış - alış - iyzico (kargo karşı taraf öder) */
const netKar = (satis: number) =>
  satis - alis(satis) - (satis * IYZICO_R + IYZICO_F);

const fmt = (v: number) =>
  v.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 });

const statusColors: Record<string, string> = {
  ACTIVE:       'bg-green-100 text-green-700',
  INACTIVE:     'bg-gray-100 text-gray-600',
  OUT_OF_STOCK: 'bg-red-100 text-red-600',
  DRAFT:        'bg-yellow-100 text-yellow-700',
};
const statusLabels: Record<string, string> = {
  ACTIVE: 'Aktif', INACTIVE: 'Pasif', OUT_OF_STOCK: 'Stok Yok', DRAFT: 'Taslak',
};

/* Sayfalama yardımcısı — max 7 buton göster */
function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  if (current > 3) pages.push('…');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}

export default function AdminProductsPage() {
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [showPricing, setShowPricing] = useState(true);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', { search, page, statusFilter, featuredFilter }],
    queryFn: () =>
      api.get('/products', {
        params: {
          search:   search || undefined,
          page,
          limit:    20,
          status:   statusFilter || 'ALL',   // boşsa tüm durumlar
          featured: featuredFilter === 'featured' ? 'true' : featuredFilter === 'normal' ? 'false' : undefined,
          sort:     'createdAt',
          order:    'desc',
        },
      }).then(r => r.data),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Ürün devre dışı bırakıldı.'); },
  });

  const toggleFeatured = useMutation({
    mutationFn: (id: string) => api.patch(`/products/${id}/toggle-featured`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); },
  });

  const products   = data?.data || [];
  const pagination = data?.pagination;
  const colCount   = showPricing ? 9 : 7;

  return (
    <div className="space-y-5">
      {/* Başlık */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Ürünler</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPricing(p => !p)}
            className={`btn-outline text-sm gap-1.5 ${showPricing ? 'border-brand-400 text-brand-600 bg-brand-50' : ''}`}
          >
            <TrendingUp size={14} />
            {showPricing ? 'Fiyatları Gizle' : 'Alış/Kar Göster'}
          </button>
          <Link href="/admin/products/new" className="btn-primary gap-2">
            <Plus size={16} /> Ürün Ekle
          </Link>
        </div>
      </div>

      {/* Bilgi notu */}
      {showPricing && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 flex items-start gap-2">
          <span className="text-base shrink-0">ℹ️</span>
          <span>
            <strong>Alış fiyatı</strong> = xmltedarik satış fiyatının <strong>%70'i</strong> (%30 bayi indirimi) ·{' '}
            <strong>Net kar</strong> = Satış − Alış − İyzico komisyonu (kargo alıcı öder)
          </span>
        </div>
      )}

      {/* Filtreler */}
      <div className="card p-4 flex flex-wrap gap-3">
        {/* Arama */}
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Ürün adı, SKU ara..."
            className="input pl-9"
          />
        </div>

        {/* Durum filtresi */}
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="input w-auto"
        >
          <option value="">Tüm Durumlar</option>
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Pasif</option>
          <option value="OUT_OF_STOCK">Stok Yok</option>
          <option value="DRAFT">Taslak</option>
        </select>

        {/* Öne çıkan filtresi */}
        <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm font-medium">
          {[
            { value: '',         label: 'Tümü' },
            { value: 'featured', label: '⭐ Öne Çıkanlar' },
            { value: 'normal',   label: 'Normal' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => { setFeaturedFilter(opt.value); setPage(1); }}
              className={`px-3.5 py-2 transition-colors ${
                featuredFilter === opt.value
                  ? 'bg-amber-50 text-amber-700 border-x border-amber-200'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tablo */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">Ürün</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Satış Fiyatı</th>
                {showPricing && (
                  <>
                    <th className="px-5 py-3 text-blue-700 bg-blue-50/50">Alış Fiyatı</th>
                    <th className="px-5 py-3 text-emerald-700 bg-emerald-50/50">Net Kar</th>
                  </>
                )}
                <th className="px-5 py-3">Stok</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(colCount)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="animate-pulse h-4 bg-gray-100 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="px-5 py-16 text-center text-gray-400">
                    Ürün bulunamadı
                  </td>
                </tr>
              ) : (
                products.map((product: any) => {
                  const satis     = Number(product.price);
                  const alisFiyat = alis(satis);
                  const kar       = netKar(satis);
                  const karPct    = satis > 0 ? (kar / satis) * 100 : 0;

                  return (
                    <tr key={product.id} className={`hover:bg-gray-50/50 transition-colors ${product.isFeatured ? 'bg-amber-50/30' : ''}`}>
                      {/* Ürün */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {product.thumbnail ? (
                              <Image
                                src={product.thumbnail.startsWith('http') ? product.thumbnail : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${product.thumbnail}`}
                                alt={product.name} width={40} height={40} className="h-full w-full object-cover"
                              />
                            ) : <div className="flex h-full items-center justify-center text-lg">📦</div>}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {product.isFeatured && <Star size={12} className="text-amber-400 shrink-0" fill="currentColor" />}
                            <span className="font-medium text-gray-800 line-clamp-1 max-w-[200px]">{product.name}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{product.sku || '—'}</td>
                      <td className="px-5 py-3 text-gray-600">{product.category?.name || '—'}</td>
                      <td className="px-5 py-3 font-bold text-gray-900">{fmt(satis)}</td>

                      {showPricing && (
                        <td className="px-5 py-3 bg-blue-50/30">
                          <div className="flex flex-col">
                            <span className="font-semibold text-blue-700">{fmt(alisFiyat)}</span>
                            <span className="text-[10px] text-blue-400">%30 bayi indirimli</span>
                          </div>
                        </td>
                      )}

                      {showPricing && (
                        <td className="px-5 py-3 bg-emerald-50/30">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              {kar > 0 ? <TrendingUp size={13} className="text-emerald-600" />
                                : kar === 0 ? <Minus size={13} className="text-gray-400" />
                                : <TrendingDown size={13} className="text-red-500" />}
                              <span className={`font-bold text-sm ${kar > 0 ? 'text-emerald-700' : kar < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                {fmt(kar)}
                              </span>
                            </div>
                            <span className={`text-[10px] ${kar > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                              %{karPct.toFixed(1)} marj
                            </span>
                          </div>
                        </td>
                      )}

                      <td className="px-5 py-3">
                        <span className={`font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-gray-700'}`}>
                          {product.stock}
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        <span className={`badge ${statusColors[product.status]}`}>
                          {statusLabels[product.status]}
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleFeatured.mutate(product.id)}
                            title={product.isFeatured ? 'Öne çıkanlardan kaldır' : 'Öne çıkar'}
                            className={`p-1.5 rounded-lg transition-colors ${product.isFeatured ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-gray-300 hover:bg-amber-50 hover:text-amber-400'}`}
                          >
                            <Star size={15} fill={product.isFeatured ? 'currentColor' : 'none'} />
                          </button>
                          <Link href={`/product/${product.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                            <Eye size={15} />
                          </Link>
                          <Link href={`/admin/products/${product.id}/edit`} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                            <Pencil size={15} />
                          </Link>
                          <button
                            onClick={() => { if (confirm('Ürünü devre dışı bırakmak istediğinize emin misiniz?')) deleteProduct.mutate(product.id); }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t px-5 py-3 text-sm">
            <span className="text-gray-500">
              Toplam <strong>{pagination.total}</strong> ürün · Sayfa {page}/{pagination.pages}
            </span>
            <div className="flex items-center gap-1">
              {/* Önceki */}
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={15} />
              </button>

              {/* Sayfa numaraları */}
              {pageNumbers(page, pagination.pages).map((p, i) =>
                p === '…' ? (
                  <span key={`sep-${i}`} className="px-1 text-gray-400 text-xs">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 min-w-[2rem] rounded-lg px-2 text-xs font-medium transition-colors ${
                      page === p ? 'bg-brand-600 text-white' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              {/* Sonraki */}
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
