'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, User, Menu, X, Heart, ChevronDown, MailWarning } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import api from '@/lib/api';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const showVerifyBanner = isAuthenticated && user && !user.emailVerified && !bannerDismissed;

  const resendVerification = useMutation({
    mutationFn: () => api.post('/auth/resend-verification'),
    onSuccess: () => toast.success('Doğrulama maili tekrar gönderildi!'),
    onError: () => toast.error('Gönderilemedi, lütfen tekrar deneyin.'),
  });
  const { totalItems, fetchCart } = useCartStore();

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['nav-categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  // Canlı arama
  const { data: searchResults } = useQuery({
    queryKey: ['search-suggest', searchQuery],
    queryFn: () => api.get('/products', { params: { search: searchQuery, limit: 5 } }).then(r => r.data.data),
    enabled: searchQuery.trim().length >= 2,
    staleTime: 10000,
  });

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('#user-menu-container')) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  // Arama dışına tıklayınca kapat
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!searchRef.current?.contains(e.target as Node)) setSearchFocus(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchFocus(false);
    }
  };

  const goToProduct = (slug: string) => {
    setSearchQuery('');
    setSearchFocus(false);
    router.push(`/product/${slug}`);
  };

  const getImgSrc = (url: string) =>
    url?.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${url}`;

  const showSuggestions = searchFocus && searchQuery.trim().length >= 2;

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow ${isScrolled ? 'shadow-md' : 'border-b border-gray-100'}`}>
      <div className="bg-dark text-white py-1.5 text-center text-xs">
        Hızlı Teslimat — Sürat Kargo 🚚 &nbsp;|&nbsp; Güvenli Ödeme — İYZİCO 🔒
      </div>

      {/* E-posta doğrulama banner */}
      {showVerifyBanner && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-amber-800 flex-1 min-w-0">
            <MailWarning size={15} className="shrink-0 text-amber-500" />
            <span className="truncate">
              E-posta adresiniz doğrulanmadı. Sipariş vermek için lütfen doğrulayın.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => resendVerification.mutate()}
              disabled={resendVerification.isPending}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors"
            >
              {resendVerification.isPending ? 'Gönderiliyor...' : 'Tekrar Gönder'}
            </button>
            <button onClick={() => setBannerDismissed(true)} className="text-amber-400 hover:text-amber-600 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="container">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="font-display text-2xl font-bold text-dark">
              venta<span className="text-brand-600">premium</span>
            </span>
          </Link>

          {/* Arama + Autocomplete */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl relative">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocus(true)}
                  placeholder="Ürün, kategori veya marka ara..."
                  className={`input pr-12 rounded-full border-gray-200 focus:border-brand-400 ${showSuggestions ? 'rounded-b-none border-b-transparent' : ''}`}
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600">
                  <Search size={18} />
                </button>
              </div>
            </form>

            {/* Öneri dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 z-50 rounded-b-2xl border border-t-0 border-gray-200 bg-white shadow-lg overflow-hidden">
                {!searchResults || searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-400">Sonuç bulunamadı</div>
                ) : (
                  <>
                    {searchResults.map((product: any) => (
                      <button
                        key={product.id}
                        onClick={() => goToProduct(product.slug)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          {product.thumbnail ? (
                            <Image src={getImgSrc(product.thumbnail)} alt={product.name} width={40} height={40} className="h-full w-full object-cover" />
                          ) : <div className="h-full flex items-center justify-center text-lg">📦</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.category?.name}</p>
                        </div>
                        <span className="text-sm font-semibold text-brand-600 shrink-0">
                          {Number(product.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </span>
                      </button>
                    ))}
                    <button
                      onClick={() => { router.push(`/shop?search=${encodeURIComponent(searchQuery)}`); setSearchFocus(false); }}
                      className="flex w-full items-center justify-center gap-2 border-t py-2.5 text-sm text-brand-600 hover:bg-brand-50 transition-colors"
                    >
                      <Search size={14} /> "{searchQuery}" için tüm sonuçlar
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sağ aksiyonlar */}
          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <div id="user-menu-container" className="relative hidden md:block">
                <button onClick={() => setUserMenuOpen(o => !o)} className="btn-ghost gap-1.5">
                  <User size={18} />
                  <span className="text-sm">{user?.firstName}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white shadow-lg border border-gray-100 py-1 z-50">
                    <Link href="/account" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors">Hesabım</Link>
                    <Link href="/account/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors">Siparişlerim</Link>
                    {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-brand-600 hover:bg-gray-50 transition-colors">Admin Panel</Link>
                    )}
                    <hr className="my-1" />
                    <button onClick={() => { setUserMenuOpen(false); logout(); }} className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-50 transition-colors">
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="btn-ghost hidden md:inline-flex">
                <User size={18} /><span>Giriş Yap</span>
              </Link>
            )}

            <Link href="/wishlist" className="btn-ghost hidden md:inline-flex" title="Favorilerim">
              <Heart size={18} />
            </Link>

            <Link href="/cart" className="relative btn-ghost">
              <ShoppingCart size={20} />
              {totalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                  {totalItems() > 9 ? '9+' : totalItems()}
                </span>
              )}
            </Link>

            <button className="btn-ghost md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Kategori nav */}
        <nav className="hidden md:flex items-center gap-1 py-2 border-t border-gray-50 text-sm">
          <Link href="/shop" className="px-3 py-1.5 font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50 rounded-lg transition-colors whitespace-nowrap">
            Tüm Ürünler
          </Link>
          {categories.slice(0, 7).map((cat: any) => (
            <div key={cat.id} className="relative group">
              <Link
                href={`/shop?category=${cat.slug}`}
                className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-brand-600 hover:bg-gray-50 rounded-lg transition-colors whitespace-nowrap"
              >
                {cat.name}
                {cat.children?.length > 0 && <ChevronDown size={12} className="opacity-50" />}
              </Link>
              {cat.children?.length > 0 && (
                <div className="absolute top-full left-0 z-50 hidden group-hover:block bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 min-w-[180px]">
                  {cat.children.map((child: any) => (
                    <Link key={child.id} href={`/shop?category=${child.slug}`} className="block px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-colors">
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          {categories.length > 7 && (
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-1.5 text-gray-500 hover:text-brand-600 hover:bg-gray-50 rounded-lg transition-colors whitespace-nowrap">
                Daha Fazla <ChevronDown size={12} />
              </button>
              <div className="absolute top-full left-0 z-50 hidden group-hover:block bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 min-w-[180px] max-h-64 overflow-y-auto">
                {categories.slice(7).map((cat: any) => (
                  <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="block px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-colors">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <Link href="/shop?featured=true" className="ml-auto px-3 py-1.5 text-brand-600 font-medium hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors whitespace-nowrap">
            ✨ Öne Çıkanlar
          </Link>
        </nav>
      </div>

      {/* Mobil menü */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 pb-4 pt-2">
          <form onSubmit={handleSearch} className="mb-3">
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Ürün ara..." className="input rounded-full" />
          </form>
          <nav className="flex flex-col gap-1">
            <Link href="/shop" className="py-2 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>Tüm Ürünler</Link>
            {categories.slice(0, 5).map((cat: any) => (
              <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="py-2 text-sm text-gray-600" onClick={() => setIsMenuOpen(false)}>{cat.name}</Link>
            ))}
            <hr className="my-1" />
            {isAuthenticated ? (
              <>
                <Link href="/account" className="py-2 text-sm" onClick={() => setIsMenuOpen(false)}>Hesabım</Link>
                <Link href="/account/orders" className="py-2 text-sm" onClick={() => setIsMenuOpen(false)}>Siparişlerim</Link>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="py-2 text-left text-sm text-red-500">Çıkış Yap</button>
              </>
            ) : (
              <Link href="/auth/login" className="py-2 text-sm font-medium text-brand-600" onClick={() => setIsMenuOpen(false)}>Giriş Yap</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
