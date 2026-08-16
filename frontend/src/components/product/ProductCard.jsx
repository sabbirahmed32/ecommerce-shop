import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Plus, Eye } from 'lucide-react';
import RatingStars from '../ui/RatingStars';
import { formatPrice } from '../../utils/format';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useAuthStore } from '../../stores/authStore';
import { extractError } from '../../api/client';
import { useToastStore } from '../../stores/toastStore';
import QuickViewModal from './QuickViewModal';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=60';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const toast = useToastStore();
  const { user } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.ids.has(product.id));
  const [adding, setAdding] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [quickView, setQuickView] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info('Please sign in to add items to your cart.');
      navigate('/login', { state: { from: `/product/${product.slug}` } });
      return;
    }
    setAdding(true);
    try {
      await addItem(product.id, 1);
      toast.success(`Added ${product.name} to cart.`);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info('Please sign in to save items to your wishlist.');
      navigate('/login', { state: { from: '/wishlist' } });
      return;
    }
    setWishlistBusy(true);
    try {
      const message = await toggleWishlist(product.id);
      toast.success(message);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setWishlistBusy(false);
    }
  };

  const discount = product.discount_percent;

  return (
    <div className="group relative card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-zinc-100">
          <img
            src={product.image || FALLBACK_IMAGE}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {discount && (
            <span className="absolute left-3 top-3 chip bg-red-600 text-white shadow-sm">
              -{discount}%
            </span>
          )}

          <button
            onClick={handleWishlist}
            disabled={wishlistBusy}
            aria-label="Toggle wishlist"
            className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110 ${
              isWishlisted ? 'text-red-500' : 'text-zinc-500 hover:text-red-500'
            }`}
          >
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>

          <div className="absolute inset-x-3 bottom-3 grid grid-cols-2 gap-2 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickView(true);
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-white/95 py-2.5 text-sm font-semibold text-zinc-800 shadow-lg backdrop-blur transition hover:bg-white"
            >
              <Eye size={15} /> Quick View
            </button>
            <button
              onClick={handleAdd}
              disabled={adding || !product.in_stock}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900/95 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur transition hover:bg-zinc-800 disabled:opacity-60"
            >
              {adding ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Plus size={16} />}
              Add
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              {product.category?.name || 'Product'}
            </span>
            {product.in_stock ? (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> In stock
              </span>
            ) : (
              <span className="text-xs font-medium text-red-500">Out of stock</span>
            )}
          </div>

          <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 transition group-hover:text-brand-700">
            {product.name}
          </h3>

          <div className="mt-1.5 flex items-center gap-1.5">
            <RatingStars value={product.rating_avg} size={13} />
            <span className="text-xs text-zinc-400">
              {product.rating_count ? `(${product.rating_count})` : 'No reviews'}
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-lg font-bold text-zinc-900">{formatPrice(product.price)}</span>
            {product.compare_price && (
              <span className="text-sm text-zinc-400 line-through">{formatPrice(product.compare_price)}</span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 lg:hidden">
            <button
              onClick={() => setQuickView(true)}
              aria-label="Quick view"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-brand-300 hover:text-brand-700"
            >
              <Eye size={15} /> Quick View
            </button>
            <button
              onClick={handleAdd}
              disabled={adding || !product.in_stock}
              aria-label="Add to cart"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 active:scale-[.98] disabled:bg-zinc-200 disabled:text-zinc-400"
            >
              <ShoppingBag size={15} />
              {product.in_stock ? 'Add to Cart' : 'Sold Out'}
            </button>
          </div>
        </div>
      </Link>

      <QuickViewModal product={product} open={quickView} onClose={() => setQuickView(false)} />
    </div>
  );
}
