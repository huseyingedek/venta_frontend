'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { User, MapPin, Package, Plus, Trash2, Check } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const { isAuthenticated, user, _hydrated } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'password'>('profile');
  const qc = useQueryClient();

  useEffect(() => { if (!_hydrated) return; if (!isAuthenticated) router.push('/auth/login'); }, [_hydrated, isAuthenticated]);

  const profileForm = useForm({
    defaultValues: { firstName: '', lastName: '', phone: '' }
  });

  // API'den tam profil çek (phone dahil)
  const { data: profileData } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/users/profile').then(r => r.data.data),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (profileData) {
      profileForm.reset({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        phone: profileData.phone || '',
      });
    }
  }, [profileData?.id]);
  const passwordForm = useForm({ defaultValues: { currentPassword: '', newPassword: '', confirm: '' } });
  const addressForm = useForm({
    defaultValues: { title: '', firstName: '', lastName: '', phone: '', city: '', district: '', fullAddress: '', isDefault: false }
  });
  const [showAddressForm, setShowAddressForm] = useState(false);

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get('/users/addresses').then(r => r.data.data),
    enabled: isAuthenticated,
  });

  const updateProfile = useMutation({
    mutationFn: (data: any) => api.put('/users/profile', data),
    onSuccess: () => toast.success('Profil güncellendi!'),
  });

  const updatePassword = useMutation({
    mutationFn: ({ currentPassword, newPassword }: any) =>
      api.put('/users/password', { currentPassword, newPassword }),
    onSuccess: () => { toast.success('Şifre güncellendi!'); passwordForm.reset(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Hata'),
  });

  const createAddress = useMutation({
    mutationFn: (data: any) => api.post('/users/addresses', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); setShowAddressForm(false); toast.success('Adres eklendi!'); addressForm.reset(); },
  });

  const deleteAddress = useMutation({
    mutationFn: (id: string) => api.delete(`/users/addresses/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Adres silindi.'); },
  });

  const tabs = [
    { key: 'profile', label: 'Profilim', icon: User },
    { key: 'addresses', label: 'Adreslerim', icon: MapPin },
    { key: 'password', label: 'Şifre Değiştir', icon: Check },
  ];

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-bold">Hesabım</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                activeTab === tab.key ? 'bg-brand-600 text-white' : 'bg-white hover:bg-gray-50 text-gray-700'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
          <Link href="/account/orders" className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
            <Package size={16} /> Siparişlerim
          </Link>
        </div>

        {/* İçerik */}
        <div className="lg:col-span-3">
          {/* Profil */}
          {activeTab === 'profile' && (
            <div className="card p-6">
              <h2 className="mb-5 font-bold text-lg">Profil Bilgileri</h2>
              <form onSubmit={profileForm.handleSubmit(d => updateProfile.mutate(d))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Ad</label>
                    <input {...profileForm.register('firstName', { required: true })} className="input" />
                  </div>
                  <div>
                    <label className="label">Soyad</label>
                    <input {...profileForm.register('lastName', { required: true })} className="input" />
                  </div>
                </div>
                <div>
                  <label className="label">E-posta</label>
                  <input value={user?.email || ''} disabled className="input bg-gray-50 text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="label">Telefon</label>
                  <input {...profileForm.register('phone')} type="tel" placeholder="05xx xxx xx xx" className="input" />
                </div>
                <button type="submit" disabled={updateProfile.isPending} className="btn-primary">
                  {updateProfile.isPending ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </form>
            </div>
          )}

          {/* Adresler */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg">Adreslerim</h2>
                <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn-outline gap-2">
                  <Plus size={15} /> Yeni Adres
                </button>
              </div>

              {showAddressForm && (
                <div className="card p-5">
                  <form onSubmit={addressForm.handleSubmit(d => createAddress.mutate(d))} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="label">Başlık *</label>
                        <input {...addressForm.register('title', { required: true })} placeholder="Ev, İş..." className="input" />
                      </div>
                      <div>
                        <label className="label">Ad *</label>
                        <input {...addressForm.register('firstName', { required: true })} className="input" />
                      </div>
                      <div>
                        <label className="label">Soyad *</label>
                        <input {...addressForm.register('lastName', { required: true })} className="input" />
                      </div>
                      <div>
                        <label className="label">Telefon *</label>
                        <input {...addressForm.register('phone', { required: true })} className="input" />
                      </div>
                      <div>
                        <label className="label">İl *</label>
                        <input {...addressForm.register('city', { required: true })} className="input" />
                      </div>
                      <div>
                        <label className="label">İlçe *</label>
                        <input {...addressForm.register('district', { required: true })} className="input" />
                      </div>
                      <div className="col-span-2">
                        <label className="label">Açık Adres *</label>
                        <textarea {...addressForm.register('fullAddress', { required: true })} rows={2} className="input resize-none" />
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" {...addressForm.register('isDefault')} className="accent-brand-600" />
                          <span className="text-sm">Varsayılan adres olarak ayarla</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" className="btn-primary" disabled={createAddress.isPending}>Kaydet</button>
                      <button type="button" onClick={() => setShowAddressForm(false)} className="btn-outline">İptal</button>
                    </div>
                  </form>
                </div>
              )}

              {addresses?.length === 0 && !showAddressForm && (
                <div className="card p-12 text-center text-gray-400">
                  <MapPin size={40} className="mx-auto mb-3 text-gray-300" />
                  <p>Kayıtlı adresiniz yok</p>
                </div>
              )}

              {addresses?.map((addr: any) => (
                <div key={addr.id} className="card p-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800">{addr.title}</p>
                      {addr.isDefault && <span className="badge bg-brand-100 text-brand-700 text-xs">Varsayılan</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{addr.firstName} {addr.lastName} — {addr.phone}</p>
                    <p className="text-sm text-gray-500">{addr.district}, {addr.city}</p>
                    <p className="text-xs text-gray-400">{addr.fullAddress}</p>
                  </div>
                  <button onClick={() => deleteAddress.mutate(addr.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Şifre */}
          {activeTab === 'password' && (
            <div className="card p-6">
              <h2 className="mb-5 font-bold text-lg">Şifre Değiştir</h2>
              <form onSubmit={passwordForm.handleSubmit(d => updatePassword.mutate(d))} className="space-y-4 max-w-sm">
                <div>
                  <label className="label">Mevcut Şifre</label>
                  <input {...passwordForm.register('currentPassword', { required: true })} type="password" className="input" />
                </div>
                <div>
                  <label className="label">Yeni Şifre</label>
                  <input {...passwordForm.register('newPassword', { required: true, minLength: 8 })} type="password" className="input" />
                </div>
                <div>
                  <label className="label">Yeni Şifre Tekrar</label>
                  <input {...passwordForm.register('confirm', { required: true })} type="password" className="input" />
                </div>
                <button type="submit" disabled={updatePassword.isPending} className="btn-primary">
                  {updatePassword.isPending ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
