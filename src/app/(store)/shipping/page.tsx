import type { Metadata } from 'next';
import Link from 'next/link';
import { Truck, Clock, MapPin, Package, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kargo Bilgileri',
  description: 'Venta Premium kargo seçenekleri, teslimat süreleri ve ücretleri hakkında bilgi.',
};

export default function ShippingPage() {
  return (
    <div className="container py-12 max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-gray-400 mb-2">
          <Link href="/" className="hover:text-brand-600">Ana Sayfa</Link> / Kargo Bilgileri
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Kargo Bilgileri</h1>
        <p className="mt-2 text-sm text-gray-400">Siparişleriniz hızlı ve güvenli şekilde kapınıza ulaşır.</p>
      </div>

      {/* Özet kartlar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        {[
          { icon: Truck, title: 'Ücretsiz Kargo', desc: '500 TL ve üzeri', color: 'bg-green-50 text-green-600' },
          { icon: Clock, title: '1-3 İş Günü', desc: 'Teslimat süresi', color: 'bg-brand-50 text-brand-600' },
          { icon: MapPin, title: 'Tüm Türkiye', desc: 'Kapıya teslimat', color: 'bg-purple-50 text-purple-600' },
        ].map(item => (
          <div key={item.title} className="card p-5 flex items-center gap-4">
            <div className={`rounded-xl p-3 ${item.color}`}>
              <item.icon size={22} />
            </div>
            <div>
              <p className="font-bold text-gray-900">{item.title}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-8 space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Kargo Ücretleri</h2>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Sipariş Tutarı</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Kargo Ücreti</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Tahmini Süre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-700">500 TL ve üzeri</td>
                  <td className="px-5 py-3"><span className="font-semibold text-green-600">ÜCRETSİZ</span></td>
                  <td className="px-5 py-3 text-gray-500">1-3 iş günü</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-700">500 TL altı</td>
                  <td className="px-5 py-3 font-semibold">29,99 ₺</td>
                  <td className="px-5 py-3 text-gray-500">1-3 iş günü</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Teslimat Süreci</h2>
          <ol className="space-y-5">
            {[
              { step: '1', title: 'Sipariş Onayı', desc: 'Siparişiniz onaylandıktan sonra hazırlık süreci başlar. Onay e-postası ve SMS ile bildirilir.', time: 'Anlık' },
              { step: '2', title: 'Kargo Hazırlığı', desc: 'Ürününüz depodan ayrılıp kargo şirketine teslim edilir.', time: '0-1 iş günü' },
              { step: '3', title: 'Kargoda', desc: 'Kargo firması ürününüzü teslim için yola çıkarır. SMS ile takip numaranız iletilir.', time: '1-2 iş günü' },
              { step: '4', title: 'Teslim', desc: 'Ürününüz belirtilen adrese teslim edilir. Evinizde değilseniz komşunuza veya kapıya not bırakılır.', time: '1-3 iş günü' },
            ].map(item => (
              <li key={item.step} className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white text-sm font-bold">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-gray-800">{item.title}</p>
                    <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2.5 py-1 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Kargo Takibi</h2>
          <p>Siparişiniz kargoya verildikten sonra:</p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-gray-600">
            <li>SMS ile kargo firması ve takip numaranız iletilir</li>
            <li>E-posta ile kargo bilgileri ve takip linki gönderilir</li>
            <li>Hesabım → Siparişlerim sayfasından canlı takip yapabilirsiniz</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Teslimat Saatleri</h2>
          <p>Kargo teslimatları hafta içi <strong>08:00 - 20:00</strong> saatleri arasında yapılmaktadır. Hafta sonu teslimat kargo firmasına ve bölgeye göre değişmektedir.</p>
          <p className="mt-3">Teslimat sırasında adreste bulunmamanız durumunda kargo şirketi 1 iş günü sonra tekrar gelecektir. 3 başarısız denemeden sonra ürün şubeye götürülür.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Hasarlı Teslimat</h2>
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-100 p-4">
            <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 mb-1">Önemli: Teslim Alırken Kontrol Edin</p>
              <p className="text-sm text-amber-700">Kargo paketini teslim alırken dış ambalajı kontrol edin. Hasar tespit etmeniz durumunda kargo görevlisine tutanak tutturun ve paketi kabul etmeyin. Hasar fotoğraflarıyla birlikte bize bildirin.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Yanlış veya Eksik Teslimat</h2>
          <p>Yanlış ürün veya eksik parça teslim aldıysanız teslim tarihinden itibaren <strong>48 saat içinde</strong> <a href="mailto:info@ventapremium.com" className="text-brand-600 hover:underline">info@ventapremium.com</a> adresine fotoğraflı bildirim yapın. Kargo dahil tüm masraflar tarafımızca karşılanarak doğru ürün gönderilir.</p>
        </section>

        <div className="rounded-2xl bg-brand-50 p-5 border border-brand-100">
          <p className="font-semibold text-brand-800 mb-1">Kargo hakkında sorunuz mu var?</p>
          <p className="text-sm text-brand-700">
            <a href="mailto:info@ventapremium.com" className="underline">info@ventapremium.com</a> adresinden bize ulaşın, en kısa sürede yardımcı olalım.
          </p>
        </div>

      </div>
    </div>
  );
}
