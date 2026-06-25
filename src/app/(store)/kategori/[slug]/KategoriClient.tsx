'use client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';

interface Props {
  slug: string;
  category: { id: string; name: string; slug: string; description?: string; children?: any[] };
}

export default function KategoriClient({ slug, category }: Props) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceExpanded, setPriceExpanded] = useState(true);
  const [catExpanded, setCatExpanded] = useState(true);

  const filters = {
    category: slug,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    page, sort, order, limit: 24,
  };

  const { data, isLoading } = useQuery<{
    data: any[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }>({
    queryKey: ['kategori-products', filters],
    queryFn: () => api.get('/products', { params: filters }).then(r => r.data),
    keepPreviousData: true,
  } as any);

  // Tüm kategorileri çek (shop sayfasıyla aynı sidebar)
  const { data: allCategories = [] } = useQuery<any[]>({
    queryKey: ['shop-categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const products = data?.data || [];
  const pagination = data?.pagination;

  const clearFilters = () => { setMinPrice(''); setMaxPrice(''); setPage(1); };

  const FilterSidebar = () => (
    <div className="space-y-5">
      {/* Kategoriler — shop sayfasıyla aynı */}
      <div>
        <button
          onClick={() => setCatExpanded(e => !e)}
          className="flex w-full items-center justify-between font-semibold text-gray-800 mb-2"
        >
          Kategoriler {catExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        {catExpanded && (
          <div className="max-h-72 overflow-y-auto space-y-0.5 pr-1">
            <Link
              href="/shop"
              className="block rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Tüm Ürünler
            </Link>
            {allCategories.map((cat: any) => (
              <div key={cat.id}>
                <Link
                  href={`/kategori/${cat.slug}`}
                  className={`block rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${slug === cat.slug ? 'bg-brand-50 text-brand-600' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {cat.name}
                </Link>
                {/* Aktif kategorinin alt kategorilerini göster */}
                {(slug === cat.slug || cat.children?.some((c: any) => c.slug === slug)) &&
                  cat.children?.map((child: any) => (
                    <Link
                      key={child.id}
                      href={`/kategori/${child.slug}`}
                      className={`block rounded-lg pl-6 pr-3 py-1 text-xs transition-colors ${slug === child.slug ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      └ {child.name}
                    </Link>
                  ))
                }
              </div>
            ))}
          </div>
        )}
      </div>

      <hr />

      {/* Fiyat Aralığı */}
      <div>
        <button
          onClick={() => setPriceExpanded(e => !e)}
          className="flex w-full items-center justify-between font-semibold text-gray-800 mb-2"
        >
          Fiyat Aralığı {priceExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        {priceExpanded && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min ₺" className="input text-sm" min={0} />
              <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max ₺" className="input text-sm" min={0} />
            </div>
            <button onClick={() => setPage(1)} className="w-full btn-primary text-sm py-1.5">Uygula</button>
          </div>
        )}
      </div>

      {(minPrice || maxPrice) && (
        <button onClick={clearFilters} className="w-full btn-outline text-sm text-red-500 border-red-200 hover:bg-red-50">
          Filtreleri Temizle
        </button>
      )}
    </div>
  );

  return (
    <div className="container py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-gray-400">
        <Link href="/" className="hover:text-brand-600 transition-colors">Ana Sayfa</Link>
        <ChevronRight size={13} />
        <Link href="/shop" className="hover:text-brand-600 transition-colors">Ürünler</Link>
        <ChevronRight size={13} />
        <span className="text-gray-700 font-medium">{category.name}</span>
      </nav>

      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{category.name}</h1>
        {category.description && (
          <p className="mt-1 text-sm text-gray-500 max-w-2xl">{category.description}</p>
        )}
        {pagination && <p className="mt-1 text-sm text-gray-400">{pagination.total} ürün</p>}
      </div>

      {/* Sıralama + filtre butonu */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <button onClick={() => setFilterOpen(true)} className="lg:hidden btn-outline gap-1.5 text-sm">
          <SlidersHorizontal size={15} /> Filtre
        </button>
        <select
          value={`${sort}-${order}`}
          onChange={e => { const [s, o] = e.target.value.split('-'); setSort(s); setOrder(o); setPage(1); }}
          className="input w-auto text-sm ml-auto"
        >
          <option value="createdAt-desc">En Yeni</option>
          <option value="price-asc">Fiyat ↑</option>
          <option value="price-desc">Fiyat ↓</option>
          <option value="name-asc">A–Z</option>
        </select>
      </div>

      <div className="flex gap-6">
        {/* Masaüstü sidebar */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="card p-4 sticky top-24">
            <FilterSidebar />
          </div>
        </aside>

        {/* Mobil filtre overlay */}
        {filterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-72 bg-white p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <span className="font-bold text-lg">Filtreler</span>
                <button onClick={() => setFilterOpen(false)}><X size={20} /></button>
              </div>
              <FilterSidebar />
            </div>
          </div>
        )}

        {/* Ürün grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-gray-200 h-60 sm:h-72" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <p className="text-5xl mb-4">📦</p>
              <p className="text-lg font-medium">Bu kategoride ürün bulunamadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Sayfalama */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-10 flex justify-center gap-2 flex-wrap">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-9 px-3 rounded-lg text-sm border hover:border-brand-300 disabled:opacity-40">{'<'}</button>
              {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                const p = pagination.pages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= pagination.pages - 3 ? pagination.pages - 6 + i : page - 3 + i;
                return (
                  <button key={p} onClick={() => setPage(p)} className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-brand-600 text-white' : 'bg-white border hover:border-brand-300 hover:text-brand-600'}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="h-9 px-3 rounded-lg text-sm border hover:border-brand-300 disabled:opacity-40">{'>'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
