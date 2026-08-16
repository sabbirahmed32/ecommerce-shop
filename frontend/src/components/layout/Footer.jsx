import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Facebook, Youtube, Mail, Send, MapPin, Phone } from 'lucide-react';

const SHOP_LINKS = [
  { label: 'All Products', to: '/shop' },
  { label: 'New Arrivals', to: '/shop?sort=newest' },
  { label: 'Best Sellers', to: '/shop?sort=popularity' },
  { label: 'On Sale', to: '/shop?deal=1' },
];

const CATEGORY_LINKS = [
  { label: 'Electronics', to: '/shop?category=electronics' },
  { label: 'Fashion', to: '/shop?category=fashion' },
  { label: 'Footwear', to: '/shop?category=footwear' },
  { label: 'Accessories', to: '/shop?category=accessories' },
  { label: 'Home & Living', to: '/shop?category=home-living' },
];

const HELP_LINKS = [
  { label: 'Track Order', to: '/account?tab=orders' },
  { label: 'Shipping Info', to: '/account' },
  { label: 'Returns & Refunds', to: '/account' },
  { label: 'Contact Us', to: '/account' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3500);
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400">
      <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
        <div className="sm:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-400" fill="none">
                <path d="M6 16 12 5l6 11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 12.5h6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-xl font-extrabold tracking-tight text-white">
              NOVA<span className="text-brand-500">.</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Premium products, thoughtfully curated. Nova brings you carefully selected goods that blend modern design with everyday practicality.
          </p>
          <div className="mt-5 space-y-2 text-sm">
            <p className="flex items-center gap-2.5"><MapPin size={15} className="text-brand-500" /> 123 Commerce Avenue, New York, NY</p>
            <p className="flex items-center gap-2.5"><Phone size={15} className="text-brand-500" /> +1 (555) 010-0100</p>
            <p className="flex items-center gap-2.5"><Mail size={15} className="text-brand-500" /> hello@nova.store</p>
          </div>
          <div className="mt-6 flex gap-2.5">
            {[Twitter, Instagram, Facebook, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-zinc-400 transition hover:bg-brand-600 hover:text-white"
                aria-label="Social link"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>

        <FooterCol title="Shop">
          {SHOP_LINKS.map((l) => (
            <FooterLink key={l.label} {...l} />
          ))}
        </FooterCol>

        <FooterCol title="Categories">
          {CATEGORY_LINKS.map((l) => (
            <FooterLink key={l.label} {...l} />
          ))}
        </FooterCol>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Stay in the loop</h4>
          <p className="mb-4 text-sm">Join our newsletter for new arrivals, exclusive deals & 10% off your first order.</p>
          {subscribed ? (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
              <Send size={16} /> You're subscribed! Welcome aboard.
            </div>
          ) : (
            <form onSubmit={subscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
              <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-500" aria-label="Subscribe">
                <Send size={17} />
              </button>
            </form>
          )}
          <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
            <span className="flex h-5 w-8 items-center justify-center rounded bg-white/10 font-bold">VISA</span>
            <span className="flex h-5 w-8 items-center justify-center rounded bg-white/10 font-bold">MC</span>
            <span className="flex h-5 w-8 items-center justify-center rounded bg-white/10 font-bold">AMEX</span>
            <span className="flex h-5 w-8 items-center justify-center rounded bg-white/10 font-bold">PYPL</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-zinc-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Nova Store. All rights reserved.</p>
          <div className="flex gap-5">
            {['Privacy Policy', 'Terms of Service', 'Cookies'].map((t) => (
              <a key={t} href="#" onClick={(e) => e.preventDefault()} className="transition hover:text-zinc-200">
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">{title}</h4>
      <ul className="space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ label, to }) {
  return (
    <li>
      <Link to={to} className="transition hover:text-white">
        {label}
      </Link>
    </li>
  );
}
