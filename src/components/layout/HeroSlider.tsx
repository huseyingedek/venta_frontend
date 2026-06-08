'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* ── Görselleri buraya ekle — public/ klasörüne attıktan sonra ── */
const ALL_SLIDES = [
  { id: 1, src: '/hero1.png' },
  { id: 2, src: '/hero2.png' },
  { id: 3, src: '/hero3.png' },
  { id: 4, src: '/hero4.png' },
  { id: 5, src: '/hero5.png' },
];

/* Henüz yüklenemeyen görselleri atla */
const slides = ALL_SLIDES;

const DURATION = 5000;

export default function HeroSlider({ featuredProduct }: { featuredProduct?: any }) {
  const [current, setCurrent]     = useState(0);
  const [animating, setAnimating] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [loaded, setLoaded]       = useState<Record<number,boolean>>({ 0: true });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Yüklenebilen görseller */
  const visibleSlides = slides.filter(s => loaded[s.id - 1] !== false);
  const count = visibleSlides.length;

  const goTo = useCallback((index: number) => {
    if (animating) return;
    setAnimating(true);
    setProgress(0);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 500);
  }, [animating]);

  const prev = () => goTo((current - 1 + count) % count);
  const next = useCallback(() => goTo((current + 1) % count), [current, count, goTo]);

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const tick = setInterval(() => {
      setProgress(Math.min(((Date.now() - start) / DURATION) * 100, 100));
    }, 50);
    intervalRef.current = setInterval(next, DURATION);
    return () => { clearInterval(tick); if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [next]);

  const slide = visibleSlides[current] ?? visibleSlides[0];
  if (!slide) return null;

  return (
    <div className="container py-4">
    <div className="relative overflow-hidden w-full rounded-2xl aspect-[16/9] sm:aspect-[16/7] md:aspect-[16/6]">
      {/* Görseller — hepsi render edilir, sadece aktif olan görünür */}
      {slides.map((s, i) => (
        <Image
          key={s.id}
          src={s.src}
          alt={`Hero ${s.id}`}
          fill
          className="object-cover"
          style={{
            transition: 'opacity 0.5s ease',
            opacity: (visibleSlides[current]?.id === s.id && !animating) ? 1 : 0,
            zIndex: visibleSlides[current]?.id === s.id ? 1 : 0,
          }}
          priority={i === 0}
          unoptimized
          onError={() => setLoaded(prev => ({ ...prev, [s.id - 1]: false }))}
        />
      ))}

      {/* Oklar — her zaman görünür */}
      <button onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-lg">
        <ChevronLeft size={20} />
      </button>
      <button onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-lg">
        <ChevronRight size={20} />
      </button>

      {/* Nokta nav + progress */}
      {count > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="flex justify-center gap-2 pb-3">
            {visibleSlides.map((s, i) => (
              <button key={s.id} onClick={() => goTo(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width:           i === current ? 24 : 7,
                  height:          7,
                  backgroundColor: i === current ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                }}
              />
            ))}
          </div>
          <div className="h-0.5 bg-white/10">
            <div className="h-full bg-white/60 transition-none" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
