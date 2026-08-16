import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';

const PROPS = [
  {
    Icon: Truck,
    title: 'Free & Fast Shipping',
    description: 'Free shipping on orders over $100. Delivered in 2–5 business days.',
  },
  {
    Icon: ShieldCheck,
    title: '2-Year Warranty',
    description: 'Every product is covered by our premium protection plan.',
  },
  {
    Icon: RotateCcw,
    title: 'Easy 30-Day Returns',
    description: 'Changed your mind? Return any item within 30 days, no questions asked.',
  },
  {
    Icon: Headphones,
    title: '24/7 Support',
    description: 'Real humans, round the clock. We are here whenever you need us.',
  },
];

export default function ValueProps() {
  return (
    <section className="border-y border-zinc-100 bg-zinc-50/60">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {PROPS.map(({ Icon, title, description }) => (
          <div key={title} className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm ring-1 ring-zinc-100">
              <Icon size={22} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
