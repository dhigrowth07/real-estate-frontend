'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  Flame,
  Award,
  Plus,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/StatusPill';
import { MatchScoreBadge } from '@/components/ui/MatchScoreBadge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { DashboardStats, Match, Lead, Property } from '@/types';

const SOURCE_COLORS: Record<string, string> = {
  WEBSITE: '#2563EB',
  PORTAL: '#3B82F6',
  REFERRAL: '#10B981',
  DIRECT_CALL: '#F59E0B',
  WALK_IN: '#8B5CF6',
  OTHER: '#94A3B8',
};

function getDaysOnMarket(createdAtString: string): number {
  try {
    const createdTime = new Date(createdAtString).getTime();
    if (isNaN(createdTime)) return 30;
    const diff = Math.max(0, Date.now() - createdTime);
    return Math.floor(diff / (1000 * 60 * 60 * 24)) || 30;
  } catch {
    return 30;
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
      // Fallback if backend is booting
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

  // Recent Leads columns
  const recentLeadsColumns: Column<Lead>[] = [
    {
      header: 'Lead Name',
      cell: (lead) => (
        <div>
          <div className="font-bold text-slate-900">{lead.name}</div>
          <div className="text-xs text-slate-500">{lead.phone}</div>
        </div>
      ),
    },
    {
      header: 'Requirement',
      cell: (lead) => (
        <div>
          <span className="font-medium text-slate-800">
            {lead.bhk || ''} {lead.propertyType}
          </span>
          <div className="text-xs text-slate-500">
            {lead.preferredLocations?.join(', ') || 'Any Location'}
          </div>
        </div>
      ),
    },
    {
      header: 'Budget Range',
      cell: (lead) => (
        <span className="font-semibold text-slate-900">
          ₹{(lead.budgetMin / 100000).toFixed(0)}L - ₹{(lead.budgetMax / 100000).toFixed(0)}L
        </span>
      ),
    },
    {
      header: 'Stage',
      cell: (lead) => <StatusPill status={lead.stage} />,
    },
    {
      header: 'Agent',
      cell: (lead) => (
        <span className="text-xs font-medium text-slate-600">
          {lead.assignedAgent?.name || 'Unassigned'}
        </span>
      ),
    },
  ];

  const totalLeadsCount =
    stats?.distributions.leadsBySource.reduce((acc, s) => acc + s.count, 0) || 0;

  const donutSegments = useMemo(() => {
    return (stats?.distributions.leadsBySource || [])
      .filter((s) => s.count > 0)
      .map((s) => {
        const percentage = totalLeadsCount > 0 ? (s.count / totalLeadsCount) * 100 : 0;
        return {
          ...s,
          percentage,
          color: SOURCE_COLORS[s.source] || '#2563EB',
        };
      });
  }, [stats?.distributions.leadsBySource, totalLeadsCount]);

  const agingWithDays = useMemo(() => {
    return (stats?.agingInventory || []).map((p) => ({
      ...p,
      daysOnMarket: getDaysOnMarket(p.createdAt),
    }));
  }, [stats?.agingInventory]);

  // Top 4 High-Probability Matches
  const topMatches = matches.slice(0, 4);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 p-6" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-white rounded-2xl border border-slate-200 p-6" />
          <div className="h-96 bg-white rounded-2xl border border-slate-200 p-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Overview
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Here&apos;s what&apos;s happening with your portfolio today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={handleRefresh}
            isLoading={isRefreshing}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Link href="/leads">
            <Button variant="primary" size="md" className="font-bold shadow-md shadow-blue-500/20">
              <Plus className="h-4 w-4" />
              <span>New Lead</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Active Leads */}
        <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Active Leads
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2.5">
            <span className="text-3xl font-black tracking-tight text-slate-900">
              {stats?.kpis.totalActiveLeads ?? 0}
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
              +12%
            </span>
          </div>
        </Card>

        {/* Card 2: Total Properties Listed */}
        <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Properties Listed
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Building2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-slate-900">
              {stats?.kpis.totalProperties ?? 0}
            </span>
            <span className="text-xs font-semibold text-slate-500">active</span>
          </div>
        </Card>

        {/* Card 3: Hot Matches Today */}
        <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Hot Matches Today
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Flame className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2.5">
            <span className="text-3xl font-black tracking-tight text-slate-900">
              {stats?.kpis.hotMatchesToday ?? 0}
            </span>
            {(stats?.kpis.hotMatchesToday ?? 0) > 0 ? (
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                Action Required
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-400">All reviewed</span>
            )}
          </div>
        </Card>

        {/* Card 4: Deals Closed This Month */}
        <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Deals Closed This Month
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Award className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2.5">
            <span className="text-3xl font-black tracking-tight text-slate-900">
              {stats?.kpis.dealsClosedThisMonth ?? 0}
            </span>
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
              Target: 10
            </span>
          </div>
        </Card>
      </div>

      {/* Main Content Grid: Matches (2 Cols) & Side Widgets (1 Col) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Columns: High Probability Matches Grid & Recent Leads */}
        <div className="space-y-8 lg:col-span-2">
          {/* High Probability Matches Card */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-2 text-slate-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  High Probability Matches
                </h3>
              </div>
              <Link
                href="/matches"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Match Cards Grid */}
            {topMatches.length === 0 ? (
              <div className="py-12 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                <Sparkles className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No high compatibility matches yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Add new leads and property inventory to generate automated compatibility scores.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {topMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md"
                  >
                    <div>
                      {/* Top Lead Name & Score Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Lead
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 mt-0.5">
                            {match.lead?.name || 'Inquiry'}
                          </h4>
                        </div>
                        <MatchScoreBadge score={match.score} size="md" />
                      </div>

                      {/* Property Match Info */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100">
                        <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Property Match
                        </span>
                        <p className="text-xs font-bold text-slate-800 mt-0.5 line-clamp-1">
                          {match.property?.title || 'Property Listing'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {match.property?.bhk ? `${match.property.bhk} • ` : ''}
                          ₹{((match.property?.price || 0) / 100000).toFixed(0)} Lakhs
                        </p>
                      </div>
                    </div>

                    {/* View Match Action Button */}
                    <div className="mt-4 pt-2">
                      <Link href="/matches">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          View Match
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Inquiries & Leads Table */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Users className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Recent Inquiries
                </h3>
              </div>
              <Link
                href="/leads"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                <span>View All Leads</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {stats?.recentLeads && stats.recentLeads.length > 0 ? (
              <DataTable
                columns={recentLeadsColumns}
                data={stats.recentLeads}
                keyExtractor={(lead) => lead.id}
              />
            ) : (
              <div className="py-10 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                <p className="text-sm font-semibold text-slate-700">No leads recorded yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Start by adding your first buyer inquiry.
                </p>
                <div className="mt-3">
                  <Link href="/leads">
                    <Button variant="primary" size="sm">
                      <Plus className="h-4 w-4" />
                      <span>Add First Lead</span>
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 Column: Aging Inventory & Lead Sources Widgets */}
        <div className="space-y-8">
          {/* Widget 1: Aging Inventory */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Aging Inventory</h3>
              </div>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                {agingWithDays.length} Listed
              </span>
            </div>

            {agingWithDays.length > 0 ? (
              <div className="divide-y divide-slate-100 mt-1">
                {agingWithDays.map((prop: Property & { daysOnMarket: number }) => (
                  <Link
                    key={prop.id}
                    href="/properties"
                    className="group flex items-center justify-between py-3.5 transition-colors hover:bg-slate-50/60 -mx-2 px-2 rounded-xl"
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {prop.title}
                      </h4>
                      <p className="text-xs font-semibold text-rose-600">
                        {prop.daysOnMarket} Days on Market
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                <p className="font-semibold text-slate-700">No aging listings</p>
                <p className="text-slate-400 mt-0.5">
                  All active inventory has matched with potential buyers within 30 days.
                </p>
              </div>
            )}
          </Card>

          {/* Widget 2: Lead Sources Distribution */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Lead Sources</h3>
              <span className="text-xs font-semibold text-slate-500">
                {totalLeadsCount} Total Leads
              </span>
            </div>

            {totalLeadsCount === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No lead data recorded yet.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {/* Progress bars for each source */}
                <div className="space-y-3">
                  {donutSegments.map((item) => (
                    <div key={item.source} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-semibold text-slate-700">
                            {item.source.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900">
                          {item.count} ({item.percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
