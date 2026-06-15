import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock, Package, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'İade & Değişim | Venta Premium',
  description: 'Venta Premium iade ve değişim koşulları, iade süreci hakkında bilgi.',
};

export default function ReturnsPage() {
  return (
    <div className="container py-12 max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-gray-400 mb-2">
          <Link href="/" className="hover:text-brand-600">Ana Sayfa</Link> / İade & Değişim
        </p>
        <h1 className="text-3xl font-bold text-gray-900">İade & Değişim Politikası</h1>
        <p className="mt-2 text-sm text-gray-400">Müşteri memnuniyeti önceliğimizdir.</p>
      </div>

      <div className="space-y-5">

        {/* Cayma Hakkı */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
              <Clock size={20} className="text-brand-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">14 Günlük Cayma Hakkı</h2>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            6502 sayılı Tüketicinin Korunması Hakkında Kanun gereğince, ürünü teslim aldığınız tarihten
            itibaren <strong>14 gün içinde</strong> herhangi bir gerekçe göstermeksizin iade hakkınızı kullanabilirsiniz.
          </p>
        </div>

        {/* İade Koşulları */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">İade Kabul Koşulları</h2>
          <div className="space-y-3">
            {[
              { ok: true, text: 'Ürün orijinal ambalajında ve hasarsız olmalıdır' },
              { ok: true, text: 'Ürün kullanılmamış olmalıdır' },
              { ok: true, text: 'Tüm aksesuarlar ve etiketler eksiksiz olmalıdır' },
              { ok: true, text: 'Fatura veya sipariş numarası belirtilmelidir' },
              { ok: false, text: 'Ambalajı açılmış veya kullanılmış ürünler iade alınmaz' },
              { ok: false, text: '14 günlük süreyi geçmiş iadeler kabul edilmez' },
              { ok: false, text: 'Müşteri kusurundan kaynaklanan hasarlar iade kapsamında değildir' },
            ].map(item => (
              <div key={item.text} className="flex items-start gap-2.5 text-sm">
                {item.ok
                  ? <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
                  : <XCircle size={15} className="text-red-400 mt-0.5 shrink-0" />}
                <span className={item.ok ? 'text-gray-700' : 'text-gray-500'}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* İade Süreci */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Package size={20} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">İade Süreci</h2>
          </div>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Bize Ulaşın', desc: 'WhatsApp veya e-posta yoluyla sipariş numaranızı ve iade nedeninizi bildirin.' },
              { step: '2', title: 'Onay Alın', desc: 'İade talebiniz incelenir, onaylanması durumunda iade adresi tarafınıza iletilir.' },
              { step: '3', title: 'Ürünü Gönderin', desc: 'Ürünü orijinal ambalajında paketleyerek belirtilen adrese gönderin. Kargo ücreti alıcıya aittir.' },
              { step: '4', title: 'İnceleme', desc: 'Ürün tarafımıza ulaştıktan sonra 2 iş günü içinde incelenir.' },
              { step: '5', title: 'İade', desc: 'Onaylanan iadelerde ödeme, 14 iş günü içinde orijinal ödeme yönteminize iade edilir.' },
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

        {/* Hasarlı / Hatalı Ürün */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Hasarlı veya Hatalı Ürün</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Kargo hasarı veya yanlış ürün gönderimi durumunda kargo ücreti tarafımızca karşılanır.
            Ürünü teslim alırken hasar tespit ederseniz kargo görevlisine tutanak tutturunuz ve
            bize fotoğraflı bildirim yapınız.
          </p>
        </div>

        {/* İletişim */}
        <div className="rounded-2xl bg-brand-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <MessageCircle size={20} />
            <h3 className="font-bold">İade Talebi İçin Bize Yazın</h3>
          </div>
          <p className="text-sm text-brand-100 mb-4">
            İade sürecinizi başlatmak için aşağıdaki kanallardan bize ulaşabilirsiniz:
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://wa.me/905354676801?text=Merhaba%2C%20iade%20talebi%20olu%C5%9Fturmak%20istiyorum."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-white/30 transition-colors"
            >
              <MessageCircle size={15} /> WhatsApp — 0535 467 68 01
            </a>
            <a
              href="mailto:destek@ventapremium.com.tr"
              className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-white/30 transition-colors"
            >
              ✉️ destek@ventapremium.com.tr
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
