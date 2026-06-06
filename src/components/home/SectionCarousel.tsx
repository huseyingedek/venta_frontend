'use client';
import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';

export default function SectionCarousel({ products }: { products: any[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    const amount = ref.current.clientWidth * 0.85;
    ref.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <div className="relative" onMouseEnter={() => setShowArrows(true)} onMouseLeave={() => setShowArrows(false)}>
      {/* Sol ok */}
      <button
        onClick={() => scroll('left')}
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 h-10 w-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center transition-opacity hover:bg-gray-50 ${showArrows ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronLeft size={20} className="text-gray-700" />
      </button>

      {/* Ürünler */}
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-1 pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {products.map((product: any) => (
          <div
            key={product.id}
            className="shrink-0"
            style={{ width: 'calc(25% - 12px)', scrollSnapAlign: 'start', minWidth: '200px' }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Sağ ok */}
      <button
        onClick={() => scroll('right')}
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 h-10 w-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center transition-opacity hover:bg-gray-50 ${showArrows ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronRight size={20} className="text-gray-700" />
      </button>
    </div>
  );
}
