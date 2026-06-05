import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tüm Ürünler',
  description: 'Elektronik, giyim, ev & yaşam ve daha fazlası. Binlerce ürün arasından dilediğinizi seçin, güvenle alışveriş yapın.',
  openGraph: {
    title: 'Tüm Ürünler | Venta Premium',
    description: 'Elektronik, giyim, ev & yaşam ve daha fazlası. Binlerce ürün arasından dilediğinizi seçin.',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Venta Premium',
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
