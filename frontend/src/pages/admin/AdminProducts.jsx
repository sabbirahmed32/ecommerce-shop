import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Package, Filter } from 'lucide-react';
import { adminApi } from '../../api';
import { extractError } from '../../api/client';
import { useToastStore } from '../../stores/toastStore';
import { formatPrice } from '../../utils/format';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

export default function AdminProducts() {
  const toast = useToastStore();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    adminApi.allCategories().then(({ data }) => setCategories(data.data.categories)).catch(() => {});
    adminApi.allBrands().then(({ data }) => setBrands(data.data.brands)).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminApi
      .products({
        search: search || undefined,
        category_id: filterCategory || undefined,
        brand_id: filterBrand || undefined,
        page,
      })
      .then(({ data }) => {
        if (!active) return;
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      })
      .catch((err) => toast.error(extractError(err)))
      .finally(() => active && setLoading(false));
    return () => (active = false);
  }, [search, filterCategory, filterBrand, page]);

  const runSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const toggleStatus = async (product) => {
    try {
      const { data } = await adminApi.updateProduct(product.id, {
        category_id: product.category_id,
        brand_id: product.brand_id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        compare_price: product.compare_price,
        discount_price: product.discount_price,
        stock: product.stock,
        sku: product.sku,
        image: product.image,
        images: product.images,
        featured: product.featured,
        status: !product.status,
      });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? data.data.product : p)));
      toast.success(data.message);
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success('Product deleted.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setFilterCategory('');
    setFilterBrand('');
    setPage(1);
  };

  const hasFilters = search || filterCategory || filterBrand;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">Products</h2>
          <p className="mt-1 text-sm text-zinc-500">{pagination?.total ?? 0} products</p>
        </div>
        <Link to="/admin/products/new">
          <Button variant="primary" icon={Plus}>Add Product</Button>
        </Link>
      </div>

      <div className="card space-y-3 p-4">
        <form onSubmit={runSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={filterBrand}
            onChange={(e) => { setFilterBrand(e.target.value); setPage(1); }}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All brands</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <Button type="submit" variant="primary">Search</Button>
          {hasFilters && (
            <Button type="button" variant="secondary" icon={Filter} onClick={clearFilters}>Clear</Button>
          )}
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : products.length === 0 ? (
        <EmptyState icon={Package} title="No products found" description="Try a different search or add a new product." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-3 font-semibold">Product</th>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 font-semibold">Brand</th>
                  <th className="px-6 py-3 font-semibold">Price</th>
                  <th className="px-6 py-3 font-semibold">Stock</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt="" className="h-11 w-11 rounded-xl bg-zinc-100 object-cover" onError={(e) => (e.currentTarget.style.opacity = 0.15)} />
                        <div className="min-w-0">
                          <p className="max-w-[220px] truncate font-semibold text-zinc-900">{p.name}</p>
                          <p className="text-xs text-zinc-400">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-zinc-600">{p.category?.name}</td>
                    <td className="px-6 py-3 text-zinc-600">{p.brandRel?.name || p.brand || '—'}</td>
                    <td className="px-6 py-3">
                      <div>
                        <span className="font-semibold text-zinc-900">{formatPrice(p.price)}</span>
                        {p.discount_price && <span className="ml-1 text-xs text-green-600">Sale: {formatPrice(p.discount_price)}</span>}
                        {p.compare_price > p.price && <span className="ml-1 text-xs text-zinc-400 line-through">{formatPrice(p.compare_price)}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-sm font-medium ${p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-amber-600' : 'text-zinc-600'}`}>{p.stock}</span>
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => toggleStatus(p)}
                        className={`relative h-6 w-11 rounded-full transition ${p.status ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                        aria-label="Toggle product status"
                      >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${p.status ? 'left-[22px]' : 'left-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-1">
                        <Link to={`/admin/products/${p.id}/edit`} className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-brand-50 hover:text-brand-700" aria-label="Edit">
                          <Pencil size={16} />
                        </Link>
                        <button onClick={() => setDeleteTarget(p)} className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-50 hover:text-red-500" aria-label="Delete">
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

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete product" size="sm">
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
