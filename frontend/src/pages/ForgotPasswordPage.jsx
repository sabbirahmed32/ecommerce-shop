import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { authApi } from '../api';
import { extractError } from '../api/client';
import { useToastStore } from '../stores/toastStore';
import Button from '../components/ui/Button';

export default function ForgotPasswordPage() {
  const toast = useToastStore();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetUrl, setResetUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await authApi.forgotPassword(email);
      setResetUrl(data?.data?.reset_url || null);
      toast.success(data.message || 'Reset link sent!');
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
              <KeyRound size={26} className="text-brand-400" />
            </span>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-zinc-900">Forgot your password?</h1>
            <p className="mt-1.5 text-sm text-zinc-500">Enter your email and we&apos;ll send you a link to reset it.</p>
          </div>

          {resetUrl ? (
            <div className="mt-7">
              <div className="rounded-2xl bg-green-50 p-4 text-sm text-green-800 ring-1 ring-green-200">
                <p className="flex items-center gap-2 font-semibold text-green-900">
                  <CheckCircle2 size={17} /> Check your inbox
                </p>
                <p className="mt-1.5 leading-relaxed">
                  A password reset link has been sent to <span className="font-semibold">{email}</span>. The link expires in 60 minutes.
                </p>
              </div>

              {resetUrl && (
                <div className="mt-4 rounded-2xl bg-zinc-50 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Demo mode — no mail server configured</p>
                  <a
                    href={resetUrl}
                    className="block break-all rounded-xl bg-white px-4 py-3 text-sm font-medium text-brand-700 ring-1 ring-zinc-200 transition hover:text-brand-900 hover:ring-brand-300"
                  >
                    {resetUrl}
                  </a>
                </div>
              )}

              <Link
                to="/login"
                className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    className="input !pl-10"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full" loading={submitting}>
                Send Reset Link <ArrowRight size={17} />
              </Button>
            </form>
          )}

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
