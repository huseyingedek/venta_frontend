'use client';
import { useQuery } from '@tanstack/react-query';
import { Package, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-orange-100 text-orange-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  PAYMENT_FAILED: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Bekliyor', CONFIRMED: 'Onaylandı', PREPARING: 'Hazırlanıyor',
  SHIPPED: 'Kargoda', DELIVERED: 'Teslim Edildi', CANCELLED: 'İptal',
  PAYMENT_FAILED: 'Ödeme Başarısız',
};

function TRYFormatter(value: number) {
  return value >= 1000
    ? `${(value / 1000).toFixed(1)}K ₺`
    : `${value} ₺`;
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data.data),
  });

  const stats = data?.stats;

  const statCards = [
    { label: 'Aktif Ürün', value: stats?.totalProducts, icon: Package, color: 'blue', href: '/admin/products' },
    { label: 'Toplam Sipariş', value: stats?.totalOrders, icon: ShoppingBag, color: 'orange', href: '/admin/orders' },
    { label: 'Müşteri', value: stats?.totalUsers, icon: Users, color: 'purple', href: '/admin/users' },
    {
      label: 'Toplam Ciro',
      value: stats?.totalRevenue
        ? Number(stats.totalRevenue).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
        : '0 ₺',
      icon: TrendingUp, color: 'green', href: '#',
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stat Kartları */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(card => (
          <Link key={card.label} href={card.href} className="card p-5 hover:shadow-card-hover transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {isLoading
                    ? <span className="animate-pulse bg-gray-200 rounded h-7 w-16 inline-block" />
                    : card.value ?? '—'}
                </p>
              </div>
              <div className={`rounded-xl p-2.5 ${colorMap[card.color]}`}>
                <card.icon size={20} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Grafik + Son Siparişler yan yana */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* Haftalık Gelir Grafiği */}
        <div className="card p-6 xl:col-span-3">
          <h2 className="font-bold text-gray-800 mb-4">Son 7 Günlük Gelir</h2>
          {isLoading ? (
            <div className="animate-pulse h-48 rounded-xl bg-gray-100" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.weeklyRevenue || []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={TRYFormatter} tick={{ fontSize: 11 }} width={55} />
                <Tooltip
                  formatter={(val: number) => [Number(val).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }), 'Gelir']}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar dataKey="gelir" fill="#f97316" radius={[6, 6, 0, 0]} name="Gelir" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sipariş Sayısı Mini Grafik */}
        <div className="card p-6 xl:col-span-2">
          <h2 className="font-bold text-gray-800 mb-4">Günlük Sipariş</h2>
          {isLoading ? (
            <div className="animate-pulse h-48 rounded-xl bg-gray-100" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.weeklyRevenue || []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={30} />
                <Tooltip
                  formatter={(val: number) => [val, 'Sipariş']}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar dataKey="siparis" fill="#6366f1" radius={[6, 6, 0, 0]} name="Sipariş" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Son Siparişler */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Son Siparişler</h2>
          <Link href="/admin/orders" className="text-sm text-brand-600 hover:underline">Tümünü Gör →</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="pb-3 pr-4">Sipariş No</th>
                <th className="pb-3 pr-4">Müşteri</th>
                <th className="pb-3 pr-4">Tutar</th>
                <th className="pb-3 pr-4">Durum</th>
                <th className="pb-3">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="py-3 pr-4">
                        <div className="animate-pulse h-4 bg-gray-100 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.recentOrders?.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">Henüz sipariş yok</td></tr>
              ) : (
                data?.recentOrders?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4 font-mono font-medium text-brand-600 text-xs">
                      #{order.orderNumber}
                    </td>
                    <td className="py-3 pr-4 text-gray-700">
                      {order.user.firstName} {order.user.lastName}
                    </td>
                    <td className="py-3 pr-4 font-semibold">
                      {Number(order.total).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
