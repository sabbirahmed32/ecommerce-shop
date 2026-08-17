import { useEffect, useState } from 'react';
import { BarChart3, DollarSign, ShoppingCart, Package, Users, TrendingUp } from 'lucide-react';
import { adminApi } from '../../api';
import { extractError } from '../../api/client';
import { useToastStore } from '../../stores/toastStore';
import { formatPrice, ORDER_STATUS_STYLES } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';

export default function AdminReports() {
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

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!data) return null;

  const { stats, revenue_by_status, monthly_revenue, orders_by_status, top_products } = data;
  const maxMonth = Math.max(...monthly_revenue.map((m) => m.revenue), 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">Reports</h2>
        <p className="mt-1 text-sm text-zinc-500">Analytics and business insights for your store.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Revenue', value: formatPrice(stats.total_revenue), icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Total Orders', value: stats.total_orders, icon: ShoppingCart, color: 'text-brand-600 bg-brand-50' },
          { label: 'Avg. Order Value', value: stats.total_orders > 0 ? formatPrice(stats.total_revenue / stats.total_orders) : '$0.00', icon: TrendingUp, color: 'text-violet-600 bg-violet-50' },
          { label: 'Conversion Rate', value: stats.total_users > 0 ? `${((stats.total_orders / stats.total_users) * 100).toFixed(1)}%` : '0%', icon: Users, color: 'text-sky-600 bg-sky-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon size={18} /></span>
            <p className="mt-3 text-2xl font-extrabold text-zinc-900">{value}</p>
            <p className="mt-0.5 text-xs font-medium text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-sm font-bold text-zinc-900">Monthly Revenue (Last 6 Months)</h3>
          <div className="mt-6 flex h-48 items-end gap-4">
            {monthly_revenue.map((m) => (
              <div key={m.month} className="group relative flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-violet-400 transition group-hover:from-brand-700"
                  style={{ height: `${Math.max(4, (m.revenue / maxMonth) * 100)}%` }}
                />
                <span className="mt-1 text-[10px] font-medium text-zinc-500">{m.month.split(' ')[0]}</span>
                <span className="hidden text-[9px] text-zinc-400 group-hover:block">{m.revenue > 0 ? formatPrice(m.revenue) : ''}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-bold text-zinc-900">Revenue by Status</h3>
          <div className="mt-4 space-y-3">
            {revenue_by_status.map((item) => {
              const style = ORDER_STATUS_STYLES[item.status] || {};
              const pct = stats.total_revenue > 0 ? ((item.revenue / stats.total_revenue) * 100).toFixed(1) : 0;
              return (
                <div key={item.status}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`chip ring-1 ${style.className}`}>{style.label}</span>
                      <span className="text-zinc-500">{item.count} orders</span>
                    </div>
                    <span className="font-semibold text-zinc-900">{formatPrice(item.revenue)}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-bold text-zinc-900">Top Selling Products</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-xs uppercase tracking-wider text-zinc-500">
                <th className="pb-3 font-semibold">#</th>
                <th className="pb-3 font-semibold">Product</th>
                <th className="pb-3 font-semibold">Price</th>
                <th className="pb-3 font-semibold">Sold</th>
                <th className="pb-3 font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {top_products.map((p, i) => (
                <tr key={p.id} className="border-b border-zinc-50">
                  <td className="py-3 font-bold text-zinc-400">{i + 1}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="h-10 w-10 rounded-lg bg-zinc-100 object-cover" onError={(e) => (e.currentTarget.style.opacity = 0.15)} />
                      <span className="font-semibold text-zinc-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-zinc-600">{formatPrice(p.price)}</td>
                  <td className="py-3 font-semibold text-zinc-900">{p.sold}</td>
                  <td className="py-3 font-bold text-zinc-900">{formatPrice(p.price * p.sold)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
