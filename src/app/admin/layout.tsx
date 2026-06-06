'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  LayoutDashboard, Package, Tags, ShoppingBag, Users,
  Truck, LogOut, Menu, X, BarChart2, LayoutTemplate
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useState } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Ürünler', icon: Package },
  { href: '/admin/categories', label: 'Kategoriler', icon: Tags },
  { href: '/admin/orders', label: 'Siparişler', icon: ShoppingBag },
  { href: '/admin/users', label: 'Kullanıcılar', icon: Users },
  { href: '/admin/suppliers', label: 'Tedarikçi & XML', icon: Truck },
  { href: '/admin/reviews', label: 'Yorumlar', icon: BarChart2 },
  { href: '/admin/homepage', label: 'Anasayfa', icon: LayoutTemplate },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, _hydrated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!_hydrated) return; // localStorage yüklenene kadar bekle
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/');
    }
  }, [_hydrated, isAuthenticated, user]);

  // Hydration tamamlanana kadar boş ekran göster (login'e yanlış yönlendirmeyi önler)
  if (!_hydrated) return null;

  const SidebarContent = () => (
    <aside className="flex h-full flex-col bg-dark text-white">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
        <span className="font-display text-xl font-bold">
          venta<span className="text-brand-400">premium</span>
        </span>
        <span className="rounded-full bg-brand-600/20 px-2 py-0.5 text-[10px] font-bold text-brand-400 uppercase tracking-wider">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(item => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                active ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Kullanıcı */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold">
            {user?.firstName?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={async () => { await logout(); router.push('/'); }}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={15} /> Çıkış Yap
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden w-64 shrink-0 lg:flex lg:flex-col">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 z-50">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b bg-white px-5 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <div className="flex-1 lg:flex-none" />
          <Link href="/" target="_blank" className="text-sm text-gray-500 hover:text-brand-600 transition-colors">
            ↗ Siteye Git
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
