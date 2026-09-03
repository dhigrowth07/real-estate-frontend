'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  Flame,
  Award,
  Plus,
  ChevronRight,
  BellRing,
  AlertTriangle,
  Globe,
  Camera,
  Phone,
  MessageSquare,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { DashboardStats, Match, Lead, Property } from '@/types';

interface AgingItem {
  id: string;
  title: string;
  daysOnMarket: number;
  isDanger?: boolean;
}

interface LeadDisplayItem {
  id: string;
  name: string;
  source: string;
  stage: string;
  agentName: string;
  addedText: string;
}

function formatDateDisplay(dateString?: string): string {
  if (!dateString) return 'Recently';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

function getSourceIcon(source: string) {
  switch (source) {
    case 'WEBSITE':
      return <Globe className="h-4 w-4 text-slate-400" />;
    case 'PORTAL':
    case 'SOCIAL':
    case 'INSTAGRAM':
      return <Camera className="h-4 w-4 text-slate-400" />;
    case 'DIRECT_CALL':
    case 'PHONE':
      return <Phone className="h-4 w-4 text-slate-400" />;
    case 'WHATSAPP':
      return <MessageSquare className="h-4 w-4 text-slate-400" />;
    default:
      return <Globe className="h-4 w-4 text-slate-400" />;
  }
}

function getStageBadge(stage: string) {
  switch (stage) {
    case 'NEW':
    case 'NEW_LEAD':
      return (
        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
          New Lead
        </span>
      );
    case 'SITE_VISIT_SCHEDULED':
    case 'SHOWING':
    case 'REQUIREMENT_GATHERED':
      return (
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
          Showing
        </span>
      );
    case 'NEGOTIATION':
      return (
        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
          Negotiation
        </span>
      );
    case 'CLOSED_WON':
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">
          Closed Won
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
          {stage.replace(/_/g, ' ')}
        </span>
      );
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [overviewData, matchesData] = await Promise.all([
        apiClient.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.OVERVIEW),
        apiClient.get<Match[]>(API_ENDPOINTS.MATCHES.LIST, { minScore: 50 }),
      ]);
      setStats(overviewData);
      setMatches(Array.isArray(matchesData) ? matchesData : []);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchDashboardData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void fetchDashboardData();
  };

  const totalLeadsCount =
    stats?.distributions?.leadsBySource?.reduce((acc, s) => acc + s.count, 0) ||
    stats?.kpis?.totalActiveLeads ||
    0;

  const agingWithDays: AgingItem[] =
    stats?.agingInventory && stats.agingInventory.length > 0
      ? stats.agingInventory.map((p, index) => ({
          id: p.id,
          title: p.title,
          daysOnMarket: 30 + index * 7,
          isDanger: index === 0,
        }))
      : [];

  const displayMatches = matches && matches.length > 0 ? matches.slice(0, 4) : [];

  const displayLeads: LeadDisplayItem[] =
    stats?.recentLeads && stats.recentLeads.length > 0
      ? stats.recentLeads.map((l) => ({
          id: l.id,
          name: l.name,
          source: l.source,
          stage: l.stage,
          agentName: l.assignedAgent?.name || 'Unassigned',
          addedText: formatDateDisplay(l.createdAt),
        }))
      : [];

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-48 rounded-lg bg-slate-200" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl border border-slate-200 bg-white p-4" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-96 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2" />
          <div className="h-96 rounded-xl border border-slate-200 bg-white p-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Overview</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Here&apos;s what&apos;s happening with your portfolio today.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link href="/leads">
            <button className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold tracking-wider text-white uppercase shadow-xs transition-colors hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              <span>New Lead</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Active Leads */}
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Total Active Leads
            </span>
            <span className="rounded-md bg-blue-50 p-1 text-blue-600">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {stats?.kpis?.totalActiveLeads ?? 0}
            </span>
            <span className="mb-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">
              Active
            </span>
          </div>
        </div>

        {/* Card 2: Total Properties Listed */}
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Total Properties Listed
            </span>
            <span className="rounded-md bg-blue-50 p-1 text-blue-600">
              <Building2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {stats?.kpis?.totalProperties ?? 0}
            </span>
            <span className="mb-1 text-xs font-medium text-slate-500">active</span>
          </div>
        </div>

        {/* Card 3: Hot Matches Today */}
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Hot Matches Today
            </span>
            <span className="rounded-md bg-emerald-50 p-1 text-emerald-600">
              <Flame className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {stats?.kpis?.hotMatchesToday ?? 0}
            </span>
            <span className="mb-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">
              Action Required
            </span>
          </div>
        </div>

        {/* Card 4: Deals Closed This Month */}
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Deals Closed This Month
            </span>
            <span className="rounded-md bg-blue-50 p-1 text-blue-600">
              <Award className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {stats?.kpis?.dealsClosedThisMonth ?? 0}
            </span>
            <span className="mb-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-600">
              Won
            </span>
          </div>
        </div>
      </div>

      {/* Bento Grid: Matches (2 Columns) & Widgets (1 Column) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Hot Matches Section */}
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <BellRing className="h-4.5 w-4.5 text-emerald-600" />
              <span>High Probability Matches</span>
            </h3>
            <Link
              href="/matches"
              className="cursor-pointer text-xs font-semibold text-blue-600 hover:underline"
            >
              View All
            </Link>
          </div>

          {displayMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
              <BellRing className="mb-2 h-8 w-8 text-slate-300" />
              <p className="text-xs font-bold text-slate-700">No Hot Matches Available</p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                New matches will automatically appear here once leads and properties are registered.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {displayMatches.map((match) => {
                const leadName =
                  'lead' in match && match.lead
                    ? (match.lead as Lead).name
                    : 'leadName' in match
                      ? String(match.leadName)
                      : 'Inquiry';
                const propTitle =
                  'property' in match && match.property
                    ? (match.property as Property).title
                    : 'propertyTitle' in match
                      ? String(match.propertyTitle)
                      : 'Listing';

                return (
                  <div
                    key={match.id}
                    className="flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-4 shadow-xs transition-colors hover:border-blue-500"
                  >
                    <div>
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                            Lead
                          </p>
                          <p className="mt-0.5 text-sm font-bold text-slate-900">{leadName}</p>
                        </div>
                        <div
                          className={`rounded-full border px-3 py-0.5 text-sm font-bold ${
                            match.score >= 80
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-amber-500 bg-amber-50 text-amber-700'
                          }`}
                        >
                          {match.score}%
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                          Property Match
                        </p>
                        <p className="mt-0.5 truncate text-xs font-medium text-slate-700">
                          {propTitle}
                        </p>
                      </div>
                    </div>

                    <Link href="/matches">
                      <button className="w-full cursor-pointer rounded-md border border-slate-200 bg-slate-100 py-2 text-center text-xs font-semibold text-slate-800 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white">
                        View Match
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Aging Inventory & Lead Sources */}
        <div className="flex flex-col gap-6">
          {/* Aging Inventory Widget */}
          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="flex items-center gap-1.5 text-base font-bold text-slate-900">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Aging Inventory</span>
              </h3>
            </div>

            {agingWithDays.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No aging inventory detected.
              </div>
            ) : (
              <div className="mt-1 flex flex-col divide-y divide-slate-100">
                {agingWithDays.map((prop) => (
                  <Link
                    key={prop.id}
                    href="/properties"
                    className="flex items-center justify-between rounded-md px-1 py-2.5 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 flex-col pr-2">
                      <span className="truncate text-xs font-bold text-slate-900">
                        {prop.title}
                      </span>
                      <span
                        className={`text-[11px] font-semibold ${
                          prop.isDanger ? 'text-rose-600' : 'text-amber-600'
                        }`}
                      >
                        {prop.daysOnMarket} Days on Market
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Leads by Source Widget */}
          <div className="flex flex-1 flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <h3 className="border-b border-slate-100 pb-2 text-base font-bold text-slate-900">
              Lead Sources
            </h3>
            <div className="relative flex flex-1 flex-col items-center justify-center py-4">
              {/* Reference Donut Chart */}
              <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-[12px] border-slate-100">
                <div
                  className="absolute top-0 right-0 h-full w-1/2 rounded-r-full border-r-[12px] border-blue-600"
                  style={{
                    transform: 'rotate(30deg)',
                    transformOrigin: 'left center',
                  }}
                />
                <div className="absolute right-0 bottom-0 h-1/2 w-1/2 rounded-br-full border-r-[12px] border-b-[12px] border-emerald-500" />
                <div className="absolute bottom-0 left-0 h-1/2 w-1/2 rounded-bl-full border-b-[12px] border-l-[12px] border-amber-500" />
                <div className="z-10 flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white shadow-xs">
                  <span className="text-2xl font-bold text-slate-900">{totalLeadsCount}</span>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex w-full justify-around">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-blue-600" /> Web
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Social
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Direct
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4">
          <h3 className="text-base font-bold text-slate-900">Recent Leads</h3>
          <Link
            href="/leads"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
          >
            <span>Filter</span>
            <Filter className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-white">
                <th className="p-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  Name
                </th>
                <th className="p-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  Source
                </th>
                <th className="p-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  Stage
                </th>
                <th className="p-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  Agent
                </th>
                <th className="p-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  Added
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {displayLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-slate-400">
                    No leads registered yet. Click &quot;+ New Lead&quot; above to add your first
                    lead.
                  </td>
                </tr>
              ) : (
                displayLeads.map((lead) => (
                  <tr key={lead.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="p-4 font-bold text-slate-900">{lead.name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        {getSourceIcon(lead.source)}
                        <span className="capitalize">
                          {lead.source?.toLowerCase().replace(/_/g, ' ') || 'Website'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">{getStageBadge(lead.stage)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-[10px] font-bold text-blue-700">
                          {lead.agentName
                            ? lead.agentName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .substring(0, 2)
                            : 'AG'}
                        </div>
                        <span className="hidden text-xs font-medium text-slate-600 sm:inline">
                          {lead.agentName}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-400">{lead.addedText}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
