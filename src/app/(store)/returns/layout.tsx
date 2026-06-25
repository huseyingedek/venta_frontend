import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İade ve Değişim',
  description: '14 gün içinde ücretsiz iade ve değişim. Venta Premium iade politikası hakkında bilgi alın.',
};

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
