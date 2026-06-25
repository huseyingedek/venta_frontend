import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ventapremium.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/shop', '/product/', '/about', '/shipping', '/returns', '/privacy'],
        disallow: [
          '/admin/',
          '/account/',
          '/checkout/',
          '/cart',
          '/wishlist',
          '/auth/',
          '/mesafeli-satis',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
