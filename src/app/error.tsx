'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <p className="text-6xl mb-4">⚠️</p>
      <h1 className="text-2xl font-bold text-gray-900">Bir hata oluştu</h1>
      <p className="mt-2 text-gray-500 max-w-md">Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.</p>
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="btn-primary">Tekrar Dene</button>
        <Link href="/" className="btn-outline">Ana Sayfaya Dön</Link>
      </div>
    </div>
  );
}
