'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const { addItem } = useCartStore();

  useEffect(() => { if (!isAuthenticated) router.push('/auth/login'); }, [isAuthenticated]);

  const { data: items = [], isLoading } = useQuery<any[]>({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/users/wishlist').then(r => r.data.data),
    enabled: isAuthenticated,
  });

  const remove = useMutation({
    mutationFn: (productId: string) => api.delete(`/users/wishlist/${productId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wishlist'] }); toast.success('Favorilerden çıkarıldı.'); },
  });

  const getImgSrc = (url?: string) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${url}`;
  };

  return (
    <div className="container py-4 sm:py-8">
      <h1 className="mb-5 text-xl sm:text-2xl font-bold flex items-center gap-2">
        <Heart size={22} className="text-red-500 fill-red-500" /> Favorilerim
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => <div key={i} className="animate-pulse rounded-2xl bg-gray-200 h-72" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="card py-20 text-center">
          <Heart size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="text-lg font-medium text-gray-600">Favori ürününüz yok</p>
          <p className="mt-1 text-sm text-gray-400">Beğendiğiniz ürünleri favorilere ekleyin</p>
          <Link href="/shop" className="btn-primary mt-5 inline-flex">Ürünlere Göz At</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item: any) => {
            const product = item.product;
            const imgSrc = getImgSrc(product.thumbnail || product.images?.[0]?.url);
            const discount = product.comparePrice
              ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)
              : 0;

            return (
              <div key={item.id} className="card group relative flex flex-col overflow-hidden">
                {discount > 0 && (
                  <span className="absolute left-3 top-3 z-10 badge bg-red-500 text-white">-%{discount}</span>
                )}
                <button
                  onClick={() => remove.mutate(product.id)}
                  className="absolute right-3 top-3 z-10 rounded-full bg-white p-1.5 shadow text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>

                <Link href={`/product/${product.slug}`} className="block aspect-square bg-gray-50 overflow-hidden">
                  {imgSrc ? (
                    <Image src={imgSrc} alt={product.name} width={300} height={300}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">📦</div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col p-4">
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="text-sm font-medium line-clamp-2 hover:text-brand-600 transition-colors">{product.name}</h3>
                  </Link>
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-base font-bold">
                        {Number(product.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </span>
                      {product.comparePrice && (
                        <span className="ml-1.5 text-xs text-gray-400 line-through">
                          {Number(product.comparePrice).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addItem(product.id, 1, undefined, { id: product.id, name: product.name, price: Number(product.price), thumbnail: product.thumbnail ?? null, stock: product.stock })}
                      disabled={product.stock === 0}
                      className="rounded-xl bg-brand-600 p-2.5 text-white hover:bg-brand-700 transition-colors disabled:opacity-40"
                    >
                      <ShoppingCart size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
