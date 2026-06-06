import Link from 'next/link';
import { ArrowRight, Shield, Truck, RefreshCw, Star, MessageCircle, Tag } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import HeroSlider from '@/components/layout/HeroSlider';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import SectionCarousel from '@/components/home/SectionCarousel';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const features = [
  { icon: Truck,     title: 'Hızlı Kargo',     desc: 'Sürat Kargo ile 1-3 iş günü teslimat' },
  { icon: Shield,    title: 'Güvenli Ödeme',    desc: '256-bit SSL şifreleme, İYZİCO güvencesi' },
  { icon: RefreshCw, title: 'Kolay İade',       desc: '14 gün içinde ücretsiz iade imkânı' },
  { icon: Star,      title: 'Premium Kalite',   desc: 'Sadece güvenilir marka ve tedarikçiler' },
];

/* ── Renkler: kategori adına göre sabit gradient ── */
const catColors: Record<string, { from: string; to: string; emoji: string }> = {
  default:              { from: '#6366f1', to: '#8b5cf6', emoji: '🛍️' },
  elektronik:           { from: '#3b82f6', to: '#1d4ed8', emoji: '💻' },
  giyim:                { from: '#ec4899', to: '#be185d', emoji: '👗' },
  moda:                 { from: '#f43f5e', to: '#be123c', emoji: '✨' },
  'ev & yaşam':         { from: '#f59e0b', to: '#d97706', emoji: '🏠' },
  'ev & mobilya':       { from: '#f59e0b', to: '#d97706', emoji: '🏠' },
  spor:                 { from: '#22c55e', to: '#15803d', emoji: '⚽' },
  kozmetik:             { from: '#a855f7', to: '#7e22ce', emoji: '💄' },
  'kitap':              { from: '#14b8a6', to: '#0f766e', emoji: '📚' },
  oyuncak:              { from: '#f97316', to: '#c2410c', emoji: '🧸' },
  'anne & bebek':       { from: '#fb7185', to: '#e11d48', emoji: '👶' },
  'hobi & eğlence':     { from: '#06b6d4', to: '#0e7490', emoji: '🎮' },
  'banyo':              { from: '#0ea5e9', to: '#0369a1', emoji: '🚿' },
  'otomobil':           { from: '#64748b', to: '#334155', emoji: '🚗' },
  çocuk:                { from: '#f97316', to: '#ea580c', emoji: '🎈' },
};

