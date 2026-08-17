import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, ShoppingCart, Package, Users, AlertTriangle, TrendingUp,
  CheckCircle2, Clock, Star, Ticket, BarChart3,
} from 'lucide-react';
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

  const { stats, sales_by_day, monthly_revenue, orders_by_status, recent_orders, top_products, low_stock_products } = data;
  const maxDay = Math.max(...sales_by_day.map((d) => d.revenue), 1);
  const maxMonth = Math.max(...monthly_revenue.map((m) => m.revenue), 1);

  const cards = [
    { label: 'Total Sales', value: formatPrice(stats.total_revenue), icon: DollarSign, accent: 'from-emerald-500 to-emerald-600', ring: 'ring-emerald-100' },
    { label: 'Total Orders', value: stats.total_orders, icon: ShoppingCart, accent: 'from-brand-500 to-brand-600', ring: 'ring-brand-100' },
    { label: 'Total Customers', value: stats.total_users, icon: Users, accent: 'from-violet-500 to-violet-600', ring: 'ring-violet-100' },
    { label: 'Total Products', value: stats.total_products, icon: Package, accent: 'from-sky-500 to-sky-600', ring: 'ring-sky-100' },
    { label: 'Pending Orders', value: stats.pending_orders, icon: Clock, accent: 'from-amber-500 to-amber-600', ring: 'ring-amber-100' },
    { label: 'Delivered Orders', value: stats.delivered_orders, icon: CheckCircle2, accent: 'from-teal-500 to-teal-600', ring: 'ring-teal-100' },
    { label: 'Low Stock', value: stats.low_stock, icon: AlertTriangle, accent: stats.low_stock > 0 ? 'from-red-500 to-red-600' : 'from-zinc-300 to-zinc-400', ring: stats.low_stock > 0 ? 'ring-red-100' : 'ring-zinc-100' },
    { label: 'Reviews', value: stats.total_reviews, icon: Star, accent: 'from-orange-500 to-orange-600', ring: 'ring-orange-100' },
  ];

  const orderStatusCards = [
    { label: 'Pending', count: orders_by_status.pending || 0, color: 'bg-amber-50 text-amber-700' },
    { label: 'Confirmed', count: orders_by_status.confirmed || 0, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Processing', count: orders_by_status.processing || 0, color: 'bg-blue-50 text-blue-700' },
    { label: 'Shipped', count: orders_by_status.shipped || 0, color: 'bg-violet-50 text-violet-700' },
    { label: 'Delivered', count: orders_by_status.delivered || 0, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Cancelled', count: orders_by_status.cancelled || 0, color: 'bg-red-50 text-red-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">Dashboard</h2>
          <p className="mt-1 text-sm text-zinc-500">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
        {cards.map(({ label, value, icon: Icon, accent, ring }) => (
          <div key={label} className="card group overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white ring-4 ${accent} ${ring}`}>
                  <Icon size={18} />
                </span>
              </div>
              <p className="mt-4 text-2xl font-extrabold tracking-tight text-zinc-900">{value}</p>
              <p className="mt-0.5 text-xs font-medium text-zinc-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {orderStatusCards.map(({ label, count, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-2xl font-extrabold ${color.split(' ')[1]}`}>{count}</p>
            <p className="mt-1 text-xs font-medium text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900">Sales Overview — Last 14 Days</h3>
            <BarChart3 size={16} className="text-zinc-400" />
          </div>
          <div className="mt-6 flex h-52 items-end gap-1.5">
            {sales_by_day.length === 0 ? (
              <p className="text-sm text-zinc-400">No sales recorded yet.</p>
            ) : (
              sales_by_day.map((d) => (
                <div key={d.date} className="group relative flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-violet-400 transition-all duration-300 group-hover:from-brand-700 group-hover:to-violet-500"
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
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900">Top Products</h3>
            <Star size={16} className="text-zinc-400" />
          </div>
          <div className="mt-4 space-y-4">
            {top_products.length === 0 ? (
              <p className="text-sm text-zinc-400">No sales yet.</p>
            ) : (
              top_products.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-5 text-center text-xs font-bold text-zinc-400">{i + 1}</span>
                  <img src={p.image} alt="" className="h-10 w-10 rounded-xl bg-zinc-100 object-cover" onError={(e) => (e.currentTarget.style.opacity = 0.15)} />
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

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900">Monthly Revenue</h3>
            <TrendingUp size={16} className="text-zinc-400" />
          </div>
          <div className="mt-6 flex h-44 items-end gap-3">
            {monthly_revenue.map((m) => (
              <div key={m.month} className="group relative flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-teal-400 transition-all duration-300 group-hover:from-emerald-700"
                  style={{ height: `${Math.max(4, (m.revenue / maxMonth) * 100)}%` }}
                />
                <span className="mt-1 text-[10px] font-medium text-zinc-500">{m.month.split(' ')[0]}</span>
                <span className="hidden text-[9px] text-zinc-400 group-hover:block">
                  {m.revenue > 0 ? formatPrice(m.revenue) : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {low_stock_products.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">Low Stock Alert</h3>
              <AlertTriangle size={16} className="text-red-400" />
            </div>
            <div className="mt-4 space-y-3">
              {low_stock_products.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl bg-red-50/50 p-3">
                  <img src={p.image} alt="" className="h-10 w-10 rounded-lg bg-zinc-100 object-cover" onError={(e) => (e.currentTarget.style.opacity = 0.15)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900">{p.name}</p>
                    <p className="text-xs text-zinc-500">{formatPrice(p.price)}</p>
                  </div>
                  <span className={`text-sm font-bold ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
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
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
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
