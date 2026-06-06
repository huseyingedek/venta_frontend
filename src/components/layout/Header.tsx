'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, User, Menu, X, Heart, ChevronDown, MailWarning, Package } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import api from '@/lib/api';
import Image from 'next/image';
import toast from 'react-hot-toast';

/* ─── Sosyal medya ikonları (SVG) ─────────────────────────────────── */
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

/* ─── Kategori öğesi + mega dropdown ─────────────────────────────── */
function CatItem({ cat }: { cat: any }) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), 180);
  };
  const handleLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(false), 120);
  };

  if (!cat.children?.length) {
    return (
      <Link
        href={`/shop?category=${cat.slug}`}
        className="flex items-center px-3.5 py-3 text-[13px] font-semibold text-gray-700 whitespace-nowrap hover:text-brand-600 transition-colors border-b-2 border-transparent hover:border-brand-600 h-full"
      >
        {cat.name}
      </Link>
    );
  }

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <Link
        href={`/shop?category=${cat.slug}`}
        className={`flex items-center gap-1 px-3.5 py-3 text-[13px] font-semibold whitespace-nowrap transition-colors border-b-2 h-full ${open ? 'text-brand-600 border-brand-600' : 'text-gray-700 border-transparent hover:text-brand-600 hover:border-brand-600'}`}
      >
        {cat.name}
        <ChevronDown size={11} className={`transition-transform duration-200 opacity-50 ${open ? 'rotate-180 opacity-100' : ''}`} />
      </Link>

      {/* Mega dropdown */}
      {open && (
        <div
          className="fixed left-0 right-0 z-40"
          style={{ top: 'var(--nav-bottom, 160px)' }}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          {/* Koyu arka plan overlay — tıklayınca kapatır */}
          <div className="fixed inset-0 bg-black/20 -z-10" onClick={() => setOpen(false)} />
          <div className="container relative z-50">
            <div className="h-0.5 bg-brand-600" />
            <div className="bg-white border border-t-0 border-gray-200 shadow-2xl p-6 max-h-[65vh] overflow-y-auto">
              <div
                className="grid gap-x-8 gap-y-5"
                style={{ gridTemplateColumns: `repeat(${Math.min(Math.ceil(cat.children.length / 3), 4)}, 1fr)` }}
              >
                {cat.children.map((sub: any) => (
                  <div key={sub.id}>
                    <Link
                      href={`/shop?category=${sub.slug}`}
                      onClick={() => setOpen(false)}
                      className="block text-sm font-bold text-brand-600 hover:text-brand-700 mb-1.5 leading-tight"
                    >
                      {sub.name}
                    </Link>
                    {sub.children?.length > 0 && (
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {sub.children.map((child: any, i: number) => (
                          <span key={child.id}>
                            <Link
                              href={`/shop?category=${child.slug}`}
                              onClick={() => setOpen(false)}
                              className="hover:text-brand-600 hover:underline transition-colors"
                            >
                              {child.name}
                            </Link>
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
  const [isMenuOpen, setIsMenuOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled]   = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router    = useRouter();

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
    const fn = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Mega dropdown top pozisyonunu header yüksekliğine göre ayarla
  useEffect(() => {
    const updateNavBottom = () => {
      const header = document.querySelector('header');
      if (header) {
        document.documentElement.style.setProperty('--nav-bottom', `${header.getBoundingClientRect().bottom}px`);
      }
    };
    updateNavBottom();
    window.addEventListener('resize', updateNavBottom);
    window.addEventListener('scroll', updateNavBottom);
    return () => {
      window.removeEventListener('resize', updateNavBottom);
      window.removeEventListener('scroll', updateNavBottom);
    };
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const fn = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('#user-menu-container')) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [userMenuOpen]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!searchRef.current?.contains(e.target as Node)) setSearchFocus(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchFocus(false);
    }
  };

  const goToProduct = (slug: string) => {
    setSearchQuery(''); setSearchFocus(false);
    router.push(`/product/${slug}`);
  };

  const getImgSrc = (url: string) =>
    url?.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${url}`;

  const showSuggestions = searchFocus && searchQuery.trim().length >= 2;
  const cartCount = totalItems();

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>

      {/* ── 1. KATMAN: Üst bilgi çubuğu — scroll'da gizlenir ─────── */}
      <div
        className="border-b border-gray-100 bg-gray-50 overflow-hidden transition-all duration-300"
        style={{ maxHeight: isScrolled ? '0px' : '40px', opacity: isScrolled ? 0 : 1 }}
      >
        <div className="container flex h-9 items-center justify-between text-xs text-gray-500">
          {/* Sol: yardım linkleri */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/account/orders" className="hover:text-brand-600 transition-colors">Sipariş Takip</Link>
            <span className="text-gray-200">|</span>
            <Link href="/shop" className="hover:text-brand-600 transition-colors">Sıkça Sorulan Sorular</Link>
            <span className="text-gray-200">|</span>
            <Link href="/shop" className="hover:text-brand-600 transition-colors">Blog</Link>
            <span className="text-gray-200">|</span>
            <Link href="/shop" className="hover:text-brand-600 transition-colors">İletişim</Link>
          </div>
          <span className="md:hidden text-gray-400">Güvenli Alışveriş</span>
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
            <span className="truncate">E-posta adresiniz doğrulanmadı. Sipariş vermek için lütfen doğrulayın.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => resendVerification.mutate()}
              disabled={resendVerification.isPending}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2"
            >
              {resendVerification.isPending ? 'Gönderiliyor...' : 'Tekrar Gönder'}
            </button>
            <button onClick={() => setBannerDismissed(true)} className="text-amber-400 hover:text-amber-600">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── 2. KATMAN: Logo + Arama + Hesap/Sepet ───────────────── */}
      <div className="border-b border-gray-100">
        <div className={`container flex items-center gap-4 md:gap-6 transition-all duration-300 ${isScrolled ? 'h-14' : 'h-20'}`}>

          {/* Mobil hamburger */}
          <button className="md:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 overflow-visible">
            <Image
              src="/logo.png"
              alt="Venta Premium"
              width={1254}
              height={1254}
              className="object-contain"
              style={{
                height: isScrolled ? '52px' : '72px',
                width: isScrolled ? '52px' : '72px',
                transform: isScrolled ? 'scale(1.5)' : 'scale(1.9)',
                transformOrigin: 'left center',
                marginRight: isScrolled ? '42px' : '68px',
                transition: 'all 0.3s ease',
              }}
              priority
            />
          </Link>

          {/* Arama çubuğu */}
          <div ref={searchRef} className="hidden md:flex flex-1 relative">
            <form onSubmit={handleSearch} className="w-full flex">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                placeholder="Aramak istediğin ürünü yaz, kolayca bul!"
                className={`flex-1 h-11 rounded-l-xl border border-r-0 border-gray-300 px-4 text-sm outline-none focus:border-brand-500 transition-colors ${showSuggestions ? 'rounded-bl-none' : ''}`}
              />
              <button
                type="submit"
                className="h-11 px-6 rounded-r-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 transition-colors flex items-center gap-2 shrink-0"
              >
                <Search size={16} />
                ARA
              </button>
            </form>

            {/* Öneri dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 z-50 rounded-b-2xl border border-t-0 border-gray-200 bg-white shadow-xl overflow-hidden">
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
                          {product.thumbnail
                            ? <Image src={getImgSrc(product.thumbnail)} alt={product.name} width={40} height={40} className="h-full w-full object-cover" />
                            : <div className="h-full flex items-center justify-center text-lg">📦</div>}
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
                      <Search size={13} /> "{searchQuery}" için tüm sonuçları gör
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sağ: Hesabım + Favoriler + Sepet */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Hesabım */}
            {isAuthenticated ? (
              <div id="user-menu-container" className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:border-brand-400 hover:bg-brand-50 transition-all"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
                    {user?.firstName?.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400 leading-none">Merhaba,</p>
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.firstName}</p>
                  </div>
                  <ChevronDown size={13} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-white shadow-xl border border-gray-100 py-1 z-50">
                    <Link href="/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                      <User size={14} className="text-gray-400" /> Hesabım
                    </Link>
                    <Link href="/account/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                      <Package size={14} className="text-gray-400" /> Siparişlerim
                    </Link>
                    {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-600 hover:bg-brand-50 transition-colors">
                        ⚙️ Admin Panel
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={() => { setUserMenuOpen(false); logout(); }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden md:flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:border-brand-400 hover:bg-brand-50 transition-all"
              >
                <User size={16} className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-400 leading-none">Giriş Yap /</p>
                  <p className="text-sm font-semibold text-gray-800 leading-tight">Hesabım</p>
                </div>
              </Link>
            )}

            {/* Favoriler */}
            <Link
              href="/wishlist"
              className="hidden md:flex flex-col items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-gray-600 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 transition-all"
              title="Favorilerim"
            >
              <Heart size={18} />
              <span className="text-[10px] mt-0.5 font-medium">Favoriler</span>
            </Link>

            {/* Sepet */}
            <Link
              href="/cart"
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 transition-colors relative"
            >
              <div className="relative">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-black text-brand-700">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] text-brand-200 leading-none">Sepetim</p>
                <p className="text-sm font-bold leading-tight">{cartCount} Ürün</p>
              </div>
            </Link>

          </div>
        </div>
      </div>

      {/* ── 3. KATMAN: Kategori navigasyonu ─────────────────────── */}
      <nav className="hidden md:block bg-white border-b border-gray-200">
        {/* Renkli üst şerit */}
        <div className="h-1 w-full" style={{
          background: 'linear-gradient(to right, #e53e3e, #dd6b20, #d69e2e, #38a169, #3182ce, #805ad5, #d53f8c)'
        }} />

        {/* Kategori çubuğu */}
        <div className="container relative">
          <div className="flex items-stretch">

            {/* İlk 8 kategori doğrudan göster */}
            {categories.slice(0, 8).map((cat: any) => (
              <CatItem key={cat.id} cat={cat} />
            ))}

            {/* Daha Fazla — kalan kategoriler */}
            {categories.length > 8 && (
              <div className="group relative">
                <button className="flex items-center gap-1 px-3.5 py-3 text-[13px] font-semibold text-gray-700 whitespace-nowrap hover:text-brand-600 transition-colors border-b-2 border-transparent group-hover:border-brand-600 group-hover:text-brand-600 h-full">
                  Daha Fazla <ChevronDown size={11} className="opacity-50 group-hover:rotate-180 transition-transform duration-200" />
                </button>
                <div className="absolute top-full left-0 z-50 hidden group-hover:block bg-white border border-gray-200 shadow-xl rounded-b-xl py-1 min-w-[200px]">
                  {categories.slice(8).map((cat: any) => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${cat.slug}`}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </nav>

      {/* ── Mobil menü ───────────────────────────────────────────── */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white shadow-lg">
          {/* Mobil arama */}
          <div className="p-3 border-b">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Ürün ara..."
                className="flex-1 h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-brand-500"
              />
              <button type="submit" className="h-10 px-4 rounded-lg bg-brand-600 text-white text-sm font-bold">
                ARA
              </button>
            </form>
          </div>
          <nav className="flex flex-col divide-y divide-gray-50 py-1">
            <Link href="/shop" className="px-4 py-3 text-sm font-semibold text-gray-800" onClick={() => setIsMenuOpen(false)}>Tüm Ürünler</Link>
            {categories.slice(0, 8).map((cat: any) => (
              <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="px-4 py-3 text-sm text-gray-600" onClick={() => setIsMenuOpen(false)}>
                {cat.name}
              </Link>
            ))}
            <div className="px-4 py-3 border-t mt-1">
              {isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <Link href="/account" className="text-sm text-gray-700" onClick={() => setIsMenuOpen(false)}>Hesabım</Link>
                  <Link href="/account/orders" className="text-sm text-gray-700" onClick={() => setIsMenuOpen(false)}>Siparişlerim</Link>
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-left text-sm text-red-500">Çıkış Yap</button>
                </div>
              ) : (
                <Link href="/auth/login" className="text-sm font-semibold text-brand-600" onClick={() => setIsMenuOpen(false)}>Giriş Yap / Üye Ol</Link>
              )}
            </div>
          </nav>
        </div>
      )}

    </header>
  );
}
