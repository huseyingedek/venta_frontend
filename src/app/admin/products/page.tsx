'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Upload, RefreshCw, Eye } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
  OUT_OF_STOCK: 'bg-red-100 text-red-600',
  DRAFT: 'bg-yellow-100 text-yellow-700',
};
const statusLabels: Record<string, string> = {
  ACTIVE: 'Aktif', INACTIVE: 'Pasif', OUT_OF_STOCK: 'Stok Yok', DRAFT: 'Taslak'
};

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', { search, page, statusFilter }],
    queryFn: () => api.get('/products', {
      params: { search: search || undefined, page, limit: 20, status: statusFilter || undefined, sort: 'createdAt', order: 'desc' }
    }).then(r => r.data),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Ürün devre dışı bırakıldı.'); },
  });

  const products = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      {/* Başlık */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Ürünler</h1>
        <div className="flex gap-2">
          <Link href="/admin/products/new" className="btn-primary gap-2">
            <Plus size={16} /> Ürün Ekle
          </Link>
        </div>
      </div>

      {/* Filtreler */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Ürün adı, SKU ara..."
            className="input pl-9"
          />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">Tüm Durumlar</option>
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Pasif</option>
          <option value="OUT_OF_STOCK">Stok Yok</option>
          <option value="DRAFT">Taslak</option>
        </select>
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
                <th className="px-5 py-3">Fiyat</th>
                <th className="px-5 py-3">Stok</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3">Kaynak</th>
                <th className="px-5 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="animate-pulse h-4 bg-gray-100 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-gray-400">Ürün bulunamadı</td></tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
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
                        <span className="font-medium text-gray-800 line-clamp-1 max-w-[200px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 font-mono text-xs">{product.sku || '—'}</td>
                    <td className="px-5 py-3 text-gray-600">{product.category?.name || '—'}</td>
                    <td className="px-5 py-3 font-semibold text-gray-800">
                      {Number(product.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-gray-700'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${statusColors[product.status]}`}>{statusLabels[product.status]}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${product.source === 'XML' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {product.source}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t px-5 py-3 text-sm text-gray-500">
            <span>{pagination.total} ürün</span>
            <div className="flex gap-1">
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`h-7 w-7 rounded text-xs font-medium transition-colors ${
                    page === i + 1 ? 'bg-brand-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
