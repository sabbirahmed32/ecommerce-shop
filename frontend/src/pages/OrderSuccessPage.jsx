import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, Package, Calendar, CreditCard, Home } from 'lucide-react';
import { formatPrice, formatDate } from '../utils/format';
import Button from '../components/ui/Button';

export default function OrderSuccessPage() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="container-page flex justify-center py-14 lg:py-20">
      <div className="w-full max-w-2xl animate-fade-up">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 size={44} className="text-emerald-600" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-zinc-900">Order Confirmed!</h1>
          <p className="mx-auto mt-3 max-w-md text-zinc-500">
            Thank you for your purchase. Your order has been placed and is now being processed. A confirmation email is on its way.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-bold text-zinc-900">
            <Package size={16} /> Order #{orderNumber || order?.order_number}
          </p>
        </div>

        {order && (
          <div className="card mt-8 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Calendar size={15} /> Placed {formatDate(order.created_at)}
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <CreditCard size={15} /> {order.payment_method.replaceAll('_', ' ')}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {(order.items || []).map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.image} alt="" className="h-14 w-14 rounded-xl bg-zinc-100 object-cover" onError={(e) => (e.currentTarget.style.opacity = 0.15)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900">{item.name}</p>
                    <p className="text-xs text-zinc-500">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-zinc-900">{formatPrice(item.total)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-dashed border-zinc-200 pt-4 text-sm">
              <div className="flex justify-between text-zinc-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600"><span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span><span>−{formatPrice(order.discount)}</span></div>
              )}
              <div className="flex justify-between text-zinc-600"><span>Shipping</span><span>{order.shipping_fee === 0 ? 'FREE' : formatPrice(order.shipping_fee)}</span></div>
              <div className="flex justify-between text-zinc-600"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
              <div className="flex justify-between text-base font-extrabold text-zinc-900"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/orders">
            <Button variant="primary">View My Orders</Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" icon={Home}>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
