'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building, Lock, User, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { AuthSession } from '@/types';

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing or invalid invitation token in URL.');
      return;
    }

    if (!name || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      const session = await apiClient.post<AuthSession>(API_ENDPOINTS.AUTH.ACCEPT_INVITE, {
        token,
        name,
        password,
      });
      login(session);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed to activate agent account. The invitation link may have expired or already been used.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <Building className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Join Real Estate Team
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">
          Accept your agent invitation and setup your CRM account
        </p>
      </div>

      <div className="mt-8 px-4 sm:mx-auto sm:w-full sm:max-w-md sm:px-0">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs leading-relaxed text-emerald-900">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold">Agent Onboarding</p>
              <p className="mt-0.5 text-emerald-800">
                You have been invited to join the Infragen matching workspace. Set your name and
                secure password below.
              </p>
            </div>
          </div>

          {!token && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p>
                No invite token found in the URL. Please click the full invitation link provided in
                your invite email.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <p className="font-semibold">Activation error</p>
                <p className="mt-0.5 text-xs text-rose-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                Your Full Name
              </label>
              <div className="relative">
                <User className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Agent"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                Create Password
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="mt-2 w-full font-bold shadow-md shadow-blue-500/20"
              isLoading={isLoading}
              disabled={!token}
            >
              Activate Account & Sign In
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-xs text-slate-500">
              Already activated?{' '}
              <Link
                href="/login"
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Sign In Instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={<div className="p-12 text-center text-slate-500">Loading invite form...</div>}
    >
      <AcceptInviteForm />
    </Suspense>
  );
}
