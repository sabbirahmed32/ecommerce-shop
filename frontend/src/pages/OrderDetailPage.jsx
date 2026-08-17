import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Package, Truck, MapPin, CreditCard, Calendar, XCircle,
  CheckCircle2, Clock, PackageCheck, CircleDot, Ban,
} from 'lucide-react';
import { orderApi } from '../api';
import { extractError } from '../api/client';
import { useToastStore } from '../stores/toastStore';
import {
  formatPrice, formatDate, formatDateTime,
  ORDER_STATUS_STYLES, PAYMENT_STATUS_STYLES,
} from '../utils/format';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const STATUS_TIMELINE = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'processing', label: 'Processing', icon: CircleDot },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: PackageCheck },
];

const CANCELLED_STEP = { key: 'cancelled', label: 'Cancelled', icon: Ban };

function getTimelineIndex(status) {
  if (status === 'cancelled') return -1;
  return STATUS_TIMELINE.findIndex((s) => s.key === status);
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToastStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    orderApi
      .show(id)
      .then(({ data }) => {
        if (!active) return;
        setOrder(data.data.order);
      })
      .catch((err) => {
        toast.error(extractError(err));
        navigate('/orders');
      })
      .finally(() => active && setLoading(false));
    return () => (active = false);
  }, [id]);

  const cancelOrder = async () => {
    setCancelling(true);
    try {
      const { data } = await orderApi.cancel(id);
      setOrder(data.data.order);
      toast.success('Order cancelled successfully.');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container-page flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) return null;

  const status = ORDER_STATUS_STYLES[order.status] || {};
  const payment = PAYMENT_STATUS_STYLES[order.payment_status] || {};
  const activeIndex = getTimelineIndex(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="container-page py-10 lg:py-14">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-zinc-900"
      >
        <ArrowLeft size={16} /> Back to Orders
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
            Order #{order.order_number}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className={`chip ring-1 ${status.className}`}>{status.label}</span>
            <span className={`chip ring-1 ${payment.className}`}>{payment.label}</span>
            <span className="flex items-center gap-1.5 text-sm text-zinc-500">
              <Calendar size={14} /> {formatDateTime(order.created_at)}
            </span>
          </div>
        </div>
        {order.can_cancel && (
          <Button
            variant="danger"
            loading={cancelling}
            onClick={cancelOrder}
            icon={XCircle}
          >
            Cancel Order
          </Button>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-900">
              <Package size={16} className="text-brand-600" /> Order Status
            </h2>
            <div className="mt-5 flex items-center justify-between">
              {STATUS_TIMELINE.map((step, idx) => {
                const StepIcon = step.icon;
                const reached = !isCancelled && idx <= activeIndex;
                const current = !isCancelled && idx === activeIndex;
                return (
                  <div key={step.key} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                          current
                            ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                            : reached
                            ? 'bg-brand-600 text-white'
                            : 'bg-zinc-100 text-zinc-400'
                        }`}
                      >
                        <StepIcon size={16} />
                      </div>
                      <span className={`mt-2 text-[11px] font-semibold ${reached ? 'text-zinc-900' : 'text-zinc-400'}`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < STATUS_TIMELINE.length - 1 && (
                      <div
                        className={`mx-1 h-0.5 flex-1 ${
                          !isCancelled && idx < activeIndex ? 'bg-brand-500' : 'bg-zinc-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {isCancelled && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
                <Ban size={16} /> This order has been cancelled.
              </div>
            )}
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-zinc-100 bg-zinc-50/50 px-5 py-3 sm:px-6">
              <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                <Package size={16} className="text-brand-600" /> Order Items
              </h2>
            </div>
            <div className="divide-y divide-zinc-100">
              {(order.items || []).map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                  <img
                    src={item.image}
                    alt=""
                    className="h-16 w-16 rounded-xl bg-zinc-100 object-cover"
                    onError={(e) => (e.currentTarget.style.opacity = 0.15)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900">{item.name}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {formatPrice(item.price)} &times; {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-zinc-900">{formatPrice(item.total)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-900">
              <CreditCard size={16} className="text-brand-600" /> Payment Summary
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                  <span>&minus;{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600">
                <span>Shipping</span>
                <span>{order.shipping_fee === 0 ? 'FREE' : formatPrice(order.shipping_fee)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Tax</span><span>{formatPrice(order.tax)}</span>
              </div>
              <div className="border-t border-zinc-200 pt-3 flex justify-between text-base font-extrabold text-zinc-900">
                <span>Total</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-500">
              <span className="font-semibold text-zinc-700">Payment method:</span>{' '}
              {order.payment_method?.replaceAll('_', ' ')}
            </div>
          </div>

          <div className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-900">
              <MapPin size={16} className="text-brand-600" /> Shipping Address
            </h2>
            {order.shipping && (
              <div className="mt-3 text-sm text-zinc-600 leading-relaxed">
                <p className="font-semibold text-zinc-900">{order.shipping.name}</p>
                <p>{order.shipping.address}</p>
                <p>{order.shipping.city}{order.shipping.state ? `, ${order.shipping.state}` : ''} {order.shipping.postal_code}</p>
                <p>{order.shipping.country}</p>
                {order.shipping.phone && <p className="mt-1">{order.shipping.phone}</p>}
              </div>
            )}
          </div>

          {order.notes && (
            <div className="card p-5 sm:p-6">
              <h2 className="text-sm font-bold text-zinc-900">Order Notes</h2>
              <p className="mt-2 text-sm text-zinc-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
