import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, Phone, MapPin, Building2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { extractError } from '../api/client';
import { useToastStore } from '../stores/toastStore';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import Button from '../components/ui/Button';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToastStore();
  const register = useAuthStore((s) => s.register);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    address: '',
    city: '',
  });

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      toast.error('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to Nova.');
      useCartStore.getState().fetchCart().catch(() => {});
      useWishlistStore.getState().fetchWishlist().catch(() => {});
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="container-page flex justify-center py-12 lg:py-16">
      <div className="w-full max-w-lg animate-fade-up">
        <div className="card p-8">
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-brand-400" fill="none">
                <path d="M6 16 12 5l6 11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 12.5h6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </span>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-zinc-900">Create your account</h1>
            <p className="mt-1.5 text-sm text-zinc-500">Join Nova and get 10% off your first order.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label className="label">Full name</label>
              <div className="relative">
                <UserIcon size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input className="input !pl-10" placeholder="John Doe" value={form.name} onChange={set('name')} required />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input type="email" className="input !pl-10" placeholder="you@email.com" value={form.email} onChange={set('email')} required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input !pl-10 !pr-11"
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={set('password')}
                    minLength={8}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600" aria-label="Toggle password visibility">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Confirm password</label>
                <input type={showPassword ? 'text' : 'password'} className="input" placeholder="Repeat password" value={form.password_confirmation} onChange={set('password_confirmation')} required />
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Contact details (optional)</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative">
                  <Phone size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input className="input !pl-9" placeholder="Phone" value={form.phone} onChange={set('phone')} />
                </div>
                <div className="relative">
                  <Building2 size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input className="input !pl-9" placeholder="City" value={form.city} onChange={set('city')} />
                </div>
                <div className="relative sm:col-span-2">
                  <MapPin size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input className="input !pl-9" placeholder="Street address" value={form.address} onChange={set('address')} />
                </div>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" loading={submitting}>
              Create Account <ArrowRight size={17} />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" state={{ from }} className="font-semibold text-brand-600 hover:text-brand-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
