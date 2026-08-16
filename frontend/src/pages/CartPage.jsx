import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Trash2, Heart, ArrowRight, Tag, Percent, X, Check } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { extractError } from '../api/client';
import { useToastStore } from '../stores/toastStore';
import { formatPrice } from '../utils/format';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

const FREE_SHIPPING_THRESHOLD = 100;

export default function CartPage() {
  const navigate = useNavigate();
  const toast = useToastStore();
  const { items, count, subtotal, discount, shipping, tax, total, coupon_code, updateItem, removeItem, clear, applyCoupon, removeCoupon } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const wishlistIds = useWishlistStore((s) => s.ids);
  const [busyId, setBusyId] = useState(null);
  const [code, setCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [couponBusy, setCouponBusy] = useState(false);

  const afterDiscount = subtotal - discount;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - afterDiscount);
  const progress = Math.min(100, (afterDiscount / FREE_SHIPPING_THRESHOLD) * 100);

  const handleQty = async (item, delta) => {
    const next = item.quantity + delta;
    if (next < 1) return;
    setBusyId(item.id);
    try {
      await updateItem(item.id, next);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (item) => {
    setBusyId(item.id);
    try {
      await removeItem(item.id);
      toast.success('Item removed from cart.');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleMoveToWishlist = async (item) => {
    if (!user) {
      toast.info('Please sign in to save items to your wishlist.');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    setBusyId(item.id);
    try {
      await toggleWishlist(item.product.id);
      await removeItem(item.id);
      toast.success('Moved to your wishlist.');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setApplying(true);
    try {
      await applyCoupon(trimmed);
      setCode('');
      toast.success('Coupon applied successfully.');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponBusy(true);
    try {
      await removeCoupon();
      toast.info('Coupon removed.');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setCouponBusy(false);
    }
  };

  const handleClear = async () => {
    try {
      await clear();
      toast.info('Cart cleared.');
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const goCheckout = () => {
    if (!user) {
      toast.info('Please sign in to continue checkout.');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-16 lg:py-24">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore our collection and find something you love."
          action={
            <Link to="/shop">
              <Button variant="primary">Start Shopping</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Shopping Cart</h1>
      <p className="mt-2 text-zinc-500">{count} {count === 1 ? 'item' : 'items'} in your cart</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100">
            <div className="flex items-center gap-2 text-sm font-medium text-brand-800">
              <Tag size={15} />
              {remaining > 0 ? (
                <span>Add <strong>{formatPrice(remaining)}</strong> more for FREE shipping!</span>
              ) : (
                <span>You've unlocked FREE shipping!</span>
              )}
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white ring-1 ring-brand-100">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="card divide-y divide-zinc-100">
            {items.map((item) => {
              const inWishlist = wishlistIds.has(item.product.id);
              return (
                <div key={item.id} className="flex gap-4 p-4 sm:p-5">
                  <Link to={`/product/${item.product.slug}`} className="shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-24 w-24 rounded-2xl bg-zinc-100 object-cover sm:h-28 sm:w-28"
                      onError={(e) => (e.currentTarget.style.opacity = 0.15)}
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link to={`/product/${item.product.slug}`} className="line-clamp-2 font-semibold text-zinc-900 transition hover:text-brand-700">
                          {item.product.name}
                        </Link>
                        {(item.color || item.size) && (
                          <p className="mt-0.5 text-xs text-zinc-400">
                            {[item.color, item.size].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-zinc-500">
                          {item.product.in_stock ? (
                            <span className="font-medium text-emerald-600">In stock</span>
                          ) : (
                            <span className="font-medium text-red-500">Low stock — {item.product.stock} left</span>
                          )}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => handleMoveToWishlist(item)}
                          disabled={busyId === item.id}
                          title={inWishlist ? 'Already in wishlist' : 'Move to wishlist'}
                          className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                            inWishlist ? 'bg-red-50 text-red-500' : 'text-zinc-400 hover:bg-red-50 hover:text-red-500'
                          }`}
                          aria-label="Move to wishlist"
                        >
                          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => handleRemove(item)}
                          disabled={busyId === item.id}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                      <div className="flex items-center gap-1 rounded-full border border-zinc-200 p-0.5">
                        <button onClick={() => handleQty(item, -1)} disabled={busyId === item.id || item.quantity <= 1} className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-40" aria-label="Decrease">
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => handleQty(item, 1)} disabled={busyId === item.id} className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-100" aria-label="Increase">
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-right">
                        {item.product.compare_price && (
                          <p className="text-xs text-zinc-400 line-through">{formatPrice(item.product.compare_price * item.quantity)}</p>
                        )}
                        <p className="text-lg font-bold text-zinc-900">{formatPrice(item.line_total)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between p-4 sm:p-5">
              <button onClick={handleClear} className="text-sm font-medium text-zinc-500 transition hover:text-red-500">
                Clear cart
              </button>
              <Link to="/shop" className="text-sm font-semibold text-brand-600 transition hover:text-brand-800">
                Continue shopping →
              </Link>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-900">
              <Percent size={15} className="text-brand-600" /> Coupon Code
            </h2>
            {coupon_code ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                  <Check size={15} />
                  {coupon_code}
                  <span className="font-medium text-emerald-600">— {formatPrice(discount)} off</span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  disabled={couponBusy}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 transition hover:text-emerald-900 disabled:opacity-50"
                >
                  <X size={13} /> Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <Percent size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="input !py-2.5 pl-9 uppercase tracking-wide"
                    maxLength={50}
                  />
                </div>
                <Button type="submit" variant="primary" loading={applying} className="!py-2.5">
                  Apply
                </Button>
              </form>
            )}
            <p className="mt-2 text-xs text-zinc-400">Try: SAVE10, WELCOME15, FLAT25</p>
          </div>
        </div>

        <div>
          <div className="card sticky top-24 p-6">
            <h2 className="text-lg font-bold text-zinc-900">Order Summary</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal ({count} {count === 1 ? 'item' : 'items'})</span>
                <span className="font-semibold text-zinc-900">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount {coupon_code ? `(${coupon_code})` : ''}</span>
                  <span className="font-semibold">−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600">
                <span>Shipping</span>
                <span className={`font-semibold ${shipping === 0 ? 'text-emerald-600' : 'text-zinc-900'}`}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Tax (8%)</span>
                <span className="font-semibold text-zinc-900">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-zinc-200 pt-3 text-base font-bold text-zinc-900">
                <span>Grand Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Button variant="primary" size="lg" className="mt-6 w-full" onClick={goCheckout}>
              Proceed to Checkout <ArrowRight size={18} />
            </Button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Secure checkout · 30-day returns
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
