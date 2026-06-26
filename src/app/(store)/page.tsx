import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Truck, RefreshCw, Star, Tag, Zap, Sparkles, TrendingUp } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import SectionCarousel from '@/components/home/SectionCarousel';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ventapremium.com.tr/api/v1';

const features = [
  { icon: Truck,     title: 'Hızlı Kargo',     desc: 'Sürat Kargo ile 1-3 iş günü' },
  { icon: Shield,    title: 'Güvenli Ödeme',    desc: '256-bit SSL + İYZİCO güvencesi' },
  { icon: RefreshCw, title: 'Kolay İade',       desc: '14 gün içinde ücretsiz iade' },
  { icon: Star,      title: 'Premium Kalite',   desc: 'Güvenilir marka ve tedarikçiler' },
];

const UNSPLASH = {
  kozmetik: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80&auto=format&fit=crop',
  kitap:    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80&auto=format&fit=crop',
  otomotiv: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80&auto=format&fit=crop',
  default:  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80&auto=format&fit=crop',
};

/* Slug eşlemesi — slug ASCII olduğu için encoding sorunu olmaz */
const BY_SLUG: Record<string, string> = {
  'elektronik':             '/elektronikk.png',
  'giyim-moda':             '/kadin.png',
  'kadin':                  '/kadin.png',
  'kadin-giyim':            '/kadin.png',
  'ev-yasam':               '/evmobilya.png',
  'ev-mobilya':             '/evmobilya.png',
  'spor-outdoor':           '/spor.png',
  'spor':                   '/spor.png',
  'oyuncak-hobi':           '/hobi.png',
  'hobi':                   '/hobi.png',
  'anne-bebek':             '/annebebekcocuk.png',
  'cocuk':                  '/annebebekcocuk.png',
  'aksesuar':               '/aksesuar.png',
  'kirtasiye':              '/krtasiye.png',
  'kozmetik-kisisel-bakim': UNSPLASH.kozmetik,
  'kozmetik':               UNSPLASH.kozmetik,
  'kitap-muzik-film':       UNSPLASH.kitap,
  'kitap':                  UNSPLASH.kitap,
  'otomotiv':               UNSPLASH.otomotiv,
};

/* İsim bazlı fallback — slug eşleşmezse */
const BY_NAME: [string, string][] = [
  ['elektronik', '/elektronikk.png'],
  ['giyim',      '/kadin.png'],
  ['moda',       '/kadin.png'],
  ['kadin',      '/kadin.png'],
  ['kadın', '/kadin.png'], // ı harfi (U+0131)
  ['ev &',       '/evmobilya.png'],
  ['mobilya',    '/evmobilya.png'],
  ['spor',       '/spor.png'],
  ['oyuncak',    '/hobi.png'],
  ['hobi',       '/hobi.png'],
  ['anne',       '/annebebekcocuk.png'],
  ['bebek',      '/annebebekcocuk.png'],
  ['aksesuar',   '/aksesuar.png'],
  ['kırtasiye', '/krtasiye.png'], // kırtasiye
  ['kirtasiye',  '/krtasiye.png'],
  ['kozmetik',   UNSPLASH.kozmetik],
  ['kitap',      UNSPLASH.kitap],
  ['otomot',     UNSPLASH.otomotiv],
];

function getCatImage(name: string, slug?: string): string {
  if (slug) {
    const s = slug.toLowerCase();
    if (BY_SLUG[s]) return BY_SLUG[s];
    // slug içinde anahtar geçiyor mu? (örn. "elektronik-urunler")
    for (const key of Object.keys(BY_SLUG)) {
      if (s.includes(key) || key.includes(s)) return BY_SLUG[key];
    }
  }
  const lower = (name || '').toLowerCase();
  for (const [key, url] of BY_NAME) {
    if (lower.includes(key)) return url;
  }
  return UNSPLASH.default;
}

