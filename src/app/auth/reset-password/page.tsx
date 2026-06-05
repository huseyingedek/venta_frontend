'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const userId = searchParams.get('id');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const rules = [
    { label: 'En az 6 karakter', ok: password.length >= 6 },
    { label: 'Şifreler eşleşiyor', ok: password === confirm && confirm.length > 0 },
  ];
  const valid = rules.every(r => r.ok);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, userId, password });
      setDone(true);
      toast.success('Şifreniz güncellendi!');
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <XCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h1 className="text-xl font-bold mb-2">Geçersiz Link</h1>
          <p className="text-gray-500 text-sm mb-6">Bu şifre sıfırlama linki geçersiz veya süresi dolmuş.</p>
          <Link href="/auth/forgot-password" className="btn-primary inline-flex">Yeni Link İste</Link>
        </div>
      </div>
    );
  }

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

        <div className="card p-8">
          {done ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h1 className="text-xl font-bold mb-2">Şifre Güncellendi!</h1>
              <p className="text-gray-500 text-sm">Giriş sayfasına yönlendiriliyorsunuz...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Yeni Şifre Belirle</h1>
                <p className="mt-1 text-sm text-gray-500">Hesabınız için yeni bir şifre oluşturun.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Yeni Şifre</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">Şifre Tekrar</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="input"
                  />
                </div>

                {/* Kurallar */}
                {password.length > 0 && (
                  <div className="space-y-1">
                    {rules.map(r => (
                      <div key={r.label} className={`flex items-center gap-2 text-xs ${r.ok ? 'text-green-600' : 'text-gray-400'}`}>
                        {r.ok ? <CheckCircle size={13} /> : <XCircle size={13} />}
                        {r.label}
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !valid}
                  className="btn-primary w-full justify-center py-3"
                >
                  {loading ? 'Güncelleniyor...' : 'Şifremi Güncelle'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
