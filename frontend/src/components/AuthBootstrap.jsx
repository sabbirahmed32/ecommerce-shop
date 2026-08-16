import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { extractError } from '../api/client';

export function AuthBootstrap() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const resetCart = useCartStore((s) => s.reset);
  const resetWishlist = useWishlistStore((s) => s.reset);

  useEffect(() => {
    const bootstrap = async () => {
      if (token && !user) {
        try {
          await fetchUser();
          fetchCart().catch(() => {});
          fetchWishlist().catch(() => {});
        } catch {
          useAuthStore.getState().logout();
        }
      } else if (!token) {
        resetCart();
        resetWishlist();
      }
    };
    bootstrap();
  }, [token]);

  return null;
}
