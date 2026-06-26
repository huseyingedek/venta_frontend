import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ventapremium.com.tr/api/v1';

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

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ventapremium.com';

  const productSchema = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description?.slice(0, 500) || product.name,
    sku: product.sku,
    image: product.thumbnail?.startsWith('http')
      ? product.thumbnail
      : product.thumbnail
      ? `${(process.env.NEXT_PUBLIC_API_URL || '').replace('/api/v1', '')}${product.thumbnail}`
      : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'TRY',
      price: Number(product.price).toFixed(2),
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Venta Premium' },
      url: `${siteUrl}/product/${product.slug}`,
    },
    ...(product.category && { category: product.category.name }),
    // AggregateRating — yorum varsa Google yıldız gösterir
    ...(product._count?.reviews > 0 && product.reviews?.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: (
          product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          product.reviews.length
        ).toFixed(1),
        reviewCount: product._count.reviews,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  } : null;

  const breadcrumbSchema = product ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Ürünler', item: `${siteUrl}/shop` },
      ...(product.category ? [{ '@type': 'ListItem', position: 3, name: product.category.name, item: `${siteUrl}/shop?category=${product.category.slug}` }] : []),
      { '@type': 'ListItem', position: product.category ? 4 : 3, name: product.name, item: `${siteUrl}/product/${product.slug}` },
    ],
  } : null;

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <ProductDetailClient slug={params.slug} />
    </>
  );
}
