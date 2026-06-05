import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      next: { revalidate: 60 }, // ISR — 60 saniyede bir yenile
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const product = await getProduct(params.slug);

  if (!product) {
    return { title: 'Ürün Bulunamadı' };
  }

  const price = Number(product.price).toLocaleString('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  });

  const description = product.description
    ? product.description.slice(0, 155).replace(/\n/g, ' ') + '...'
    : `${product.name} — ${price}. Venta Premium'da güvenle alışveriş yapın.`;

  const imageUrl = product.thumbnail?.startsWith('http')
    ? product.thumbnail
    : product.thumbnail
    ? `${API_URL.replace('/api/v1', '')}${product.thumbnail}`
    : undefined;

  return {
    title: product.name,
    description,
    keywords: [product.name, product.category?.name, 'satın al', 'fiyat', 'Venta Premium'].filter(Boolean),
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      locale: 'tr_TR',
      siteName: 'Venta Premium',
      ...(imageUrl && {
        images: [{ url: imageUrl, width: 800, height: 800, alt: product.name }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  return <ProductDetailClient slug={params.slug} />;
}
