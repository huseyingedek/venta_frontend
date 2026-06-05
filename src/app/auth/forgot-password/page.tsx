'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-display text-3xl font-bold text-dark">
              venta<span className="text-brand-600">premium</span>
            </span>
          </Link>
        </div>

        <div className="card p-8">
          {sent ? (
            /* Başarı durumu */
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">E-posta Gönderildi!</h1>
              <p className="text-gray-500 text-sm mb-6">
                <strong>{email}</strong> adresine şifre sıfırlama linki gönderdik.
                Gelen kutunuzu ve spam klasörünüzü kontrol edin.
              </p>
              <p className="text-xs text-gray-400 mb-6">Link 1 saat geçerlidir.</p>
              <Link href="/auth/login" className="btn-primary w-full justify-center">
                Giriş Sayfasına Dön
              </Link>
            </div>
          ) : (
            /* Form */
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Şifremi Unuttum</h1>
                <p className="mt-1 text-sm text-gray-500">
                  E-posta adresinizi girin, size sıfırlama linki gönderelim.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">E-posta Adresi</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="input pl-9"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="btn-primary w-full justify-center py-3"
                >
                  {loading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  <ArrowLeft size={14} /> Giriş sayfasına dön
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
