import type { Metadata } from 'next';
import Link from 'next/link';
import { Truck, Clock, Package, AlertCircle, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Teslimat Bilgileri | Venta Premium',
  description: 'Venta Premium kargo ve teslimat bilgileri, teslimat süreleri ve ücretler.',
};

export default function ShippingPage() {
  return (
    <div className="container py-12 max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-gray-400 mb-2">
          <Link href="/" className="hover:text-brand-600">Ana Sayfa</Link> / Teslimat Bilgileri
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Teslimat Bilgileri</h1>
        <p className="mt-2 text-sm text-gray-400">Siparişleriniz güvenli ve hızlı şekilde kapınıza ulaşır.</p>
      </div>

      <div className="space-y-5">

        {/* Teslimat Süresi */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
              <Clock size={20} className="text-brand-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Teslimat Süresi</h2>
          </div>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
              <p>Ödemeniz onaylandıktan sonra siparişiniz tedarikçimize iletilir ve hazırlık süreci başlar.</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
              <p>Ürününüz hazırlandıktan sonra kargoya verilir ve kargo takip numarası tarafınıza bildirilir.</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
              <p>Tahmini teslimat süresi ödeme onayından itibaren <strong>3–7 iş günüdür.</strong></p>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle size={15} className="text-orange-500 mt-0.5 shrink-0" />
              <p>Yoğun dönemlerde (kampanya, bayram vb.) teslimat süresi uzayabilir.</p>
            </div>
          </div>
        </div>

        {/* Kargo Ücretleri */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
              <Truck size={20} className="text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Kargo Ücretleri</h2>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 text-sm text-gray-700">
            Kargo ücreti <strong>149,00 TL</strong> olup alıcıya aittir. Sipariş özetinde ayrıca gösterilmektedir.
          </div>
        </div>

        {/* Anlaşmalı Kargo Firmaları */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Package size={20} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Anlaşmalı Kargo Firmaları</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">Siparişleriniz aşağıdaki kargo firmaları aracılığıyla gönderilmektedir:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['Sürat Kargo', 'Yurtiçi Kargo', 'Aras Kargo', 'PTT Kargo', 'Gemen Kargo', 'GELİVER'].map(firm => (
              <div key={firm} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700">
                <Truck size={13} className="text-brand-500" />
                {firm}
              </div>
            ))}
          </div>
        </div>

        {/* Sipariş Süreci */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sipariş Süreci</h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Sipariş Oluşturuldu', desc: 'Siparişiniz sistemimize kaydedildi.' },
              { step: '2', title: 'Ödeme Onaylandı', desc: 'Ödemeniz doğrulandı, sipariş işleme alındı.' },
              { step: '3', title: 'Tedarikçiye İletildi', desc: 'Siparişiniz hazırlanmak üzere tedarikçimize iletildi.' },
              { step: '4', title: 'Kargoya Verildi', desc: 'Ürününüz paketlendi ve kargoya teslim edildi. Takip numarası gönderildi.' },
              { step: '5', title: 'Teslim Edildi', desc: 'Siparişiniz belirttiğiniz adrese teslim edildi.' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Adres Uyarısı */}
        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-orange-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-orange-800 mb-1">Teslimat Adresi</h3>
              <p className="text-sm text-orange-700 leading-relaxed">
                Hatalı veya eksik adres bilgisi nedeniyle oluşacak gecikmelerden Venta Premium sorumlu
                tutulamaz. Siparişinizi onaylamadan önce adresinizi kontrol ediniz. Adres değişikliği
                için en kısa sürede <strong>destek@ventapremium.com.tr</strong> adresine yazınız.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
