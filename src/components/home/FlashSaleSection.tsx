'use client';
import { useEffect, useState } from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';

interface Props {
  products: any[];
}

function useCountdown(targetHour: number) {
  const getSecondsLeft = () => {
    const now = new Date();
    const target = new Date();
    target.setHours(targetHour, 0, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    return Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  };

  const [secs, setSecs] = useState(getSecondsLeft);

  useEffect(() => {
    const id = setInterval(() => setSecs(getSecondsLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return { h, m, s };
}

function Digit({ v }: { v: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-0.5">
        {v.split('').map((d, i) => (
          <span key={i} className="flex h-9 w-7 items-center justify-center rounded-lg bg-white/15 text-xl font-black text-white tabular-nums">
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function FlashSaleSection({ products }: Props) {
  const { h, m, s } = useCountdown(23); // her gece 23:00'e kadar

  if (products.length === 0) return null;

  return (
    <section className="py-12" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
      <div className="container">
        {/* Başlık + sayaç */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/30">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Günün Fırsatı</h2>
              <p className="text-sm text-white/50">Kampanya bitimine kalan süre</p>
            </div>
          </div>

          {/* Geri sayım */}
          <div className="flex items-center gap-2">
            <Digit v={h} />
            <span className="text-2xl font-black text-orange-400 pb-1">:</span>
            <Digit v={m} />
            <span className="text-2xl font-black text-orange-400 pb-1">:</span>
            <Digit v={s} />
            <div className="ml-3 hidden sm:flex flex-col text-[10px] text-white/40 leading-tight">
              <span>SAAT</span><span>DAK</span><span>SAN</span>
            </div>
          </div>

          <Link
            href="/shop?hasDiscount=true"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Tüm Fırsatlar <ArrowRight size={14} />
          </Link>
        </div>

        {/* Ürün grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/shop?hasDiscount=true"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Tüm Fırsatları Gör <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
