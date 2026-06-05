import Link from 'next/link';
import { ArrowRight, Shield, Truck, RefreshCw, Star } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import HeroSlider from '@/components/layout/HeroSlider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const features = [
  { icon: Truck, title: 'Hızlı Kargo', desc: '500 TL üzeri ücretsiz, 1-3 iş günü teslimat' },
  { icon: Shield, title: 'Güvenli Ödeme', desc: '256-bit SSL şifreleme, İYZİCO güvencesi' },
  { icon: RefreshCw, title: 'Kolay İade', desc: '14 gün içinde ücretsiz iade imkânı' },
  { icon: Star, title: 'Premium Kalite', desc: 'Sadece güvenilir marka ve tedarikçiler' },
];

const categories = [
  { name: 'Elektronik', slug: 'elektronik', emoji: '💻', bg: 'from-blue-500 to-blue-700' },
  { name: 'Giyim & Moda', slug: 'giyim-moda', emoji: '👗', bg: 'from-pink-500 to-rose-600' },
  { name: 'Ev & Yaşam', slug: 'ev-yasam', emoji: '🏠', bg: 'from-amber-500 to-orange-600' },
  { name: 'Spor & Outdoor', slug: 'spor-outdoor', emoji: '⚽', bg: 'from-green-500 to-emerald-600' },
  { name: 'Kozmetik', slug: 'kozmetik-kisisel-bakim', emoji: '✨', bg: 'from-purple-500 to-violet-600' },
  { name: 'Kitap & Müzik', slug: 'kitap-muzik-film', emoji: '📚', bg: 'from-teal-500 to-cyan-600' },
];

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${API_URL}/products?featured=true&limit=8&sort=createdAt&order=desc`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

async function getNewProducts() {
  try {
    const res = await fetch(`${API_URL}/products?isNew=true&limit=4&sort=createdAt&order=desc`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featuredProducts, newProducts] = await Promise.all([
    getFeaturedProducts(),
    getNewProducts(),
  ]);

  return (
    <div>
      {/* Hero Slider */}
      <HeroSlider />

      {/* Özellikler */}
      <section className="border-y bg-white py-10">
        <div className="container">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="rounded-xl bg-brand-50 p-2.5">
                  <f.icon size={20} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kategoriler */}
      <section className="container py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Kategoriler</h2>
          <Link href="/shop" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
            Tümü <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className={`group flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${cat.bg} p-6 text-white transition-transform hover:scale-105`}
            >
              <span className="text-3xl mb-2">{cat.emoji}</span>
              <span className="text-sm font-semibold text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Öne Çıkan Ürünler */}
      {featuredProducts.length > 0 && (
        <section className="container pb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">✨ Öne Çıkan Ürünler</h2>
              <p className="text-sm text-gray-500 mt-1">Editörlerimizin seçtiği özel ürünler</p>
            </div>
            <Link href="/shop?featured=true" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              Tümünü Gör <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Yeni Ürünler */}
      {newProducts.length > 0 && (
        <section className="container pb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">🆕 Yeni Gelenler</h2>
              <p className="text-sm text-gray-500 mt-1">En son eklenen ürünler</p>
            </div>
            <Link href="/shop?isNew=true" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              Tümünü Gör <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {newProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Ürün yoksa statik placeholder */}
      {featuredProducts.length === 0 && newProducts.length === 0 && (
        <section className="container pb-14">
          <div className="rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 py-16 text-center">
            <p className="text-4xl mb-4">📦</p>
            <h3 className="text-xl font-bold text-gray-700">Ürünler Yükleniyor</h3>
            <p className="text-gray-400 mt-2 mb-6">Admin panelinden ürün ekleyin veya XML feed entegre edin.</p>
            <Link href="/shop" className="btn-primary inline-flex">Tüm Ürünleri Gör</Link>
          </div>
        </section>
      )}

      {/* İstatistikler */}
      <section className="border-y bg-gray-50 py-10">
        <div className="container">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
            {[
              { value: '10.000+', label: 'Mutlu Müşteri' },
              { value: '50.000+', label: 'Başarılı Sipariş' },
              { value: '5.000+', label: 'Ürün Çeşidi' },
              { value: '4.8/5', label: 'Ortalama Puan' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-brand-600">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Müşteri Yorumları */}
      <section className="container py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold">Müşterilerimiz Ne Diyor?</h2>
          <p className="mt-2 text-gray-500">Binlerce mutlu müşterimizden bazıları</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            { name: 'Ahmet Y.', city: 'İstanbul', rating: 5, text: 'Ürünler gerçekten kaliteli ve kargo çok hızlıydı. 2 günde kapımdaydı. Kesinlikle tavsiye ederim!' },
            { name: 'Elif K.', city: 'Ankara', rating: 5, text: 'İlk alışverişimdi, çok memnun kaldım. Ürün açıklamadaki gibi geldi, iade politikası da çok rahat.' },
            { name: 'Murat D.', city: 'İzmir', rating: 4, text: 'Fiyat/performans açısından çok iyi. Müşteri hizmetleri de sorularıma hızlıca cevap verdi.' },
          ].map((review, i) => (
            <div key={i} className="card p-6">
              <div className="flex items-center gap-1 mb-3">
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

      {/* CTA Banner */}
      <section className="container pb-14">
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-12 text-center text-white">
          <h2 className="text-3xl font-bold">Üye Ol, Ayrıcalıkları Kazan</h2>
          <p className="mt-3 text-brand-100">İlk alışverişine özel %10 indirim ve özel fırsatlardan yararlan.</p>
          <Link href="/auth/register" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 font-semibold text-brand-700 hover:bg-brand-50 transition-colors">
            Hemen Üye Ol <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
