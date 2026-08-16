import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import { authApi } from '../api';
import { extractError } from '../api/client';
import { useToastStore } from '../stores/toastStore';
import Button from '../components/ui/Button';

const MIN_LENGTH = 8;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToastStore();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ password: '', password_confirmation: '' });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('This reset link is invalid or incomplete.');
      return;
    }
    if (form.password.length < MIN_LENGTH) {
      toast.error(`Password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (form.password !== form.password_confirmation) {
      toast.error('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.resetPassword({ ...form, token, email });
      toast.success('Password reset successfully. Please sign in.');
      navigate('/login', { replace: true });
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
              <ShieldCheck size={26} className="text-brand-400" />
            </span>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-zinc-900">Set a new password</h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              {email ? (
                <>Choose a new password for <span className="font-semibold text-zinc-700">{email}</span>.</>
              ) : (
                <>Choose a new password for your account.</>
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label className="label">New password</label>
              <div className="relative">
                <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input !pl-10 !pr-11"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={set('password')}
                  minLength={MIN_LENGTH}
                  autoComplete="new-password"
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
            <div>
              <label className="label">Confirm new password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="Repeat new password"
                value={form.password_confirmation}
                onChange={set('password_confirmation')}
                autoComplete="new-password"
                required
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" loading={submitting}>
              Reset Password <ArrowRight size={17} />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
