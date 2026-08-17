import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Ticket, Search } from 'lucide-react';
import { adminApi } from '../../api';
import { extractError } from '../../api/client';
import { useToastStore } from '../../stores/toastStore';
import { formatPrice, formatDate } from '../../utils/format';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const EMPTY_FORM = { code: '', type: 'percent', value: '', max_discount: '', min_subtotal: '', max_uses: '', starts_at: '', expires_at: '', is_active: true };

export default function AdminCoupons() {
  const toast = useToastStore();
  const [coupons, setCoupons] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = () => {
    let active = true;
    adminApi
      .coupons({ search: search || undefined, page })
      .then(({ data }) => {
        if (!active) return;
        setCoupons(data.data.coupons);
        setPagination(data.data.pagination);
      })
      .catch((err) => toast.error(extractError(err)))
      .finally(() => active && setLoading(false));
    return () => (active = false);
  };

  useEffect(() => {
    load();
  }, [search, page]);

  const runSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create'); };
  const openEdit = (c) => {
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      max_discount: c.max_discount ?? '',
      min_subtotal: c.min_subtotal || '',
      max_uses: c.max_uses || '',
      starts_at: c.starts_at ? c.starts_at.split('T')[0] : '',
      expires_at: c.expires_at ? c.expires_at.split('T')[0] : '',
      is_active: c.is_active,
    });
    setModal(c);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        await adminApi.createCoupon(form);
        toast.success('Coupon created.');
      } else {
        await adminApi.updateCoupon(modal.id, form);
        toast.success('Coupon updated.');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.deleteCoupon(deleteTarget.id);
      toast.success('Coupon deleted.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const isExpired = (c) => c.expires_at && new Date(c.expires_at) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">Coupons</h2>
          <p className="mt-1 text-sm text-zinc-500">{pagination?.total ?? 0} coupons</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openCreate}>Add Coupon</Button>
      </div>

      <form onSubmit={runSearch} className="relative max-w-sm">
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by code…"
          className="w-full rounded-full border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </form>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : coupons.length === 0 ? (
        <EmptyState icon={Ticket} title="No coupons yet" description="Create discount coupons for your customers." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-3 font-semibold">Code</th>
                  <th className="px-6 py-3 font-semibold">Type</th>
                  <th className="px-6 py-3 font-semibold">Discount</th>
                  <th className="px-6 py-3 font-semibold">Max Discount</th>
                  <th className="px-6 py-3 font-semibold">Min. Order</th>
                  <th className="px-6 py-3 font-semibold">Usage</th>
                  <th className="px-6 py-3 font-semibold">Expires</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                    <td className="px-6 py-3 font-mono font-bold text-zinc-900">{c.code}</td>
                    <td className="px-6 py-3">
                      <span className={`chip ring-1 ${c.type === 'percent' ? 'bg-violet-50 text-violet-700 ring-violet-200' : 'bg-blue-50 text-blue-700 ring-blue-200'}`}>
                        {c.type === 'percent' ? 'Percent' : 'Fixed'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-zinc-700 font-semibold">{c.type === 'percent' ? `${c.value}%` : formatPrice(c.value)}</td>
                    <td className="px-6 py-3 text-zinc-500">{c.max_discount ? formatPrice(c.max_discount) : '—'}</td>
                    <td className="px-6 py-3 text-zinc-500">{c.min_subtotal ? formatPrice(c.min_subtotal) : '—'}</td>
                    <td className="px-6 py-3 text-zinc-500">{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ''}</td>
                    <td className="px-6 py-3 text-zinc-500">
                      {c.expires_at ? formatDate(c.expires_at) : '—'}
                      {isExpired(c) && <span className="ml-1 text-xs text-red-500">(expired)</span>}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`chip ring-1 ${c.is_active ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-zinc-100 text-zinc-500 ring-zinc-200'}`}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(c)} className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-brand-50 hover:text-brand-700"><Pencil size={15} /></button>
                        <button onClick={() => setDeleteTarget(c)} className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button>
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

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Coupon' : 'Edit Coupon'}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Code</label>
              <input className="input font-mono" value={form.code} onChange={set('code')} placeholder="SAVE20" required />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={set('type')}>
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label className="label">Value</label>
              <input type="number" step="0.01" min="0" className="input" value={form.value} onChange={set('value')} required placeholder={form.type === 'percent' ? '20' : '10.00'} />
            </div>
            <div>
              <label className="label">Maximum Discount ($)</label>
              <input type="number" step="0.01" min="0" className="input" value={form.max_discount} onChange={set('max_discount')} placeholder="Cap for percentage coupons" />
            </div>
            <div>
              <label className="label">Minimum Order ($)</label>
              <input type="number" step="0.01" min="0" className="input" value={form.min_subtotal} onChange={set('min_subtotal')} placeholder="0 for no minimum" />
            </div>
            <div>
              <label className="label">Usage Limit</label>
              <input type="number" min="1" className="input" value={form.max_uses} onChange={set('max_uses')} placeholder="Unlimited if empty" />
            </div>
            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input" value={form.starts_at} onChange={set('starts_at')} />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" className="input" value={form.expires_at} onChange={set('expires_at')} />
            </div>
            <label className="flex items-center gap-3 text-sm font-medium text-zinc-700">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="h-4 w-4 rounded accent-emerald-600" />
              Active
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>{modal === 'create' ? 'Create' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete coupon" size="sm">
        <p className="text-sm text-zinc-600">Delete <strong className="text-zinc-900">{deleteTarget?.code}</strong>? This action cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete} loading={deleting}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
