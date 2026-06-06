'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, ArrowRight,
  Zap, ShieldCheck, Sparkles, Star,
  Truck, RotateCcw, Lock, BadgePercent,
  ShoppingBag, TrendingUp,
} from 'lucide-react';

/* ─── Slide verileri ─────────────────────────────────────────────── */
const slides = [
  {
    id: 1,
    badge: '🆕 Yeni Sezon',
    title: ['Yeni Sezon', 'Koleksiyonunu', 'Keşfet'],
    accentLine: 1,           // hangi satır accent rengi alır (0-indexed)
    subtitle: 'En yeni trendler, en uygun fiyatlar. Binlerce ürün arasından seni bekleyenler var.',
    cta:  { label: 'Koleksiyonu Gör', href: '/shop?isNew=true' },
    cta2: { label: 'Öne Çıkanlar',    href: '/shop?featured=true' },
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f2b4a 100%)',
    accent:   '#f97316',
    accentRgb:'249,115,22',
    badgeCls: 'bg-orange-500/15 text-orange-300 border border-orange-500/20',
  },
  {
    id: 2,
    badge: '⚡ Flash Sale',
    title: ['Seçili Ürünlerde', '%50\'ye Kadar', 'İndirim'],
    accentLine: 1,
    subtitle: 'Sınırlı stok, sınırlı süre! En iyi fırsatları kaçırmadan sepetine ekle.',
    cta:  { label: 'Fırsatları Gör', href: '/shop?featured=true' },
    cta2: { label: 'Tüm Ürünler',   href: '/shop' },
    gradient: 'linear-gradient(135deg, #1c0a00 0%, #7c2d12 50%, #991b1b 100%)',
    accent:   '#fbbf24',
    accentRgb:'251,191,36',
    badgeCls: 'bg-yellow-400/15 text-yellow-300 border border-yellow-400/20',
  },
  {
    id: 3,
    badge: '🔒 Güvenli Alışveriş',
    title: ['İYZİCO Güvencesiyle', 'Güvenli ve Hızlı', 'Alışveriş'],
    accentLine: 1,
    subtitle: '256-bit SSL şifreleme ve İYZİCO altyapısıyla ödemeleriniz her zaman güvende.',
    cta:  { label: 'Alışverişe Başla', href: '/shop' },
    cta2: { label: 'Öne Çıkanlar',    href: '/shop?featured=true' },
    gradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #065f46 100%)',
    accent:   '#34d399',
    accentRgb:'52,211,153',
    badgeCls: 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/20',
  },
];

