'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Search, Shield, ShieldOff, UserX, UserCheck } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const roleColors: Record<string, string> = {
  CUSTOMER: 'bg-gray-100 text-gray-600',
  ADMIN: 'bg-blue-100 text-blue-700',
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery<any[]>({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then(r => r.data.data),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, ...payload }: any) => api.patch(`/admin/users/${id}`, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Kullanıcı güncellendi.'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Hata'),
  });

  const filtered = data.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Kullanıcılar</h1>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ad, soyad veya e-posta ara..."
            className="input pl-9"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-5 py-3">Kullanıcı</th>
              <th className="px-5 py-3">Rol</th>
              <th className="px-5 py-3">Sipariş</th>
              <th className="px-5 py-3">Durum</th>
              <th className="px-5 py-3">Kayıt Tarihi</th>
              <th className="px-5 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-5 py-4"><div className="animate-pulse h-4 bg-gray-100 rounded" /></td>)}</tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">Kullanıcı bulunamadı</td></tr>
            ) : (
              filtered.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-sm shrink-0">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={user.role}
                      onChange={e => updateUser.mutate({ id: user.id, role: e.target.value })}
                      className={`badge cursor-pointer border-0 outline-none ${roleColors[user.role]}`}
                    >
                      <option value="CUSTOMER">Müşteri</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Süper Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{user._count?.orders || 0}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {user.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => updateUser.mutate({ id: user.id, isActive: !user.isActive })}
                        className={`p-1.5 rounded transition-colors ${user.isActive ? 'hover:bg-red-50 text-gray-400 hover:text-red-500' : 'hover:bg-green-50 text-gray-400 hover:text-green-500'}`}
                        title={user.isActive ? 'Deaktive et' : 'Aktive et'}
                      >
                        {user.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!isLoading && (
          <div className="border-t px-5 py-3 text-xs text-gray-400">
            Toplam {filtered.length} kullanıcı
          </div>
        )}
      </div>
    </div>
  );
}
