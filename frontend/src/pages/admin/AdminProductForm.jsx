import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { adminApi, categoryApi } from '../../api';
import { extractError } from '../../api/client';
import { useToastStore } from '../../stores/toastStore';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=60';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToastStore();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    brand: '',
    sku: '',
    price: '',
    compare_price: '',
    stock: '10',
    image: '',
    description: '',
    featured: false,
    status: true,
    slug: '',
  });

  useEffect(() => {
    categoryApi
      .list()
      .then(({ data }) => {
        setCategories(data.data.categories);
        setForm((f) => ({ ...f, category_id: f.category_id || data.data.categories[0]?.id || '' }));
      })
      .catch(() => {});

    if (isEdit) {
      adminApi
        .product(id)
        .then(({ data }) => {
          const p = data.data.product;
          setForm({
            name: p.name,
            category_id: p.category_id,
            brand: p.brand || '',
            sku: p.sku || '',
            price: p.price,
            compare_price: p.compare_price || '',
            stock: p.stock,
            image: p.image || '',
            description: p.description,
            featured: p.featured,
            status: p.status,
            slug: p.slug,
          });
        })
        .catch((err) => {
          toast.error(extractError(err));
          navigate('/admin/products');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await adminApi.updateProduct(id, form);
        toast.success('Product updated.');
      } else {
        await adminApi.createProduct(form);
        toast.success('Product created.');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20"><Spinner /></div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/products" className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-800">
            <ArrowLeft size={15} /> Back to products
          </Link>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
        </div>
      </div>

      <form onSubmit={save} className="card space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product name" className="sm:col-span-2">
            <input className="input" value={form.name} onChange={set('name')} placeholder="Aurora Wireless Headphones" required />
          </Field>
          <Field label="Category">
            <select className="input" value={form.category_id} onChange={set('category_id')} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="SKU">
            <input className="input" value={form.sku} onChange={set('sku')} placeholder="AUR-HD-001" />
          </Field>
          <Field label="Brand">
            <input className="input" value={form.brand} onChange={set('brand')} placeholder="Aurora" />
          </Field>
          <Field label="Price ($)">
            <input type="number" step="0.01" min="0" className="input" value={form.price} onChange={set('price')} placeholder="199.99" required />
          </Field>
          <Field label="Compare price ($)">
            <input type="number" step="0.01" min="0" className="input" value={form.compare_price} onChange={set('compare_price')} placeholder="249.99" />
          </Field>
          <Field label="Stock">
            <input type="number" min="0" className="input" value={form.stock} onChange={set('stock')} required />
          </Field>
          <Field label="Slug">
            <input className="input" value={form.slug} onChange={set('slug')} placeholder="auto-generated if empty" />
          </Field>
          <Field label="Image URL" className="sm:col-span-2">
            <input className="input" value={form.image} onChange={set('image')} placeholder="https://images.unsplash.com/…" />
          </Field>
        </div>

        <div className="flex gap-3">
          <div className="w-40 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
            <img
              src={form.image || FALLBACK_IMAGE}
              alt="Preview"
              className="aspect-[4/3] w-full object-cover"
              onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
            />
          </div>
          <div className="flex flex-col justify-center gap-2 text-sm text-zinc-500">
            <p className="flex items-center gap-2"><ImageIcon size={15} /> Product image preview</p>
            <p className="text-xs">Paste an image URL above. Paste Unsplash links for best results.</p>
          </div>
        </div>

        <Field label="Description">
          <textarea className="input min-h-32 resize-y" value={form.description} onChange={set('description')} required />
        </Field>

        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-700">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="h-4 w-4 rounded accent-brand-600" />
            Featured on home page
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-700">
            <input type="checkbox" checked={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.checked }))} className="h-4 w-4 rounded accent-emerald-600" />
            Active (visible in store)
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-zinc-100 pt-5">
          <Link to="/admin/products"><Button variant="secondary" type="button">Cancel</Button></Link>
          <Button type="submit" variant="primary" loading={saving} icon={Save}>
            {isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, className = '', children }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
