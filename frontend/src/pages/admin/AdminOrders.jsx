import { useEffect, useState } from 'react';
import { Search, ShoppingCart, ChevronDown, Eye } from 'lucide-react';
import { adminApi } from '../../api';
import { extractError } from '../../api/client';
import { useToastStore } from '../../stores/toastStore';
import { formatPrice, formatDateTime, ORDER_STATUS_STYLES, ORDER_STATUSES } from '../../utils/format';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

export default function AdminOrders() {
  const toast = useToastStore();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminApi
      .orders({ search: search || undefined, status: statusFilter || undefined, page })
      .then(({ data }) => {
        if (!active) return;
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      })
      .catch((err) => toast.error(extractError(err)))
      .finally(() => active && setLoading(false));
    return () => (active = false);
  }, [search, statusFilter, page]);

  const runSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const changeStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const { data } = await adminApi.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.data.order : o)));
      if (detail?.id === orderId) setDetail(data.data.order);
      toast.success('Order status updated.');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const viewDetail = async (orderId) => {
    try {
      const { data } = await adminApi.order(orderId);
      setDetail(data.data.order);
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">Orders</h2>
          <p className="mt-1 text-sm text-zinc-500">{pagination?.total ?? 0} orders</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={runSearch} className="relative max-w-sm flex-1">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search order #, name or email…"
            className="w-full rounded-full border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </form>
        <div className="relative">
          <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="appearance-none rounded-full border border-zinc-200 bg-white py-2.5 pl-4 pr-9 text-sm font-medium text-zinc-700 focus:border-brand-500 focus:outline-none"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : orders.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No orders found" description="Orders placed by customers will appear here." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-3 font-semibold">Order</th>
                  <th className="px-6 py-3 font-semibold">Customer</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Payment</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 text-right font-semibold">Total</th>
                  <th className="px-6 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const status = ORDER_STATUS_STYLES[order.status] || {};
                  return (
                    <tr key={order.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                      <td className="px-6 py-3.5 font-semibold text-zinc-900">#{order.order_number}</td>
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-zinc-700">{order.shipping.name}</p>
                        <p className="text-xs text-zinc-400">{order.shipping.email}</p>
                      </td>
                      <td className="px-6 py-3.5 text-zinc-500">{formatDateTime(order.created_at)}</td>
                      <td className="px-6 py-3.5 text-zinc-500">{order.payment_method.replaceAll('_', ' ')}</td>
                      <td className="px-6 py-3.5">
                        <div className="relative inline-block">
                          <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) => changeStatus(order.id, e.target.value)}
                            className={`appearance-none rounded-full py-1.5 pl-3 pr-8 text-xs font-semibold ring-1 transition disabled:opacity-60 ${status.className}`}
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s} className="bg-white text-zinc-900">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                          <ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400" />
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-right font-bold text-zinc-900">{formatPrice(order.total)}</td>
                      <td className="px-6 py-3.5">
                        <button onClick={() => viewDetail(order.id)} className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-brand-50 hover:text-brand-700" aria-label="View order">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {pagination && (
            <div className="border-t border-zinc-100 p-4">
              <Pagination page={pagination.current_page} lastPage={pagination.last_page} onChange={setPage} />
            </div>
          )}
        </div>
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Order #${detail?.order_number ?? ''}`} size="lg">
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={`chip ring-1 ${(ORDER_STATUS_STYLES[detail.status] || {}).className}`}>
                  {(ORDER_STATUS_STYLES[detail.status] || {}).label}
                </span>
                <span className="text-sm text-zinc-500">{formatDateTime(detail.created_at)}</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">Total</p>
                <p className="text-xl font-extrabold text-zinc-900">{formatPrice(detail.total)}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-zinc-50 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Shipping address</h4>
                <p className="mt-2 text-sm font-semibold text-zinc-900">{detail.shipping.name}</p>
                <p className="text-sm text-zinc-600">{detail.shipping.address}</p>
                <p className="text-sm text-zinc-600">{detail.shipping.city}{detail.shipping.state ? `, ${detail.shipping.state}` : ''} {detail.shipping.postal_code}</p>
                <p className="text-sm text-zinc-600">{detail.shipping.country}</p>
                <p className="mt-1 text-sm text-zinc-600">{detail.shipping.phone}</p>
                <p className="mt-1 text-sm font-medium capitalize text-zinc-700">{detail.shipping_method} delivery</p>
              </div>
              <div className="rounded-2xl bg-zinc-50 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Payment</h4>
                <p className="mt-2 text-sm text-zinc-700">{detail.payment_method.replaceAll('_', ' ')}</p>
                <p className="text-sm capitalize text-zinc-500">{detail.payment_status}</p>
                {detail.notes && (
                  <>
                    <h4 className="mt-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Notes</h4>
                    <p className="mt-1 text-sm text-zinc-600">{detail.notes}</p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {(detail.items || []).map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.image} alt="" className="h-14 w-14 rounded-xl bg-zinc-100 object-cover" onError={(e) => (e.currentTarget.style.opacity = 0.15)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900">{item.name}</p>
                    <p className="text-xs text-zinc-500">{formatPrice(item.price)} × {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-zinc-900">{formatPrice(item.total)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-dashed border-zinc-200 pt-4 text-sm">
              <div className="flex justify-between text-zinc-600"><span>Subtotal</span><span>{formatPrice(detail.subtotal)}</span></div>
              {detail.discount > 0 && (
                <div className="flex justify-between text-emerald-600"><span>Discount {detail.coupon_code ? `(${detail.coupon_code})` : ''}</span><span>−{formatPrice(detail.discount)}</span></div>
              )}
              <div className="flex justify-between text-zinc-600"><span>Shipping</span><span>{detail.shipping_fee === 0 ? 'FREE' : formatPrice(detail.shipping_fee)}</span></div>
              <div className="flex justify-between text-zinc-600"><span>Tax</span><span>{formatPrice(detail.tax)}</span></div>
              <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-extrabold text-zinc-900">
                <span>Total</span><span>{formatPrice(detail.total)}</span>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Update status</h4>
              <div className="flex flex-wrap gap-2">
                {ORDER_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus(detail.id, s)}
                    disabled={detail.status === s}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      detail.status === s ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
