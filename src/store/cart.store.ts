import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export interface CartItem {
  id: string;          // server cart item id (üye) veya `local-${productId}` (guest)
  productId: string;
  quantity: number;
  product: {
    id: string;
    slug?: string;
    name: string;
    price: number;
    thumbnail: string | null;
    stock: number;
    sku?: string;
  };
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number, variantId?: string, productData?: CartItem['product']) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

/** Kullanıcı giriş yapmış mı? token varlığına bakıyoruz */
const isLoggedIn = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('accessToken');
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      /* ── Sepeti sunucudan çek (sadece üye) ─────────────────────── */
      fetchCart: async () => {
        if (!isLoggedIn()) return; // guest: persist'ten gelen local items yeterli
        try {
          const { data } = await api.get('/cart');
          set({ items: data.data.items || [] });
        } catch {}
      },

      /* ── Sepete ekle ────────────────────────────────────────────── */
      addItem: async (productId, quantity = 1, variantId, productData) => {
        set({ isLoading: true });
        try {
          if (isLoggedIn()) {
            // ── Üye: sunucu sepeti
            const { data } = await api.post('/cart/items', { productId, quantity, variantId });
            set({ items: data.data.items || [] });
          } else {
            // ── Guest: local sepet
            const existing = get().items.find(i => i.productId === productId);
            if (existing) {
              set({
                items: get().items.map(i =>
                  i.productId === productId
                    ? { ...i, quantity: i.quantity + quantity }
                    : i
                ),
              });
            } else {
              // Ürün verisi yoksa API'den çek
              let product = productData;
              if (!product) {
                const { data } = await api.get(`/products/${productId}`);
                const p = data.data;
                product = {
                  id: p.id,
                  slug: p.slug,
                  name: p.name,
                  price: Number(p.price),
                  thumbnail: p.thumbnail ?? null,
                  stock: p.stock ?? 99,
                  sku: p.sku,
                };
              }
              const newItem: CartItem = {
                id: `local-${productId}-${Date.now()}`,
                productId,
                quantity,
                product,
              };
              set({ items: [...get().items, newItem] });
            }
          }
          toast.success('Sepete eklendi!');
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Hata oluştu.');
        } finally {
          set({ isLoading: false });
        }
      },

      /* ── Güncelle ───────────────────────────────────────────────── */
      updateItem: async (itemId, quantity) => {
        if (quantity < 1) {
          // 1'den aşağı düşerse ürünü sil
          get().removeItem(itemId);
          return;
        }
        if (isLoggedIn()) {
          try {
            const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
            set({ items: data.data.items || [] });
          } catch {}
        } else {
          set({
            items: get().items.map(i =>
              i.id === itemId ? { ...i, quantity } : i
            ),
          });
        }
      },

      /* ── Çıkar ──────────────────────────────────────────────────── */
      removeItem: async (itemId) => {
        if (isLoggedIn()) {
          try {
            const { data } = await api.delete(`/cart/items/${itemId}`);
            set({ items: data.data.items || [] });
          } catch {}
        } else {
          set({ items: get().items.filter(i => i.id !== itemId) });
        }
        toast.success('Ürün sepetten çıkarıldı.');
      },

      /* ── Temizle ────────────────────────────────────────────────── */
      clearCart: () => {
        if (isLoggedIn()) {
          api.delete('/cart').catch(() => {});
        }
        set({ items: [] });
      },

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: () => get().items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0),
    }),
    {
      name: 'venta-cart', // localStorage key
      // sadece items'ı persist et, isLoading değil
      partialize: (state) => ({ items: state.items }),
    }
  )
);
