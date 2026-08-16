import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Minus, Plus, ArrowRight, LogIn } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { formatPrice } from '../../utils/format';
import { extractError } from '../../api/client';
import { useToastStore } from '../../stores/toastStore';

export default function CartDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const toast = useToastStore();
  const { items, count, subtotal, discount, shipping, tax, total, coupon_code, updateItem, removeItem, loading } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => (document.body.style.overflow = '');
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

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

  const goCheckout = () => {
    onClose();
    if (!user) {
      toast.info('Please sign in to continue checkout.');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-zinc-900" />
            <h2 className="text-lg font-bold">Your Cart</h2>
            {count > 0 && (
              <span className="chip bg-brand-50 text-brand-700">{count} items</span>
            )}
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100" aria-label="Close cart">
            <X size={19} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-100 text-zinc-300">
              <ShoppingBag size={36} />
            </div>
            <h3 className="text-lg font-semibold">Your cart is empty</h3>
            <p className="text-sm text-zinc-500">Discover our latest arrivals and add something you love.</p>
            <button onClick={onClose} className="btn-primary mt-3">
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-2xl border border-zinc-100 p-3">
                    <Link to={`/product/${item.product.slug}`} onClick={onClose} className="shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-20 w-20 rounded-xl bg-zinc-100 object-cover"
                        onError={(e) => (e.currentTarget.style.opacity = 0.15)}
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/product/${item.product.slug}`} onClick={onClose} className="line-clamp-2 text-sm font-semibold text-zinc-900 hover:text-brand-700">
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => handleRemove(item)}
                          disabled={busyId === item.id}
                          className="shrink-0 text-zinc-400 transition hover:text-red-500"
                          aria-label="Remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      {(item.color || item.size) && (
                        <p className="mt-0.5 text-xs text-zinc-400">
                          {[item.color, item.size].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs font-medium text-zinc-400">
                        {formatPrice(item.product.price)} each
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 rounded-full border border-zinc-200 p-0.5">
                          <button
                            onClick={() => handleQty(item, -1)}
                            disabled={busyId === item.id || item.quantity <= 1}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-40"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => handleQty(item, 1)}
                            disabled={busyId === item.id}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-100"
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-zinc-900">{formatPrice(item.line_total)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-100 p-5">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-zinc-500">Subtotal</span>
                <span className="font-bold text-zinc-900">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-emerald-600">Discount {coupon_code ? `(${coupon_code})` : ''}</span>
                  <span className="font-bold text-emerald-600">−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-zinc-500">Shipping</span>
                <span className={`font-semibold ${shipping === 0 ? 'text-emerald-600' : 'text-zinc-900'}`}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-zinc-500">Tax</span>
                <span className="font-bold text-zinc-900">{formatPrice(tax)}</span>
              </div>
              <div className="mb-4 flex items-center justify-between text-base">
                <span className="font-bold text-zinc-900">Total</span>
                <span className="font-extrabold text-zinc-900">{formatPrice(total)}</span>
              </div>
              <button onClick={goCheckout} className="btn-primary w-full">
                Checkout <ArrowRight size={17} />
              </button>
              {!user && (
                <Link to="/login" state={{ from: '/checkout' }} onClick={onClose} className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700">
                  <LogIn size={15} /> Sign in for a faster checkout
                </Link>
              )}
              {loading && <p className="mt-3 text-center text-xs text-zinc-400">Syncing cart…</p>}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