async function fetchJSON(url: string, revalidate = 60) {
  try {
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch { return []; }
}

async function getTopCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []).filter((c: any) => !c.parentId && c.isActive).slice(0, 8);
  } catch { return []; }
}

async function getHomepageSections() {
  try {
    const res = await fetch(`${API_URL}/homepage/sections`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch { return []; }
}

export default async function HomePage() {
  const [discountProducts, featuredProducts, newProducts, topCategories, homepageSections] = await Promise.all([
    fetchJSON(`${API_URL}/products?hasDiscount=true&limit=8&sort=createdAt&order=desc`),
    fetchJSON(`${API_URL}/products?featured=true&limit=10&sort=createdAt&order=desc`),
    fetchJSON(`${API_URL}/products?isNew=true&limit=10&sort=createdAt&order=desc`),
    getTopCategories(),
    getHomepageSections(),
  ]);

  return (
    <div className="bg-gray-50">


      {/* ── 3. ÖNE ÇIKAN ÜRÜNLER ────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="container py-7 sm:py-10">
          <div className="flex items-end justify-between mb-5 sm:mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-1 flex items-center gap-1.5">
                <Sparkles size={11} /> Öne Çıkanlar
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">Öne Çıkan Ürünler</h2>
            </div>
            <Link href="/shop?featured=true" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              Tümünü Gör <ArrowRight size={14} />
            </Link>
          </div>
          <SectionCarousel products={featuredProducts} />
        </section>
      )}

      {/* ── 4. PROMOSYON BANNER 1 ────────────────────────────────── */}
      <section className="container py-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Banner 1 */}
          <Link href="/shop?hasDiscount=true" className="group relative overflow-hidden rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Zap size={26} className="text-yellow-300" fill="currentColor" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-red-200">Flash Fırsat</p>
              <p className="text-lg font-black text-white leading-tight">%50'ye Kadar<br/>İndirim</p>
            </div>
            <ArrowRight size={18} className="ml-auto text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
          {/* Banner 2 */}
          <Link href="/shop?isNew=true" className="group relative overflow-hidden rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)' }}>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Sparkles size={26} className="text-purple-200" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-purple-200">Yeni Gelenler</p>
              <p className="text-lg font-black text-white leading-tight">Yeni Sezon<br/>Ürünleri</p>
            </div>
            <ArrowRight size={18} className="ml-auto text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
          {/* Banner 3 */}
          <Link href="/shop" className="group relative overflow-hidden rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg transition-all hover:-translate-y-0.5 sm:col-span-2 lg:col-span-1"
            style={{ background: 'linear-gradient(135deg, #0369a1 0%, #075985 100%)' }}>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <TrendingUp size={26} className="text-sky-200" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-sky-200">En Çok Satan</p>
              <p className="text-lg font-black text-white leading-tight">Popüler<br/>Ürünler</p>
            </div>
            <ArrowRight size={18} className="ml-auto text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </section>

      {/* ── 5. KATEGORİ VİTRİNİ (geliştirilmiş) ────────────────── */}
      <section className="container py-6 sm:py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-1">Kategoriler</p>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">Ne Arıyorsun?</h2>
          </div>
          <Link href="/shop" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
            Tüm Kategoriler <ArrowRight size={14} />
          </Link>
        </div>

        {topCategories.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
            {topCategories.slice(0, 8).map((cat: any) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative block overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ aspectRatio: '3/4' }}
              >
                {/* Fotoğraf */}
                <Image
                  src={getCatImage(cat.name, cat.slug)}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
                {/* Koyu gradyan — alt metin okunabilirliği */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/0 transition-opacity duration-300 group-hover:from-black/85" />
                {/* İsim + ürün sayısı */}
                <div className="absolute bottom-0 left-0 right-0 p-3.5">
                  <p className="text-sm font-bold text-white leading-tight">{cat.name}</p>
                  {cat._count?.products > 0 && (
                    <p className="text-[11px] text-white/60 mt-0.5">{cat._count.products.toLocaleString('tr-TR')} ürün</p>
                  )}
                </div>
                {/* Hover: keşfet rozeti */}
                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/0 px-2.5 py-1 text-[10px] font-semibold text-white/0 transition-all duration-300 group-hover:bg-white/20 group-hover:text-white group-hover:backdrop-blur-sm">
                  Keşfet <ArrowRight size={9} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
            {[
              { name: 'Elektronik',  slug: 'elektronik' },
              { name: 'Giyim',       slug: 'giyim'       },
              { name: 'Ev & Yaşam',  slug: 'ev-yasam'    },
              { name: 'Spor',        slug: 'spor'         },
              { name: 'Kozmetik',    slug: 'kozmetik'     },
              { name: 'Oyuncak',     slug: 'oyuncak'      },
              { name: 'Kitap',       slug: 'kitap'        },
              { name: 'Çocuk',       slug: 'cocuk'        },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="group relative block overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ aspectRatio: '3/4' }}
              >
                <Image
                  src={getCatImage(cat.name, cat.slug)}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/0 transition-opacity duration-300 group-hover:from-black/85" />
                <div className="absolute bottom-0 left-0 right-0 p-3.5">
                  <p className="text-sm font-bold text-white">{cat.name}</p>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/0 px-2.5 py-1 text-[10px] font-semibold text-white/0 transition-all duration-300 group-hover:bg-white/20 group-hover:text-white group-hover:backdrop-blur-sm">
                  Keşfet <ArrowRight size={9} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── 6. FLASH SALE / GÜNÜN FIRSATI ───────────────────────── */}
      <FlashSaleSection products={discountProducts} />

      {/* ── 7. YENİ GELENLER ────────────────────────────────────── */}
      {newProducts.length > 0 && (
        <section className="py-10">
          <div className="container mb-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-purple-500 mb-1 flex items-center gap-1.5">
                  <Sparkles size={11} /> Yeni Sezon
                </p>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900">Yeni Gelenler</h2>
              </div>
              <Link href="/shop?isNew=true" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                Tümünü Gör <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div className="container">
            <SectionCarousel products={newProducts} />
          </div>
        </section>
      )}

      {/* ── 8. BÜYÜK PROMOSYON BANNER ───────────────────────────── */}
      <section className="container py-4">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl px-5 sm:px-8 py-8 sm:py-10 md:py-12"
          style={{ background: 'linear-gradient(135deg, #f97316 0%, #dc2626 50%, #9333ea 100%)' }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 0%, transparent 50%), radial-gradient(circle at 80% 50%, #fff 0%, transparent 50%)' }} />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">Özel Kampanya</p>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black">İlk Alışverişte <span className="underline decoration-wavy decoration-white/50">%10 İndirim</span></h3>
              <p className="mt-2 text-white/80 text-sm">Üye ol, özel kampanyaları kaçırma. Sınırlı süre!</p>
            </div>
            <Link href="/auth/register"
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-brand-700 hover:bg-gray-50 transition-colors shadow-lg">
              Hemen Üye Ol <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 9. DİNAMİK BÖLÜMLER (admin'den yönetilen) ──────────── */}
      {homepageSections.length > 0 && homepageSections.map((section: any) => (
        section.products?.length > 0 && (
          <section key={section.id} className="py-10">
            <div className="container mb-6">
              <div className="flex items-end justify-between">
                <div>
                  {section.subtitle && (
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-1">{section.subtitle}</p>
                  )}
                  <h2 className="text-2xl font-black text-gray-900">{section.title}</h2>
                </div>
                {section.linkUrl && (
                  <Link href={section.linkUrl} className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                    Tümünü Gör <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>
            <div className="container">
              <SectionCarousel products={section.products} />
            </div>
          </section>
        )
      ))}

      {/* ── 10. İSTATİSTİKLER ───────────────────────────────────── */}
      <section className="bg-white border-y py-8 sm:py-10">
        <div className="container grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
          {[
            { value: '10.000+', label: 'Mutlu Müşteri',    icon: '😊' },
            { value: '50.000+', label: 'Başarılı Sipariş', icon: '📦' },
            { value: '31.000+', label: 'Ürün Çeşidi',      icon: '🛍️' },
            { value: '4.8/5',   label: 'Ortalama Puan',    icon: '⭐' },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-2xl mb-1">{stat.icon}</span>
              <p className="text-3xl font-black text-brand-600">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 11. NEDEN BİZ ───────────────────────────────────────── */}
      <section className="container py-8 sm:py-12">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-1">Avantajlar</p>
          <h2 className="text-2xl font-black text-gray-900">Neden Venta Premium?</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: '🚀', title: 'Hızlı Teslimat',
              desc: 'Siparişin 1-3 iş günü içinde kapında. Sürat Kargo güvencesiyle.',
              color: 'from-orange-50 to-amber-50 border-orange-100',
            },
            {
              icon: '🔒', title: 'Güvenli Alışveriş',
              desc: 'İYZİCO altyapısı ve 256-bit SSL şifreleme ile her ödeme güvende.',
              color: 'from-blue-50 to-sky-50 border-blue-100',
            },
            {
              icon: '↩️', title: 'Kolay İade',
              desc: '14 gün içinde, ücretsiz iade imkânı. Hiçbir soru sorulmaz.',
              color: 'from-green-50 to-emerald-50 border-green-100',
            },
            {
              icon: '💎', title: 'Premium Ürünler',
              desc: 'Yalnızca güvenilir tedarikçilerden, kalite kontrollü ürünler.',
              color: 'from-purple-50 to-violet-50 border-purple-100',
            },
          ].map((item) => (
            <div key={item.title} className={`rounded-2xl border bg-gradient-to-br ${item.color} p-6`}>
              <span className="text-3xl mb-3 block">{item.icon}</span>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 12. MÜŞTERİ YORUMLARI ───────────────────────────────── */}
      <section className="bg-white border-y py-12">
        <div className="container">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-1">Yorumlar</p>
            <h2 className="text-2xl font-black text-gray-900">Müşterilerimiz Ne Diyor?</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              { name: 'Ahmet Y.', city: 'İstanbul', rating: 5, text: 'Ürünler gerçekten kaliteli ve kargo çok hızlıydı. 2 günde kapımdaydı. Kesinlikle tavsiye ederim!', product: 'Elektronik' },
              { name: 'Elif K.',  city: 'Ankara',   rating: 5, text: 'İlk alışverişimdi, çok memnun kaldım. Ürün açıklamadaki gibi geldi, iade politikası da çok rahat.', product: 'Giyim' },
              { name: 'Murat D.', city: 'İzmir',    rating: 4, text: 'Fiyat/performans açısından çok iyi. Müşteri hizmetleri de sorularıma hızlıca cevap verdi.', product: 'Ev & Yaşam' },
            ].map((review, i) => (
              <div key={i} className="rounded-2xl bg-gray-50 border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={14} className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-200/70 px-2 py-0.5 rounded-full">{review.product}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{review.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{review.name}</p>
                    <p className="text-xs text-gray-400">{review.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 13. BÜLTEN ──────────────────────────────────────────── */}
      <section className="border-y bg-brand-600 py-12">
        <div className="container">
          <div className="flex flex-col items-center text-center md:flex-row md:text-left md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                <Tag size={18} className="text-white/70" />
                <span className="text-sm font-semibold text-white/70 uppercase tracking-wide">Özel Fırsatlar</span>
              </div>
              <h3 className="text-xl font-bold text-white">Kampanyaları Kaçırma!</h3>
              <p className="mt-1 text-sm text-brand-100">E-posta listemize katıl, özel indirimleri ilk sen öğren.</p>
            </div>
            <div className="flex w-full sm:max-w-md gap-2">
              <input type="email" placeholder="E-posta adresiniz"
                className="input flex-1 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white" />
              <button className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand-700 hover:bg-brand-50 transition-colors">
                Kayıt Ol
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
