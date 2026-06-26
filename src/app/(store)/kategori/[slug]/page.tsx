import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import KategoriClient from './KategoriClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ventapremium.com.tr/api/v1';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ventapremium.com';

// Tüm derinliklerde kategori ara (recursive)
function findInTree(nodes: any[], slug: string): any {
  for (const node of nodes) {
    if (node.slug === slug) return node;
    if (node.children?.length) {
      const found = findInTree(node.children, slug);
      if (found) return found;
    }
  }
  return null;
}

async function getCategory(slug: string) {
  try {
    const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    return findInTree(json.data || [], slug);
  } catch { return null; }
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const category = await getCategory(params.slug);
  if (!category) return { title: 'Kategori Bulunamadı' };

  const desc = category.description
    || `${category.name} kategorisindeki en iyi ürünler Venta Premium'da. Uygun fiyat, hızlı kargo ve güvenli ödeme garantisiyle ${category.name.toLowerCase()} ürünlerini keşfedin.`;

  return {
    title: `${category.name} Ürünleri`,
    description: desc.slice(0, 160),
    keywords: [
      category.name,
      `${category.name} fiyatları`,
      `${category.name} satın al`,
      `ucuz ${category.name}`,
      `${category.name} online`,
      'venta premium',
    ],
    alternates: { canonical: `${SITE_URL}/kategori/${params.slug}` },
    openGraph: {
      title: `${category.name} Ürünleri | Venta Premium`,
      description: desc.slice(0, 160),
      type: 'website',
      url: `${SITE_URL}/kategori/${params.slug}`,
      ...(category.image && { images: [{ url: category.image, width: 800, height: 600, alt: category.name }] }),
    },
  };
}

export default async function KategoriPage({ params }: { params: { slug: string } }) {
  const category = await getCategory(params.slug);
  if (!category) notFound();

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Ürünler', item: `${SITE_URL}/shop` },
      { '@type': 'ListItem', position: 3, name: category.name, item: `${SITE_URL}/kategori/${params.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <KategoriClient slug={params.slug} category={category} />
    </>
  );
}
