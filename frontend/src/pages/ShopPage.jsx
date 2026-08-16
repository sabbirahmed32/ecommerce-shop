import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, Search, PackageOpen } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import { productApi, categoryApi } from '../api';
import { extractError } from '../api/client';
import { useToastStore } from '../stores/toastStore';
import Button from '../components/ui/Button';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Latest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'popularity', label: 'Popular' },
  { value: 'rating', label: 'Best Rated' },
];

const PRICE_RANGES = [
  { value: '', label: 'Any price' },
  { value: '0-50', label: 'Under $50' },
  { value: '50-100', label: '$50 – $100' },
  { value: '100-250', label: '$100 – $250' },
  { value: '250-100000', label: '$250+' },
];

const RATING_OPTIONS = [
  { value: '', label: 'Any rating', stars: 0 },
  { value: '4', label: '4 & up', stars: 4 },
  { value: '3', label: '3 & up', stars: 3 },
  { value: '2', label: '2 & up', stars: 2 },
];

export default function ShopPage() {
  const toast = useToastStore();
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);

  const filters = useMemo(
    () => ({
      search: params.get('search') || '',
      category: params.get('category') || '',
      brand: params.get('brand') || '',
      sort: params.get('sort') || 'newest',
      price_range: params.get('price_range') || '',
      min_rating: params.get('min_rating') || '',
      featured: params.get('featured') === '1',
      in_stock: params.get('in_stock') === '1',
      deal: params.get('deal') === '1',
      page: params.get('page') || '1',
    }),
    [params]
  );

  useEffect(() => {
    categoryApi
      .list()
      .then(({ data }) => setCategories(data.data.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const apiParams = {
      search: filters.search || undefined,
      category: filters.category || undefined,
      brand: filters.brand || undefined,
      sort: filters.sort,
      price_range: filters.price_range || undefined,
      min_rating: filters.min_rating || undefined,
      featured: filters.featured || undefined,
      in_stock: filters.in_stock || undefined,
      page: filters.page,
      per_page: 12,
    };

    if (filters.deal) apiParams.min_price = 0.01;

    productApi
      .list(apiParams)
      .then(({ data }) => {
        if (!active) return;
        setProducts(data.data.products);
        setPagination(data.data.pagination);
        if (data.data.brands?.length) setBrands(data.data.brands);
      })
      .catch((err) => toast.error(extractError(err)))
      .finally(() => active && setLoading(false));

    return () => (active = false);
  }, [filters.search, filters.category, filters.brand, filters.sort, filters.price_range, filters.min_rating, filters.featured, filters.in_stock, filters.deal, filters.page]);

  const updateFilter = useCallback(
    (key, value) => {
      const next = new URLSearchParams(params);
      if (!value || value === '') next.delete(key);
      else next.set(key, value);
      if (key !== 'page') next.delete('page');
      setParams(next, { replace: false });
    },
    [params, setParams]
  );

  const toggleFilter = useCallback(
    (key) => updateFilter(key, filters[key] ? '' : '1'),
    [updateFilter, filters]
  );

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (filters.search) next.set('search', filters.search);
    setParams(next);
  };

  const hasActiveFilters = filters.category || filters.brand || filters.price_range || filters.min_rating || filters.featured || filters.in_stock || filters.deal || filters.search;

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="mb-8">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-brand-600">Our collection</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
          {filters.deal ? 'Hot Deals' : filters.search ? `Results for "${filters.search}"` : 'Shop All Products'}
        </h1>
        <p className="mt-2 text-zinc-500">
          {loading ? 'Loading products…' : `${pagination?.total ?? 0} ${pagination?.total === 1 ? 'product' : 'products'} found`}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = new FormData(e.currentTarget).get('search')?.toString().trim() || '';
            updateFilter('search', q);
          }}
          className="relative mt-5 max-w-md"
        >
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            name="search"
            type="search"
            key={filters.search}
            defaultValue={filters.search}
            placeholder="Search products…"
            className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </form>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="hidden w-64 shrink-0 lg:block">
          <FilterPanel filters={filters} categories={categories} brands={brands} updateFilter={updateFilter} toggleFilter={toggleFilter} clearFilters={clearFilters} hasActiveFilters={hasActiveFilters} />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between gap-3">
            <button onClick={() => setMobileFilters(true)} className="btn-secondary lg:hidden">
              <SlidersHorizontal size={16} /> Filters
            </button>

            <div className="relative ml-auto">
              <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="appearance-none rounded-full border border-zinc-200 bg-white py-2.5 pl-4 pr-9 text-sm font-medium text-zinc-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <EmptyState
              icon={PackageOpen}
              title="No products found"
              description="Try adjusting your filters or search terms to find what you're looking for."
              action={
                <Button variant="primary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {pagination && (
                <Pagination
                  page={pagination.current_page}
                  lastPage={pagination.last_page}
                  onChange={(page) => updateFilter('page', String(page))}
                  className="mt-10"
                />
              )}
            </>
          )}
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm" onClick={() => setMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 animate-fade-up">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Filters</h3>
              <button onClick={() => setMobileFilters(false)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-zinc-100" aria-label="Close filters">
                <X size={18} />
              </button>
            </div>
            <FilterPanel filters={filters} categories={categories} brands={brands} updateFilter={updateFilter} toggleFilter={toggleFilter} clearFilters={clearFilters} hasActiveFilters={hasActiveFilters} />
            <Button variant="primary" className="mt-5 w-full" onClick={() => setMobileFilters(false)}>
              Show Results
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel({ filters, categories, brands, updateFilter, toggleFilter, clearFilters, hasActiveFilters }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Filters</h3>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs font-semibold text-brand-600 hover:text-brand-800">
            Clear all
          </button>
        )}
      </div>

      <div>
        <FilterTitle>Categories</FilterTitle>
        <div className="mt-2.5 space-y-1">
          <FilterRadio active={!filters.category} onClick={() => updateFilter('category', '')}>
            All categories
          </FilterRadio>
          {categories.map((cat) => (
            <FilterRadio key={cat.id} active={filters.category === cat.slug} onClick={() => updateFilter('category', cat.slug)}>
              {cat.name}
              <span className="ml-auto text-xs text-zinc-400">{cat.products_count}</span>
            </FilterRadio>
          ))}
        </div>
      </div>

      <div>
        <FilterTitle>Brand</FilterTitle>
        <div className="mt-2.5 max-h-56 space-y-1 overflow-y-auto pr-1">
          <FilterRadio active={!filters.brand} onClick={() => updateFilter('brand', '')}>
            All brands
          </FilterRadio>
          {brands.map((brand) => (
            <FilterRadio key={brand.name} active={filters.brand === brand.name} onClick={() => updateFilter('brand', brand.name)}>
              {brand.name}
              <span className="ml-auto text-xs text-zinc-400">{brand.count}</span>
            </FilterRadio>
          ))}
        </div>
      </div>

      <div>
        <FilterTitle>Price</FilterTitle>
        <div className="mt-2.5 space-y-1">
          {PRICE_RANGES.map((range) => (
            <FilterRadio key={range.value} active={filters.price_range === range.value} onClick={() => updateFilter('price_range', range.value)}>
              {range.label}
            </FilterRadio>
          ))}
        </div>
      </div>

      <div>
        <FilterTitle>Rating</FilterTitle>
        <div className="mt-2.5 space-y-1">
          {RATING_OPTIONS.map((opt) => (
            <FilterRadio key={opt.value || 'any'} active={filters.min_rating === opt.value} onClick={() => updateFilter('min_rating', opt.value)}>
              {opt.stars > 0 ? <StarRow stars={opt.stars} /> : <span className="text-zinc-600">{opt.label}</span>}
            </FilterRadio>
          ))}
        </div>
      </div>

      <div>
        <FilterTitle>Availability</FilterTitle>
        <div className="mt-2.5 space-y-2">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-700">
            <input type="checkbox" checked={filters.in_stock} onChange={() => toggleFilter('in_stock')} className="h-4 w-4 rounded accent-brand-600" />
            In stock only
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-700">
            <input type="checkbox" checked={filters.featured} onChange={() => toggleFilter('featured')} className="h-4 w-4 rounded accent-brand-600" />
            Featured products
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-700">
            <input type="checkbox" checked={filters.deal} onChange={() => toggleFilter('deal')} className="h-4 w-4 rounded accent-brand-600" />
            On sale
          </label>
        </div>
      </div>
    </div>
  );
}

function StarRow({ stars }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} viewBox="0 0 20 20" className={`h-3.5 w-3.5 ${s <= stars ? 'text-amber-400' : 'text-zinc-300'}`} fill="currentColor">
          <path d="M10 1.5 12.6 6.7l5.6.8-4 4 1 5.6-5-2.6-5 2.6 1-5.6-4-4 5.6-.8L10 1.5Z" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-medium text-zinc-600">{stars}★ & up</span>
    </span>
  );
}

function FilterTitle({ children }) {
  return <h4 className="text-sm font-bold text-zinc-900">{children}</h4>;
}

function FilterRadio({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${
        active ? 'bg-brand-50 font-semibold text-brand-700' : 'text-zinc-600 hover:bg-zinc-50'
      }`}
    >
      {active && <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />}
      <span className="flex flex-1 items-center gap-2">{children}</span>
    </button>
  );
}
