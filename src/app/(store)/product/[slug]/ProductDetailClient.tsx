'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCart, Heart, Star, Shield, Truck, RefreshCw, ChevronRight, Minus, Plus, Check, Send } from 'lucide-react';
import api from '@/lib/api';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import ProductCard from '@/components/product/ProductCard';

export default function ProductDetailClient({ slug }: { slug: string }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const { addItem, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const qc = useQueryClient();
  const reviewForm = useForm({ defaultValues: { rating: 5, title: '', comment: '' } });

  const toggleWishlist = useMutation({
    mutationFn: (productId: string) => api.post('/users/wishlist', { productId }),
    onSuccess: (res) => {
      setInWishlist(res.data.action === 'added');
      toast.success(res.data.action === 'added' ? '❤️ Favorilere eklendi!' : 'Favorilerden çıkarıldı.');
    },
    onError: () => toast.error('Giriş yapmanız gerekiyor.'),
  });

  const submitReview = useMutation({
    mutationFn: (data: any) => api.post('/users/reviews', { productId: product.id, ...data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product', slug] });
      reviewForm.reset({ rating: 5, title: '', comment: '' });
      toast.success('Yorumunuz incelemeye alındı!');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Hata'),
  });

  const { data, isLoading: pageLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/products/${slug}`).then(r => r.data.data),
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['related', slug],
    queryFn: () => api.get(`/products/${slug}/related`).then(r => r.data.data),
    enabled: !!slug,
  });

  const product = data;

  const handleAddToCart = async () => {
    await addItem(product.id, quantity, selectedVariant || undefined);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const getImageSrc = (url: string) =>
    url?.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${url}`;

  if (pageLoading) {
    return (
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="animate-pulse space-y-3">
            <div className="aspect-square rounded-2xl bg-gray-200" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => <div key={i} className="aspect-square rounded-xl bg-gray-200" />)}
            </div>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-1/3 rounded bg-gray-200" />
            <div className="h-8 w-2/3 rounded bg-gray-200" />
            <div className="h-10 w-1/4 rounded bg-gray-200" />
            <div className="h-24 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="container py-20 text-center text-gray-500">Ürün bulunamadı.</div>;

  const allImages = [
    ...(product.thumbnail ? [product.thumbnail] : []),
    ...(product.images?.map((i: any) => i.url) || []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const discountPercent = product.comparePrice
    ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)
    : 0;

  const avgRating = product.reviews?.length
    ? product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length
    : 0;

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-600">Ana Sayfa</Link>
        <ChevronRight size={14} />
        <Link href="/shop" className="hover:text-brand-600">Ürünler</Link>
        {product.category && (
          <>
            <ChevronRight size={14} />
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-brand-600">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Sol — Görsel Galeri */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 border border-gray-100">
            {allImages[selectedImage] ? (
              <Image
                src={getImageSrc(allImages[selectedImage])}
                alt={product.name}
                fill
                className="object-contain p-4"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300 text-7xl">📦</div>
            )}
            {discountPercent > 0 && (
              <span className="absolute left-4 top-4 badge bg-red-500 text-white text-sm px-3 py-1">
                -%{discountPercent}
              </span>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {allImages.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === i ? 'border-brand-500 shadow-md' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image src={getImageSrc(img)} alt={`${product.name} ${i + 1}`} width={80} height={80} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sağ — Ürün Bilgileri */}
        <div className="flex flex-col gap-5">
          {/* Kategori & isim */}
          <div>
            {product.category && (
              <Link href={`/shop?category=${product.category.slug}`} className="text-sm text-brand-600 font-medium hover:underline">
                {product.category.name}
              </Link>
            )}
            <h1 className="mt-1 text-2xl font-bold text-gray-900 leading-snug">{product.name}</h1>
            {product.sku && <p className="mt-1 text-xs text-gray-400">SKU: {product.sku}</p>}
          </div>

          {/* Puan */}
          {product.reviews?.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={15} className={s <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({product._count?.reviews} değerlendirme)</span>
            </div>
          )}

          {/* Fiyat */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">
              {Number(product.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </span>
            {product.comparePrice && (
              <span className="text-lg text-gray-400 line-through">
                {Number(product.comparePrice).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-sm font-semibold text-red-600">
                %{discountPercent} indirim
              </span>
            )}
          </div>

          {/* Varyantlar */}
          {product.variants?.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-700">Seçenek:</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v.id)}
                    disabled={v.stock === 0}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                      selectedVariant === v.id
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    {v.name}
                    {v.stock === 0 && ' (Tükendi)'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Adet + Sepet */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-xl border border-gray-200">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 hover:bg-gray-50 transition-colors rounded-l-xl">
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="p-3 hover:bg-gray-50 transition-colors rounded-r-xl">
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isLoading || product.stock === 0}
              className={`flex-1 btn-primary py-3 text-base gap-2 transition-all ${
                addedToCart ? 'bg-green-600 hover:bg-green-600' : ''
              }`}
            >
              {addedToCart ? (
                <><Check size={18} /> Sepete Eklendi</>
              ) : product.stock === 0 ? (
                'Stokta Yok'
              ) : (
                <><ShoppingCart size={18} /> Sepete Ekle</>
              )}
            </button>

            <button
              onClick={() => isAuthenticated ? toggleWishlist.mutate(product.id) : toast.error('Önce giriş yapın.')}
              className={`rounded-xl border p-3 transition-colors ${
                inWishlist ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-200 hover:border-red-300 hover:text-red-500'
              }`}
            >
              <Heart size={20} className={inWishlist ? 'fill-red-500' : ''} />
            </button>
          </div>

          {/* Stok durumu */}
          {product.stock > 0 && product.stock <= 10 && (
            <p className="text-sm text-orange-600 font-medium">⚠️ Son {product.stock} ürün kaldı!</p>
          )}

          {/* Güvenceler */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl bg-gray-50 p-4">
            {[
              { icon: Truck, label: 'Ücretsiz Kargo', sub: '500 TL üzeri' },
              { icon: Shield, label: 'Güvenli Ödeme', sub: 'İYZİCO güvencesi' },
              { icon: RefreshCw, label: 'Kolay İade', sub: '14 gün içinde' },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-1 text-center">
                <item.icon size={18} className="text-brand-600" />
                <p className="text-xs font-semibold text-gray-700">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* Özellikler */}
          {product.attributes?.length > 0 && (
            <div className="rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {product.attributes.map((attr: any, i: number) => (
                    <tr key={attr.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-2.5 font-medium text-gray-600 w-1/3">{attr.name}</td>
                      <td className="px-4 py-2.5 text-gray-800">{attr.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Açıklama */}
      {product.description && (
        <div className="mt-12">
          <h2 className="mb-4 text-xl font-bold">Ürün Açıklaması</h2>
          <div className="rounded-2xl bg-white p-6 shadow-card prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
        </div>
      )}

      {/* Yorum Formu */}
      <div className="mt-12">
        <h2 className="mb-6 text-xl font-bold">Değerlendirme Yaz</h2>
        {isAuthenticated ? (
          <div className="card p-6">
            <form onSubmit={reviewForm.handleSubmit(d => submitReview.mutate(d))} className="space-y-4">
              <div>
                <label className="label">Puan</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => reviewForm.setValue('rating', s)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={s <= reviewForm.watch('rating') ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Başlık</label>
                <input {...reviewForm.register('title')} placeholder="Yorumunuzu özetleyin" className="input" />
              </div>
              <div>
                <label className="label">Yorum</label>
                <textarea {...reviewForm.register('comment')} rows={4} placeholder="Ürün hakkında düşüncelerinizi yazın..." className="input resize-none" />
              </div>
              <button type="submit" disabled={submitReview.isPending} className="btn-primary gap-2">
                <Send size={15} />
                {submitReview.isPending ? 'Gönderiliyor...' : 'Yorumu Gönder'}
              </button>
            </form>
          </div>
        ) : (
          <div className="card p-6 text-center">
            <p className="text-gray-500 mb-3">Yorum yazmak için giriş yapmalısınız.</p>
            <Link href="/auth/login" className="btn-primary inline-flex">Giriş Yap</Link>
          </div>
        )}
      </div>

      {/* Değerlendirmeler */}
      {product.reviews?.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-xl font-bold">Müşteri Değerlendirmeleri ({product._count?.reviews})</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {product.reviews.map((review: any) => (
              <div key={review.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {review.user.firstName} {review.user.lastName.charAt(0)}.
                    </p>
                    <div className="mt-1 flex">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={13} className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                {review.title && <p className="mt-2 font-medium text-gray-700 text-sm">{review.title}</p>}
                {review.comment && <p className="mt-1 text-sm text-gray-600 leading-relaxed">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* İlgili Ürünler */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-xl font-bold">Benzer Ürünler</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {relatedProducts.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