/* ─── Sağ panel bileşenleri (slide'a göre farklı) ───────────────── */
function SlideVisual({ slide, animating }: { slide: typeof slides[0]; animating: boolean }) {
  const base = `transition-all duration-700 ${animating ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`;

  if (slide.id === 1) return (
    <div className={`${base} relative w-full max-w-sm mx-auto`}>
      {/* Kategori kartları 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { emoji: '💻', label: 'Elektronik',  slug: 'elektronik',            col:'from-blue-600/30 to-blue-900/40' },
          { emoji: '👗', label: 'Giyim & Moda', slug: 'giyim-moda',           col:'from-pink-600/30 to-rose-900/40' },
          { emoji: '🏠', label: 'Ev & Yaşam',  slug: 'ev-yasam',              col:'from-amber-500/30 to-orange-900/40' },
          { emoji: '✨', label: 'Kozmetik',    slug: 'kozmetik-kisisel-bakim', col:'from-purple-600/30 to-violet-900/40' },
        ].map((c) => (
          <Link
            key={c.slug}
            href={`/shop?category=${c.slug}`}
            className={`group flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br ${c.col} border border-white/10 py-5 backdrop-blur-sm hover:border-white/25 transition-all hover:scale-[1.03]`}
          >
            <span className="text-3xl">{c.emoji}</span>
            <span className="text-xs font-semibold text-white/80">{c.label}</span>
          </Link>
        ))}
      </div>
      {/* Floating stat */}
      <div
        className="absolute -bottom-4 -right-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 backdrop-blur-md shadow-xl"
        style={{ animationDelay: '0.3s' }}
      >
        <Star size={14} className="fill-amber-400 text-amber-400" />
        <span className="text-sm font-bold text-white">4.8</span>
        <span className="text-xs text-white/60">· 10K+ müşteri</span>
      </div>
      {/* Floating yeni ürün sayısı */}
      <div
        className="absolute -top-4 -left-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-md shadow-xl"
      >
        <p className="text-xs text-white/60">Yeni ürün</p>
        <p className="text-lg font-black text-white">500+</p>
      </div>
    </div>
  );

  if (slide.id === 2) return (
    <div className={`${base} relative w-full max-w-sm mx-auto flex items-center justify-center`}>
      {/* Büyük indirim rozeti */}
      <div className="relative">
        <div
          className="flex h-52 w-52 flex-col items-center justify-center rounded-full border-4 shadow-2xl"
          style={{
            borderColor: slide.accent,
            background: `radial-gradient(circle, rgba(${slide.accentRgb},0.15) 0%, rgba(${slide.accentRgb},0.05) 100%)`,
            boxShadow: `0 0 60px rgba(${slide.accentRgb},0.3)`,
          }}
        >
          <Zap size={28} style={{ color: slide.accent }} className="mb-1" />
          <span className="text-6xl font-black" style={{ color: slide.accent }}>50%</span>
          <span className="text-sm font-semibold text-white/70 mt-1">İndirime kadar</span>
        </div>
        {/* Floating fiyat kartı */}
        <div className="absolute -top-3 -right-12 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 backdrop-blur-md shadow-xl">
          <p className="text-xs text-white/50 line-through">₺499</p>
          <p className="text-base font-black" style={{ color: slide.accent }}>₺249</p>
        </div>
        {/* Floating acil badge */}
        <div
          className="absolute -bottom-3 -left-12 flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-bold shadow-xl"
          style={{ backgroundColor: slide.accent, color: '#1c0a00' }}
        >
          <BadgePercent size={14} />
          Sınırlı Süre
        </div>
      </div>
      {/* Sağda floating ürün sayısı */}
      <div className="absolute right-0 top-1/4 flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-md">
        <ShoppingBag size={18} style={{ color: slide.accent }} />
        <span className="text-xs font-bold text-white">500+</span>
        <span className="text-[10px] text-white/50">ürün</span>
      </div>
    </div>
  );

  // Slide 3 — Güvenli ödeme
  return (
    <div className={`${base} relative w-full max-w-sm mx-auto`}>
      {/* Merkez güvenlik kartı */}
      <div
        className="rounded-3xl border border-white/10 p-6 backdrop-blur-sm"
        style={{ background: `rgba(${slide.accentRgb},0.06)` }}
      >
        {/* İyzico benzeri kart üstü */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: `rgba(${slide.accentRgb},0.2)` }}
            >
              <Lock size={16} style={{ color: slide.accent }} />
            </div>
            <div>
              <p className="text-xs text-white/50">Ödeme</p>
              <p className="text-sm font-bold text-white">İYZİCO Güvenceli</p>
            </div>
          </div>
          <ShieldCheck size={24} style={{ color: slide.accent }} />
        </div>
        {/* Özellik satırları */}
        {[
          { icon: Lock,      label: '256-bit SSL Şifreleme' },
          { icon: ShieldCheck,label: 'İYZİCO Altyapısı'    },
          { icon: Truck,     label: 'Sürat Kargo Teslimat'  },
          { icon: RotateCcw, label: '14 Gün Ücretsiz İade'  },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2.5 py-2 border-t border-white/5">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `rgba(${slide.accentRgb},0.15)` }}
            >
              <Icon size={13} style={{ color: slide.accent }} />
            </div>
            <span className="text-sm text-white/75">{label}</span>
            <div className="ml-auto h-2 w-2 rounded-full" style={{ backgroundColor: slide.accent }} />
          </div>
        ))}
      </div>
      {/* Floating "güven" rozeti */}
      <div
        className="absolute -top-4 -right-4 flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold shadow-xl"
        style={{ backgroundColor: slide.accent, color: '#022c22' }}
      >
        <ShieldCheck size={12} /> %100 Güvenli
      </div>
    </div>
  );
}

