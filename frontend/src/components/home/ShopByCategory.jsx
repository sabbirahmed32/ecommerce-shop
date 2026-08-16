import { Link } from 'react-router-dom';
import { ArrowRight, PackageOpen } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=60';

export default function ShopByCategory({ categories = [], loading }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (!categories.length) return null;

  return (
    <section className="container-page py-12 lg:py-16">
      <div className="mb-8 text-center">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-brand-600">Product categories</p>
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">Browse by Category</h2>
        <p className="mt-3 text-zinc-500">Find exactly what you're looking for across our curated departments.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/shop?category=${cat.slug}`}
            className="group flex items-center gap-4 rounded-3xl border border-zinc-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
          >
            <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
              <img
                src={cat.image || FALLBACK_IMAGE}
                alt={cat.name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-bold text-zinc-900">
                {cat.name}
                <ArrowRight size={15} className="text-brand-600 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </span>
              <span className="mt-1 flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                <PackageOpen size={13} />
                {cat.products_count} {cat.products_count === 1 ? 'product' : 'products'}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
