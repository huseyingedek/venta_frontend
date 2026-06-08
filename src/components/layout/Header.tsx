'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, User, Menu, X, Heart, ChevronDown, MailWarning, Package, Home, Tag } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import api from '@/lib/api';
import Image from 'next/image';
import toast from 'react-hot-toast';

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const IconTwitter = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
);
const IconYoutube = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
);

function CatItem({ cat }: { cat: any }) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleEnter = () => { if (timerRef.current) clearTimeout(timerRef.current); timerRef.current = setTimeout(() => setOpen(true), 180); };
  const handleLeave = () => { if (timerRef.current) clearTimeout(timerRef.current); timerRef.current = setTimeout(() => setOpen(false), 120); };

  if (!cat.children?.length) {
    return (
      <Link href={`/shop?category=${cat.slug}`} className="flex items-center px-3.5 py-3 text-[13px] font-semibold text-gray-700 whitespace-nowrap hover:text-brand-600 transition-colors border-b-2 border-transparent hover:border-brand-600 h-full">
        {cat.name}
      </Link>
    );
  }

  return (
    <div onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <Link href={`/shop?category=${cat.slug}`} className={`flex items-center gap-1 px-3.5 py-3 text-[13px] font-semibold whitespace-nowrap transition-colors border-b-2 h-full ${open ? 'text-brand-600 border-brand-600' : 'text-gray-700 border-transparent hover:text-brand-600 hover:border-brand-600'}`}>
        {cat.name}
        <ChevronDown size={11} className={`transition-transform duration-200 opacity-50 ${open ? 'rotate-180 opacity-100' : ''}`} />
      </Link>
      {open && (
        <div className="absolute left-0 right-0 z-50" style={{ top: '100%' }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
          <div className="h-0.5 bg-brand-600" />
          <div className="bg-white border border-t-0 border-gray-200 shadow-2xl">
            <div className="container py-6">
              <div className="grid gap-x-8 gap-y-5" style={{ gridTemplateColumns: `repeat(${Math.min(Math.ceil(cat.children.length / 3), 4)}, 1fr)` }}>
                {cat.children.map((sub: any) => (
                  <div key={sub.id}>
                    <Link href={`/shop?category=${sub.slug}`} onClick={() => setOpen(false)} className="block text-sm font-bold text-brand-600 hover:text-brand-700 mb-1.5 leading-tight">{sub.name}</Link>
                    {sub.children?.length > 0 && (
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {sub.children.map((child: any, i: number) => (
                          <span key={child.id}>
                            <Link href={`/shop?category=${child.slug}`} onClick={() => setOpen(false)} className="hover:text-brand-600 hover:underline transition-colors">{child.name}</Link>
                            {i < sub.children.length - 1 && <span className="text-gray-300"> , </span>}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen]             = useState(false);
  const [searchQuery, setSearchQuery]           = useState('');
  const [searchFocus, setSearchFocus]           = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen]         = useState(false);
  const [isScrolled, setIsScrolled]             = useState(false);
  const [bannerDismissed, setBannerDismissed]   = useState(false);
  const searchRef       = useRef<HTMLDivElement>(null);
  const mobileInputRef  = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { isAuthenticated, user, logout } = useAuthStore();
  const { totalItems, fetchCart }         = useCartStore();
  const showVerifyBanner = isAuthenticated && user && !user.emailVerified && !bannerDismissed;

  const resendVerification = useMutation({
    mutationFn: () => api.post('/auth/resend-verification'),
    onSuccess: () => toast.success('Doğrulama maili tekrar gönderildi!'),
    onError:   () => toast.error('Gönderilemedi, lütfen tekrar deneyin.'),
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['nav-categories'],
    queryFn:  () => api.get('/categories').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: searchResults } = useQuery({
    queryKey: ['search-suggest', searchQuery],
    queryFn:  () => api.get('/products', { params: { search: searchQuery, limit: 6 } }).then(r => r.data.data),
    enabled:  searchQuery.trim().length >= 2,
    staleTime: 10000,
  });

  useEffect(() => { if (isAuthenticated) fetchCart(); }, [isAuthenticated]);

  useEffect(() => {
    const fn = () => {
      const y = window.scrollY;
      if (y > 80) setIsScrolled(true);
      else if (y < 30) setIsScrolled(false);
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (mobileSearchOpen) setTimeout(() => mobileInputRef.current?.focus(), 100);
  }, [mobileSearchOpen]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const fn = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('#user-menu-container')) setUserMenuOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [userMenuOpen]);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (!searchRef.current?.contains(e.target as Node)) setSearchFocus(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchFocus(false); setMobileSearchOpen(false); setSearchQuery('');
    }
  };

  const goToProduct = (slug: string) => {
    setSearchQuery(''); setSearchFocus(false); setMobileSearchOpen(false);
    router.push(`/product/${slug}`);
  };

  const getImgSrc = (url: string) =>
    url?.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${url}`;

  const showSuggestions = searchFocus && searchQuery.trim().length >= 2;
  const cartCount = totalItems();

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>

      {/* ── 1. Üst bilgi çubuğu ─────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-gray-50 overflow-hidden transition-all duration-300"
        style={{ maxHeight: isScrolled ? '0px' : '40px', opacity: isScrolled ? 0 : 1 }}>
        <div className="container flex h-9 items-center justify-between text-xs text-gray-500">
          <div className="hidden md:flex items-center gap-4">
            <Link href="/account/orders" className="hover:text-brand-600 transition-colors">Sipariş Takip</Link>
            <span className="text-gray-200">|</span>
            <Link href="/shop" className="hover:text-brand-600 transition-colors">Sıkça Sorulan Sorular</Link>
            <span className="text-gray-200">|</span>
            <Link href="/shop" className="hover:text-brand-600 transition-colors">İletişim</Link>
          </div>
          <span className="md:hidden text-gray-400 text-[11px]">🔒 Güvenli Alışveriş</span>
          <div className="flex items-center gap-3 text-gray-400">
            <a href="#" aria-label="Facebook"  className="hover:text-blue-600 transition-colors"><IconFacebook /></a>
            <a href="#" aria-label="Twitter"   className="hover:text-gray-800 transition-colors"><IconTwitter /></a>
            <a href="#" aria-label="Instagram" className="hover:text-pink-600 transition-colors"><IconInstagram /></a>
            <a href="#" aria-label="YouTube"   className="hover:text-red-600  transition-colors"><IconYoutube /></a>
          </div>
        </div>
      </div>

      {/* E-posta doğrulama banner */}
      {showVerifyBanner && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-amber-800 flex-1 min-w-0">
            <MailWarning size={15} className="shrink-0 text-amber-500" />
            <span className="truncate text-xs sm:text-sm">E-posta adresiniz doğrulanmadı. Sipariş vermek için lütfen doğrulayın.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => resendVerification.mutate()} disabled={resendVerification.isPending} className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2">
              {resendVerification.isPending ? 'Gönderiliyor...' : 'Tekrar Gönder'}
            </button>
            <button onClick={() => setBannerDismissed(true)} className="text-amber-400 hover:text-amber-600"><X size={14} /></button>
          </div>
        </div>
      )}

      {/* ── 2. Logo + Arama + İkonlar ────────────────────────────── */}
      <div className="border-b border-gray-100">
        <div className={`container flex items-center gap-2 md:gap-6 transition-all duration-300 ${isScrolled ? 'h-14' : 'h-16 md:h-20'}`}>

          {/* Hamburger */}
          <button className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors shrink-0" onClick={() => setIsMenuOpen(true)} aria-label="Menü">
            <Menu size={20} className="text-gray-700" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 overflow-visible">
            <Image src="/logo.png" alt="Venta Premium" width={1254} height={1254} className="object-contain"
              style={{ height: isScrolled ? '44px' : '54px', width: isScrolled ? '44px' : '54px', transform: isScrolled ? 'scale(1.4)' : 'scale(1.65)', transformOrigin: 'left center', marginRight: isScrolled ? '34px' : '48px', transition: 'all 0.3s ease' }}
              priority />
          </Link>

          {/* Masaüstü arama */}
          <div ref={searchRef} className="hidden md:flex flex-1 relative">
            <form onSubmit={handleSearch} className="w-full flex">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => setSearchFocus(true)}
                placeholder="Aramak istediğin ürünü yaz, kolayca bul!"
                className={`flex-1 h-11 rounded-l-xl border border-r-0 border-gray-300 px-4 text-sm outline-none focus:border-brand-500 transition-colors ${showSuggestions ? 'rounded-bl-none' : ''}`} />
              <button type="submit" className="h-11 px-6 rounded-r-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 transition-colors flex items-center gap-2 shrink-0">
                <Search size={16} /> ARA
              </button>
            </form>
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 z-50 rounded-b-2xl border border-t-0 border-gray-200 bg-white shadow-xl overflow-hidden">
                {!searchResults || searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-400">Sonuç bulunamadı</div>
                ) : (
                  <>
                    {searchResults.map((product: any) => (
                      <button key={product.id} onClick={() => goToProduct(product.slug)} className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          {product.thumbnail ? <Image src={getImgSrc(product.thumbnail)} alt={product.name} width={40} height={40} className="h-full w-full object-cover" /> : <div className="h-full flex items-center justify-center text-lg">📦</div>}
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
                    <button onClick={() => { router.push(`/shop?search=${encodeURIComponent(searchQuery)}`); setSearchFocus(false); }} className="flex w-full items-center justify-center gap-2 border-t py-2.5 text-sm text-brand-600 hover:bg-brand-50 transition-colors">
                      <Search size={13} /> "{searchQuery}" için tüm sonuçları gör
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Flex spacer */}
          <div className="flex-1 md:hidden" />

          {/* Sağ ikonlar */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* Mobil arama ikonu */}
            <button onClick={() => setMobileSearchOpen(o => !o)}
              className={`md:hidden flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${mobileSearchOpen ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600 hover:bg-brand-50 hover:text-brand-600'}`}
              aria-label="Ara">
              {mobileSearchOpen ? <X size={17} /> : <Search size={17} />}
            </button>

            {/* Mobil favori ikonu */}
            <Link href="/wishlist" className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all" aria-label="Favorilerim">
              <Heart size={17} />
            </Link>

            {/* Masaüstü hesabım */}
            {isAuthenticated ? (
              <div id="user-menu-container" className="relative hidden md:block">
                <button onClick={() => setUserMenuOpen(o => !o)} className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:border-brand-400 hover:bg-brand-50 transition-all">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold">{user?.firstName?.charAt(0)}</div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400 leading-none">Merhaba,</p>
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.firstName}</p>
                  </div>
                  <ChevronDown size={13} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-white shadow-xl border border-gray-100 py-1 z-50">
                    <Link href="/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"><User size={14} className="text-gray-400" /> Hesabım</Link>
                    <Link href="/account/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"><Package size={14} className="text-gray-400" /> Siparişlerim</Link>
                    {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-600 hover:bg-brand-50 transition-colors">⚙️ Admin Panel</Link>
                    )}
                    <hr className="my-1" />
                    <button onClick={() => { setUserMenuOpen(false); logout(); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">Çıkış Yap</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="hidden md:flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:border-brand-400 hover:bg-brand-50 transition-all">
                <User size={16} className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-400 leading-none">Giriş Yap /</p>
                  <p className="text-sm font-semibold text-gray-800 leading-tight">Hesabım</p>
                </div>
              </Link>
            )}

            {/* Masaüstü favoriler */}
            <Link href="/wishlist" className="hidden md:flex flex-col items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-gray-600 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 transition-all" title="Favorilerim">
              <Heart size={18} />
              <span className="text-[10px] mt-0.5 font-medium">Favoriler</span>
            </Link>

            {/* Sepet */}
            <Link href="/cart" className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-brand-600 px-2.5 sm:px-4 py-2 text-white hover:bg-brand-700 transition-colors relative">
              <div className="relative">
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-black text-brand-700">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] text-brand-200 leading-none">Sepetim</p>
                <p className="text-xs sm:text-sm font-bold leading-tight">{cartCount} Ürün</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Mobil arama çubuğu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileSearchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
          <form onSubmit={handleSearch} className="flex gap-2 px-4 pb-3 pt-1">
            <input ref={mobileInputRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Ürün ara..." className="flex-1 h-10 rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-brand-500" />
            <button type="submit" className="h-10 px-4 rounded-xl bg-brand-600 text-white font-bold text-sm shrink-0">ARA</button>
          </form>
        </div>
      </div>

      {/* ── 3. Masaüstü kategori nav ─────────────────────────────── */}
      <nav className="hidden md:block bg-white border-b border-gray-200 relative">
        <div className="h-1 w-full" style={{ background: 'linear-gradient(to right, #e53e3e, #dd6b20, #d69e2e, #38a169, #3182ce, #805ad5, #d53f8c)' }} />
        <div className="container">
          <div className="flex items-stretch">
            {categories.slice(0, 8).map((cat: any) => <CatItem key={cat.id} cat={cat} />)}
            {categories.length > 8 && (
              <div className="group relative">
                <button className="flex items-center gap-1 px-3.5 py-3 text-[13px] font-semibold text-gray-700 whitespace-nowrap hover:text-brand-600 transition-colors border-b-2 border-transparent group-hover:border-brand-600 group-hover:text-brand-600 h-full">
                  Daha Fazla <ChevronDown size={11} className="opacity-50 group-hover:rotate-180 transition-transform duration-200" />
                </button>
                <div className="absolute top-full left-0 z-50 hidden group-hover:block bg-white border border-gray-200 shadow-xl rounded-b-xl py-1 min-w-[200px]">
                  {categories.slice(8).map((cat: any) => (
                    <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">{cat.name}</Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobil menü drawer (soldan açılır) ────────────────────── */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[280px] bg-white shadow-2xl flex flex-col">

            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 h-14 border-b bg-brand-600 shrink-0">
              <span className="text-white font-bold">Menü</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Kullanıcı bölümü */}
            <div className="px-4 py-3 bg-brand-50 border-b shrink-0">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-sm shrink-0">
                    {user?.firstName?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center rounded-xl bg-brand-600 py-2 text-sm font-semibold text-white">Giriş Yap</Link>
                  <Link href="/auth/register" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center rounded-xl border border-brand-600 py-2 text-sm font-semibold text-brand-600">Üye Ol</Link>
                </div>
              )}
            </div>

            {/* Hızlı ikonlar */}
            <div className="grid grid-cols-3 border-b shrink-0">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center gap-1 py-3 text-gray-600 hover:bg-gray-50 transition-colors">
                <Home size={17} className="text-brand-600" />
                <span className="text-[11px] font-medium">Ana Sayfa</span>
              </Link>
              <Link href="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center gap-1 py-3 text-gray-600 hover:bg-gray-50 transition-colors border-x border-gray-100">
                <Heart size={17} className="text-red-500" />
                <span className="text-[11px] font-medium">Favoriler</span>
              </Link>
              <Link href="/cart" onClick={() => setIsMenuOpen(false)} className="relative flex flex-col items-center gap-1 py-3 text-gray-600 hover:bg-gray-50 transition-colors">
                <ShoppingCart size={17} className="text-brand-600" />
                {cartCount > 0 && <span className="absolute top-1.5 right-6 h-4 w-4 flex items-center justify-center rounded-full bg-brand-600 text-white text-[10px] font-bold">{cartCount}</span>}
                <span className="text-[11px] font-medium">Sepetim</span>
              </Link>
            </div>

            {/* Scroll içerik */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="px-4 pt-3 pb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Kategoriler</p>
              </div>
              <nav>
                <Link href="/shop" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 border-b border-gray-50 transition-colors">
                  <Tag size={14} /> Tüm Ürünler
                </Link>
                {(categories as any[]).map((cat: any) => (
                  <Link key={cat.id} href={`/shop?category=${cat.slug}`} onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 transition-colors">
                    <span>{cat.name}</span>
                    {cat._count?.products > 0 && <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{cat._count.products}</span>}
                  </Link>
                ))}

                {isAuthenticated && (
                  <>
                    <div className="px-4 pt-3 pb-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Hesabım</p>
                    </div>
                    <Link href="/account" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 transition-colors">
                      <User size={14} className="text-gray-400" /> Profilim
                    </Link>
                    <Link href="/account/orders" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 transition-colors">
                      <Package size={14} className="text-gray-400" /> Siparişlerim
                    </Link>
                    {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                      <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-600 hover:bg-brand-50 border-b border-gray-50 transition-colors">
                        ⚙️ Admin Panel
                      </Link>
                    )}
                  </>
                )}
              </nav>
            </div>

            {/* Footer — çıkış */}
            {isAuthenticated && (
              <div className="border-t p-3 shrink-0">
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
