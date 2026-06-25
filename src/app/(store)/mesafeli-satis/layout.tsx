import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mesafeli Satış Sözleşmesi',
  description: 'Venta Premium mesafeli satış sözleşmesi.',
  robots: { index: false, follow: false },
};

export default function MesafeliSatisLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
