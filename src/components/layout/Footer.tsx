import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-dark text-gray-300 mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Marka */}
          <div>
            <span className="font-display text-2xl font-bold text-white">
              venta<span className="text-brand-400">premium</span>
            </span>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Kalite ve güvenin buluştuğu adres. Binlerce ürün, güvenli alışveriş, hızlı teslimat.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://www.instagram.com/ventapremiumcomtr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-lg bg-white/10 p-2 hover:bg-brand-600 transition-colors"
              >
                <IconInstagram />
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Hızlı Linkler</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="hover:text-brand-400 transition-colors">Ürünler</Link></li>
              <li><Link href="/shop?featured=true" className="hover:text-brand-400 transition-colors">Öne Çıkanlar</Link></li>
              <li><Link href="/account/orders" className="hover:text-brand-400 transition-colors">Siparişlerim</Link></li>
              <li><Link href="/wishlist" className="hover:text-brand-400 transition-colors">Favorilerim</Link></li>
            </ul>
          </div>

          {/* Kurumsal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Kurumsal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-brand-400 transition-colors">Hakkımızda</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-400 transition-colors">Gizlilik & KVKK</Link></li>
              <li><Link href="/returns" className="hover:text-brand-400 transition-colors">İade & Değişim</Link></li>
              <li><Link href="/shipping" className="hover:text-brand-400 transition-colors">Teslimat Bilgileri</Link></li>
              <li><Link href="/mesafeli-satis" className="hover:text-brand-400 transition-colors">Mesafeli Satış Sözleşmesi</Link></li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">İletişim</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2.5">
                <Phone size={15} className="mt-0.5 shrink-0 text-brand-400" />
                <a href="tel:+905354676801" className="hover:text-brand-400 transition-colors">0535 467 68 01</a>
              </li>
              <li className="flex gap-2.5">
                <Mail size={15} className="mt-0.5 shrink-0 text-brand-400" />
                <a href="mailto:destek@ventapremium.com.tr" className="hover:text-brand-400 transition-colors">destek@ventapremium.com.tr</a>
              </li>
              <li className="flex gap-2.5">
                <MapPin size={15} className="mt-0.5 shrink-0 text-brand-400" />
                <span>İstanbul, Türkiye</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Ödeme Logoları */}
      <div className="border-t border-white/10">
        <div className="container py-5">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} Venta Premium. Tüm hakları saklıdır.</p>
            {/* Ödeme yöntemi logoları */}
            <div className="flex items-center justify-center rounded-xl bg-white px-4 py-2">
              <Image
                src="/logo_band_colored@1X.png"
                alt="iyzico ile güvenli ödeme - Visa, Mastercard"
                width={240}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs text-gray-500 md:justify-start">
            <Link href="/privacy" className="hover:text-gray-300">Gizlilik & KVKK</Link>
            <Link href="/mesafeli-satis" className="hover:text-gray-300">Mesafeli Satış Sözleşmesi</Link>
            <Link href="/returns" className="hover:text-gray-300">İade & Değişim</Link>
            <Link href="/shipping" className="hover:text-gray-300">Teslimat</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
