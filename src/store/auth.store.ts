import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/** Login/register sonrası local wishlist → server wishlist merge */
async function mergeLocalWishlist() {
  try {
    const raw = localStorage.getItem('venta-wishlist');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const localItems: Array<{ productId: string }> = parsed?.state?.items || [];
    if (!localItems.length) return;
    await Promise.allSettled(
      localItems.map(item => api.post('/users/wishlist', { productId: item.productId }))
    );
    localStorage.removeItem('venta-wishlist');
  } catch {}
}

/** Login/register sonrası local cart → server cart merge */
async function mergeLocalCart() {
  try {
    const raw = localStorage.getItem('venta-cart');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const localItems: Array<{ productId: string; quantity: number }> = parsed?.state?.items || [];
    if (!localItems.length) return;

    // Her local ürünü sunucu sepetine ekle
    await Promise.allSettled(
      localItems.map(item =>
        api.post('/cart/items', { productId: item.productId, quantity: item.quantity })
      )
    );

    // Local cart'ı temizle (artık sunucuda)
    localStorage.removeItem('venta-cart');
  } catch {}
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      _hydrated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          const { user, accessToken, refreshToken } = data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          set({ user, accessToken, isAuthenticated: true });
          // Guest sepet + favorilerini server'a taşı
          await mergeLocalCart();
          await mergeLocalWishlist();
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (formData) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', formData);
          const { user, accessToken, refreshToken } = data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          set({ user, accessToken, isAuthenticated: true });
          // Guest sepet + favorilerini server'a taşı
          await mergeLocalCart();
          await mergeLocalWishlist();
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        await api.post('/auth/logout', { refreshToken }).catch(() => {});
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'venta-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state) state._hydrated = true;
      },
    }
  )
);
