import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { User, Package, MapPin, ChevronRight, XCircle, PackageOpen } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { orderApi } from '../api';
import { extractError } from '../api/client';
import { useToastStore } from '../stores/toastStore';
import { formatPrice, formatDate, ORDER_STATUS_STYLES, PAYMENT_STATUS_STYLES } from '../utils/format';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';

export default function AccountPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'profile';

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">My Account</h1>
      <p className="mt-2 text-zinc-500">Manage your profile and track your orders.</p>

      <div className="mt-8 flex gap-4 overflow-x-auto border-b border-zinc-200 pb-px">
        <TabButton active={tab === 'profile'} onClick={() => setParams({ tab: 'profile' })}>
          <User size={16} /> Profile
        </TabButton>
        <TabButton active={tab === 'orders'} onClick={() => setParams({ tab: 'orders' })}>
          <Package size={16} /> My Orders
        </TabButton>
        <TabButton active={tab === 'address'} onClick={() => setParams({ tab: 'address' })}>
          <MapPin size={16} /> Address
        </TabButton>
      </div>

      <div className="mt-8">
        {tab === 'profile' && <ProfileTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'address' && <AddressTab />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
        active ? 'border-brand-600 text-brand-700' : 'border-transparent text-zinc-500 hover:text-zinc-800'
      }`}
    >
      {children}
    </button>
  );
}

function ProfileTab() {
  const toast = useToastStore();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      password: '',
      password_confirmation: '',
    });
  }, [user]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.password_confirmation) {
      toast.error('Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-xl space-y-5">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-bold text-white">
          {user?.name?.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="text-lg font-bold text-zinc-900">{user?.name}</p>
          <p className="text-sm text-zinc-500">{user?.email}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <input className="input" value={form.name} onChange={set('name')} required />
        </Field>
        <Field label="Email">
          <input type="email" className="input" value={form.email} onChange={set('email')} required />
        </Field>
        <Field label="Phone">
          <input className="input" value={form.phone} onChange={set('phone')} />
        </Field>
      </div>

      <div className="rounded-2xl bg-zinc-50 p-5">
        <h3 className="text-sm font-bold text-zinc-900">Change password</h3>
        <p className="mt-1 text-xs text-zinc-500">Leave blank to keep your current password.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="New password">
            <input type="password" className="input" value={form.password} onChange={set('password')} minLength={8} />
          </Field>
          <Field label="Confirm new password">
            <input type="password" className="input" value={form.password_confirmation} onChange={set('password_confirmation')} />
          </Field>
        </div>
      </div>

      <Button type="submit" variant="primary" loading={saving}>
        Save Changes
      </Button>
    </form>
  );
}

function AddressTab() {
  const toast = useToastStore();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    postal_code: user?.postal_code || '',
    country: user?.country || '',
  });

  useEffect(() => {
    setForm({
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      postal_code: user?.postal_code || '',
      country: user?.country || '',
    });
  }, [user]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Address saved.');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-xl space-y-4">
      <Field label="Street address">
        <input className="input" value={form.address} onChange={set('address')} placeholder="123 Commerce Ave" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="City">
          <input className="input" value={form.city} onChange={set('city')} />
        </Field>
        <Field label="State">
          <input className="input" value={form.state} onChange={set('state')} />
        </Field>
        <Field label="Postal code">
          <input className="input" value={form.postal_code} onChange={set('postal_code')} />
        </Field>
        <Field label="Country">
          <input className="input" value={form.country} onChange={set('country')} />
        </Field>
      </div>
      <Button type="submit" variant="primary" loading={saving}>Save Address</Button>
    </form>
  );
}

function OrdersTab() {
  const toast = useToastStore();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    orderApi
      .index({ page })
      .then(({ data }) => {
        if (!active) return;
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      })
      .catch((err) => toast.error(extractError(err)))
      .finally(() => active && setLoading(false));
    return () => (active = false);
  }, [page]);

  const cancelOrder = async (id) => {
    setCancellingId(id);
    try {
      const { data } = await orderApi.cancel(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? data.data.order : o)));
      toast.success('Order cancelled.');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="No orders yet"
        description="When you place an order, it will show up here so you can track it anytime."
        action={<Link to="/shop"><Button variant="primary">Start Shopping</Button></Link>}
      />
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {orders.map((order) => {
          const status = ORDER_STATUS_STYLES[order.status] || {};
          const payment = PAYMENT_STATUS_STYLES[order.payment_status] || {};
          return (
            <div key={order.id} className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-zinc-900">#{order.order_number}</p>
                    <span className={`chip ring-1 ${status.className}`}>{status.label}</span>
                    <span className={`chip ring-1 ${payment.className}`}>{payment.label}</span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">Placed on {formatDate(order.created_at)}</p>
                </div>
                <p className="text-xl font-extrabold text-zinc-900">{formatPrice(order.total)}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 border-t border-zinc-100 pt-4">
                {(order.items || []).map((item) => (
                  <Link key={item.id} to={`/product/${item.product_id}`} className="group flex items-center gap-2 rounded-xl bg-zinc-50 p-2 pr-3 transition hover:bg-zinc-100">
                    <img src={item.image} alt="" className="h-10 w-10 rounded-lg bg-zinc-100 object-cover" onError={(e) => (e.currentTarget.style.opacity = 0.15)} />
                    <span className="max-w-[140px] truncate text-xs font-medium text-zinc-700 group-hover:text-zinc-900">
                      {item.name} <span className="text-zinc-400">×{item.quantity}</span>
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4">
                <Link to={`/account?tab=orders`} className="text-sm font-semibold text-brand-600 hover:text-brand-800">
                  View details
                </Link>
                {order.can_cancel && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    disabled={cancellingId === order.id}
                    className="flex items-center gap-1.5 text-sm font-medium text-red-500 transition hover:text-red-600 disabled:opacity-50"
                  >
                    {cancellingId === order.id ? <Spinner size="sm" /> : <XCircle size={15} />}
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {pagination && (
        <Pagination page={pagination.current_page} lastPage={pagination.last_page} onChange={setPage} className="mt-8" />
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
