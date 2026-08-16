import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Truck, ShieldCheck, RotateCcw, CreditCard } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />

      <div className="container-page relative grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-20">
        <div className="animate-fade-up">
          <span className="chip mb-5 bg-white text-brand-700 ring-1 ring-brand-200 shadow-sm">
            <Sparkles size={13} /> New season, now live
          </span>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
            Modern essentials,
            <span className="block bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent">
              elevated for you.
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-600 sm:text-lg">
            Thoughtfully curated premium products — from cutting-edge tech to timeless style. Designed for how you live today.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/shop" className="btn-accent !px-7 !py-3.5 !text-base">
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link to="/shop" className="btn-secondary !px-7 !py-3.5 !text-base">
              Explore Collection
            </Link>
          </div>

          <div className="mt-10 grid max-w-lg grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {[
              { Icon: Truck, label: 'Free shipping', sub: 'Over $100' },
              { Icon: ShieldCheck, label: 'Secure checkout', sub: '2-year warranty' },
              { Icon: RotateCcw, label: 'Easy returns', sub: '30 days' },
              { Icon: CreditCard, label: 'Flexible payment', sub: 'COD & cards' },
            ].map(({ Icon, label, sub }) => (
              <div key={label} className="flex items-start gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm ring-1 ring-zinc-100">
                  <Icon size={17} />
                </span>
                <div>
                  <p className="text-xs font-bold text-zinc-900">{label}</p>
                  <p className="text-[11px] text-zinc-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  const images = [
    { src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', cls: 'h-56 sm:h-72', delay: '0s' },
    { src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', cls: 'h-40 sm:h-52', delay: '.12s' },
    { src: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80', cls: 'h-40 sm:h-52', delay: '.24s' },
    { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80', cls: 'h-48 sm:h-60', delay: '.36s' },
  ];

  return (
    <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: '.15s' }}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4 pt-8">
          {images.slice(0, 2).map((img, i) => (
            <img key={i} src={img.src} alt="Featured product" style={{ animationDelay: img.delay }} className={`${img.cls} w-full rounded-3xl object-cover shadow-lift animate-fade-up`} />
          ))}
        </div>
        <div className="space-y-4 pb-8">
          {images.slice(2).map((img, i) => (
            <img key={i} src={img.src} alt="Featured product" style={{ animationDelay: img.delay }} className={`${img.cls} w-full rounded-3xl object-cover shadow-lift animate-fade-up`} />
          ))}
        </div>
      </div>

      <div className="absolute -left-6 top-10 rounded-2xl bg-white/95 px-4 py-3 shadow-lift ring-1 ring-zinc-100 backdrop-blur animate-scale-in" style={{ animationDelay: '.5s' }}>
        <p className="text-xs text-zinc-500">Deal of the week</p>
        <p className="text-sm font-bold text-zinc-900">Up to 40% off</p>
      </div>
      <div className="absolute -right-4 bottom-14 flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-white shadow-lift animate-scale-in" style={{ animationDelay: '.65s' }}>
        <span className="text-xs font-medium">★★★★★</span>
        <span className="text-xs text-zinc-300">2,000+ reviews</span>
      </div>
    </div>
  );
}
