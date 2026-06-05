import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook } from 'lucide-react';

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
              <a href="#" className="rounded-lg bg-white/10 p-2 hover:bg-brand-600 transition-colors"><Instagram size={16} /></a>
              <a href="#" className="rounded-lg bg-white/10 p-2 hover:bg-brand-600 transition-colors"><Twitter size={16} /></a>
              <a href="#" className="rounded-lg bg-white/10 p-2 hover:bg-brand-600 transition-colors"><Facebook size={16} /></a>
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
              <li><Link href="/contact" className="hover:text-brand-400 transition-colors">İletişim</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-400 transition-colors">Gizlilik Politikası</Link></li>
              <li><Link href="/returns" className="hover:text-brand-400 transition-colors">İade & Değişim</Link></li>
              <li><Link href="/shipping" className="hover:text-brand-400 transition-colors">Kargo Bilgileri</Link></li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">İletişim</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2.5"><Phone size={15} className="mt-0.5 shrink-0 text-brand-400" /><span>0850 000 00 00</span></li>
              <li className="flex gap-2.5"><Mail size={15} className="mt-0.5 shrink-0 text-brand-400" /><span>destek@ventapremium.com</span></li>
              <li className="flex gap-2.5"><MapPin size={15} className="mt-0.5 shrink-0 text-brand-400" /><span>İstanbul, Türkiye</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-xs text-gray-500 md:flex-row">
          <p>© {new Date().getFullYear()} Venta Premium. Tüm hakları saklıdır.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-300">Gizlilik</Link>
            <Link href="/terms" className="hover:text-gray-300">Kullanım Koşulları</Link>
            <Link href="/cookies" className="hover:text-gray-300">Çerezler</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
