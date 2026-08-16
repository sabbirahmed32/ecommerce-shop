import { create } from 'zustand';
import { cartApi } from '../api';

export const useCartStore = create((set, get) => ({
  items: [],
  count: 0,
  subtotal: 0,
  coupon_code: null,
  discount: 0,
  shipping: 0,
  tax: 0,
  total: 0,
  loading: false,

  setCart: (payload) =>
    set({
      items: payload.items || [],
      count: payload.count || 0,
      subtotal: payload.subtotal || 0,
      coupon_code: payload.coupon_code || null,
      discount: payload.discount || 0,
      shipping: payload.shipping || 0,
      tax: payload.tax || 0,
      total: payload.total || 0,
    }),

  fetchCart: async () => {
    set({ loading: true });
    try {
      const { data } = await cartApi.index();
      get().setCart(data.data);
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (productId, quantity = 1, options = {}) => {
    const { data } = await cartApi.add({ product_id: productId, quantity, ...options });
    get().setCart(data.data);
    return data.message;
  },

  updateItem: async (id, quantity) => {
    const { data } = await cartApi.update(id, quantity);
    get().setCart(data.data);
    return data.message;
  },

  removeItem: async (id) => {
    const { data } = await cartApi.remove(id);
    get().setCart(data.data);
    return data.message;
  },

  clear: async () => {
    const { data } = await cartApi.clear();
    get().setCart(data.data);
  },

  applyCoupon: async (code) => {
    const { data } = await cartApi.applyCoupon(code);
    get().setCart(data.data);
    return data.message;
  },

  removeCoupon: async () => {
    const { data } = await cartApi.removeCoupon();
    get().setCart(data.data);
    return data.message;
  },

  reset: () => set({ items: [], count: 0, subtotal: 0, coupon_code: null, discount: 0, shipping: 0, tax: 0, total: 0, loading: false }),
}));
