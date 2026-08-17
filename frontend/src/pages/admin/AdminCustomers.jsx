import { useEffect, useState } from 'react';
import { Search, Users, Eye, Mail, Phone, Trash2, Ban, CheckCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api';
import { extractError } from '../../api/client';
import { useToastStore } from '../../stores/toastStore';
import { formatPrice, formatDate, ORDER_STATUS_STYLES } from '../../utils/format';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

export default function AdminCustomers() {
  const toast = useToastStore();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminApi
      .customers({ search: search || undefined, page })
      .then(({ data }) => {
        if (!active) return;
        setCustomers(data.data.customers);
        setPagination(data.data.pagination);
      })
      .catch((err) => toast.error(extractError(err)))
      .finally(() => active && setLoading(false));
    return () => (active = false);
  }, [search, page]);

  const runSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const viewCustomer = async (id) => {
    try {
      const { data } = await adminApi.customer(id);
      setDetail(data.data.customer);
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const toggleBlock = async (customer) => {
    try {
      const { data } = await adminApi.blockCustomer(customer.id);
      toast.success(data.message);
      setCustomers((prev) => prev.map((c) => (c.id === customer.id ? data.data.customer : c)));
      if (detail?.id === customer.id) setDetail(data.data.customer);
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.deleteCustomer(deleteTarget.id);
      toast.success('Customer deleted.');
      setDeleteTarget(null);
      setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">Customers</h2>
        <p className="mt-1 text-sm text-zinc-500">{pagination?.total ?? 0} customers</p>
      </div>

      <form onSubmit={runSearch} className="relative max-w-sm">
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, email or phone…"
          className="w-full rounded-full border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </form>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : customers.length === 0 ? (
        <EmptyState icon={Users} title="No customers found" description="Registered customers will appear here." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-3 font-semibold">Customer</th>
                  <th className="px-6 py-3 font-semibold">Phone</th>
                  <th className="px-6 py-3 font-semibold">Orders</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Joined</th>
                  <th className="px-6 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
                          {c.name?.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-zinc-900">{c.name}</p>
                          <p className="text-xs text-zinc-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-zinc-500">{c.phone || '—'}</td>
                    <td className="px-6 py-3 font-semibold text-zinc-900">{c.orders_count}</td>
                    <td className="px-6 py-3">
                      {c.is_blocked ? (
                        <span className="chip ring-1 bg-red-50 text-red-700 ring-red-200">Blocked</span>
                      ) : (
                        <span className="chip ring-1 bg-emerald-50 text-emerald-700 ring-emerald-200">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-zinc-500">{formatDate(c.created_at)}</td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => viewCustomer(c.id)} className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-brand-50 hover:text-brand-700" title="View">
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => toggleBlock(c)}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${c.is_blocked ? 'text-emerald-500 hover:bg-emerald-50' : 'text-amber-500 hover:bg-amber-50'}`}
                          title={c.is_blocked ? 'Unblock' : 'Block'}
                        >
                          {c.is_blocked ? <CheckCircle size={16} /> : <Ban size={16} />}
                        </button>
                        <button onClick={() => setDeleteTarget(c)} className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-50 hover:text-red-500" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Customer Details" size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white">
                  {detail.name?.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-lg font-bold text-zinc-900">{detail.name}</p>
                  <p className="flex items-center gap-1.5 text-sm text-zinc-500"><Mail size={13} /> {detail.email}</p>
                  {detail.phone && <p className="flex items-center gap-1.5 text-sm text-zinc-500"><Phone size={13} /> {detail.phone}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant={detail.is_blocked ? 'primary' : 'secondary'} size="sm" icon={detail.is_blocked ? CheckCircle : Ban} onClick={() => toggleBlock(detail)}>
                  {detail.is_blocked ? 'Unblock' : 'Block'}
                </Button>
                <Button variant="danger" size="sm" icon={Trash2} onClick={() => { setDetail(null); setDeleteTarget(detail); }}>
                  Delete
                </Button>
              </div>
            </div>

            {detail.is_blocked && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                This customer is <strong>blocked</strong> and cannot place orders.
              </div>
            )}

            {(detail.address || detail.city || detail.country) && (
              <div className="rounded-2xl bg-zinc-50 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Address</h4>
                <p className="mt-2 text-sm text-zinc-700">{detail.address}</p>
                {detail.city && <p className="text-sm text-zinc-600">{detail.city}{detail.state ? `, ${detail.state}` : ''} {detail.postal_code}</p>}
                {detail.country && <p className="text-sm text-zinc-600">{detail.country}</p>}
              </div>
            )}

            {detail.orders_count !== undefined && (
              <p className="text-sm text-zinc-600"><span className="font-semibold">{detail.orders_count}</span> orders placed</p>
            )}

            {detail.orders && detail.orders.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Recent Orders</h4>
                  <button
                    onClick={() => { setDetail(null); navigate('/admin/orders'); }}
                    className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800"
                  >
                    View all orders <ExternalLink size={12} />
                  </button>
                </div>
                <div className="space-y-2">
                  {detail.orders.map((o) => {
                    const s = ORDER_STATUS_STYLES[o.status] || {};
                    return (
                      <div key={o.id} className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-zinc-900">#{o.order_number}</span>
                          <span className={`chip ring-1 text-[10px] ${s.className}`}>{s.label}</span>
                        </div>
                        <span className="text-zinc-500">{formatDate(o.created_at)}</span>
                        <span className="font-bold text-zinc-900">{formatPrice(o.total)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete customer" size="sm">
        <p className="text-sm text-zinc-600">
          Are you sure you want to delete <strong className="text-zinc-900">{deleteTarget?.name}</strong>? All their orders and data will be permanently removed.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete} loading={deleting}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