/* ─── Ana bileşen ────────────────────────────────────────────────── */
export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const DURATION = 6000;

  const goTo = useCallback((index: number) => {
    if (animating) return;
    setAnimating(true);
    setProgress(0);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 600);
  }, [animating]);

  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);

  // Otomatik geçiş + progress
  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min((elapsed / DURATION) * 100, 100));
    }, 50);
    intervalRef.current = setInterval(next, DURATION);
    return () => {
      clearInterval(tick);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [next]);

  const slide = slides[current];

  return (
    <div className="relative overflow-hidden select-none" style={{ background: slide.gradient, transition: 'background 0.6s ease' }}>
      {/* Arka plan ızgara deseni */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(rgba(${slide.accentRgb},0.07) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
      {/* Arka plan ışıma */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-2/3 h-full"
        style={{
          background: `radial-gradient(ellipse 60% 80% at 80% 40%, rgba(${slide.accentRgb},0.12) 0%, transparent 70%)`,
          transition: 'background 0.6s ease',
        }}
      />

      <div className="container relative py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center min-h-[420px]">

          {/* SOL — Metin */}
          <div className={`text-white transition-all duration-600 ${animating ? 'opacity-0 translate-x-[-16px]' : 'opacity-100 translate-x-0'}`}>
            {/* Badge */}
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold mb-6 ${slide.badgeCls}`}>
              {slide.badge}
            </span>

            {/* Başlık — satır satır */}
            <h1 className="text-4xl font-black leading-[1.1] sm:text-5xl lg:text-[3.5rem] mb-5">
              {slide.title.map((line, i) => (
                <span key={i} className="block">
                  {i === slide.accentLine
                    ? <span style={{ color: slide.accent }}>{line}</span>
                    : line}
                </span>
              ))}
            </h1>

            {/* Alt metin */}
            <p className="text-base text-white/60 leading-relaxed mb-8 max-w-[440px]">
              {slide.subtitle}
            </p>

            {/* CTA butonlar */}
            <div className="flex flex-wrap gap-3">
              <Link
                href={slide.cta.href}
                className="group inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold shadow-lg transition-all hover:gap-3 hover:shadow-xl active:scale-95"
                style={{ backgroundColor: slide.accent, color: slide.id === 3 ? '#022c22' : '#0f172a' }}
              >
                {slide.cta.label}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={slide.cta2.href}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/15 active:scale-95 backdrop-blur-sm"
              >
                {slide.cta2.label}
              </Link>
            </div>

            {/* Güven rozetleri — satır */}
            <div className="mt-8 flex flex-wrap gap-5">
              {[
                { icon: Lock,      label: 'Güvenli Ödeme' },
                { icon: Truck,     label: 'Hızlı Teslimat' },
                { icon: RotateCcw, label: 'Kolay İade'     },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-white/45">
                  <Icon size={12} className="text-white/40" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* SAĞ — Slide'a özgü görsel */}
          <div className="hidden md:block">
            <SlideVisual slide={slide} animating={animating} />
          </div>
        </div>
      </div>

      {/* Sol / Sağ ok */}
      {['prev','next'].map((dir) => (
        <button
          key={dir}
          onClick={dir === 'prev' ? prev : next}
          className="absolute top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-90"
          style={{ [dir === 'prev' ? 'left' : 'right']: '1rem' }}
          aria-label={dir === 'prev' ? 'Önceki' : 'Sonraki'}
        >
          {dir === 'prev' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      ))}

      {/* Alt bar: noktalar + progress */}
      <div className="absolute bottom-0 left-0 right-0">
        {/* Nokta navigasyon */}
        <div className="flex items-center justify-center gap-2 pb-4">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width:  i === current ? 28 : 8,
                height: 8,
                backgroundColor: i === current ? slide.accent : 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
        </div>
        {/* Progress çizgisi */}
        <div className="h-0.5 w-full bg-white/10">
          <div
            className="h-full transition-none"
            style={{ width: `${progress}%`, backgroundColor: slide.accent }}
          />
        </div>
      </div>
    </div>
  );
}
