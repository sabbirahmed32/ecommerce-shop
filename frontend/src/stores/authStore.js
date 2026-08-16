import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api';

const sessionStorage = window.sessionStorage;
const localStorage = window.localStorage;

const tokenStorage = {
  getItem: (name) => localStorage.getItem(name) ?? sessionStorage.getItem(name),
  setItem: (name, value) => {
    const remember = useAuthStore.getState().rememberMe;
    const target = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;
    target.setItem(name, value);
    other.removeItem(name);
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: true,
      rememberMe: false,

      setAuth: (token, user) => set({ token, user, loading: false }),
      setUser: (user) => set({ user }),

      login: async (credentials, rememberMe = false) => {
        const { data } = await authApi.login(credentials);
        set({ token: data.data.token, user: data.data.user, loading: false, rememberMe });
        return data;
      },

      register: async (payload) => {
        const { data } = await authApi.register(payload);
        set({ token: data.data.token, user: data.data.user, loading: false });
        return data;
      },

      logout: () => {
        try {
          if (get().token) authApi.logout();
        } catch {
          /* ignore network errors on logout */
        }
        set({ token: null, user: null, loading: false });
      },

      fetchUser: async () => {
        const { data } = await authApi.user();
        set({ user: data.data });
        return data.data;
      },

      updateProfile: async (payload) => {
        const { data } = await authApi.updateProfile(payload);
        set({ user: data.data });
        return data.data;
      },
    }),
    {
      name: 'nova-auth',
      partialize: (state) => ({ token: state.token, user: state.user, rememberMe: state.rememberMe }),
      storage: tokenStorage,
    }
  )
);

export const isAdmin = () => useAuthStore.getState().user?.is_admin === true;
