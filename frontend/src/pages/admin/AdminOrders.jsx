import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, ChevronDown, Eye, Printer } from 'lucide-react';
import { adminApi } from '../../api';
import { extractError } from '../../api/client';
import { useToastStore } from '../../stores/toastStore';
import { formatPrice, formatDateTime, ORDER_STATUS_STYLES, ORDER_STATUSES, PAYMENT_STATUS_STYLES, PAYMENT_STATUSES } from '../../utils/format';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

export default function AdminOrders() {
  const toast = useToastStore();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminApi
      .orders({
        search: search || undefined,
        status: statusFilter || undefined,
        payment_status: paymentFilter || undefined,
        page,
      })
      .then(({ data }) => {
        if (!active) return;
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      })
      .catch((err) => toast.error(extractError(err)))
      .finally(() => active && setLoading(false));
    return () => (active = false);
  }, [search, statusFilter, paymentFilter, page]);

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

  const changePaymentStatus = async (orderId, paymentStatus) => {
    try {
      const { data } = await adminApi.updateOrderPaymentStatus(orderId, paymentStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.data.order : o)));
      if (detail?.id === orderId) setDetail(data.data.order);
      toast.success('Payment status updated.');
    } catch (err) {
      toast.error(extractError(err));
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

  const printInvoice = (order) => {
    const invoiceContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Invoice #${order.order_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #111; padding-bottom: 20px; margin-bottom: 30px; }
    .brand { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .invoice-label { font-size: 14px; color: #666; text-align: right; }
    .invoice-number { font-size: 22px; font-weight: 700; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .section h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin-bottom: 8px; }
    .section p { font-size: 14px; line-height: 1.6; }
    .section .name { font-weight: 700; font-size: 15px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #f5f5f5; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; padding: 10px 12px; }
    td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
    .totals { margin-left: auto; width: 300px; }
    .totals .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .totals .total { border-top: 2px solid #111; margin-top: 8px; padding-top: 8px; font-size: 18px; font-weight: 800; }
    .status { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; }
    .status-paid { background: #ecfdf5; color: #059669; }
    .status-pending { background: #fef9c3; color: #ca8a04; }
    .footer { border-top: 1px solid #eee; padding-top: 20px; text-align: center; font-size: 12px; color: #999; margin-top: 40px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">NOVA</div>
      <div class="invoice-label">eCommerce Store</div>
    </div>
    <div class="invoice-label">
      <div>INVOICE</div>
      <div class="invoice-number">#${order.order_number}</div>
      <div style="margin-top:4px">${formatDateTime(order.created_at)}</div>
    </div>
  </div>
  <div class="grid">
    <div class="section">
      <h3>Bill To</h3>
      <p class="name">${order.shipping.name}</p>
      <p>${order.shipping.address || ''}</p>
      <p>${order.shipping.city || ''}${order.shipping.state ? ', ' + order.shipping.state : ''} ${order.shipping.postal_code || ''}</p>
      <p>${order.shipping.country || ''}</p>
      <p style="margin-top:8px">${order.shipping.email}</p>
      <p>${order.shipping.phone || ''}</p>
    </div>
    <div class="section">
      <h3>Payment Details</h3>
      <p>Method: ${order.payment_method?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}</p>
      <p style="margin-top:6px">Status: <span class="status status-${order.payment_status === 'paid' ? 'paid' : 'pending'}">${order.payment_status?.toUpperCase()}</span></p>
      <p style="margin-top:12px">Order Status: <strong>${order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}</strong></p>
      ${order.coupon_code ? `<p style="margin-top:6px">Coupon: <strong>${order.coupon_code}</strong></p>` : ''}
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Price</th>
        <th>Qty</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${(order.items || []).map(item => `
        <tr>
          <td><strong>${item.name}</strong></td>
          <td>${formatPrice(item.price)}</td>
          <td>${item.quantity}</td>
          <td style="text-align:right;font-weight:600">${formatPrice(item.total)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="totals">
    <div class="row"><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
    ${order.discount > 0 ? `<div class="row" style="color:#059669"><span>Discount</span><span>-${formatPrice(order.discount)}</span></div>` : ''}
    <div class="row"><span>Shipping</span><span>${order.shipping_fee === 0 ? 'FREE' : formatPrice(order.shipping_fee)}</span></div>
    <div class="row"><span>Tax</span><span>${formatPrice(order.tax)}</span></div>
    <div class="row total"><span>Total</span><span>${formatPrice(order.total)}</span></div>
  </div>
  <div class="footer">
    <p>Thank you for your purchase!</p>
    <p style="margin-top:4px">Nova eCommerce &mdash; This is a system-generated invoice.</p>
  </div>
</body>
</html>`;
    const win = window.open('', '_blank');
    win.document.write(invoiceContent);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setStatusFilter('');
    setPaymentFilter('');
    setPage(1);
  };

  const hasFilters = search || statusFilter || paymentFilter;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">Orders</h2>
          <p className="mt-1 text-sm text-zinc-500">{pagination?.total ?? 0} orders</p>
        </div>
      </div>

      <div className="card space-y-3 p-4">
        <form onSubmit={runSearch} className="flex flex-wrap gap-3">
          <div className="relative flex-1">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search order #, name or email…"
              className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="relative">
            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="appearance-none rounded-lg border border-zinc-200 bg-white py-2.5 pl-4 pr-9 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="">All statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
              className="appearance-none rounded-lg border border-zinc-200 bg-white py-2.5 pl-4 pr-9 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="">All payments</option>
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="primary">Search</Button>
          {hasFilters && (
            <Button type="button" variant="secondary" onClick={clearFilters}>Clear</Button>
          )}
        </form>
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
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const status = ORDER_STATUS_STYLES[order.status] || {};
                  const payStatus = PAYMENT_STATUS_STYLES[order.payment_status] || {};
                  return (
                    <tr key={order.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                      <td className="px-6 py-3.5 font-semibold text-zinc-900">#{order.order_number}</td>
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-zinc-700">{order.shipping.name}</p>
                        <p className="text-xs text-zinc-400">{order.shipping.email}</p>
                      </td>
                      <td className="px-6 py-3.5 text-zinc-500">{formatDateTime(order.created_at)}</td>
                      <td className="px-6 py-3.5">
                        <span className={`chip ring-1 ${payStatus.className || 'bg-zinc-100 text-zinc-500 ring-zinc-200'}`}>
                          {payStatus.label || order.payment_status}
                        </span>
                      </td>
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
                <span className={`chip ring-1 ${(PAYMENT_STATUS_STYLES[detail.payment_status] || {}).className}`}>
                  Payment: {(PAYMENT_STATUS_STYLES[detail.payment_status] || {}).label || detail.payment_status}
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Customer</h4>
                {detail.user ? (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-zinc-900">{detail.user.name}</p>
                    <p className="text-sm text-zinc-600">{detail.user.email}</p>
                    {detail.user.phone && <p className="text-sm text-zinc-600">{detail.user.phone}</p>}
                    <Link
                      to={`/admin/customers`}
                      onClick={() => setDetail(null)}
                      className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:text-brand-800"
                    >
                      View customer profile
                    </Link>
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-zinc-900">{detail.shipping.name}</p>
                    <p className="text-sm text-zinc-600">{detail.shipping.email}</p>
                  </div>
                )}
              </div>
              <div className="rounded-2xl bg-zinc-50 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Shipping Address</h4>
                <p className="mt-2 text-sm text-zinc-600">{detail.shipping.address}</p>
                <p className="text-sm text-zinc-600">{detail.shipping.city}{detail.shipping.state ? `, ${detail.shipping.state}` : ''} {detail.shipping.postal_code}</p>
                <p className="text-sm text-zinc-600">{detail.shipping.country}</p>
                <p className="mt-1 text-sm text-zinc-600">{detail.shipping.phone}</p>
                <p className="mt-1 text-sm capitalize text-zinc-500">{detail.shipping_method} delivery</p>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Update Order Status</h4>
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
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Update Payment Status</h4>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => changePaymentStatus(detail.id, s)}
                      disabled={detail.payment_status === s}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                        detail.payment_status === s ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-zinc-100 pt-4">
              <Button variant="secondary" icon={Printer} onClick={() => printInvoice(detail)}>
                Print Invoice
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
