'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { fetchMe } = useAuthStore();
  const token = searchParams.get('token');
  const id = searchParams.get('id');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !id) { setStatus('error'); setMessage('Geçersiz doğrulama linki.'); return; }

    api.get(`/auth/verify-email?token=${token}&id=${id}`)
      .then(async () => {
        setStatus('success');
        await fetchMe(); // Auth store'u güncelle
        setTimeout(() => router.push('/'), 3000);
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Link geçersiz veya süresi dolmuş.');
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-display text-3xl font-bold text-dark">
              venta<span className="text-brand-600">premium</span>
            </span>
          </Link>
        </div>

        <div className="card p-10 text-center">
          {status === 'loading' && (
            <>
              <Loader2 size={48} className="mx-auto text-brand-500 animate-spin mb-4" />
              <h1 className="text-xl font-bold mb-2">Doğrulanıyor...</h1>
              <p className="text-gray-500 text-sm">E-posta adresiniz doğrulanıyor, lütfen bekleyin.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle size={36} className="text-green-500" />
              </div>
              <h1 className="text-xl font-bold mb-2">E-posta Doğrulandı! 🎉</h1>
              <p className="text-gray-500 text-sm mb-6">
                Hesabınız aktifleştirildi. Ana sayfaya yönlendiriliyorsunuz...
              </p>
              <Link href="/shop" className="btn-primary inline-flex">Alışverişe Başla</Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle size={36} className="text-red-400" />
              </div>
              <h1 className="text-xl font-bold mb-2">Doğrulama Başarısız</h1>
              <p className="text-gray-500 text-sm mb-6">{message}</p>
              <Link href="/auth/login" className="btn-primary inline-flex">Giriş Yap</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 size={32} className="animate-spin text-brand-500" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
