'use client';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import { useState } from 'react';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceExpanded, setPriceExpanded] = useState(true);
  const [catExpanded, setCatExpanded] = useState(true);

  const activeCategory = searchParams.get('category') || '';

  const { data: catData = [] } = useQuery<any[]>({
    queryKey: ['shop-categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const filters = {
    category: activeCategory || undefined,
    search: searchParams.get('search') || undefined,
    featured: searchParams.get('featured') || undefined,
    isNew: searchParams.get('isNew') || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    page, sort, order, limit: 24,
  };

  const { data, isLoading } = useQuery<{
    data: any[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }>({
    queryKey: ['products', filters],
    queryFn: () => api.get('/products', { params: filters }).then(r => r.data),
    keepPreviousData: true,
  } as any);

  const products = data?.data || [];
  const pagination = data?.pagination;

  const applyPrice = () => setPage(1);
  const clearFilters = () => { setMinPrice(''); setMaxPrice(''); setPage(1); router.push('/shop'); };

  const hasFilters = activeCategory || minPrice || maxPrice || searchParams.get('featured') || searchParams.get('isNew');

  const FilterSidebar = () => (
    <div className="space-y-5">
      {/* Kategoriler */}
      <div>
        <button
          onClick={() => setCatExpanded(e => !e)}
          className="flex w-full items-center justify-between font-semibold text-gray-800 mb-2"
        >
          Kategoriler {catExpanded ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
        </button>
        {catExpanded && (
          <div className="max-h-72 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
            <Link
              href="/shop"
              className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${!activeCategory ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Tüm Ürünler
            </Link>
            {catData.map((cat: any) => (
              <div key={cat.id}>
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className={`block rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${activeCategory === cat.slug ? 'bg-brand-50 text-brand-600' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {cat.name}
                </Link>
                {/* Sadece aktif kategorinin alt kategorilerini göster */}
                {(activeCategory === cat.slug || cat.children?.some((c: any) => c.slug === activeCategory)) &&
                  cat.children?.map((child: any) => (
                    <Link
                      key={child.id}
                      href={`/shop?category=${child.slug}`}
                      className={`block rounded-lg pl-6 pr-3 py-1 text-xs transition-colors ${activeCategory === child.slug ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
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
          Fiyat Aralığı {priceExpanded ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
        </button>
        {priceExpanded && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                placeholder="Min ₺"
                className="input text-sm"
                min={0}
              />
              <input
                type="number"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                placeholder="Max ₺"
                className="input text-sm"
                min={0}
              />
            </div>
            <button onClick={applyPrice} className="w-full btn-primary text-sm py-1.5">
              Uygula
            </button>
          </div>
        )}
      </div>

      <hr />

      {/* Özel Filtreler */}
      <div className="space-y-1">
        <p className="font-semibold text-gray-800 mb-2">Özel</p>
        <Link href="/shop?featured=true" className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${searchParams.get('featured') ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
          ✨ Öne Çıkanlar
        </Link>
        <Link href="/shop?isNew=true" className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${searchParams.get('isNew') ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
          🆕 Yeni Gelenler
        </Link>
      </div>

      {hasFilters && (
        <button onClick={clearFilters} className="w-full btn-outline text-sm text-red-500 border-red-200 hover:bg-red-50">
          Filtreleri Temizle
        </button>
      )}
    </div>
  );

  return (
    <div className="container py-8">
      {/* Başlık + sıralama */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            {searchParams.get('search') ? `"${searchParams.get('search')}" için sonuçlar` :
             activeCategory ? (catData.find((c:any)=>c.slug===activeCategory) || catData.flatMap((c:any)=>c.children||[]).find((c:any)=>c.slug===activeCategory))?.name || 'Kategori Ürünleri' :
             searchParams.get('featured') ? '✨ Öne Çıkanlar' :
             searchParams.get('isNew') ? '🆕 Yeni Gelenler' : 'Tüm Ürünler'}
          </h1>
          {pagination && <p className="mt-0.5 text-sm text-gray-400">{pagination.total} ürün</p>}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={`${sort}-${order}`}
            onChange={e => { const [s,o] = e.target.value.split('-'); setSort(s); setOrder(o); setPage(1); }}
            className="input w-auto text-sm"
          >
            <option value="createdAt-desc">En Yeni</option>
            <option value="price-asc">Fiyat ↑</option>
            <option value="price-desc">Fiyat ↓</option>
            <option value="name-asc">A–Z</option>
          </select>
          {/* Mobil filtre butonu */}
          <button
            onClick={() => setFilterOpen(true)}
            className="lg:hidden btn-outline gap-1.5 text-sm"
          >
            <SlidersHorizontal size={15} /> Filtre
            {hasFilters && <span className="h-2 w-2 rounded-full bg-brand-600" />}
          </button>
        </div>
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
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-medium">Ürün bulunamadı</p>
              <p className="text-sm mt-1">Filtreleri değiştirmeyi deneyin</p>
              <button onClick={clearFilters} className="mt-4 btn-outline text-sm">Filtreleri Temizle</button>
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
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="h-9 px-3 rounded-lg text-sm border hover:border-brand-300 disabled:opacity-40">{'<'}</button>
              {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                const p = pagination.pages <= 7 ? i+1 : page <= 4 ? i+1 : page >= pagination.pages-3 ? pagination.pages-6+i : page-3+i;
                return (
                  <button key={p} onClick={() => setPage(p)} className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${p===page ? 'bg-brand-600 text-white' : 'bg-white border hover:border-brand-300 hover:text-brand-600'}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(pagination.pages, p+1))} disabled={page===pagination.pages} className="h-9 px-3 rounded-lg text-sm border hover:border-brand-300 disabled:opacity-40">{'>'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
