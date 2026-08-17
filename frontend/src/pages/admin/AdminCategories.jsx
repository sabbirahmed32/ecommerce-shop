import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, FolderTree } from 'lucide-react';
import { adminApi } from '../../api';
import { extractError } from '../../api/client';
import { useToastStore } from '../../stores/toastStore';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';

const EMPTY_FORM = { name: '', slug: '', description: '', image: '', status: true };

export default function AdminCategories() {
  const toast = useToastStore();
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const load = () =>
    adminApi
      .categories({ search: search || undefined, page })
      .then(({ data }) => {
        setCategories(data.data.categories);
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

  const openEdit = (cat) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', image: cat.image || '', status: cat.status ?? true });
    setModal(cat);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        await adminApi.createCategory(form);
        toast.success('Category created.');
      } else {
        await adminApi.updateCategory(modal.id, form);
        toast.success('Category updated.');
      }
      setModal(null);
      await load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (cat) => {
    setDeletingId(cat.id);
    try {
      await adminApi.deleteCategory(cat.id);
      toast.success('Category deleted.');
      await load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeletingId(null);
    }
  };

  const toggleStatus = async (cat) => {
    try {
      await adminApi.updateCategory(cat.id, { ...cat, status: !cat.status });
      toast.success(`Category ${cat.status ? 'deactivated' : 'activated'}.`);
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
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">Categories</h2>
          <p className="mt-1 text-sm text-zinc-500">{pagination?.total ?? 0} categories</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openCreate}>Add Category</Button>
      </div>

      <form onSubmit={runSearch} className="relative max-w-sm">
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search categories…"
          className="w-full rounded-full border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </form>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : categories.length === 0 ? (
        <EmptyState icon={FolderTree} title="No categories yet" description="Create your first category to organize products." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div key={cat.id} className="card overflow-hidden">
                <div className="relative h-28 bg-zinc-100">
                  <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.opacity = 0.2)} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <p className="absolute bottom-3 left-4 text-sm font-bold text-white">{cat.name}</p>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleStatus(cat)}
                      className={`relative h-5 w-9 rounded-full transition ${cat.status ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                      aria-label="Toggle status"
                    >
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${cat.status ? 'left-[18px]' : 'left-0.5'}`} />
                    </button>
                    <div>
                      <p className="text-xs text-zinc-500">
                        <span className="font-semibold text-zinc-900">{cat.products_count}</span> products
                      </p>
                      {cat.slug && <p className="text-[11px] text-zinc-400">/{cat.slug}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(cat)} className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-brand-50 hover:text-brand-700" aria-label="Edit">
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => remove(cat)}
                      disabled={deletingId === cat.id || cat.products_count > 0}
                      title={cat.products_count > 0 ? 'Cannot delete a category with products' : 'Delete'}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {pagination && (
            <Pagination page={pagination.current_page} lastPage={pagination.last_page} onChange={setPage} />
          )}
        </>
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Add Category' : 'Edit Category'}
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Name">
            <input className="input" value={form.name} onChange={set('name')} placeholder="Electronics" required />
          </Field>
          <Field label="Slug">
            <input className="input" value={form.slug} onChange={set('slug')} placeholder="electronics (auto if empty)" />
          </Field>
          <Field label="Image URL">
            <input className="input" value={form.image} onChange={set('image')} placeholder="https://images.unsplash.com/…" />
          </Field>
          <Field label="Description">
            <textarea className="input min-h-20 resize-y" value={form.description} onChange={set('description')} />
          </Field>
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-700">
            <input type="checkbox" checked={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.checked }))} className="h-4 w-4 rounded accent-emerald-600" />
            Active (visible in store)
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>
              {modal === 'create' ? 'Create' : 'Save Changes'}
            </Button>
          </div>
        </form>
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
