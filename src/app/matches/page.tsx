'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Mail,
  MessageSquare,
  X,
  RefreshCw,
  User,
  MapPin,
  CheckCircle,
  Filter,
  Sparkles,
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { Match, MatchStatus } from '@/types';

function formatPrice(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(0)} Lakhs`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

type TabType = 'ALL' | 'NEW' | 'HIGH' | 'MEDIUM' | 'DISMISSED';

function MatchesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchIdParam = searchParams.get('matchId');
  const leadIdParam = searchParams.get('leadId');
  const propertyIdParam = searchParams.get('propertyId');

  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [sortBy, setSortBy] = useState<'score' | 'recency'>('score');
  const [highlightedMatchId, setHighlightedMatchId] = useState<string | null>(matchIdParam);

  const scrolledRef = useRef(false);

  const fetchMatches = useCallback(async () => {
    try {
      const data = await apiClient.get<Match[]>(API_ENDPOINTS.MATCHES.LIST);
      setMatches(Array.isArray(data) ? data : []);
    } catch {
      setMatches([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchMatches();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchMatches]);

  useEffect(() => {
    if (matchIdParam) {
      setHighlightedMatchId(matchIdParam);
    }
  }, [matchIdParam]);

  // Auto-scroll to target match card when matches load or URL changes
  useEffect(() => {
    if (!isLoading && matches.length > 0 && !scrolledRef.current) {
      const targetId = matchIdParam || (leadIdParam ? matches.find(m => m.leadId === leadIdParam)?.id : null);
      if (targetId) {
        const el = document.getElementById(`match-${targetId}`);
        if (el) {
          scrolledRef.current = true;
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [isLoading, matches, matchIdParam, leadIdParam]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void fetchMatches();
  };

  const handleClearFilters = () => {
    setHighlightedMatchId(null);
    router.push('/matches');
  };

  const handleUpdateStatus = async (matchId: string, newStatus: MatchStatus) => {
    try {
      await apiClient.patch(API_ENDPOINTS.MATCHES.UPDATE_STATUS(matchId), {
        status: newStatus,
      });
      setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, status: newStatus } : m)));
    } catch {
      // Local optimistic update
      setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, status: newStatus } : m)));
    }
  };

  const handleNotify = (match: Match) => {
    void handleUpdateStatus(match.id, 'NOTIFIED');
    alert(`Alert notification sent to agent for ${match.lead?.name}!`);
  };

  // Filter matching tabs + URL query parameters (if leadId or propertyId is specified)
  const filteredMatches = matches
    .filter((m) => {
      if (leadIdParam && m.leadId !== leadIdParam && m.id !== matchIdParam) return false;
      if (propertyIdParam && m.propertyId !== propertyIdParam && m.id !== matchIdParam) return false;

      if (activeTab === 'NEW') return m.status === 'NEW';
      if (activeTab === 'HIGH') return m.score >= 80;
      if (activeTab === 'MEDIUM') return m.score >= 50 && m.score < 80;
      if (activeTab === 'DISMISSED') return m.status === 'DISMISSED';
      return m.status !== 'DISMISSED';
    })
    .sort((a, b) => {
      // Pin targeted match to the top if highlighted
      if (highlightedMatchId) {
        if (a.id === highlightedMatchId) return -1;
        if (b.id === highlightedMatchId) return 1;
      }
      if (sortBy === 'score') return b.score - a.score;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const newCount = matches.filter((m) => m.status === 'NEW').length;
  const hasActiveUrlFilter = Boolean(matchIdParam || leadIdParam || propertyIdParam);

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Matches & Alerts
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 md:text-sm">
          Monitor system-generated matches between leads and listings.
        </p>
      </div>

      {/* Active Filter Notification Banner */}
      {hasActiveUrlFilter && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>
              {matchIdParam
                ? 'Viewing targeted match alert'
                : leadIdParam
                  ? 'Showing high-compatibility matches for the selected lead'
                  : 'Showing matched buyers for the selected property'}
            </span>
          </div>
          <button
            onClick={handleClearFilters}
            className="flex cursor-pointer items-center gap-1 rounded-lg border border-blue-300 bg-white px-2.5 py-1 text-xs font-bold text-blue-700 shadow-2xs hover:bg-blue-50"
          >
            <X className="h-3.5 w-3.5" />
            <span>Clear Filter (Show All)</span>
          </button>
        </div>
      )}

      {/* Controls & Filter Tabs Bar */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-1 md:flex-row md:items-center">
        {/* Filter Tabs */}
        <div className="hide-scrollbar flex w-full gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`cursor-pointer border-b-2 px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'ALL'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('NEW')}
            className={`cursor-pointer border-b-2 px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'NEW'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            New ({newCount || 0})
          </button>
          <button
            onClick={() => setActiveTab('HIGH')}
            className={`cursor-pointer border-b-2 px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'HIGH'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            High Confidence (&gt;80%)
          </button>
          <button
            onClick={() => setActiveTab('MEDIUM')}
            className={`cursor-pointer border-b-2 px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'MEDIUM'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Medium (50-80%)
          </button>
          <button
            onClick={() => setActiveTab('DISMISSED')}
            className={`cursor-pointer border-b-2 px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'DISMISSED'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Dismissed
          </button>
        </div>

        {/* Right Actions Toolbar */}
        <div className="flex w-full items-center justify-end gap-2.5 md:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'score' | 'recency')}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white py-2 pr-8 pl-3 text-xs font-semibold text-slate-800 outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          >
            <option value="score">Sort by: Score</option>
            <option value="recency">Sort by: Recency</option>
          </select>

          <button
            onClick={handleRefresh}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold whitespace-nowrap text-white shadow-xs transition-colors hover:bg-blue-700"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Match Feed List */}
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl border border-slate-200 bg-white" />
          ))}
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <CheckCircle className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-base font-bold text-slate-900">No matches found</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {hasActiveUrlFilter
              ? 'No matches match your current query filters.'
              : 'There are currently no active matches for the selected tab.'}
          </p>
          {hasActiveUrlFilter && (
            <button
              onClick={handleClearFilters}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Show All Matches</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredMatches.map((match) => {
            const lead = match.lead;
            const prop = match.property;
            const isExplicit = match.isExplicit || (match.breakdown as any)?.isExplicit;
            const isHigh = match.score >= 80;
            const isMedium = match.score >= 50 && match.score < 80;
            const isTargeted = match.id === highlightedMatchId || match.id === matchIdParam;

            const leadInitials = lead?.name
              ? lead.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : 'SJ';

            const propImage =
              prop?.images && prop.images.length > 0
                ? prop.images[0]
                : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={match.id}
                id={`match-${match.id}`}
                className={`rounded-xl border border-l-4 bg-white shadow-xs transition-all hover:shadow-md ${
                  isTargeted
                    ? 'border-blue-600 ring-2 ring-blue-600/30'
                    : isExplicit
                      ? 'border-indigo-200 border-l-indigo-600 bg-indigo-50/10'
                      : isHigh
                        ? 'border-slate-200 border-l-emerald-600'
                        : 'border-slate-200 border-l-amber-500'
                } relative flex flex-col overflow-hidden md:flex-row`}
              >
                {/* Left: Lead Information */}
                <div className="flex flex-1 flex-col justify-center border-slate-100 p-4 md:border-r">
                  <div className="mb-2.5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {leadInitials}
                    </div>
                    <div>
                      <Link href={`/leads/${lead?.id || '1'}`}>
                        <h3 className="text-sm font-bold text-slate-900 hover:text-blue-600">
                          {lead?.name || 'Sarah Jenkins'}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                        <User className="h-3 w-3 text-slate-400" />
                        <span>Hot Lead</span>
                        {isExplicit && (
                          <span className="ml-1 inline-flex items-center gap-1 rounded-sm bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700">
                            <Sparkles className="h-2.5 w-2.5 text-indigo-600" />
                            Direct Inquiry
                          </span>
                        )}
                        {isTargeted && !isExplicit && (
                          <span className="ml-1 rounded-sm bg-blue-100 px-1 py-0.5 text-[9px] font-bold text-blue-700">
                            Target Alert
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-400">Budget:</span>
                      <span className="font-bold text-slate-900">
                        {lead?.budgetMin ? formatPrice(lead.budgetMin) : '₹50L'} -{' '}
                        {lead?.budgetMax ? formatPrice(lead.budgetMax) : '₹75L'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-400">Prefers:</span>
                      <span className="font-semibold text-slate-800">
                        {lead?.preferredLocations?.[0] || 'Downtown'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center: Match Score & Connector */}
                <div className="relative z-10 flex flex-row items-center justify-center gap-1.5 border-y border-slate-100 bg-slate-50/60 px-3 py-4 md:w-36 md:flex-col md:border-y-0">
                  <div className="absolute top-1/2 -z-10 hidden h-[1px] w-full bg-slate-200 md:block" />
                  <div
                    className={`h-14 w-14 rounded-full border-4 ${
                      isExplicit
                        ? 'border-indigo-500 ring-2 ring-indigo-200'
                        : isHigh
                          ? 'border-emerald-500'
                          : isMedium
                            ? 'border-amber-500'
                            : 'border-slate-300'
                    } relative z-20 flex items-center justify-center bg-white shadow-2xs`}
                  >
                    <span
                      className={`text-sm font-bold ${
                        isExplicit
                          ? 'text-indigo-700'
                          : isHigh
                            ? 'text-emerald-700'
                            : isMedium
                              ? 'text-amber-700'
                              : 'text-slate-700'
                      }`}
                    >
                      {match.score}%
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold tracking-wider uppercase ${
                      isExplicit
                        ? 'text-indigo-600'
                        : isHigh
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                    } z-20`}
                  >
                    {isExplicit ? 'Direct' : 'Match'}
                  </span>
                </div>

                {/* Right: Property Details */}
                <div className="flex flex-1 items-center gap-3.5 p-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={propImage}
                      alt={prop?.title || 'Property'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/properties/${prop?.id || '1'}`}>
                      <h3 className="truncate text-sm font-bold text-slate-900 hover:text-blue-600">
                        {prop?.title || 'Sunrise Apartments'}
                      </h3>
                    </Link>
                    <p className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{prop?.location || 'Downtown Core'}</span>
                    </p>
                    <div className="text-lg font-bold text-blue-600">
                      {formatPrice(prop?.price || 6500000)}
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex shrink-0 flex-row items-center justify-end gap-2 border-slate-200 bg-slate-50/80 p-3 md:flex-col md:justify-center md:border-l">
                  <button
                    onClick={() => handleNotify(match)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-blue-700 md:w-full"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Notify</span>
                  </button>
                  <a
                    href={`https://wa.me/${(lead?.phone || '15551234567').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-100 md:w-full"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                  <button
                    onClick={() => void handleUpdateStatus(match.id, 'DISMISSED')}
                    title="Dismiss Match"
                    className="cursor-pointer rounded-full p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MatchesAndAlertsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-md bg-slate-200" />
          <div className="h-32 rounded-xl border border-slate-200 bg-white" />
        </div>
      }
    >
      <MatchesContent />
    </Suspense>
  );
}
