import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
  description: 'Venta Premium gizlilik politikası ve kişisel veri işleme hakkında bilgi.',
};

export default function PrivacyPage() {
  return (
    <div className="container py-12 max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-gray-400 mb-2">
          <Link href="/" className="hover:text-brand-600">Ana Sayfa</Link> / Gizlilik Politikası
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Gizlilik Politikası</h1>
        <p className="mt-2 text-sm text-gray-400">Son güncelleme: Ocak 2025</p>
      </div>

      <div className="card p-8 space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Genel Bilgiler</h2>
          <p>Venta Premium olarak, kişisel verilerinizin güvenliği ve gizliliği konusunda en yüksek önemi göstermekteyiz. Bu Gizlilik Politikası, web sitemizi ve hizmetlerimizi kullanırken toplanan kişisel verilerinizin nasıl işlendiğini, saklandığını ve korunduğunu açıklamaktadır.</p>
          <p className="mt-3">6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu sıfatıyla hareket etmekteyiz.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. Toplanan Kişisel Veriler</h2>
          <p className="mb-3">Sitemizi kullanırken aşağıdaki kişisel verileriniz toplanabilir:</p>
          <ul className="space-y-2 list-disc list-inside text-gray-600">
            <li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li>
            <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, teslimat adresi</li>
            <li><strong>Finansal Bilgiler:</strong> Ödeme yöntemi bilgileri (kart bilgileri şifreli olarak işlenir, saklanmaz)</li>
            <li><strong>İşlem Bilgileri:</strong> Sipariş geçmişi, satın alınan ürünler</li>
            <li><strong>Teknik Veriler:</strong> IP adresi, tarayıcı bilgisi, çerez verileri</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Verilerin İşlenme Amacı</h2>
          <p className="mb-3">Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
          <ul className="space-y-2 list-disc list-inside text-gray-600">
            <li>Siparişlerinizin oluşturulması, işlenmesi ve teslimatı</li>
            <li>Müşteri hizmetleri ve destek sağlanması</li>
            <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Güvenlik ve dolandırıcılık önleme</li>
            <li>Onay vermeniz halinde pazarlama ve kampanya bildirimleri</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Verilerin Saklanması ve Güvenliği</h2>
          <p>Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca saklanmaktadır. Yasal zorunluluklar gereği bazı veriler daha uzun süre saklanabilir.</p>
          <p className="mt-3">Verilerinizi korumak için SSL şifreleme, güvenli sunucular ve erişim kısıtlamaları gibi teknik ve idari güvenlik önlemleri almaktayız. Ödeme bilgileriniz İYZİCO güvencesiyle 256-bit SSL ile şifrelenerek işlenmektedir.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Üçüncü Taraflarla Paylaşım</h2>
          <p className="mb-3">Kişisel verileriniz aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:</p>
          <ul className="space-y-2 list-disc list-inside text-gray-600">
            <li><strong>Kargo Şirketleri:</strong> Teslimat için ad, soyad ve adres bilgileri paylaşılır</li>
            <li><strong>Ödeme Kuruluşları:</strong> İYZİCO ile ödeme işlemleri için gerekli bilgiler paylaşılır</li>
            <li><strong>Yasal Zorunluluklar:</strong> Yetkili makamların talepleri doğrultusunda</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. Çerezler (Cookies)</h2>
          <p>Sitemiz, kullanıcı deneyimini iyileştirmek amacıyla çerezler kullanmaktadır. Oturum çerezleri, tercih çerezleri ve analitik çerezler kullanılmaktadır. Tarayıcınızın ayarlarından çerezleri devre dışı bırakabilirsiniz; ancak bu durumda bazı özellikler çalışmayabilir.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. KVKK Kapsamında Haklarınız</h2>
          <p className="mb-3">6698 sayılı KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul className="space-y-2 list-disc list-inside text-gray-600">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenen verileriniz hakkında bilgi talep etme</li>
            <li>Verilerin işlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya dışında aktarıldığı üçüncü kişileri öğrenme</li>
            <li>Eksik veya yanlış işlenen verilerin düzeltilmesini isteme</li>
            <li>Verilerin silinmesini veya yok edilmesini isteme</li>
            <li>İşlenen verilerin otomatik sistemler aracılığıyla analiz edilmesi sonucu aleyhinize çıkan kararı itiraz etme</li>
          </ul>
          <p className="mt-3">Bu haklarınızı kullanmak için <a href="mailto:destek@ventapremium.com.tr" className="text-brand-600 hover:underline">destek@ventapremium.com.tr</a> adresine e-posta gönderebilirsiniz.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">8. İletişim</h2>
          <p>Gizlilik politikamız hakkında sorularınız için:</p>
          <div className="mt-3 rounded-xl bg-gray-50 p-4 text-sm space-y-1">
            <p><strong>Venta Premium</strong></p>
            <p>E-posta: <a href="mailto:destek@ventapremium.com.tr" className="text-brand-600">destek@ventapremium.com.tr</a></p>
          </div>
        </section>

      </div>
    </div>
  );
}
