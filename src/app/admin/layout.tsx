'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Package, Tags, ShoppingBag, Users,
  Truck, LogOut, Menu, BarChart2, LayoutTemplate,
  Calculator, Bell, ChevronRight, Star,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const navGroups = [
  {
    label: 'Genel',
    items: [
      { href: '/admin',        label: 'Dashboard',  icon: LayoutDashboard },
      { href: '/admin/orders', label: 'Siparişler', icon: ShoppingBag, badgeKey: 'pendingOrders' },
    ],
  },
  {
    label: 'Katalog',
    items: [
      { href: '/admin/products',   label: 'Ürünler',    icon: Package },
      { href: '/admin/categories', label: 'Kategoriler', icon: Tags },
      { href: '/admin/suppliers',  label: 'Tedarikçi & XML', icon: Truck },
    ],
  },
  {
    label: 'Müşteriler & İçerik',
    items: [
      { href: '/admin/users',    label: 'Müşteriler', icon: Users },
      { href: '/admin/reviews',  label: 'Yorumlar',   icon: Star, badgeKey: 'pendingReviews' },
      { href: '/admin/homepage', label: 'Anasayfa',   icon: LayoutTemplate },
    ],
  },
  {
    label: 'Raporlar',
    items: [
      { href: '/admin/kar-hesaplama', label: 'Kar Analizi', icon: Calculator },
    ],
  },
];

function NavItem({ item, pathname, badges, onClose }: any) {
  const active = item.href === '/admin'
    ? pathname === '/admin'
    : pathname.startsWith(item.href);
  const badge = item.badgeKey ? (badges?.[item.badgeKey] ?? 0) : 0;

  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
        active
          ? 'bg-brand-600 text-white shadow-sm'
          : 'text-gray-400 hover:bg-white/[0.07] hover:text-gray-100'
      }`}
    >
      <item.icon size={16} className="shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {badge > 0 && (
        <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
          active ? 'bg-white/25 text-white' : 'bg-red-500 text-white'
        }`}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, _hydrated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: badges } = useQuery({
    queryKey: ['admin-badges'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return {
        pendingOrders: data?.data?.stats?.pendingOrders ?? 0,
        pendingReviews: data?.data?.stats?.pendingReviews ?? 0,
      };
    },
    refetchInterval: 60_000,
    enabled: isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'),
  });

  useEffect(() => {
    if (!_hydrated) return;
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') router.push('/');
  }, [_hydrated, isAuthenticated, user]);

  if (!_hydrated) return null;

  const currentLabel = (() => {
    if (pathname === '/admin') return 'Dashboard';
    for (const g of navGroups)
      for (const item of g.items)
        if (item.href !== '/admin' && pathname.startsWith(item.href)) return item.label;
    return '';
  })();

  const SidebarContent = () => (
    <aside className="flex h-full flex-col bg-[#0f172a]">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-[18px]">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-sm">V</div>
        <div>
          <p className="text-[15px] font-bold text-white leading-none">Venta Premium</p>
          <p className="mt-0.5 text-[11px] text-gray-500">Yönetim Paneli</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavItem key={item.href} item={item} pathname={pathname} badges={badges} onClose={() => setSidebarOpen(false)} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-white/[0.08] p-3 space-y-1">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.05] px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
            {user?.firstName?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
            <p className="truncate text-[11px] text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={async () => { await logout(); router.push('/'); }}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-500 hover:bg-white/[0.06] hover:text-red-400 transition-colors"
        >
          <LogOut size={15} /> Çıkış Yap
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden w-60 shrink-0 lg:flex lg:flex-col">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-60 z-50"><SidebarContent /></div>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-white px-5 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden rounded-lg p-1.5 hover:bg-gray-100 text-gray-600"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm">
            <span className="text-gray-400">Admin</span>
            <ChevronRight size={13} className="text-gray-300" />
            <span className="font-semibold text-gray-800">{currentLabel}</span>
          </div>

          <div className="flex-1" />

          {/* Notification bell */}
          {(badges?.pendingOrders ?? 0) > 0 && (
            <Link
              href="/admin/orders"
              className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100 transition-colors"
            >
              <Bell size={13} />
              {badges!.pendingOrders} yeni sipariş
            </Link>
          )}

          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          >
            ↗ Siteye Git
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
