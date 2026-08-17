import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react';
import { adminApi } from '../../api';
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
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const mainFileRef = useRef(null);
  const galleryFileRef = useRef(null);
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    brand_id: '',
    brand: '',
    sku: '',
    price: '',
    compare_price: '',
    discount_price: '',
    stock: '10',
    image: '',
    images: [],
    description: '',
    short_description: '',
    specifications: [],
    colors: [],
    sizes: [],
    featured: false,
    status: true,
    slug: '',
    meta_title: '',
    meta_description: '',
  });

  useEffect(() => {
    adminApi.allCategories().then(({ data }) => setCategories(data.data.categories)).catch(() => {});
    adminApi.allBrands().then(({ data }) => setBrands(data.data.brands)).catch(() => {});

    if (isEdit) {
      adminApi
        .product(id)
        .then(({ data }) => {
          const p = data.data.product;
          setForm({
            name: p.name,
            category_id: p.category_id || '',
            brand_id: p.brand_id || '',
            brand: p.brand || '',
            sku: p.sku || '',
            price: p.price ?? '',
            compare_price: p.compare_price ?? '',
            discount_price: p.discount_price ?? '',
            stock: p.stock ?? '',
            image: p.image || '',
            images: Array.isArray(p.images) ? p.images.filter((img) => img !== p.image) : [],
            description: p.description || '',
            short_description: p.short_description || '',
            specifications: Array.isArray(p.specifications) ? p.specifications : [],
            colors: Array.isArray(p.colors) ? p.colors : [],
            sizes: Array.isArray(p.sizes) ? p.sizes : [],
            featured: p.featured ?? false,
            status: p.status ?? true,
            slug: p.slug || '',
            meta_title: p.meta_title || '',
            meta_description: p.meta_description || '',
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

  const uploadFile = async (file, isMain = false) => {
    setUploading(true);
    try {
      const { data } = await adminApi.uploadImage(file);
      const url = data.data.url;
      if (isMain) {
        setForm((f) => ({ ...f, image: url }));
      } else {
        setForm((f) => ({ ...f, images: [...f.images, url] }));
      }
      toast.success('Image uploaded.');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setUploading(false);
    }
  };

  const handleMainFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file, true);
    e.target.value = '';
  };

  const handleGalleryFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => uploadFile(file, false));
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const addListItem = (key) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = e.target.value.trim();
      if (val) {
        setForm((f) => ({ ...f, [key]: [...f[key], val] }));
        e.target.value = '';
      }
    }
  };

  const removeListItem = (key, idx) => {
    setForm((f) => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
        stock: parseInt(form.stock) || 0,
        category_id: parseInt(form.category_id) || null,
        brand_id: form.brand_id ? parseInt(form.brand_id) : null,
      };
      if (isEdit) {
        await adminApi.updateProduct(id, payload);
        toast.success('Product updated.');
      } else {
        await adminApi.createProduct(payload);
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
    return <div className="flex justify-center py-20"><Spinner /></div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/products" className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-800">
            <ArrowLeft size={15} /> Back to products
          </Link>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
        </div>
      </div>

      <form onSubmit={save} className="space-y-6">
        <div className="card space-y-5 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Basic Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product name" className="sm:col-span-2">
              <input className="input" value={form.name} onChange={set('name')} placeholder="Aurora Wireless Headphones" required />
            </Field>
            <Field label="Slug">
              <input className="input" value={form.slug} onChange={set('slug')} placeholder="auto-generated if empty" />
            </Field>
            <Field label="SKU">
              <input className="input" value={form.sku} onChange={set('sku')} placeholder="AUR-HD-001" />
            </Field>
            <Field label="Category">
              <select className="input" value={form.category_id} onChange={set('category_id')} required>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Brand (from database)">
              <select className="input" value={form.brand_id} onChange={set('brand_id')}>
                <option value="">No brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Brand name (text, optional)">
              <input className="input" value={form.brand} onChange={set('brand')} placeholder="Fallback brand name" />
            </Field>
          </div>
          <Field label="Short description">
            <input className="input" value={form.short_description} onChange={set('short_description')} placeholder="Brief product summary" maxLength={500} />
          </Field>
          <Field label="Description">
            <textarea className="input min-h-32 resize-y" value={form.description} onChange={set('description')} required />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="card space-y-5 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Pricing & Stock</h3>
            <Field label="Price ($)">
              <input type="number" step="0.01" min="0" className="input" value={form.price} onChange={set('price')} placeholder="199.99" required />
            </Field>
            <Field label="Compare price ($)">
              <input type="number" step="0.01" min="0" className="input" value={form.compare_price} onChange={set('compare_price')} placeholder="249.99" />
            </Field>
            <Field label="Discount price ($)">
              <input type="number" step="0.01" min="0" className="input" value={form.discount_price} onChange={set('discount_price')} placeholder="179.99" />
            </Field>
            <Field label="Stock">
              <input type="number" min="0" className="input" value={form.stock} onChange={set('stock')} required />
            </Field>
          </div>

          <div className="card space-y-5 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">SEO</h3>
            <Field label="Meta title">
              <input className="input" value={form.meta_title} onChange={set('meta_title')} placeholder="SEO title" maxLength={255} />
            </Field>
            <Field label="Meta description">
              <textarea className="input min-h-20 resize-y" value={form.meta_description} onChange={set('meta_description')} placeholder="SEO description" maxLength={500} />
            </Field>
          </div>
        </div>

        <div className="card space-y-5 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Images</h3>

          {/* Main image upload */}
          <div>
            <label className="label">Main image</label>
            <input ref={mainFileRef} type="file" accept="image/*" className="hidden" onChange={handleMainFileChange} />
            {form.image ? (
              <div className="flex gap-3">
                <div className="relative w-32 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                  <img src={form.image} alt="Main" className="aspect-square w-full object-cover" onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)} />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, image: '' }))}
                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="flex items-center text-xs text-zinc-500"><ImageIcon size={14} className="mr-1" /> Main image preview</p>
                  <Button type="button" variant="secondary" size="sm" icon={Upload} onClick={() => mainFileRef.current?.click()} disabled={uploading}>
                    Replace
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => mainFileRef.current?.click()}
                disabled={uploading}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 text-center transition hover:border-brand-400 hover:bg-brand-50 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 size={24} className="animate-spin text-brand-500" />
                ) : (
                  <Upload size={24} className="text-zinc-400" />
                )}
                <span className="text-sm font-medium text-zinc-600">{uploading ? 'Uploading...' : 'Click to upload main image'}</span>
                <span className="text-xs text-zinc-400">JPG, PNG, GIF, WebP (max 5MB)</span>
              </button>
            )}
          </div>

          {/* Gallery images upload */}
          <div>
            <label className="label">Gallery images</label>
            <input ref={galleryFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryFilesChange} />
            <button
              type="button"
              onClick={() => galleryFileRef.current?.click()}
              disabled={uploading}
              className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 text-center transition hover:border-brand-400 hover:bg-brand-50 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={24} className="animate-spin text-brand-500" />
              ) : (
                <Upload size={24} className="text-zinc-400" />
              )}
              <span className="text-sm font-medium text-zinc-600">{uploading ? 'Uploading...' : 'Click to upload multiple images'}</span>
              <span className="text-xs text-zinc-400">Select one or more files (JPG, PNG, GIF, WebP)</span>
            </button>
            {form.images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.images.map((img, idx) => (
                  <div key={idx} className="group relative">
                    <img src={img} alt={`Gallery ${idx + 1}`} className="h-20 w-20 rounded-lg object-cover" onError={(e) => (e.currentTarget.style.opacity = 0.2)} />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow transition group-hover:opacity-100"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card space-y-5 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Product Variants</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <TagInput label="Colors" items={form.colors} key="colors" onAdd={addListItem('colors')} onRemove={(i) => removeListItem('colors', i)} />
            <TagInput label="Sizes" items={form.sizes} key="sizes" onAdd={addListItem('sizes')} onRemove={(i) => removeListItem('sizes', i)} />
            <TagInput label="Specifications" items={form.specifications} key="specifications" onAdd={addListItem('specifications')} onRemove={(i) => removeListItem('specifications', i)} />
          </div>
        </div>

        <div className="card p-6">
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
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/admin/products"><Button variant="secondary" type="button">Cancel</Button></Link>
          <Button type="submit" variant="primary" loading={saving} icon={Save} disabled={uploading}>
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

function TagInput({ label, items, onAdd, onRemove }) {
  const [value, setValue] = useState('');
  const handleKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) {
        onAdd({ target: { value } });
        setValue('');
      }
    }
  };
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Type + Enter"
      />
      {items.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {items.map((item, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {item}
              <button type="button" onClick={() => onRemove(idx)} className="ml-0.5 text-zinc-400 hover:text-red-500">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
