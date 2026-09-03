'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { AuthSession } from '@/types';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const session = await apiClient.post<AuthSession>(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });
      login(session);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Invalid email or password. Please check your credentials.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo & Header */}
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <Building className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Infragen Real Estate
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">
          Sign in to your Matching CRM workspace
        </p>
      </div>

      <div className="mt-8 px-4 sm:mx-auto sm:w-full sm:max-w-md sm:px-0">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <p className="font-semibold">Sign in failed</p>
                <p className="mt-0.5 text-xs text-rose-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@agency.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10 pl-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-md shadow-blue-500/20"
              isLoading={isLoading}
            >
              Sign In to Workspace
            </Button>
          </form>

          {/* Setup / Help Notice */}
          <div className="mt-6 space-y-2 border-t border-slate-100 pt-5 text-center">
            <p className="text-xs text-slate-500">
              Setting up agency for the first time?{' '}
              <Link
                href="/signup"
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Create Admin Account
              </Link>
            </p>
            <p className="text-[11px] text-slate-400">
              Agents: Onboarding is invite-only. Check your email for an invitation link.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
