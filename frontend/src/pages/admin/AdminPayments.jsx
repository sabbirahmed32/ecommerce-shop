import { useEffect, useState } from 'react';
import { CreditCard, Search, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { adminApi } from '../../api';
import { extractError } from '../../api/client';
import { useToastStore } from '../../stores/toastStore';
import { formatPrice, formatDateTime, PAYMENT_STATUS_STYLES } from '../../utils/format';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';

export default function AdminPayments() {
  const toast = useToastStore();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminApi
      .orders({ status: statusFilter || undefined, page })
      .then(({ data }) => {
        if (!active) return;
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      })
      .catch((err) => toast.error(extractError(err)))
      .finally(() => active && setLoading(false));
    return () => (active = false);
  }, [statusFilter, page]);

  const paidOrders = orders.filter((o) => o.payment_status === 'paid');
  const unpaidOrders = orders.filter((o) => o.payment_status === 'unpaid');
  const totalPaid = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const totalUnpaid = unpaidOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">Payments</h2>
        <p className="mt-1 text-sm text-zinc-500">Track payment status across all orders.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><DollarSign size={18} /></span>
            <div>
              <p className="text-xl font-extrabold text-zinc-900">{formatPrice(totalPaid)}</p>
              <p className="text-xs font-medium text-zinc-500">Total Paid ({paidOrders.length})</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><TrendingUp size={18} /></span>
            <div>
              <p className="text-xl font-extrabold text-zinc-900">{formatPrice(totalUnpaid)}</p>
              <p className="text-xs font-medium text-zinc-500">Pending ({unpaidOrders.length})</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600"><CreditCard size={18} /></span>
            <div>
              <p className="text-xl font-extrabold text-zinc-900">{formatPrice(totalPaid + totalUnpaid)}</p>
              <p className="text-xs font-medium text-zinc-500">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="appearance-none rounded-full border border-zinc-200 bg-white py-2.5 pl-4 pr-8 text-sm font-medium text-zinc-700 focus:border-brand-500 focus:outline-none"
        >
          <option value="">All orders</option>
          <option value="paid">Paid only</option>
          <option value="unpaid">Unpaid only</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-3 font-semibold">Order</th>
                  <th className="px-6 py-3 font-semibold">Customer</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Method</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const pay = PAYMENT_STATUS_STYLES[o.payment_status] || {};
                  return (
                    <tr key={o.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                      <td className="px-6 py-3 font-semibold text-zinc-900">#{o.order_number}</td>
                      <td className="px-6 py-3 text-zinc-600">{o.shipping?.name}</td>
                      <td className="px-6 py-3 text-zinc-500">{formatDateTime(o.created_at)}</td>
                      <td className="px-6 py-3 text-zinc-500 capitalize">{o.payment_method?.replaceAll('_', ' ')}</td>
                      <td className="px-6 py-3"><span className={`chip ring-1 ${pay.className}`}>{pay.label}</span></td>
                      <td className="px-6 py-3 text-right font-bold text-zinc-900">{formatPrice(o.total)}</td>
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
    </div>
  );
}
