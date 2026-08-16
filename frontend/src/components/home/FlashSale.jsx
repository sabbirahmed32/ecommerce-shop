import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';
import ProductCard from '../product/ProductCard';
import { ProductGridSkeleton } from '../ui/Skeleton';

function useCountdown(targetIso) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!targetIso) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return useMemo(() => {
    if (!targetIso) return { done: true, parts: [0, 0, 0, 0] };
    let diff = Math.max(0, Math.floor((new Date(targetIso).getTime() - now) / 1000));
    const days = Math.floor(diff / 86400);
    diff -= days * 86400;
    const hours = Math.floor(diff / 3600);
    diff -= hours * 3600;
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return { done: days + hours + minutes + seconds <= 0, parts: [days, hours, minutes, seconds] };
  }, [targetIso, now]);
}

export default function FlashSale({ products = [], endsAt, loading }) {
  const { done, parts } = useCountdown(endsAt);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-brand-600 py-12 lg:py-16">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-black/10 blur-3xl" />

      <div className="container-page relative">
        <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-amber-300">
              <Zap size={15} className="fill-amber-300" /> Limited-time flash sale
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Flash Sale — Up to 40% Off</h2>
          </div>

          {!loading && endsAt && !done && (
            <div className="flex items-center gap-2">
              <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-white/80">Ends in</span>
              {[
                { value: parts[0], label: 'Days' },
                { value: parts[1], label: 'Hrs' },
                { value: parts[2], label: 'Min' },
                { value: parts[3], label: 'Sec' },
              ].map((u, i) => (
                <div key={u.label} className="flex items-center gap-2">
                  <div className="flex h-11 min-w-11 flex-col items-center justify-center rounded-xl bg-white/15 px-2 backdrop-blur">
                    <span className="text-lg font-extrabold tabular-nums leading-none text-white">{String(u.value).padStart(2, '0')}</span>
                    <span className="text-[9px] font-semibold uppercase text-white/70">{u.label}</span>
                  </div>
                  {i < 3 && <span className="font-bold text-white/70">:</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/shop?deal=1" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 transition hover:text-white">
            Shop all deals
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
