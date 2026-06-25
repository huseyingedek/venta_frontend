import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Favorilerim',
  description: 'Favori ürünlerinizi görüntüleyin ve sepete ekleyin.',
  robots: { index: false, follow: false },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
