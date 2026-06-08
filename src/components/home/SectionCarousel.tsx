'use client';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';

export default function SectionCarousel({ products }: { products: any[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    const amount = ref.current.clientWidth * 0.85;
    ref.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <div className="relative group/carousel">
      {/* Sol ok — masaüstünde hover'da görünür */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 h-9 w-9 rounded-full bg-white shadow-lg border border-gray-100 items-center justify-center hover:bg-gray-50 opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden sm:flex"
        aria-label="Geri"
      >
        <ChevronLeft size={18} className="text-gray-700" />
      </button>

      {/* Scroll container — mobil: 2 kart, sm: 3 kart, lg: 4 kart */}
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {products.map((product: any) => (
          <div
            key={product.id}
            className="shrink-0 w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] lg:w-[calc(25%-9px)]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Sağ ok — masaüstünde hover'da görünür */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 h-9 w-9 rounded-full bg-white shadow-lg border border-gray-100 items-center justify-center hover:bg-gray-50 opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden sm:flex"
        aria-label="İleri"
      >
        <ChevronRight size={18} className="text-gray-700" />
      </button>
    </div>
  );
}
