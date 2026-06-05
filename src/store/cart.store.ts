import { create } from 'zustand';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    thumbnail: string | null;
    stock: number;
  };
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async () => {
    try {
      const { data } = await api.get('/cart');
      set({ items: data.data.items || [] });
    } catch {}
  },

  addItem: async (productId, quantity = 1, variantId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/cart/items', { productId, quantity, variantId });
      set({ items: data.data.items || [] });
      toast.success('Sepete eklendi!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Hata oluştu.');
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
      set({ items: data.data.items || [] });
    } catch {}
  },

  removeItem: async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/items/${itemId}`);
      set({ items: data.data.items || [] });
      toast.success('Ürün sepetten çıkarıldı.');
    } catch {}
  },

  clearCart: async () => {
    try {
      await api.delete('/cart');
      set({ items: [] });
    } catch {}
  },

  totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  totalPrice: () => get().items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0),
}));
