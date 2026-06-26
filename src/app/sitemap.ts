import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ventapremium.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ventapremium.com.tr/api/v1';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Statik sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Yardımcı: timeout'lu fetch (build sırasında backend yoksa takılmasın)
  const fetchWithTimeout = (url: string, options: RequestInit, ms = 5000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
  };

  // Dinamik: ürünler (tüm sayfaları çek)
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const PAGE_SIZE = 500;
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const res = await fetchWithTimeout(
        `${API_URL}/products?limit=${PAGE_SIZE}&page=${page}&sort=createdAt&order=desc`,
        { next: { revalidate: 3600 } } as RequestInit
      );
      if (!res.ok) break;
      const json = await res.json();
      const products: any[] = json.data || [];
      productPages.push(
        ...products.map((p: any) => ({
          url: `${BASE_URL}/product/${p.slug}`,
          lastModified: new Date(p.updatedAt || p.createdAt),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }))
      );
      hasMore = products.length === PAGE_SIZE;
      page++;
      if (page > 100) break; // max 50.000 ürün güvenlik limiti
    }
  } catch { /* sitemap oluşturmaya devam et */ }

  // Dinamik: kategoriler
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetchWithTimeout(`${API_URL}/categories`, { next: { revalidate: 86400 } } as RequestInit);
    if (res.ok) {
      const json = await res.json();
      const categories = json.data || [];
      categoryPages = categories.map((c: any) => ({
        url: `${BASE_URL}/shop?category=${c.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch { /* devam et */ }

  return [...staticPages, ...productPages, ...categoryPages];
}
