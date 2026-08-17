export function formatPrice(value) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value));
}

export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function timeAgo(value) {
  if (!value) return '';
  return value.includes('ago') ? value : new Date(value).toLocaleDateString();
}

export const ORDER_STATUS_STYLES = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  confirmed: { label: 'Confirmed', className: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  processing: { label: 'Processing', className: 'bg-blue-50 text-blue-700 ring-blue-200' },
  shipped: { label: 'Shipped', className: 'bg-violet-50 text-violet-700 ring-violet-200' },
  delivered: { label: 'Delivered', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-700 ring-red-200' },
};

export const PAYMENT_STATUS_STYLES = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  failed: { label: 'Failed', className: 'bg-red-50 text-red-700 ring-red-200' },
  refunded: { label: 'Refunded', className: 'bg-blue-50 text-blue-700 ring-blue-200' },
};

export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
