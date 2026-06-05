import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock, Package, PhoneCall } from 'lucide-react';

export const metadata: Metadata = {
  title: 'İade & Değişim',
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

      {/* Hızlı özet kartları */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        {[
          { icon: Clock, title: '14 Gün', desc: 'İade süresi', color: 'bg-brand-50 text-brand-600' },
          { icon: Package, title: 'Ücretsiz', desc: 'İade kargosu', color: 'bg-green-50 text-green-600' },
          { icon: PhoneCall, title: 'Hızlı', desc: 'Geri ödeme', color: 'bg-blue-50 text-blue-600' },
        ].map(item => (
          <div key={item.title} className="card p-5 flex items-center gap-4">
            <div className={`rounded-xl p-3 ${item.color}`}>
              <item.icon size={22} />
            </div>
            <div>
              <p className="font-bold text-lg text-gray-900">{item.title}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-8 space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">İade Koşulları</h2>
          <p className="mb-4">Satın aldığınız ürünü, teslim tarihinden itibaren <strong>14 gün içinde</strong> iade edebilirsiniz. İade işleminin geçerli olabilmesi için aşağıdaki koşulların sağlanması gerekmektedir:</p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
              <p>Ürün, orijinal ambalajında ve kullanılmamış olmalıdır</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
              <p>Ürünle birlikte gelen tüm aksesuarlar ve belgeler eksiksiz olmalıdır</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
              <p>Ürün üzerindeki etiketler çıkarılmamış ve barkodlar hasar görmemiş olmalıdır</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
              <p>Fatura veya sipariş numarası ibraz edilmelidir</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">İade Edilemeyen Ürünler</h2>
          <div className="space-y-3">
            {[
              'Kişisel hijyen ürünleri (iç çamaşırı, mayo vb.) — ambalajı açılmış ise',
              'Dijital içerikler ve yazılımlar — aktivasyon sonrası',
              'Özel sipariş veya kişiselleştirilmiş ürünler',
              'Gıda ve hızlı bozulan ürünler',
              'Sağlık ve güvenlik mühürü kırılmış kozmetik ürünler',
            ].map(item => (
              <div key={item} className="flex items-start gap-3">
                <XCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">İade Süreci</h2>
          <ol className="space-y-4">
            {[
              { step: '1', title: 'İade Talebi Oluşturun', desc: 'Hesabınıza giriş yapın, ilgili siparişi seçin ve "İade Talebi" butonuna tıklayın. Veya info@ventapremium.com adresine e-posta gönderin.' },
              { step: '2', title: 'Onay Bekleyin', desc: 'İade talebiniz 1-2 iş günü içinde değerlendirilir. Onay durumu e-posta ile bildirilir.' },
              { step: '3', title: 'Ürünü Kargoya Verin', desc: 'Onay sonrası ürünü orijinal ambalajına koyun ve belirtilen kargo firmasıyla gönderin. Kargo ücreti tarafımızca karşılanır.' },
              { step: '4', title: 'Geri Ödeme', desc: 'Ürün tarafımıza ulaştıktan ve inceleme tamamlandıktan sonra 3-7 iş günü içinde ödeme iadesi yapılır.' },
            ].map(item => (
              <li key={item.step} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white text-sm font-bold">
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{item.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Geri Ödeme Yöntemi</h2>
          <p>Geri ödeme, ödemenizin yapıldığı yönteme iade edilir:</p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-gray-600">
            <li><strong>Kredi Kartı:</strong> 3-7 iş günü (bankanıza göre değişebilir)</li>
            <li><strong>Banka Havalesi:</strong> 2-5 iş günü</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Değişim</h2>
          <p>Ürünü farklı beden, renk veya model ile değiştirmek istiyorsanız iade talebi oluştururken "Değişim" seçeneğini işaretleyin. Değişim stoka bağlı olup stokta bulunmaması durumunda para iadesi yapılır.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Hasarlı veya Hatalı Ürün</h2>
          <p>Ürün hasarlı, eksik veya yanlış geldiyse 48 saat içinde fotoğraf ile birlikte <a href="mailto:info@ventapremium.com" className="text-brand-600 hover:underline">info@ventapremium.com</a> adresine bildirin. Bu durumlarda kargo dahil tüm masraflar tarafımızca karşılanır ve öncelikli işleme alınır.</p>
        </section>

        <div className="rounded-2xl bg-brand-50 p-5 border border-brand-100">
          <p className="font-semibold text-brand-800 mb-1">Sorularınız mı var?</p>
          <p className="text-sm text-brand-700">
            <a href="mailto:info@ventapremium.com" className="underline">info@ventapremium.com</a> adresinden veya hesabınızdaki canlı destek üzerinden bize ulaşabilirsiniz.
          </p>
        </div>

      </div>
    </div>
  );
}
