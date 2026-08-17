import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Tag } from 'lucide-react';
import { adminApi } from '../../api';
import { extractError } from '../../api/client';
import { useToastStore } from '../../stores/toastStore';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';

const EMPTY_FORM = { name: '', slug: '', description: '', logo: '', status: true };

export default function AdminBrands() {
  const toast = useToastStore();
  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const load = () =>
    adminApi
      .brands({ search: search || undefined, page })
      .then(({ data }) => {
        setBrands(data.data.brands);
        setPagination(data.data.pagination);
      })
      .catch((err) => toast.error(extractError(err)));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [search, page]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModal('create');
  };

  const openEdit = (brand) => {
    setForm({ name: brand.name, slug: brand.slug, description: brand.description || '', logo: brand.logo || '', status: brand.status ?? true });
    setModal(brand);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        await adminApi.createBrand(form);
        toast.success('Brand created.');
      } else {
        await adminApi.updateBrand(modal.id, form);
        toast.success('Brand updated.');
      }
      setModal(null);
      await load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.deleteBrand(deleteTarget.id);
      toast.success('Brand deleted.');
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (brand) => {
    try {
      await adminApi.updateBrand(brand.id, { ...brand, status: !brand.status });
      toast.success(`Brand ${brand.status ? 'deactivated' : 'activated'}.`);
      await load();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const runSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">Brands</h2>
          <p className="mt-1 text-sm text-zinc-500">{pagination?.total ?? 0} brands</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openCreate}>Add Brand</Button>
      </div>

      <form onSubmit={runSearch} className="relative max-w-sm">
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search brands…"
          className="w-full rounded-full border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </form>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : brands.length === 0 ? (
        <EmptyState icon={Tag} title="No brands found" description="Add your first brand to organize products." />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/60 text-xs uppercase tracking-wider text-zinc-500">
                    <th className="px-6 py-3 font-semibold">Brand</th>
                    <th className="px-6 py-3 font-semibold">Slug</th>
                    <th className="px-6 py-3 font-semibold">Products</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand) => (
                    <tr key={brand.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          {brand.logo ? (
                            <img src={brand.logo} alt="" className="h-10 w-10 rounded-xl bg-zinc-100 object-cover" onError={(e) => (e.currentTarget.style.opacity = 0.15)} />
                          ) : (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-sm font-bold text-white">
                              {brand.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-zinc-900">{brand.name}</p>
                            {brand.description && <p className="max-w-[200px] truncate text-xs text-zinc-500">{brand.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-zinc-500">/{brand.slug}</td>
                      <td className="px-6 py-3 font-medium text-zinc-600">{brand.products_count}</td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => toggleStatus(brand)}
                          className={`relative h-6 w-11 rounded-full transition ${brand.status ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                          aria-label="Toggle brand status"
                        >
                          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${brand.status ? 'left-[22px]' : 'left-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(brand)} className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-brand-50 hover:text-brand-700" aria-label="Edit">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => setDeleteTarget(brand)} className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-50 hover:text-red-500" aria-label="Delete">
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
        </>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Brand' : 'Edit Brand'}>
        <form onSubmit={save} className="space-y-4">
          <Field label="Name">
            <input className="input" value={form.name} onChange={set('name')} placeholder="Brand name" required />
          </Field>
          <Field label="Slug">
            <input className="input" value={form.slug} onChange={set('slug')} placeholder="brand-name (auto if empty)" />
          </Field>
          <Field label="Logo URL">
            <input className="input" value={form.logo} onChange={set('logo')} placeholder="https://..." />
          </Field>
          {form.logo && (
            <div className="flex gap-3">
              <img src={form.logo} alt="Logo preview" className="h-16 w-16 rounded-xl object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
          <Field label="Description">
            <textarea className="input min-h-20 resize-y" value={form.description} onChange={set('description')} />
          </Field>
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-700">
            <input type="checkbox" checked={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.checked }))} className="h-4 w-4 rounded accent-emerald-600" />
            Active
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>
              {modal === 'create' ? 'Create' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete brand" size="sm">
        <p className="text-sm text-zinc-600">
          Are you sure you want to delete <strong className="text-zinc-900">{deleteTarget?.name}</strong>? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete} loading={deleting}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
