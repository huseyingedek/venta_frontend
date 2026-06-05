'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Zap, Package, Sparkles } from 'lucide-react';

const slides = [
  {
    id: 1,
    badge: '🆕 Yeni Sezon',
    title: 'Yeni Sezon\nKoleksiyonu Geldi',
    titleAccent: 'Koleksiyonu',
    subtitle: 'En yeni trendler, en uygun fiyatlar. Binlerce ürün arasından seni bekleyenler var.',
    cta: { label: 'Koleksiyonu Keşfet', href: '/shop?isNew=true' },
    ctaSecondary: { label: 'Öne Çıkanlar', href: '/shop?featured=true' },
    bg: 'from-[#0f172a] to-[#1e293b]',
    accent: '#f97316',
    accentLight: 'rgba(249,115,22,0.15)',
    tag: 'bg-orange-500/20 text-orange-300',
    icon: Sparkles,
    deco: [
      { size: 320, x: '75%', y: '-30%', opacity: 0.06 },
      { size: 200, x: '85%', y: '50%', opacity: 0.04 },
      { size: 120, x: '60%', y: '70%', opacity: 0.05 },
    ],
  },
  {
    id: 2,
    badge: '⚡ Flash Sale',
    title: 'Seçili Ürünlerde\n%50 İndirim',
    titleAccent: '%50 İndirim',
    subtitle: 'Sınırlı stok, sınırlı süre! Fırsatları kaçırmadan sepetine ekle.',
    cta: { label: 'Fırsatları Gör', href: '/shop?featured=true' },
    ctaSecondary: { label: 'Tüm Ürünler', href: '/shop' },
    bg: 'from-[#7c2d12] to-[#991b1b]',
    accent: '#fbbf24',
    accentLight: 'rgba(251,191,36,0.12)',
    tag: 'bg-yellow-400/20 text-yellow-300',
    icon: Zap,
    deco: [
      { size: 280, x: '70%', y: '-20%', opacity: 0.08 },
      { size: 180, x: '80%', y: '55%', opacity: 0.05 },
      { size: 100, x: '55%', y: '65%', opacity: 0.06 },
    ],
  },
  {
    id: 3,
    badge: '🚚 Kargo Kampanyası',
    title: 'Tüm Siparişlerde\nÜcretsiz Kargo',
    titleAccent: 'Ücretsiz Kargo',
    subtitle: '500 TL ve üzeri tüm siparişlerde ücretsiz kargo. Hemen alışverişe başla!',
    cta: { label: 'Alışverişe Başla', href: '/shop' },
    ctaSecondary: { label: 'Kampanyalar', href: '/shop?featured=true' },
    bg: 'from-[#064e3b] to-[#065f46]',
    accent: '#34d399',
    accentLight: 'rgba(52,211,153,0.12)',
    tag: 'bg-emerald-400/20 text-emerald-300',
    icon: Package,
    deco: [
      { size: 300, x: '72%', y: '-25%', opacity: 0.07 },
      { size: 190, x: '82%', y: '52%', opacity: 0.05 },
      { size: 110, x: '58%', y: '68%', opacity: 0.06 },
    ],
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((index: number) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 500);
  }, [animating]);

  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);

  // Otomatik geçiş — 5 saniye
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div className="relative overflow-hidden select-none">
      {/* Slide içeriği */}
      <div
        className={`bg-gradient-to-br ${slide.bg} transition-all duration-500 ease-in-out`}
        style={{ minHeight: '480px' }}
      >
        {/* Dekoratif çemberler */}
        {slide.deco.map((d, i) => (
          <div
            key={i}
            className="pointer-events-none absolute rounded-full"
            style={{
              width: d.size,
              height: d.size,
              left: d.x,
              top: d.y,
              background: slide.accentLight,
              opacity: d.opacity * 10,
              transform: 'translate(-50%, -50%)',
              transition: 'all 0.5s ease',
            }}
          />
        ))}

        <div className="container relative py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Sol — Metin */}
            <div
              className={`text-white transition-all duration-500 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
            >
              {/* Badge */}
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-5 ${slide.tag}`}>
                <Icon size={12} />
                {slide.badge}
              </span>

              {/* Başlık */}
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl mb-4 whitespace-pre-line">
                {slide.title.split(slide.titleAccent)[0]}
                <span style={{ color: slide.accent }}>{slide.titleAccent}</span>
                {slide.title.split(slide.titleAccent)[1]}
              </h1>

              {/* Alt metin */}
              <p className="text-base text-gray-300 leading-relaxed mb-8 max-w-md">
                {slide.subtitle}
              </p>

              {/* CTA Butonlar */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={slide.cta.href}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-sm transition-all hover:opacity-90 hover:gap-3"
                  style={{ backgroundColor: slide.accent, color: '#0f172a' }}
                >
                  {slide.cta.label} <ArrowRight size={16} />
                </Link>
                <Link
                  href={slide.ctaSecondary.href}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-sm text-white transition-all hover:bg-white/20"
                >
                  {slide.ctaSecondary.label}
                </Link>
              </div>

              {/* Mini güven rozetleri */}
              <div className="mt-8 flex flex-wrap gap-4 text-xs text-gray-400">
                {['🔒 Güvenli Ödeme', '🚀 Hızlı Teslimat', '↩️ Kolay İade'].map(b => (
                  <span key={b}>{b}</span>
                ))}
              </div>
            </div>

            {/* Sağ — Dekoratif kart */}
            <div
              className={`hidden md:flex items-center justify-center transition-all duration-500 ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
            >
              <div className="relative">
                {/* Büyük dekoratif ikon */}
                <div
                  className="flex h-48 w-48 items-center justify-center rounded-3xl"
                  style={{ backgroundColor: slide.accentLight, border: `1px solid ${slide.accent}30` }}
                >
                  <Icon size={80} style={{ color: slide.accent, opacity: 0.8 }} />
                </div>
                {/* Floating badge 1 */}
                <div
                  className="absolute -top-4 -right-8 rounded-2xl px-4 py-2 text-sm font-bold shadow-xl"
                  style={{ backgroundColor: slide.accent, color: '#0f172a' }}
                >
                  {slide.id === 1 ? 'Yeni' : slide.id === 2 ? '%50 Off' : 'Ücretsiz'}
                </div>
                {/* Floating badge 2 */}
                <div className="absolute -bottom-4 -left-8 rounded-2xl bg-white/10 border border-white/20 px-4 py-2 text-xs text-white backdrop-blur-sm">
                  {slide.id === 1 ? '500+ Yeni Ürün' : slide.id === 2 ? 'Sınırlı Süre' : '500 TL Üzeri'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sol/Sağ ok butonları */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 border border-white/20"
        aria-label="Önceki"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 border border-white/20"
        aria-label="Sonraki"
      >
        <ChevronRight size={20} />
      </button>

      {/* Nokta navigasyonu */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              backgroundColor: i === current ? slides[current].accent : 'rgba(255,255,255,0.3)',
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        <div
          className="h-full transition-none"
          style={{
            backgroundColor: slide.accent,
            animation: 'progress 6s linear infinite',
            width: '100%',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
