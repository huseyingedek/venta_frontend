'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingCart, Heart, Star, Shield, Truck, RefreshCw, ChevronRight, ChevronLeft, Minus, Plus, Check, Send, Zap, Share2 } from 'lucide-react';
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
  const router = useRouter();
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

  const handleBuyNow = async () => {
    await addItem(product.id, quantity, selectedVariant || undefined);
    router.push('/checkout');
  };

  const handleWhatsApp = () => {
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
    const text = encodeURIComponent(`Merhaba, "${product.name}" ürününü sipariş vermek istiyorum.\n${window.location.href}`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(product.name);
    const links: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
    };
    window.open(links[platform], '_blank');
  };

  const handleInstagramShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url: window.location.href });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link kopyalandı! Instagram\'a yapıştırabilirsin.');
    }
  };

  const getImageSrc = (url: string) =>
    url?.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${url}`;

  if (pageLoading) {
    return (
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
    <div className="container py-4 sm:py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 hidden sm:flex items-center gap-1.5 text-sm text-gray-500 overflow-hidden">
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
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
            <h1 className="mt-1 text-xl sm:text-2xl font-bold text-gray-900 leading-snug">{product.name}</h1>
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
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">
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
          <p className="text-xs text-gray-400">KDV Dahildir</p>

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

          {/* Stok durumu */}
          <div className="flex items-center gap-2">
            {product.stock === 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Stokta Yok
              </span>
            ) : product.stock <= 5 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-600">
                <span className="h-2 w-2 rounded-full bg-orange-500" /> Son {product.stock} ürün!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500" /> Stokta Var {product.stock > 20 ? '(20+)' : `(${product.stock} adet)`}
              </span>
            )}
          </div>

          {/* Adet + Sepet */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
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

            {/* Hemen Al + WhatsApp */}
            <div className="flex gap-3">
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-40 transition-colors"
              >
                <Zap size={16} /> Hemen Al
              </button>
              {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER && (
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-semibold text-white hover:bg-[#20bd5a] transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  <span className="hidden sm:inline">WhatsApp ile </span>Sipariş
                </button>
              )}
            </div>

            {/* Sosyal Paylaşım */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-gray-400 flex items-center gap-1"><Share2 size={12} /> Paylaş:</span>
              <button onClick={() => handleShare('twitter')} className="rounded-lg border border-gray-200 p-1.5 hover:bg-sky-50 hover:border-sky-200 transition-colors" title="Twitter'da Paylaş">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-sky-500"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.26 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </button>
              <button onClick={() => handleShare('facebook')} className="rounded-lg border border-gray-200 p-1.5 hover:bg-blue-50 hover:border-blue-200 transition-colors" title="Facebook'ta Paylaş">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-blue-600"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </button>
              <button onClick={() => handleShare('whatsapp')} className="rounded-lg border border-gray-200 p-1.5 hover:bg-green-50 hover:border-green-200 transition-colors" title="WhatsApp'ta Paylaş">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-green-500"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              </button>
              <button onClick={handleInstagramShare} className="rounded-lg border border-gray-200 p-1.5 hover:bg-pink-50 hover:border-pink-200 transition-colors" title="Instagram'da Paylaş">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-pink-500"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </button>
            </div>
          </div>

          {/* Güvenceler */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-gray-50 p-3 sm:p-4">
            {[
              { icon: Truck, label: 'Hızlı Teslimat', sub: '3-7 iş günü' },
              { icon: Shield, label: 'Güvenli Ödeme', sub: 'İYZİCO güvencesi' },
              { icon: RefreshCw, label: 'Kolay İade', sub: '14 gün içinde' },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-1 text-center">
                <item.icon size={18} className="text-brand-600" />
                <p className="text-[11px] sm:text-xs font-semibold text-gray-700">{item.label}</p>
                <p className="hidden sm:block text-xs text-gray-400">{item.sub}</p>
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
          <div
            className="rounded-2xl bg-white p-6 shadow-card prose max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
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

      {/* İlgili Ürünler Carousel */}
      {relatedProducts.length > 0 && (
        <RelatedCarousel products={relatedProducts} />
      )}
    </div>
  );
}

// ─── Benzer Ürünler Carousel ───────────────────────────────────────────────
function RelatedCarousel({ products }: { products: any[] }) {
  const AUTO_INTERVAL = 4000; // ms
  const [current, setCurrent] = useState(0);
  const [VISIBLE, setVISIBLE] = useState(4);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVISIBLE(w < 640 ? 2 : w < 1024 ? 3 : 4);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const maxIndex = Math.max(0, products.length - VISIBLE);

  const next = useCallback(() => setCurrent(c => Math.min(c + 1, maxIndex)), [maxIndex]);
  const prev = () => setCurrent(c => Math.max(c - 1, 0));

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, AUTO_INTERVAL);
  };

  useEffect(() => {
    timerRef.current = setInterval(next, AUTO_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  const getImgSrc = (url: string) =>
    url?.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${url}`;

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Benzer Ürünler</h2>
        <div className="flex gap-2">
          <button
            onClick={() => { prev(); resetTimer(); }}
            disabled={current === 0}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:border-brand-400 hover:text-brand-600 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => { next(); resetTimer(); }}
            disabled={current === maxIndex}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:border-brand-400 hover:text-brand-600 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex gap-4 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(calc(-${current} * (100% / ${VISIBLE} + 1rem / ${VISIBLE} * (${VISIBLE} - 1))))` }}
        >
          {products.map((p: any) => {
            const discount = p.comparePrice
              ? Math.round(((Number(p.comparePrice) - Number(p.price)) / Number(p.comparePrice)) * 100)
              : 0;
            return (
              <div
                key={p.id}
                className="shrink-0 cursor-pointer group"
                style={{ width: `calc(100% / ${VISIBLE} - ${(VISIBLE - 1) / VISIBLE}rem)` }}
                onClick={() => router.push(`/product/${p.slug}`)}
              >
                <div className="relative overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 aspect-square mb-3">
                  {p.thumbnail ? (
                    <Image
                      src={getImgSrc(p.thumbnail)}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl text-gray-300">📦</div>
                  )}
                  {discount > 0 && (
                    <span className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                      -%{discount}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug mb-1.5 group-hover:text-brand-600 transition-colors">
                  {p.name}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-gray-900">
                    {Number(p.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                  {p.comparePrice && (
                    <span className="text-xs text-gray-400 line-through">
                      {Number(p.comparePrice).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </span>
                  )}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); router.push(`/product/${p.slug}`); }}
                  className="mt-2 w-full rounded-xl border border-gray-200 py-1.5 text-xs font-medium text-gray-600 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  Sepete Ekle
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nokta indikatörler */}
      {maxIndex > 0 && (
        <div className="mt-4 flex justify-center gap-1.5">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); resetTimer(); }}
              className={`rounded-full transition-all ${i === current ? 'w-5 h-2 bg-brand-600' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
