import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta' });

export const metadata: Metadata = {
  title: { default: 'Venta Premium | Kalite ve Güvenin Adresi', template: '%s | Venta Premium' },
  description: 'Venta Premium ile binlerce ürün arasından güvenle alışveriş yapın. Hızlı kargo, kolay iade, güvenli ödeme.',
  keywords: ['e-ticaret', 'online alışveriş', 'venta premium', 'güvenilir alışveriş'],
  verification: {
    google: 'Jem315IPt1aimuKAMfE0crsP4aOoqWhvdfqtYXaRB2I',
  },
  openGraph: {
    siteName: 'Venta Premium',
    type: 'website',
    locale: 'tr_TR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Google Ads tag */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18229741729"
          strategy="afterInteractive"
        />
        <Script id="google-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18229741729');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${plusJakarta.variable} font-sans`}>
        <Providers>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </Providers>
      </body>
    </html>
  );
}
