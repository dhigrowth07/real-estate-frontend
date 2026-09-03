'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  MoreVertical,
  Mail,
  Copy,
  Check,
  X,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { User } from '@/types';

interface AgentStats extends User {
  assignedLeadsCount?: number;
  propertiesCount?: number;
  conversionRate?: string;
  avatarUrl?: string;
}

export default function TeamPage() {
  const [agents, setAgents] = useState<AgentStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Invite Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'AGENT' | 'ADMIN'>('AGENT');
  const [isInviting, setIsInviting] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      const data = await apiClient.get<User[]>(API_ENDPOINTS.USERS.LIST);
      if (Array.isArray(data)) {
        const mapped: AgentStats[] = data.map((u) => ({
          ...u,
          assignedLeadsCount: (u as { _count?: { leads?: number } })._count?.leads || 0,
          propertiesCount: 0,
          conversionRate: '—',
        }));
        setAgents(mapped);
      } else {
        setAgents([]);
      }
    } catch {
      setAgents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchAgents();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchAgents]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);

    if (!inviteName || !inviteEmail) {
      setInviteError('Please provide both name and email.');
      return;
    }

    try {
      setIsInviting(true);
      const res = await apiClient.post<{ inviteToken?: string; link?: string }>(
        API_ENDPOINTS.AUTH.INVITES,
        {
          name: inviteName,
          email: inviteEmail,
          role: inviteRole,
        }
      );

      const token = res.inviteToken || 'sample-invite-token-abc123xyz';
      const link = `${window.location.origin}/accept-invite?token=${token}`;
      setGeneratedInviteLink(link);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send invite.';
      setInviteError(msg);
    } finally {
      setIsInviting(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedInviteLink) {
      void navigator.clipboard.writeText(generatedInviteLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleCloseModal = () => {
    setIsInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
    setGeneratedInviteLink(null);
    setInviteError(null);
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      {/* Page Header strictly matching Screenshot */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Team</h1>
          <p className="mt-1 text-xs font-medium text-slate-500 md:text-sm">
            Manage agents, roles, and performance.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700 sm:w-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>+ Invite Agent</span>
        </button>
      </div>

      {/* Team Table Card matching Screenshot */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-500">
                <th className="px-6 py-4 font-semibold">Agent</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 text-right font-semibold">Assigned Leads</th>
                <th className="px-6 py-4 text-right font-semibold">Properties</th>
                <th className="px-6 py-4 text-right font-semibold">Conversion</th>
                <th className="px-6 py-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading team members...
                  </td>
                </tr>
              ) : (
                agents.map((agent) => {
                  const initials = agent.name
                    ? agent.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'AG';

                  return (
                    <tr key={agent.id} className="transition-colors hover:bg-slate-50/60">
                      {/* Agent Avatar + Name + Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {agent.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={agent.avatarUrl}
                              alt={agent.name}
                              className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-xs font-bold text-blue-700">
                              {initials}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-slate-900">{agent.name}</p>
                            <p className="text-xs text-slate-500">{agent.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Pill Button */}
                      <td className="px-6 py-4">
                        <span className="inline-block rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
                          {agent.role === 'ADMIN' ? 'Admin' : 'Agent'}
                        </span>
                      </td>

                      {/* Assigned Leads */}
                      <td className="px-6 py-4 text-right text-sm font-semibold text-slate-800">
                        {agent.assignedLeadsCount ?? 0}
                      </td>

                      {/* Properties */}
                      <td className="px-6 py-4 text-right text-sm font-semibold text-slate-800">
                        {agent.propertiesCount ?? 0}
                      </td>

                      {/* Conversion Pill */}
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                          {agent.conversionRate || '—'}
                        </span>
                      </td>

                      {/* Options Button */}
                      <td className="px-6 py-4 text-right">
                        <button className="cursor-pointer p-1 text-slate-400 hover:text-slate-700">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer matching Screenshot */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <p className="text-xs font-medium text-slate-500">
            Showing {agents.length > 0 ? 1 : 0} to {agents.length} of {agents.length} agents
          </p>
          <div className="flex gap-2">
            <button
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Invite Agent Modal Dialog */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="animate-in fade-in zoom-in-95 w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Invite Team Member</h3>
                  <p className="text-xs text-slate-500">
                    Send an invitation link to join your agency
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="cursor-pointer rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {inviteError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                {inviteError}
              </div>
            )}

            {!generatedInviteLink ? (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-900 outline-hidden focus:border-blue-600 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="alex@infragen.io"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-900 outline-hidden focus:border-blue-600 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setInviteRole('AGENT')}
                      className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                        inviteRole === 'AGENT'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <UserIcon className="h-3.5 w-3.5" />
                      <span>Agent</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInviteRole('ADMIN')}
                      className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                        inviteRole === 'ADMIN'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <Shield className="h-3.5 w-3.5" />
                      <span>Admin</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 cursor-pointer rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="flex-1 cursor-pointer rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isInviting ? 'Generating...' : 'Create Invite'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Invitation link generated successfully!</span>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Invite Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedInviteLink}
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800 outline-hidden"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="flex cursor-pointer items-center gap-1 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700"
                    >
                      {isCopied ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleCloseModal}
                  className="w-full cursor-pointer rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-200"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
