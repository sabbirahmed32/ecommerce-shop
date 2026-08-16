import { create } from 'zustand';

let idCounter = 0;

export const useToastStore = create((set) => ({
  toasts: [],

  push: (type, message) => {
    const id = ++idCounter;
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4200);
  },

  success: (message) => get().push('success', message),
  error: (message) => get().push('error', message),
  info: (message) => get().push('info', message),

  remove: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const get = () => useToastStore.getState();
