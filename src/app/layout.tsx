import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: { default: 'Venta Premium | Kalite ve Güvenin Adresi', template: '%s | Venta Premium' },
  description: 'Venta Premium ile binlerce ürün arasından güvenle alışveriş yapın. Hızlı kargo, kolay iade, güvenli ödeme.',
  keywords: ['e-ticaret', 'online alışveriş', 'venta premium', 'güvenilir alışveriş', 'türkiye online mağaza'],
  icons: {
    icon: '/ventapremium.ico',
    shortcut: '/ventapremium.ico',
    apple: '/ventapremium.ico',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ventapremium.com'),
  alternates: { canonical: '/' },
  verification: {
    google: 'Jem315IPt1aimuKAMfE0crsP4aOoqWhvdfqtYXaRB2I',
  },
  openGraph: {
    siteName: 'Venta Premium',
    type: 'website',
    locale: 'tr_TR',
    url: '/',
    title: 'Venta Premium | Kalite ve Güvenin Adresi',
    description: 'Venta Premium ile binlerce ürün arasından güvenle alışveriş yapın. Hızlı kargo, kolay iade, güvenli ödeme.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Venta Premium' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Venta Premium | Kalite ve Güvenin Adresi',
    description: 'Venta Premium ile binlerce ürün arasından güvenle alışveriş yapın.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Venta Premium',
  url: 'https://ventapremium.com',
  logo: 'https://ventapremium.com/logo.jpeg',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: 'Turkish',
  },
  sameAs: [
    'https://www.instagram.com/ventapremium',
    'https://www.facebook.com/ventapremium',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Venta Premium',
  url: 'https://ventapremium.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://ventapremium.com/shop?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* JSON-LD: Organization + WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="font-sans">
        <Providers>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </Providers>
        {/* Google Ads tag — body sonunda olmalı (afterInteractive) */}
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
      </body>
    </html>
  );
}
