import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description: 'Venta Premium hakkında bilgi edinin. Misyonumuz, vizyonumuz ve müşteri odaklı yaklaşımımız.',
  openGraph: {
    title: 'Hakkımızda | Venta Premium',
    description: 'Venta Premium hakkında bilgi edinin.',
    type: 'website',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
