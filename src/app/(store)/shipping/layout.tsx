import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kargo ve Teslimat',
  description: 'Venta Premium kargo ve teslimat bilgileri. Sürat Kargo ile 1-3 iş günü teslimat.',
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
