import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mesafeli Satış Sözleşmesi | Venta Premium',
  description: 'Venta Premium mesafeli satış sözleşmesi ve tüketici hakları.',
};

export default function MesafeliSatisPage() {
  return (
    <div className="container py-12 max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-gray-400 mb-2">
          <Link href="/" className="hover:text-brand-600">Ana Sayfa</Link> / Mesafeli Satış Sözleşmesi
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Mesafeli Satış Sözleşmesi</h1>
        <p className="mt-2 text-sm text-gray-400">Son güncelleme: Ocak 2025</p>
      </div>

      <div className="card p-8 space-y-8 text-gray-700 leading-relaxed text-sm">

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">MADDE 1 – TARAFLAR</h2>
          <p className="mb-2"><strong>SATICI:</strong></p>
          <ul className="space-y-1 ml-4">
            <li>Marka: Venta Premium</li>
            <li>E-posta: destek@ventapremium.com.tr</li>
            <li>Web: www.ventapremium.com.tr</li>
          </ul>
          <p className="mt-3"><strong>ALICI:</strong> Siteye üye olan ve sipariş veren kişi (bundan sonra "Alıcı" olarak anılacaktır).</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">MADDE 2 – KONU</h2>
          <p>
            İşbu sözleşme, Alıcı'nın www.ventapremium.com.tr adresinden elektronik ortamda sipariş verdiği
            ürünlerin satışı ve teslimatına ilişkin olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun
            ve Mesafeli Sözleşmeler Yönetmeliği hükümleri çerçevesinde tarafların hak ve yükümlülüklerini düzenler.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">MADDE 3 – SÖZLEŞME KONUSU ÜRÜN/HİZMET</h2>
          <p>
            Alıcı'nın sipariş verdiği ürünlerin temel nitelikleri, fiyatları ve ödeme bilgileri sipariş
            özeti sayfasında ve onay e-postasında yer almaktadır. Görseller temsili olup ürün rengi ve
            özellikleri tedarikçi stoğuna göre küçük farklılıklar gösterebilir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">MADDE 4 – FİYAT VE ÖDEME</h2>
          <ul className="space-y-2 ml-4 list-disc">
            <li>Ürün fiyatları KDV dahildir ve Türk Lirası (TRY) cinsinden belirtilmiştir.</li>
            <li>Kargo ücreti alıcıya aittir ve sipariş özetinde ayrıca gösterilir.</li>
            <li>Ödeme yöntemleri: Banka/IBAN havalesi ve kredi/banka kartı (iyzico güvencesiyle).</li>
            <li>Havale ödemelerinde ödemenin tarafımıza ulaşması sipariş onayı için zorunludur.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">MADDE 5 – TESLİMAT</h2>
          <ul className="space-y-2 ml-4 list-disc">
            <li>Ödeme onaylandıktan sonra siparişler tedarikçimize iletilir ve hazırlık süreci başlar.</li>
            <li>Ürünler Sürat Kargo, Yurtiçi Kargo, Aras Kargo veya PTT Kargo ile gönderilir.</li>
            <li>Tahmini teslimat süresi: ödeme onayından itibaren <strong>3–7 iş günü</strong>dür.</li>
            <li>Teslimat adresi yanlış veya eksik girilmişse doğacak gecikmelerden Satıcı sorumlu tutulamaz.</li>
            <li>Kargo takip numarası, ürün kargoya verildikten sonra SMS/e-posta ile bildirilir.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">MADDE 6 – CAYMA HAKKI</h2>
          <p className="mb-2">
            Alıcı, teslim tarihinden itibaren <strong>14 (on dört) gün</strong> içinde herhangi bir gerekçe
            göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.
          </p>
          <p className="mb-2">Cayma hakkını kullanmak için:</p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>destek@ventapremium.com.tr adresine e-posta gönderin veya 0535 467 68 01 numaralı WhatsApp hattımızdan bize ulaşın.</li>
            <li>Ürün orijinal ambalajında, kullanılmamış ve hasarsız olmalıdır.</li>
            <li>Kargo ücreti Alıcı'ya aittir.</li>
            <li>İade onaylandıktan sonra <strong>14 iş günü</strong> içinde ödeme iade edilir.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">MADDE 7 – CAYMA HAKKININ İSTİSNALARI</h2>
          <p>Aşağıdaki ürünlerde cayma hakkı kullanılamaz:</p>
          <ul className="space-y-1 ml-4 list-disc mt-2">
            <li>Ambalajı açılmış, kullanılmış veya hasar görmüş ürünler</li>
            <li>Alıcı'nın talebi üzerine özel olarak hazırlanan ürünler</li>
            <li>Hızlı bozulabilen ürünler</li>
            <li>Dijital içerikler (yazılım, lisans vb.)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">MADDE 8 – GİZLİLİK</h2>
          <p>
            Alıcı'ya ait kişisel veriler, Gizlilik Politikamız ve KVKK kapsamında işlenmekte olup üçüncü
            kişilerle paylaşılmamaktadır.{' '}
            <Link href="/privacy" className="text-brand-600 hover:underline">Gizlilik Politikası</Link>'nı
            inceleyebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">MADDE 9 – UYUŞMAZLIK ÇÖZÜMÜ</h2>
          <p>
            İşbu sözleşmeden doğan uyuşmazlıklarda İstanbul Tüketici Hakem Heyeti ve İstanbul Tüketici
            Mahkemeleri yetkilidir. Tüketici, 6502 sayılı Kanun kapsamında Tüketici Hakem Heyeti'ne veya
            Tüketici Mahkemelerine başvurma hakkına sahiptir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">MADDE 10 – YÜRÜRLÜK</h2>
          <p>
            Alıcı, sipariş tamamlama adımında işbu sözleşmeyi okuduğunu ve kabul ettiğini beyan eder.
            Sözleşme, ödemenin onaylanmasıyla yürürlüğe girer.
          </p>
        </section>

      </div>
    </div>
  );
}
