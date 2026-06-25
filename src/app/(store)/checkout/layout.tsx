import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ödeme',
  description: 'Siparişinizi tamamlayın. Güvenli ödeme altyapısı ile hızlı ve kolay checkout.',
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
