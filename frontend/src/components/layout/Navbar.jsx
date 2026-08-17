import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  User,
  ChevronDown,
  ArrowUpRight,
  Package,
  LayoutDashboard,
  LogOut,
  Star,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { categoryApi } from '../../api';
import CartDrawer from './CartDrawer';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Deals', to: '/shop?deal=1' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [userMenu, setUserMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const userMenuRef = useRef(null);
  const categoriesRef = useRef(null);

  const cartCount = useCartStore((s) => s.count);
  const wishlistCount = useWishlistStore((s) => s.ids.size);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    categoryApi
      .list()
      .then(({ data }) => setCategories(data.data.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenu(false);
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) setCategoriesOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    navigate(q ? `/shop?search=${encodeURIComponent(q)}` : '/shop');
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    logout();
    useCartStore.getState().reset();
    useWishlistStore.getState().reset();
    setUserMenu(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
    }`;

  const iconButton =
    'relative flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900';

  const badge =
    'absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white ring-2 ring-white';

  return (
    <>
      <div className="bg-zinc-900 text-white">
        <div className="container-page flex items-center justify-center gap-6 py-2 text-xs font-medium">
          <span className="hidden items-center gap-1.5 sm:flex">
            <Truck size={13} /> Free shipping over $100
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={13} /> 30-day money-back guarantee
          </span>
          <span className="hidden items-center gap-1.5 md:flex">
            <Star size={13} /> Rated 4.8/5 by 2,000+ customers
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center gap-4 lg:h-20 lg:py-0">
          <button className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>

          <Link to="/" className="flex items-center gap-2" aria-label="Nova home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-400" fill="none">
                <path d="M6 16 12 5l6 11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 12.5h6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-xl font-extrabold tracking-tight text-zinc-900">
              NOVA
              <span className="text-brand-600">.</span>
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) =>
              link.label === 'Deals' ? (
                <Link key={link.label} to={link.to} className="rounded-full px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 hover:text-red-600">
                  {link.label}
                </Link>
              ) : (
                <NavLink key={link.label} to={link.to} className={navLinkClass} end={link.to === '/'}>
                  {link.label}
                </NavLink>
              )
            )}

            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => setCategoriesOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                  categoriesOpen ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
                aria-haspopup="menu"
                aria-expanded={categoriesOpen}
              >
                Categories <ChevronDown size={14} className={`transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoriesOpen && (
                <div className="absolute left-0 top-12 w-[420px] rounded-3xl bg-white p-3 shadow-lift ring-1 ring-zinc-200 animate-scale-in">
                  <div className="grid grid-cols-2 gap-1">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/shop?category=${cat.slug}`}
                        onClick={() => setCategoriesOpen(false)}
                        className="group flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-zinc-50"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100">
                          <img src={cat.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-zinc-800 group-hover:text-brand-700">{cat.name}</span>
                          <span className="text-xs text-zinc-400">{cat.products_count} items</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    to="/shop"
                    onClick={() => setCategoriesOpen(false)}
                    className="mt-2 flex items-center justify-center gap-1.5 rounded-2xl bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                  >
                    View All Products <ArrowUpRight size={15} />
                  </Link>
                </div>
              )}
            </div>
          </nav>

          <form onSubmit={onSearch} className="mx-auto hidden max-w-md flex-1 md:block">
            <div className="relative">
              <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Link to="/wishlist" className={iconButton} aria-label="Wishlist">
              <Heart size={21} />
              {wishlistCount > 0 && <span className={badge}>{wishlistCount}</span>}
            </Link>

            <button onClick={() => setCartOpen(true)} className={iconButton} aria-label="Cart">
              <ShoppingBag size={21} />
              {cartCount > 0 && <span className={badge}>{cartCount}</span>}
            </button>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenu((v) => !v)}
                  className="ml-1 flex h-10 items-center gap-2 rounded-full pl-1 pr-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden max-w-[90px] truncate lg:block">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={14} className="hidden text-zinc-400 lg:block" />
                </button>

                {userMenu && (
                  <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-zinc-200 animate-scale-in">
                    <div className="border-b border-zinc-100 px-4 py-3">
                      <p className="text-sm font-bold text-zinc-900">{user.name}</p>
                      <p className="truncate text-xs text-zinc-500">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      <MenuItem to="/account" icon={<User size={16} />} onClick={() => setUserMenu(false)}>
                        My Account
                      </MenuItem>
                      <MenuItem to="/orders" icon={<Package size={16} />} onClick={() => setUserMenu(false)}>
                        My Orders
                      </MenuItem>
                      {user.is_admin && (
                        <MenuItem to="/admin" icon={<LayoutDashboard size={16} />} onClick={() => setUserMenu(false)}>
                          Admin Dashboard
                        </MenuItem>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut size={16} /> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-1 flex items-center gap-1">
                <Link to="/login" className="btn-ghost hidden sm:inline-flex">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary !px-4 !py-2">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-80 max-w-[85%] flex-col bg-white shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between border-b border-zinc-100 p-4">
              <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-400" fill="none">
                    <path d="M6 16 12 5l6 11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 12.5h6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="text-xl font-extrabold tracking-tight">
                  NOVA<span className="text-brand-600">.</span>
                </span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-100" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <form onSubmit={onSearch} className="relative">
                <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none"
                />
              </form>
            </div>

            <nav className="flex flex-col gap-1 p-4 pt-0">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    link.label === 'Deals' ? 'text-red-500' : 'text-zinc-800 hover:bg-zinc-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {categories.length > 0 && (
              <div className="border-t border-zinc-100 p-4">
                <p className="mb-2 flex items-center gap-1.5 px-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <ChevronDown size={13} /> Categories
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/shop?category=${cat.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto border-t border-zinc-100 p-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{user.name}</p>
                    <p className="truncate text-xs text-zinc-500">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

function MenuItem({ to, icon, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
    >
      {icon} {children}
    </Link>
  );
}
