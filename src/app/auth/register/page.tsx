'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

const schema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir e-posta girin'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ confirmPassword, ...data }: FormData) => {
    try {
      await registerUser(data);
      toast.success('Hesabınız oluşturuldu!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Kayıt yapılamadı.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="mb-8 text-center">
            <Link href="/" className="font-display text-2xl font-bold">
              venta<span className="text-brand-600">premium</span>
            </Link>
            <h1 className="mt-4 text-xl font-semibold">Üye Ol</h1>
            <p className="mt-1 text-sm text-gray-500">Hemen üye olun, avantajlardan yararlanın</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Ad</label>
                <input {...register('firstName')} placeholder="Ad" className="input" />
                {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Soyad</label>
                <input {...register('lastName')} placeholder="Soyad" className="input" />
                {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">E-posta</label>
              <input {...register('email')} type="email" placeholder="ornek@email.com" className="input" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Telefon (isteğe bağlı)</label>
              <input {...register('phone')} type="tel" placeholder="05xx xxx xx xx" className="input" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Şifre</label>
              <input {...register('password')} type="password" placeholder="En az 8 karakter" className="input" />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Şifre Tekrar</label>
              <input {...register('confirmPassword')} type="password" placeholder="••••••••" className="input" />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
              {isLoading ? 'Kayıt yapılıyor...' : 'Üye Ol'}
            </button>

            <p className="text-center text-xs text-gray-400">
              Üye olarak <Link href="/terms" className="text-brand-600">Kullanım Koşulları</Link>'nı kabul etmiş sayılırsınız.
            </p>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Zaten üye misiniz?{' '}
            <Link href="/auth/login" className="font-medium text-brand-600 hover:underline">Giriş Yap</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
