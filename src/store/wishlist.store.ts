import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export interface WishlistItem {
  productId: string;
}

interface WishlistState {
  items: WishlistItem[];
  toggle: (productId: string) => Promise<void>;
  has: (productId: string) => boolean;
  /** Giriş/kayıt sonrası local favori listesini sunucuya aktar */
  mergeToServer: () => Promise<void>;
}

const isLoggedIn = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('accessToken');
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: async (productId: string) => {
        const already = get().has(productId);

        if (isLoggedIn()) {
          try {
            const res = await api.post('/users/wishlist', { productId });
            const added = res.data.action === 'added';
            if (added) {
              set({ items: [...get().items, { productId }] });
            } else {
              set({ items: get().items.filter(i => i.productId !== productId) });
            }
            toast.success(added ? '❤️ Favorilere eklendi!' : 'Favorilerden çıkarıldı.');
          } catch {
            toast.error('Bir hata oluştu.');
          }
        } else {
          // Guest: sadece localStorage
          if (already) {
            set({ items: get().items.filter(i => i.productId !== productId) });
            toast.success('Favorilerden çıkarıldı.');
          } else {
            set({ items: [...get().items, { productId }] });
            toast.success('❤️ Favorilere eklendi!');
          }
        }
      },

      has: (productId: string) => get().items.some(i => i.productId === productId),

      mergeToServer: async () => {
        const { items } = get();
        if (!items.length) return;
        // Sunucuya ekle (hata olursa sessizce geç)
        await Promise.allSettled(
          items.map(i => api.post('/users/wishlist', { productId: i.productId }))
        );
        // Sunucudan güncel listeyi çekerek local state'i güncelle
        try {
          const res = await api.get('/users/wishlist');
          const serverIds: string[] = (res.data.data || []).map((p: { id: string }) => p.id);
          set({ items: serverIds.map(id => ({ productId: id })) });
        } catch {
          // en kötü ihtimalle local liste kalır
        }
      },
    }),
    {
      name: 'venta-wishlist',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
