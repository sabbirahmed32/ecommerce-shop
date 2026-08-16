import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, Banknote, CreditCard, ShieldCheck, User, MapPin, Truck, Zap, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { orderApi } from '../api';
import { extractError } from '../api/client';
import { useToastStore } from '../stores/toastStore';
import { formatPrice } from '../utils/format';
import Button from '../components/ui/Button';

const FREE_SHIPPING_THRESHOLD = 100;
const STANDARD_FEE = 5.99;
const EXPRESS_FEE = 12.99;
const TAX_RATE = 0.08;

const SHIPPING_METHODS = [
  {
    value: 'standard',
    label: 'Standard Delivery',
    description: 'Delivered in 3–5 business days.',
    fee: STANDARD_FEE,
    freeOverThreshold: true,
    icon: Truck,
  },
  {
    value: 'express',
    label: 'Express Delivery',
    description: 'Delivered in 1–2 business days.',
    fee: EXPRESS_FEE,
    freeOverThreshold: false,
    icon: Zap,
  },
];

const PAYMENT_METHODS = [
  {
    value: 'cash_on_delivery',
    label: 'Cash on Delivery',
    description: 'Pay in cash when your order arrives.',
    icon: Banknote,
  },
  {
    value: 'stripe',
    label: 'Stripe',
    description: 'Pay securely with Visa, Mastercard, Amex & more.',
    icon: CreditCard,
  },
  {
    value: 'sslcommerz',
    label: 'SSLCommerz',
    description: 'Trusted gateway — cards, bKash, Nagad & bank.',
    icon: ShieldCheck,
  },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const toast = useToastStore();
  const { items, count, subtotal, discount, coupon_code, fetchCart } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const [placing, setPlacing] = useState(false);

  const [form, setForm] = useState({
    shipping_name: user?.name || '',
    shipping_email: user?.email || '',
    shipping_phone: user?.phone || '',
    shipping_address: user?.address || '',
    shipping_city: user?.city || '',
    shipping_state: user?.state || '',
    shipping_postal_code: user?.postal_code || '',
    shipping_country: user?.country || 'United States',
    shipping_method: 'standard',
    payment_method: 'cash_on_delivery',
    notes: '',
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const afterDiscount = subtotal - discount;
  const selectedMethod = SHIPPING_METHODS.find((m) => m.value === form.shipping_method);
  const shipping = selectedMethod?.freeOverThreshold && afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : (selectedMethod?.fee || 0);
  const tax = Math.round(afterDiscount * TAX_RATE * 100) / 100;
  const total = Math.round((afterDiscount + shipping + tax) * 100) / 100;

  const placeOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const { data } = await orderApi.store(form);
      await fetchCart();
      toast.success('Order placed successfully!');
      navigate(`/order-success/${data.data.order.order_number}`, { state: { order: data.data.order } });
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-100 text-zinc-300">
          <ShoppingBag size={36} />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-zinc-500">Add some products before checking out.</p>
        <Link to="/shop" className="btn-primary mt-6">Go to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Checkout</h1>
      <p className="mt-2 text-zinc-500">Complete your order in under a minute.</p>

      <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
              <User size={18} className="text-brand-600" /> Customer Information
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required>
                <input className="input" value={form.shipping_name} onChange={set('shipping_name')} placeholder="John Doe" required />
              </Field>
              <Field label="Email" required>
                <input type="email" className="input" value={form.shipping_email} onChange={set('shipping_email')} placeholder="you@email.com" required />
              </Field>
              <Field label="Phone" required>
                <input className="input" value={form.shipping_phone} onChange={set('shipping_phone')} placeholder="+1 555 0100" required />
              </Field>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
              <MapPin size={18} className="text-brand-600" /> Shipping Address
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Address" required>
                <input className="input" value={form.shipping_address} onChange={set('shipping_address')} placeholder="123 Commerce Ave" required />
              </Field>
              <Field label="City" required>
                <input className="input" value={form.shipping_city} onChange={set('shipping_city')} placeholder="New York" required />
              </Field>
              <Field label="State">
                <input className="input" value={form.shipping_state} onChange={set('shipping_state')} placeholder="NY" />
              </Field>
              <Field label="ZIP code">
                <input className="input" value={form.shipping_postal_code} onChange={set('shipping_postal_code')} placeholder="10001" />
              </Field>
              <Field label="Country">
                <input className="input" value={form.shipping_country} onChange={set('shipping_country')} placeholder="United States" />
              </Field>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
              <Truck size={18} className="text-brand-600" /> Shipping Method
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {SHIPPING_METHODS.map(({ value, label, description, fee, freeOverThreshold, icon: Icon }) => {
                const isFree = freeOverThreshold && afterDiscount >= FREE_SHIPPING_THRESHOLD;
                return (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setForm((f) => ({ ...f, shipping_method: value }))}
                    className={`relative rounded-2xl border-2 p-4 text-left transition ${
                      form.shipping_method === value ? 'border-brand-600 bg-brand-50/60' : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {form.shipping_method === value && (
                      <CheckCircle2 size={18} className="absolute right-3 top-3 text-brand-600" />
                    )}
                    <div className="flex items-center gap-2.5">
                      <Icon size={20} className="text-zinc-700" />
                      <p className="text-sm font-bold text-zinc-900">{label}</p>
                    </div>
                    <p className="mt-1.5 text-xs leading-snug text-zinc-500">{description}</p>
                    <p className={`mt-2 text-sm font-bold ${isFree ? 'text-emerald-600' : 'text-zinc-900'}`}>
                      {isFree ? 'FREE' : formatPrice(fee)}
                    </p>
                  </button>
                );
              })}
            </div>
            {form.shipping_method === 'standard' && remainingHint(afterDiscount)}
          </section>

          <section className="card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
              <ShieldCheck size={18} className="text-brand-600" /> Payment Method
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {PAYMENT_METHODS.map(({ value, label, description, icon: Icon }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setForm((f) => ({ ...f, payment_method: value }))}
                  className={`relative rounded-2xl border-2 p-4 text-left transition ${
                    form.payment_method === value ? 'border-brand-600 bg-brand-50/60' : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  {form.payment_method === value && (
                    <CheckCircle2 size={18} className="absolute right-3 top-3 text-brand-600" />
                  )}
                  <Icon size={22} className="text-zinc-700" />
                  <p className="mt-2.5 text-sm font-bold text-zinc-900">{label}</p>
                  <p className="mt-1 text-xs leading-snug text-zinc-500">{description}</p>
                </button>
              ))}
            </div>
            {form.payment_method !== 'cash_on_delivery' && (
              <p className="mt-3 rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
                Demo checkout: your card will not be charged. Payment is recorded as paid on the order.
              </p>
            )}
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-bold text-zinc-900">Order Notes</h2>
            <textarea
              className="input mt-4 resize-none"
              rows={3}
              value={form.notes}
              onChange={set('notes')}
              placeholder="Any special delivery instructions? (optional)"
            />
          </section>
        </div>

        <div>
          <div className="card sticky top-24 p-6">
            <h2 className="text-lg font-bold text-zinc-900">Order Summary</h2>
            <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img src={item.product.image} alt="" className="h-14 w-14 rounded-xl bg-zinc-100 object-cover" />
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-700">{item.product.name}</p>
                  <p className="text-sm font-bold text-zinc-900">{formatPrice(item.line_total)}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2.5 border-t border-dashed border-zinc-200 pt-4 text-sm">
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
                <span>Shipping ({form.shipping_method === 'express' ? 'Express' : 'Standard'})</span>
                <span className={`font-semibold ${shipping === 0 ? 'text-emerald-600' : 'text-zinc-900'}`}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Tax (8%)</span>
                <span className="font-semibold text-zinc-900">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-3 text-base font-extrabold text-zinc-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="mt-6 w-full" loading={placing} icon={Lock}>
              {placing ? 'Placing Order…' : `Place Order · ${formatPrice(total)}`}
            </Button>
            <p className="mt-3 text-center text-xs text-zinc-400">By placing your order you agree to our Terms & Conditions.</p>
          </div>
        </div>
      </form>
    </div>
  );
}

function remainingHint(afterDiscount) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - afterDiscount);
  return (
    <p className="mt-3 text-xs text-zinc-500">
      {remaining > 0 ? (
        <>Add <strong className="text-brand-700">{formatPrice(remaining)}</strong> more to qualify for FREE standard shipping.</>
      ) : (
        <span className="font-medium text-emerald-600">You've unlocked FREE standard shipping!</span>
      )}
    </p>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
