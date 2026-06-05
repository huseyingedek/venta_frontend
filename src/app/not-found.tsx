import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <p className="text-8xl font-bold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Sayfa Bulunamadı</h1>
      <p className="mt-2 text-gray-500">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-primary">Ana Sayfaya Dön</Link>
        <Link href="/shop" className="btn-outline">Ürünlere Göz At</Link>
      </div>
    </div>
  );
}
