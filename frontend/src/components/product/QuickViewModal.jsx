import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Minus, Plus, Star } from 'lucide-react';
import RatingStars from '../ui/RatingStars';
import { formatPrice } from '../../utils/format';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import { extractError } from '../../api/client';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=60';

export default function QuickViewModal({ product, open, onClose }) {
  const navigate = useNavigate();
  const toast = useToastStore();
  const { user } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveImage(0);
      setQty(1);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !product) return null;

  const images = product.all_images?.length ? product.all_images : product.images?.length ? product.images : [product.image || FALLBACK_IMAGE];

  const handleAdd = async () => {
    if (!user) {
      toast.info('Please sign in to add items to your cart.');
      onClose();
      navigate('/login', { state: { from: `/product/${product.slug}` } });
      return;
    }
    setAdding(true);
    try {
      await addItem(product.id, qty);
      toast.success(`Added ${product.name} to cart.`);
      onClose();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className="relative grid w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-lift animate-scale-in md:grid-cols-2"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-sm ring-1 ring-zinc-200 transition hover:bg-zinc-100"
          aria-label="Close quick view"
        >
          <X size={18} />
        </button>

        <div className="p-4 sm:p-6">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-zinc-100">
            <img
              src={images[activeImage] || FALLBACK_IMAGE}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
            {product.discount_percent && (
              <span className="absolute left-3 top-3 chip bg-red-600 text-white shadow-sm">-{product.discount_percent}%</span>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-2 transition ${
                    i === activeImage ? 'ring-brand-600' : 'ring-transparent hover:ring-zinc-300'
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col p-5 sm:p-6">
          <div className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
            <span>{product.category?.name || 'Product'}</span>
            {product.brand && (
              <>
                <span className="text-zinc-300">•</span>
                <span className="text-zinc-600">{product.brand}</span>
              </>
            )}
          </div>

          <h3 className="text-xl font-bold tracking-tight text-zinc-900">{product.name}</h3>

          <div className="mt-2 flex items-center gap-2">
            <RatingStars value={product.rating_avg} size={15} />
            <span className="text-sm text-zinc-500">
              {Number(product.rating_avg || 0).toFixed(1)}
              <span className="text-zinc-400"> ({product.rating_count || 0} reviews)</span>
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-2xl font-extrabold text-zinc-900">{formatPrice(product.price)}</span>
            {product.compare_price && (
              <span className="text-base text-zinc-400 line-through">{formatPrice(product.compare_price)}</span>
            )}
          </div>

          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-600">{product.description}</p>

          <div className="mt-3 flex items-center gap-2 text-sm">
            {product.in_stock ? (
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                <Star size={13} className="fill-emerald-500 text-emerald-500" /> In stock
              </span>
            ) : (
              <span className="font-semibold text-red-500">Out of stock</span>
            )}
            {product.sku && <span className="text-zinc-400">• SKU: {product.sku}</span>}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-zinc-200">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-100" aria-label="Decrease quantity">
                <Minus size={16} />
              </button>
              <span className="w-8 text-center text-sm font-bold tabular-nums">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-100" aria-label="Increase quantity">
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={adding || !product.in_stock}
              className="btn-primary flex-1 !py-3 disabled:opacity-60"
            >
              {adding ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <ShoppingBag size={16} />}
              {product.in_stock ? 'Add to Cart' : 'Sold Out'}
            </button>
          </div>

          <div className="mt-4 border-t border-zinc-100 pt-4">
            <Link
              to={`/product/${product.slug}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition hover:text-brand-800"
            >
              View Full Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
