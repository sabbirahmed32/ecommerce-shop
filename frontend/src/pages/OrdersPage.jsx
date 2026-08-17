import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, PackageOpen, XCircle, Eye, ChevronRight } from 'lucide-react';
import { orderApi } from '../api';
import { extractError } from '../api/client';
import { useToastStore } from '../stores/toastStore';
import { formatPrice, formatDate, ORDER_STATUS_STYLES, PAYMENT_STATUS_STYLES } from '../utils/format';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';

export default function OrdersPage() {
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
      toast.success('Order cancelled successfully.');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-zinc-900">
        <Package size={28} className="text-brand-600" /> My Orders
      </h1>
      <p className="mt-2 text-zinc-500">Track and manage all your orders in one place.</p>

      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title="No orders yet"
            description="When you place an order, it will show up here so you can track it anytime."
            action={<Link to="/shop"><Button variant="primary">Start Shopping</Button></Link>}
          />
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => {
                const status = ORDER_STATUS_STYLES[order.status] || {};
                const payment = PAYMENT_STATUS_STYLES[order.payment_status] || {};
                return (
                  <div key={order.id} className="card overflow-hidden">
                    <div className="border-b border-zinc-100 bg-zinc-50/50 px-5 py-3 sm:px-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="font-bold text-zinc-900">#{order.order_number}</p>
                          <span className={`chip ring-1 ${status.className}`}>{status.label}</span>
                          <span className={`chip ring-1 ${payment.className}`}>{payment.label}</span>
                        </div>
                        <p className="text-sm text-zinc-500">{formatDate(order.created_at)}</p>
                      </div>
                    </div>

                    <div className="px-5 py-4 sm:px-6">
                      <div className="flex flex-wrap gap-3">
                        {(order.items || []).slice(0, 4).map((item) => (
                          <div key={item.id} className="flex items-center gap-2 rounded-xl bg-zinc-50 p-2 pr-3">
                            <img
                              src={item.image}
                              alt=""
                              className="h-10 w-10 rounded-lg bg-zinc-100 object-cover"
                              onError={(e) => (e.currentTarget.style.opacity = 0.15)}
                            />
                            <span className="max-w-[160px] truncate text-xs font-medium text-zinc-700">
                              {item.name} <span className="text-zinc-400">&times;{item.quantity}</span>
                            </span>
                          </div>
                        ))}
                        {(order.items || []).length > 4 && (
                          <span className="flex items-center rounded-xl bg-zinc-50 px-3 text-xs font-medium text-zinc-500">
                            +{order.items.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 px-5 py-4 sm:px-6">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs text-zinc-500">Total:</span>
                        <span className="text-lg font-extrabold text-zinc-900">{formatPrice(order.total)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {order.can_cancel && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            disabled={cancellingId === order.id}
                            className="flex items-center gap-1.5 text-sm font-medium text-red-500 transition hover:text-red-600 disabled:opacity-50"
                          >
                            {cancellingId === order.id ? <Spinner size="sm" /> : <XCircle size={15} />}
                            Cancel
                          </button>
                        )}
                        <Link
                          to={`/orders/${order.id}`}
                          className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 active:scale-[.98]"
                        >
                          <Eye size={15} /> View Details <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {pagination && (
              <Pagination page={pagination.current_page} lastPage={pagination.last_page} onChange={setPage} className="mt-8" />
            )}
          </>
        )}
      </div>
    </div>
  );
}
