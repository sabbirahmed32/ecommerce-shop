import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { extractError } from '../api/client';
import { useToastStore } from '../stores/toastStore';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToastStore();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(form, rememberMe);
      toast.success(`Welcome back!`);
      useCartStore.getState().fetchCart().catch(() => {});
      useWishlistStore.getState().fetchWishlist().catch(() => {});
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page flex justify-center py-12 lg:py-20">
      <div className="w-full max-w-md animate-fade-up">
        <div className="card p-8">
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-brand-400" fill="none">
                <path d="M6 16 12 5l6 11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 12.5h6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </span>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-zinc-900">Welcome back</h1>
            <p className="mt-1.5 text-sm text-zinc-500">Sign in to continue shopping with Nova.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  className="input !pl-10"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input !pl-10 !pr-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-zinc-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-brand-600 accent-brand-600"
                />
                Remember me
              </label>
              <Link to="/forgot-password" state={{ from }} className="text-sm font-semibold text-brand-600 hover:text-brand-800">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" loading={submitting}>
              Sign In <ArrowRight size={17} />
            </Button>
          </form>

          <div className="mt-5 rounded-2xl bg-zinc-50 p-4 text-center text-xs text-zinc-500">
            <p className="font-medium text-zinc-700">Demo accounts</p>
            <p className="mt-1">Customer: <button type="button" onClick={() => setForm({ email: 'user@nova.com', password: 'password' })} className="font-semibold text-brand-600 hover:underline">user@nova.com</button></p>
            <p>Admin: <button type="button" onClick={() => setForm({ email: 'admin@nova.com', password: 'password' })} className="font-semibold text-brand-600 hover:underline">admin@nova.com</button> · password: <code className="text-zinc-700">password</code></p>
          </div>

          <p className="mt-6 text-center text-sm text-zinc-500">
            New to Nova?{' '}
            <Link to="/register" state={{ from }} className="font-semibold text-brand-600 hover:text-brand-800">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
