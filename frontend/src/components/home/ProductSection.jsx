import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../product/ProductCard';
import { ProductGridSkeleton } from '../ui/Skeleton';

export default function ProductSection({ title, subtitle, products, loading, linkTo, linkLabel = 'View all', accent = false }) {
  return (
    <section className="container-page py-12 lg:py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          {subtitle && <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-brand-600">{subtitle}</p>}
          <h2 className={`text-2xl font-extrabold tracking-tight sm:text-3xl ${accent ? 'text-white' : 'text-zinc-900'}`}>{title}</h2>
        </div>
        {linkTo && (
          <Link
            to={linkTo}
            className={`group inline-flex items-center gap-1.5 text-sm font-semibold transition ${
              accent ? 'text-brand-300 hover:text-white' : 'text-brand-600 hover:text-brand-800'
            }`}
          >
            {linkLabel}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
