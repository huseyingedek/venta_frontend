import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Truck, HeadphonesIcon, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hakkımızda | Venta Premium',
  description: 'Venta Premium hakkında bilgi. Kaliteli ürünler, güvenli alışveriş ve hızlı teslimat.',
};

export default function AboutPage() {
  return (
    <div className="container py-12 max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-gray-400 mb-2">
          <Link href="/" className="hover:text-brand-600">Ana Sayfa</Link> / Hakkımızda
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Hakkımızda</h1>
      </div>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-white mb-10">
        <h2 className="text-2xl font-bold mb-3">Venta Premium'a Hoş Geldiniz</h2>
        <p className="text-brand-100 leading-relaxed max-w-2xl">
          Venta Premium olarak, müşterilerimize kaliteli ve uygun fiyatlı ürünleri güvenli bir alışveriş
          deneyimiyle sunmayı amaçlıyoruz. Geniş ürün yelpazemiz ve müşteri odaklı hizmet anlayışımızla
          online alışverişi kolaylaştırıyoruz.
        </p>
      </div>

      {/* Kim Biz */}
      <div className="card p-8 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Biz Kimiz?</h2>
        <div className="text-gray-700 leading-relaxed space-y-4">
          <p>
            <strong>Venta Premium</strong>, İstanbul merkezli bir e-ticaret platformudur. 2019 yılından bu yana müşterilerimize ev, mutfak,
            kişisel bakım ve yaşam tarzı kategorilerinde binlerce ürün sunmaktayız.
          </p>
          <p>
            Tedarik zincirimizdeki güvenilir iş ortaklarımız aracılığıyla ürünleri kalite kontrolünden
            geçirerek sizlere ulaştırıyoruz. Her siparişte müşteri memnuniyetini ön planda tutarak
            şeffaf ve dürüst bir alışveriş ortamı sağlıyoruz.
          </p>
        </div>
      </div>

      {/* Değerler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[
          {
            icon: <ShieldCheck size={24} className="text-brand-600" />,
            title: 'Güvenli Alışveriş',
            desc: 'SSL sertifikalı altyapımız ve güvenli ödeme sistemlerimizle kişisel bilgileriniz her zaman koruma altındadır.',
          },
          {
            icon: <Truck size={24} className="text-brand-600" />,
            title: 'Hızlı Teslimat',
            desc: 'Siparişleriniz onaylandıktan sonra anlaşmalı kargo firmalarımız aracılığıyla en kısa sürede kapınıza ulaştırılır.',
          },
          {
            icon: <HeadphonesIcon size={24} className="text-brand-600" />,
            title: 'Müşteri Desteği',
            desc: 'Sorularınız için 0535 467 68 01 numaralı WhatsApp hattımızdan veya destek@ventapremium.com.tr adresimizden bize ulaşabilirsiniz.',
          },
          {
            icon: <Star size={24} className="text-brand-600" />,
            title: 'Kaliteli Ürünler',
            desc: 'Güvenilir tedarikçilerimizden seçilmiş, kalite kontrolünden geçirilmiş ürünleri sizlere sunuyoruz.',
          },
        ].map(item => (
          <div key={item.title} className="card p-6 flex gap-4">
            <div className="shrink-0 mt-0.5">{item.icon}</div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Şirket Bilgileri */}
      <div className="card p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Şirket Bilgileri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
          {[
            ['Marka', 'Venta Premium'],
            ['Telefon / WhatsApp', '0535 467 68 01'],
            ['E-posta', 'destek@ventapremium.com.tr'],
            ['Web Sitesi', 'www.ventapremium.com.tr'],
            ['Instagram', '@ventapremiumcomtr'],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <span className="font-semibold text-gray-500 shrink-0">{label}:</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
