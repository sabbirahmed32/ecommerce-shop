import { create } from 'zustand';
import { wishlistApi } from '../api';

export const useWishlistStore = create((set, get) => ({
  ids: new Set(),
  products: [],
  loading: false,

  setWishlist: (ids, products = []) => set({ ids: new Set(ids), products }),

  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const { data } = await wishlistApi.index();
      get().setWishlist(data.data.products.map((p) => p.id), data.data.products);
    } finally {
      set({ loading: false });
    }
  },

  toggle: async (productId) => {
    const { data } = await wishlistApi.toggle(productId);
    const ids = new Set(data.data.wishlist_ids);
    set({ ids });
    if (get().products.length) {
      const { data: list } = await wishlistApi.index();
      get().setWishlist(list.data.products.map((p) => p.id), list.data.products);
    }
    return data.message;
  },

  remove: async (productId) => {
    const { data } = await wishlistApi.remove(productId);
    set({
      ids: new Set(data.data.wishlist_ids),
      products: get().products.filter((p) => p.id !== productId),
    });
  },

  reset: () => set({ ids: new Set(), products: [], loading: false }),
}));
