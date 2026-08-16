import { Link } from 'react-router-dom';
import { ArrowRight, Tag } from 'lucide-react';

const PROMO = {
  image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1600&q=80',
  badge: 'New season drop',
  title: 'The Summer Essentials Edit',
  subtitle: 'Refresh your wardrobe with our hand-picked seasonal collection — up to 30% off selected styles.',
  cta: 'Explore Collection',
};

export default function PromoBanner() {
  return (
    <section className="container-page py-12 lg:py-16">
      <div className="relative overflow-hidden rounded-4xl bg-zinc-900 shadow-lift">
        <img src={PROMO.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/70 to-transparent" />

        <div className="relative max-w-xl px-6 py-16 sm:px-12 lg:py-20">
          <span className="chip mb-5 bg-white/10 text-white ring-1 ring-white/20 backdrop-blur">
            <Tag size={13} /> {PROMO.badge}
          </span>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">{PROMO.title}</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-300 sm:text-base">{PROMO.subtitle}</p>
          <Link to="/shop?deal=1" className="btn-accent mt-8 !px-7 !py-3.5">
            {PROMO.cta} <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