function getCatStyle(name: string) {
  const lower = name.toLowerCase();
  for (const key of Object.keys(catColors)) {
    if (lower.includes(key)) return catColors[key];
  }
  return catColors.default;
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
  const [discountProducts, topCategories, homepageSections] = await Promise.all([
    fetchJSON(`${API_URL}/products?hasDiscount=true&limit=8&sort=createdAt&order=desc`),
    getTopCategories(),
    getHomepageSections(),
  ]);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '905000000000';

  return (
    <div className="bg-gray-50">

      {/* ── 1. HERO ──────────────────────────────────────────────── */}
      <HeroSlider />

      {/* ── 2. GÜVEN ROZET ÇUBUĞU ───────────────────────────────── */}
      <section className="bg-white border-b">
        <div className="container">
          <div className="grid grid-cols-2 gap-0 divide-x divide-gray-100 md:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-3 px-6 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                  <f.icon size={19} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                  <p className="text-xs text-gray-400 leading-snug mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. KATEGORİ VİTRİNİ ─────────────────────────────────── */}
      <section className="container py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-1">Kategoriler</p>
            <h2 className="text-2xl font-black text-gray-900">Ne Arıyorsun?</h2>
          </div>
          <Link href="/shop" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
            Tümü <ArrowRight size={14} />
          </Link>
        </div>

        {topCategories.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {topCategories.map((cat: any) => {
              const style = getCatStyle(cat.name);
              return (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group relative overflow-hidden rounded-2xl p-4 text-center transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${style.from}, ${style.to})` }}
                >
                  <span className="block text-3xl mb-2">{style.emoji}</span>
                  <span className="block text-xs font-bold text-white leading-tight line-clamp-2">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Fallback: statik kategoriler */
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {[
              { name: 'Elektronik', slug: 'elektronik', emoji: '💻', from: '#3b82f6', to: '#1d4ed8' },
              { name: 'Giyim', slug: 'giyim', emoji: '👗', from: '#ec4899', to: '#be185d' },
              { name: 'Ev & Yaşam', slug: 'ev-yasam', emoji: '🏠', from: '#f59e0b', to: '#d97706' },
              { name: 'Spor', slug: 'spor', emoji: '⚽', from: '#22c55e', to: '#15803d' },
              { name: 'Kozmetik', slug: 'kozmetik', emoji: '💄', from: '#a855f7', to: '#7e22ce' },
              { name: 'Oyuncak', slug: 'oyuncak', emoji: '🧸', from: '#f97316', to: '#c2410c' },
              { name: 'Kitap', slug: 'kitap', emoji: '📚', from: '#14b8a6', to: '#0f766e' },
              { name: 'Çocuk', slug: 'cocuk', emoji: '🎈', from: '#f97316', to: '#ea580c' },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl p-4 text-center transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, ${cat.from}, ${cat.to})` }}
              >
                <span className="block text-3xl mb-2">{cat.emoji}</span>
                <span className="block text-xs font-bold text-white leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── 4. FLASH SALE / GÜNÜN FIRSATI (client) ──────────────── */}
      <FlashSaleSection products={discountProducts} />

      {/* ── 5. DİNAMİK BÖLÜMLER (admin'den yönetilen) ──────────── */}
      {homepageSections.length > 0 ? (
        homepageSections.map((section: any) => (
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
        ))
      ) : (
        discountProducts.length === 0 && (
          <section className="container py-12">
            <div className="rounded-3xl bg-white border-2 border-dashed border-gray-200 py-16 text-center">
              <p className="text-5xl mb-4">🏠</p>
              <h3 className="text-xl font-bold text-gray-700">Anasayfa henüz yapılandırılmadı</h3>
              <p className="text-gray-400 mt-2 mb-6">Admin panelinden <strong>Anasayfa Yönetimi</strong>'ne girerek bölüm ekle.</p>
              <Link href="/shop" className="btn-primary inline-flex">Tüm Ürünlere Bak</Link>
            </div>
          </section>
        )
      )}

      {/* ── 7. İSTATİSTİKLER ────────────────────────────────────── */}
      <section className="bg-white border-y py-10">
        <div className="container grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
          {[
            { value: '10.000+', label: 'Mutlu Müşteri' },
            { value: '50.000+', label: 'Başarılı Sipariş' },
            { value: '31.000+', label: 'Ürün Çeşidi' },
            { value: '4.8/5',   label: 'Ortalama Puan' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-3xl font-black text-brand-600">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. MÜŞTERİ YORUMLARI ────────────────────────────────── */}
      <section className="container py-12">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-1">Yorumlar</p>
          <h2 className="text-2xl font-black text-gray-900">Müşterilerimiz Ne Diyor?</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            { name: 'Ahmet Y.', city: 'İstanbul', rating: 5, text: 'Ürünler gerçekten kaliteli ve kargo çok hızlıydı. 2 günde kapımdaydı. Kesinlikle tavsiye ederim!' },
            { name: 'Elif K.',  city: 'Ankara',   rating: 5, text: 'İlk alışverişimdi, çok memnun kaldım. Ürün açıklamadaki gibi geldi, iade politikası da çok rahat.' },
            { name: 'Murat D.', city: 'İzmir',    rating: 4, text: 'Fiyat/performans açısından çok iyi. Müşteri hizmetleri de sorularıma hızlıca cevap verdi.' },
          ].map((review, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
              <div className="flex gap-0.5 mb-3">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={14} className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                ))}
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
      </section>

      {/* ── 9. BÜLTEN ────────────────────────────────────────────── */}
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
            <div className="flex w-full max-w-md gap-2">
              <input type="email" placeholder="E-posta adresiniz" className="input flex-1 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white" />
              <button className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand-700 hover:bg-brand-50 transition-colors">
                Kayıt Ol
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. CTA BANNER ──────────────────────────────────────── */}
      <section className="container py-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 py-12 text-center text-white">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #f97316 0%, transparent 50%), radial-gradient(circle at 80% 50%, #6366f1 0%, transparent 50%)' }} />
          <div className="relative z-10">
            <h2 className="text-3xl font-black">Üye Ol, Ayrıcalıkları Kazan</h2>
            <p className="mt-3 text-gray-300">İlk alışverişine özel <strong className="text-orange-400">%10 indirim</strong> ve özel fırsatlardan yararlan.</p>
            <Link href="/auth/register" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-3 font-semibold text-white hover:bg-brand-700 transition-colors">
              Hemen Üye Ol <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── WhatsApp Floating ────────────────────────────────────── */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=Merhaba%2C%20sipari%C5%9F%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-all hover:scale-110"
        aria-label="WhatsApp"
      >
        <MessageCircle size={26} fill="white" />
      </a>
    </div>
  );
}
