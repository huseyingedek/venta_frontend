'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart.store';
import { useWishlistStore } from '@/store/wishlist.store';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  thumbnail?: string;
  images?: { url: string }[];
  stock: number;
  isNew?: boolean;
  isFeatured?: boolean;
  category?: { name: string };
  _count?: { reviews: number };
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, isLoading } = useCartStore();
  const { toggle: toggleWishlist, has } = useWishlistStore();
  const [inWishlist, setInWishlist] = useState(false);

  // localStorage SSR mismatch'ini önlemek için client-side'da güncelle
  useEffect(() => {
    setInWishlist(has(product.id));
  }, [product.id, has]);

  const [hovered, setHovered] = useState(false);
  const imageUrl = product.thumbnail || product.images?.[0]?.url;
  const secondImage = product.images?.[1]?.url;
  const discountPercent = product.comparePrice
    ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)
    : 0;

  const getImgSrc = (url: string) =>
    url?.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${url}`;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id).then(() => setInWishlist(has(product.id)));
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id, 1, undefined, {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      thumbnail: product.thumbnail ?? null,
      stock: product.stock,
    });
  };

  return (
    <div className="card group relative flex flex-col overflow-hidden transition-shadow hover:shadow-card-hover" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {/* Badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
        {product.isNew && <span className="badge bg-green-500 text-white text-xs">Yeni</span>}
        {discountPercent > 0 && <span className="badge bg-red-500 text-white text-xs">-%{discountPercent}</span>}
        {product.stock === 0 && <span className="badge bg-gray-500 text-white text-xs">Tükendi</span>}
      </div>

      {/* Favori butonu */}
      <button
        onClick={handleWishlist}
        className={`absolute right-3 top-3 z-10 rounded-full p-1.5 shadow-sm transition-all ${
          inWishlist
            ? 'bg-red-50 text-red-500 opacity-100'
            : 'bg-white text-gray-400 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:text-red-500'
        }`}
        aria-label="Favorilere ekle"
      >
        <Heart size={15} className={inWishlist ? 'fill-red-500' : ''} />
      </button>

      {/* Görsel */}
      <Link href={`/product/${product.slug}`} className="block aspect-square bg-gray-50 overflow-hidden relative">
        {imageUrl ? (
          <>
            <Image
              src={getImgSrc(imageUrl)}
              alt={product.name}
              width={400}
              height={400}
              className={`h-full w-full object-cover transition-all duration-500 ${hovered && secondImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
            />
            {secondImage && (
              <Image
                src={getImgSrc(secondImage)}
                alt={product.name}
                width={400}
                height={400}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300 text-4xl">📦</div>
        )}
      </Link>

      {/* İçerik */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {product.category && (
          <span className="text-xs text-gray-400 mb-1">{product.category.name}</span>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 hover:text-brand-600 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Review sayısı */}
        {(product._count?.reviews ?? 0) > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span className="text-xs text-gray-400">({product._count!.reviews})</span>
          </div>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <div>
            <span className="text-sm sm:text-base font-bold text-gray-900">
              {Number(product.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </span>
            {product.comparePrice && (
              <span className="hidden sm:inline ml-1 text-xs text-gray-400 line-through">
                {Number(product.comparePrice).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isLoading || product.stock === 0}
            className="rounded-xl bg-brand-600 p-2 text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            aria-label="Sepete ekle"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
