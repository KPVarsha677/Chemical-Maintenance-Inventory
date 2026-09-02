import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  FlaskConicalIcon,
  Loader2Icon } from
'lucide-react';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Field, TextInput } from '../components/ui/FormField';
import { useAuth } from '../contexts/AuthContext';

type Mode = 'sign-in' | 'sign-up';

export function Login() {
  const { user, loading, authConfigured, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<Mode>('sign-in');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmationNotice, setConfirmationNotice] = useState(false);

  const from = (location.state as {from?: {pathname: string;};} | null)?.from?.pathname || '/dashboard';

  // Already signed in — no reason to show the login form.
  if (!loading && user) {
    return <Navigate to={from} replace />;
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError('');
    setConfirmationNotice(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setConfirmationNotice(false);

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    if (mode === 'sign-up' && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    if (mode === 'sign-in') {
      const result = await signIn(email.trim(), password);
      setSubmitting(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      navigate(from, { replace: true });
    } else {
      const result = await signUp(email.trim(), password, fullName.trim() || undefined);
      setSubmitting(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.needsEmailConfirmation) {
        setConfirmationNotice(true);
      } else {
        navigate(from, { replace: true });
      }
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-600">
            <FlaskConicalIcon className="h-4.5 w-4.5 text-white" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-navy-900">Reagentia</span>
        </Link>

        <Panel>
          <div className="p-6">
            <div
              className="mb-6 inline-flex w-full rounded-md border border-slate-300 bg-slate-50 p-0.5"
              role="tablist"
              aria-label="Sign in or create an account">

              <button
                type="button"
                role="tab"
                aria-selected={mode === 'sign-in'}
                onClick={() => switchMode('sign-in')}
                className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors duration-150 ease-out ${
                mode === 'sign-in' ?
                'bg-white text-navy-900 shadow-card' :
                'text-slate-500 hover:text-navy-800'}`
                }>

                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'sign-up'}
                onClick={() => switchMode('sign-up')}
                className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors duration-150 ease-out ${
                mode === 'sign-up' ?
                'bg-white text-navy-900 shadow-card' :
                'text-slate-500 hover:text-navy-800'}`
                }>

                Create account
              </button>
            </div>

            <h1 className="text-lg font-semibold tracking-tight text-navy-900">
              {mode === 'sign-in' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {mode === 'sign-in' ?
              'Sign in to access the chemical register.' :
              'Set up access to the chemical register.'}
            </p>

            {!authConfigured &&
            <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                <AlertCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Supabase credentials aren't configured yet (frontend_new/.env). Sign in and sign up
                won't work until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
              </div>
            }

            <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
              {mode === 'sign-up' &&
              <Field label="Full name" htmlFor="fullName" hint="Shown as who's logged usage in the register.">
                  <TextInput
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Elena Vasquez"
                  autoComplete="name" />

                </Field>
              }

              <Field label="Email" htmlFor="email" required>
                <TextInput
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@lab.com"
                  autoComplete="email"
                  required />

              </Field>

              <Field label="Password" htmlFor="password" required>
                <div className="relative">
                  <TextInput
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'sign-up' ? 'At least 6 characters' : '••••••••'}
                    autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                    className="pr-9"
                    required />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400 transition-colors duration-150 ease-out hover:text-navy-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>

                    {showPassword ?
                    <EyeOffIcon className="h-4 w-4" aria-hidden="true" /> :

                    <EyeIcon className="h-4 w-4" aria-hidden="true" />
                    }
                  </button>
                </div>
              </Field>

              {mode === 'sign-up' &&
              <Field label="Confirm password" htmlFor="confirmPassword" required>
                  <TextInput
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required />

                </Field>
              }

              {error &&
              <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
                  <AlertCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {error}
                </div>
              }

              {confirmationNotice &&
              <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800">
                  <CheckCircle2Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  Account created. Check {email} for a confirmation link, then sign in.
                </div>
              }

              <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
                {submitting &&
                <Loader2Icon className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                }
                {submitting ?
                mode === 'sign-in' ? 'Signing in…' : 'Creating account…' :
                mode === 'sign-in' ? 'Sign in' : 'Create account'}
              </Button>
            </form>
          </div>
        </Panel>

        <p className="mt-6 text-center text-xs text-slate-400">
          <Link to="/" className="hover:text-slate-600">← Back to Reagentia</Link>
        </p>
      </div>
    </div>);

}
