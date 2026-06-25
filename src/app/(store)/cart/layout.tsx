import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sepetim',
  description: 'Sepetinizdeki ürünleri görüntüleyin, miktarları güncelleyin ve siparişinizi tamamlayın.',
  robots: { index: false, follow: false },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
