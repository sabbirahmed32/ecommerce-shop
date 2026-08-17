import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlistStore } from '../stores/wishlistStore';
import { useCartStore } from '../stores/cartStore';
import { useToastStore } from '../stores/toastStore';
import { extractError } from '../api/client';
import { formatPrice } from '../utils/format';
import EmptyState from '../components/ui/EmptyState';
import RatingStars from '../components/ui/RatingStars';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

export default function WishlistPage() {
  const toast = useToastStore();
  const { products, loading, remove } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    useWishlistStore.getState().fetchWishlist().catch(() => {});
  }, []);

  const addToCart = async (product) => {
    try {
      await addItem(product.id, 1);
      await useWishlistStore.getState().remove(product.id);
      toast.success(`${product.name} moved to cart.`);
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const removeItem = async (productId, name) => {
    try {
      await remove(productId);
      toast.success(`${name} removed from wishlist.`);
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-zinc-900">
        <Heart size={28} className="text-red-500" fill="currentColor" /> My Wishlist
      </h1>
      <p className="mt-2 text-zinc-500">{products.length} {products.length === 1 ? 'item' : 'items'} saved</p>

      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Tap the heart on any product to save it here for later."
            action={<Link to="/shop"><Button variant="primary">Browse Products</Button></Link>}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {products.map((product) => (
              <div key={product.id} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
                <Link to={`/product/${product.slug}`} className="relative block overflow-hidden bg-zinc-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                    onError={(e) => (e.currentTarget.style.opacity = 0.15)}
                  />
                  {product.discount_percent && (
                    <span className="absolute left-3 top-3 chip bg-red-600 text-white">-{product.discount_percent}%</span>
                  )}
                  <button
                    onClick={() => removeItem(product.id, product.name)}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-sm transition hover:bg-red-50 hover:text-red-500"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={15} />
                  </button>
                </Link>
                <div className="p-4">
                  <Link to={`/product/${product.slug}`} className="line-clamp-1 text-sm font-semibold text-zinc-900 hover:text-brand-700">
                    {product.name}
                  </Link>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <RatingStars value={product.rating_avg} size={12} />
                    <span className="text-xs text-zinc-400">{product.rating_count}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-zinc-900">{formatPrice(product.price)}</span>
                      {product.compare_price && (
                        <span className="text-xs text-zinc-400 line-through">{formatPrice(product.compare_price)}</span>
                      )}
                    </div>
                    <span className={`text-xs font-semibold ${product.in_stock ? 'text-emerald-600' : 'text-red-500'}`}>
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!product.in_stock}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 active:scale-[.98] disabled:bg-zinc-200 disabled:text-zinc-400"
                  >
                    <ShoppingBag size={15} /> {product.in_stock ? 'Add to Cart' : 'Sold Out'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
