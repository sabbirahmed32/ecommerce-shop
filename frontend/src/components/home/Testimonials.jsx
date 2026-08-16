import { Quote } from 'lucide-react';
import RatingStars from '../ui/RatingStars';

const TESTIMONIALS = [
  {
    name: 'Sophia Martinez',
    role: 'Verified Buyer',
    avatar: 'SM',
    initials: 'bg-violet-500',
    text: 'Ordered the wireless headphones and they arrived in two days. The quality is outstanding — easily the best purchase I have made this year.',
    rating: 5,
  },
  {
    name: 'James O\'Connor',
    role: 'Verified Buyer',
    avatar: 'JO',
    initials: 'bg-emerald-500',
    text: 'Beautiful products, honest pricing, and seamless checkout. The leather bag I got feels way more premium than its price.',
    rating: 5,
  },
  {
    name: 'Aisha Rahman',
    role: 'Verified Buyer',
    avatar: 'AR',
    initials: 'bg-rose-500',
    text: 'Customer support helped me exchange sizes in under an hour. This is how online shopping should always feel.',
    rating: 4,
  },
];

export default function Testimonials() {
  return (
    <section className="container-page py-12 lg:py-16">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-brand-600">Testimonials</p>
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">Loved by thousands</h2>
        <p className="mt-3 text-zinc-500">Don't just take our word for it — hear from our happy customers.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="card relative p-6 transition hover:-translate-y-1 hover:shadow-lift">
            <Quote size={34} className="absolute right-6 top-6 text-brand-100" />
            <RatingStars value={t.rating} size={15} />
            <blockquote className="mt-4 text-sm leading-relaxed text-zinc-600">"{t.text}"</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-full ${t.initials} text-xs font-bold text-white`}>
                {t.avatar}
              </span>
              <div>
                <p className="text-sm font-bold text-zinc-900">{t.name}</p>
                <p className="text-xs text-zinc-500">{t.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
