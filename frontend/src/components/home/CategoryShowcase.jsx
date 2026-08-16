import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CategoryShowcase({ categories = [], loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (!categories.length) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          to={`/shop?category=${cat.slug}`}
          className="group relative overflow-hidden rounded-3xl bg-zinc-100 transition-shadow hover:shadow-lift"
        >
          <img
            src={cat.image}
            alt={cat.name}
            loading="lazy"
            className="h-36 w-full object-cover opacity-95 transition duration-500 group-hover:scale-105 group-hover:opacity-100 sm:h-44"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-sm font-bold text-white">{cat.name}</p>
            <p className="mt-0.5 text-xs font-medium text-white/70">
              {cat.products_count} {cat.products_count === 1 ? 'item' : 'items'}
            </p>
          </div>
          <span className="absolute right-3 top-3 flex h-8 w-8 translate-y-1 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowRight size={15} />
          </span>
        </Link>
      ))}
    </div>
  );
}
