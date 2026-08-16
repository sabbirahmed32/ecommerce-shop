import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingCart, Package, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { adminApi } from '../../api';
import { extractError } from '../../api/client';
import { useToastStore } from '../../stores/toastStore';
import { formatPrice, formatDate, ORDER_STATUS_STYLES } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import { Skeleton } from '../../components/ui/Skeleton';

export default function AdminDashboard() {
  const toast = useToastStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .dashboard()
      .then(({ data }) => setData(data.data))
      .catch((err) => toast.error(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!data) return null;

  const { stats, sales_by_day, recent_orders, top_products } = data;
  const maxDay = Math.max(...sales_by_day.map((d) => d.revenue), 1);

  const cards = [
    { label: 'Total Revenue', value: formatPrice(stats.total_revenue), icon: DollarSign, accent: 'bg-emerald-500' },
    { label: 'Total Orders', value: stats.total_orders, icon: ShoppingCart, accent: 'bg-brand-500' },
    { label: 'Pending Orders', value: stats.pending_orders, icon: TrendingUp, accent: 'bg-amber-500' },
    { label: 'Products', value: stats.total_products, icon: Package, accent: 'bg-sky-500' },
    { label: 'Customers', value: stats.total_users, icon: Users, accent: 'bg-violet-500' },
    { label: 'Low Stock', value: stats.low_stock, icon: AlertTriangle, accent: stats.low_stock > 0 ? 'bg-red-500' : 'bg-zinc-300' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">Dashboard</h2>
          <p className="mt-1 text-sm text-zinc-500">Overview of your store performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="card p-5">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${accent}`}>
              <Icon size={18} />
            </span>
            <p className="mt-4 text-lg font-extrabold text-zinc-900">{value}</p>
            <p className="text-xs font-medium text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="card p-6">
          <h3 className="text-sm font-bold text-zinc-900">Sales — last 14 days</h3>
          <div className="mt-6 flex h-48 items-end gap-2">
            {sales_by_day.length === 0 ? (
              <p className="text-sm text-zinc-400">No sales recorded yet.</p>
            ) : (
              sales_by_day.map((d) => (
                <div key={d.date} className="group relative flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-violet-400 transition group-hover:from-brand-700"
                    style={{ height: `${Math.max(4, (d.revenue / maxDay) * 100)}%` }}
                  />
                  <span className="hidden text-[9px] text-zinc-400 group-hover:block">
                    {d.revenue > 0 ? formatPrice(d.revenue) : ''}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-zinc-400">
            <span>{sales_by_day[0]?.date}</span>
            <span>{sales_by_day[sales_by_day.length - 1]?.date}</span>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-bold text-zinc-900">Top Products</h3>
          <div className="mt-4 space-y-4">
            {top_products.length === 0 ? (
              <p className="text-sm text-zinc-400">No sales yet.</p>
            ) : (
              top_products.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-4 text-xs font-bold text-zinc-400">{i + 1}</span>
                  <img src={p.image} alt="" className="h-10 w-10 rounded-lg bg-zinc-100 object-cover" onError={(e) => (e.currentTarget.style.opacity = 0.15)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900">{p.name}</p>
                    <p className="text-xs text-zinc-500">{p.sold} sold</p>
                  </div>
                  <span className="text-xs font-semibold text-zinc-500">{formatPrice(p.price)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <h3 className="text-sm font-bold text-zinc-900">Recent Orders</h3>
          <Link to="/admin/orders" className="text-sm font-semibold text-brand-600 hover:text-brand-800">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-y border-zinc-100 bg-zinc-50/60 text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-3 font-semibold">Order</th>
                <th className="px-6 py-3 font-semibold">Customer</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {recent_orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-zinc-400">No orders yet.</td>
                </tr>
              ) : (
                recent_orders.map((order) => {
                  const status = ORDER_STATUS_STYLES[order.status] || {};
                  return (
                    <tr key={order.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                      <td className="px-6 py-3.5 font-semibold text-zinc-900">#{order.order_number}</td>
                      <td className="px-6 py-3.5 text-zinc-600">{order.shipping.name}</td>
                      <td className="px-6 py-3.5 text-zinc-500">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-3.5"><span className={`chip ring-1 ${status.className}`}>{status.label}</span></td>
                      <td className="px-6 py-3.5 text-right font-bold text-zinc-900">{formatPrice(order.total)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-56" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
