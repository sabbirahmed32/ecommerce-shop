import { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart, Home, LogOut,
  ChevronDown, ChevronLeft, Menu, X, Users, Ticket, Star,
  CreditCard, BarChart3, Settings, Tag, Plus, CircleDot,
  Truck, PackageCheck, Ban, CheckCircle2, Clock,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';

const NAV_SECTIONS = [
  {
    type: 'link',
    to: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
    end: true,
  },
  {
    type: 'group',
    label: 'Products',
    icon: Package,
    children: [
      { to: '/admin/products', label: 'All Products', icon: Package },
      { to: '/admin/products/new', label: 'Add Product', icon: Plus },
    ],
  },
  {
    type: 'link',
    to: '/admin/categories',
    label: 'Categories',
    icon: FolderTree,
  },
  {
    type: 'link',
    to: '/admin/brands',
    label: 'Brands',
    icon: Tag,
  },
  {
    type: 'group',
    label: 'Orders',
    icon: ShoppingCart,
    children: [
      { to: '/admin/orders', label: 'All Orders', icon: ShoppingCart },
      { to: '/admin/orders?status=pending', label: 'Pending', icon: Clock },
      { to: '/admin/orders?status=processing', label: 'Processing', icon: CircleDot },
      { to: '/admin/orders?status=shipped', label: 'Shipped', icon: Truck },
      { to: '/admin/orders?status=delivered', label: 'Delivered', icon: PackageCheck },
      { to: '/admin/orders?status=cancelled', label: 'Cancelled', icon: Ban },
    ],
  },
  {
    type: 'link',
    to: '/admin/customers',
    label: 'Customers',
    icon: Users,
  },
  {
    type: 'link',
    to: '/admin/coupons',
    label: 'Coupons',
    icon: Ticket,
  },
  {
    type: 'link',
    to: '/admin/reviews',
    label: 'Reviews',
    icon: Star,
  },
  {
    type: 'divider',
  },
  {
    type: 'link',
    to: '/admin/payments',
    label: 'Payments',
    icon: CreditCard,
  },
  {
    type: 'link',
    to: '/admin/reports',
    label: 'Reports',
    icon: BarChart3,
  },
  {
    type: 'link',
    to: '/admin/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('nova-admin-collapsed') === 'true'; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({});

  useEffect(() => {
    try { localStorage.setItem('nova-admin-collapsed', String(collapsed)); } catch {}
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActiveGroup = (children) => {
    return children.some((child) => {
      const basePath = child.to.split('?')[0];
      return location.pathname === basePath || (child.to.includes('?') && location.pathname === '/admin/orders' && location.search.includes(child.to.split('?')[1]));
    });
  };

  const handleLogout = () => {
    logout();
    useCartStore.getState().reset();
    useWishlistStore.getState().reset();
    navigate('/');
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex h-full flex-col">
      <div className={`flex h-16 shrink-0 items-center ${collapsed && !isMobile ? 'justify-center px-2' : 'gap-2.5 px-5'} border-b border-zinc-100`}>
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-400" fill="none">
              <path d="M6 16 12 5l6 11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 12.5h6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </span>
          {(collapsed && !isMobile) ? null : (
            <div>
              <p className="text-sm font-extrabold leading-none tracking-tight">NOVA<span className="text-brand-600">.</span></p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Admin</p>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
        <div className="space-y-0.5">
          {NAV_SECTIONS.map((section, idx) => {
            if (section.type === 'divider') {
              return <div key={`div-${idx}`} className="my-3 border-t border-zinc-100" />;
            }

            if (section.type === 'link') {
              return (
                <NavLink
                  key={section.to}
                  to={section.to}
                  end={section.end}
                  title={collapsed && !isMobile ? section.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl transition ${
                      collapsed && !isMobile ? 'justify-center px-2 py-3' : 'px-3 py-2.5'
                    } text-sm font-semibold ${
                      isActive
                        ? 'bg-zinc-900 text-white shadow-md'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`
                  }
                >
                  <section.icon size={18} />
                  {(collapsed && !isMobile) ? null : <span>{section.label}</span>}
                </NavLink>
              );
            }

            if (section.type === 'group') {
              const open = openGroups[section.label] || isActiveGroup(section.children);
              return (
                <div key={section.label}>
                  <button
                    onClick={() => toggleGroup(section.label)}
                    title={collapsed && !isMobile ? section.label : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 ${
                      collapsed && !isMobile ? 'justify-center px-2 py-3' : 'px-3 py-2.5'
                    }`}
                  >
                    <section.icon size={18} />
                    {(collapsed && !isMobile) ? null : (
                      <>
                        <span className="flex-1 text-left">{section.label}</span>
                        <ChevronDown size={14} className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </button>
                  {open && !(collapsed && !isMobile) && (
                    <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-zinc-100 pl-3">
                      {section.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={({ isActive }) => {
                            const basePath = child.to.split('?')[0];
                            const isActiveExact = location.pathname === basePath && (
                              child.to.includes('?') ? location.search.includes(child.to.split('?')[1]) : true
                            );
                            return `flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition ${
                              isActiveExact || isActive
                                ? 'bg-brand-50 text-brand-700'
                                : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
                            }`;
                          }}
                        >
                          <child.icon size={14} />
                          <span>{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      </nav>

      <div className={`shrink-0 border-t border-zinc-100 ${collapsed && !isMobile ? 'p-2' : 'p-3'}`}>
        {collapsed && !isMobile ? (
          <div className="space-y-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center rounded-xl p-2.5 text-red-500 transition hover:bg-red-50"
              title="Log Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-zinc-900">{user?.name}</p>
                <p className="truncate text-xs text-zinc-500">{user?.email}</p>
              </div>
            </div>
            <Link to="/" className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100">
              <Home size={16} /> Back to Store
            </Link>
            <button onClick={handleLogout} className="mt-0.5 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50">
              <LogOut size={16} /> Log Out
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-zinc-200 bg-white transition-all duration-300 lg:flex ${
          collapsed ? 'w-[68px]' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4">
              <span className="flex h-16 items-center gap-2 text-sm font-bold">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-400" fill="none">
                    <path d="M6 16 12 5l6 11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 12.5h6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                </span>
                NOVA<span className="text-brand-600">.</span> <span className="text-xs font-medium text-zinc-400">Admin</span>
              </span>
              <button onClick={() => setMobileOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-100">
                <X size={20} />
              </button>
            </div>
            <SidebarContent isMobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'lg:ml-[68px]' : 'lg:ml-64'}`}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-zinc-200 bg-white/85 px-4 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 hover:bg-zinc-100 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition hover:bg-zinc-100 lg:flex"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft size={18} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Store live
          </div>
          <Link to="/" className="ml-auto btn-secondary !px-4 !py-2">View Store</Link>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
