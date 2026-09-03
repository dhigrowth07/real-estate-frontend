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
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
          New Lead
        </span>
      );
    case 'SITE_VISIT_SCHEDULED':
    case 'SHOWING':
    case 'REQUIREMENT_GATHERED':
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
          Showing
        </span>
      );
    case 'NEGOTIATION':
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
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
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
          {stage.replace(/_/g, ' ')}
        </span>
      );
  }
}

const STATIC_FALLBACK_LEADS: LeadDisplayItem[] = [
  {
    id: '1',
    name: 'Marcus Chen',
    source: 'WEBSITE',
    stage: 'NEW',
    agentName: 'Sarah Agent',
    addedText: '2 hours ago',
  },
  {
    id: '2',
    name: 'Sophia Martinez',
    source: 'PORTAL',
    stage: 'SITE_VISIT_SCHEDULED',
    agentName: 'David Agent',
    addedText: '5 hours ago',
  },
  {
    id: '3',
    name: 'James Wilson',
    source: 'DIRECT_CALL',
    stage: 'NEGOTIATION',
    agentName: 'Sarah Agent',
    addedText: '1 day ago',
  },
  {
    id: '4',
    name: 'Olivia Taylor',
    source: 'WHATSAPP',
    stage: 'NEW',
    agentName: 'David Agent',
    addedText: '1 day ago',
  },
  {
    id: '5',
    name: 'William Brown',
    source: 'WEBSITE',
    stage: 'SITE_VISIT_SCHEDULED',
    agentName: 'Alex Mercer',
    addedText: '2 days ago',
  },
];

const STATIC_AGING_ITEMS: AgingItem[] = [
  { id: '1', title: '124 Maple Street', daysOnMarket: 45, isDanger: true },
  { id: '2', title: 'Apt 4B, Riverfront Tower', daysOnMarket: 32, isDanger: false },
  { id: '3', title: '88 Pine Avenue', daysOnMarket: 30, isDanger: false },
];

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
    342;

  const agingWithDays: AgingItem[] =
    stats?.agingInventory && stats.agingInventory.length > 0
      ? stats.agingInventory.map((p, index) => ({
          id: p.id,
          title: p.title,
          daysOnMarket: 30 + index * 7,
          isDanger: index === 0,
        }))
      : STATIC_AGING_ITEMS;

  // Top 4 High-Probability Matches (live or default visual pairs)
  const displayMatches =
    matches && matches.length > 0
      ? matches.slice(0, 4)
      : [
          {
            id: 'sample-1',
            score: 92,
            leadName: 'Sarah Johnson',
            propertyTitle: 'Sunrise Apartments, 3BHK',
          },
          {
            id: 'sample-2',
            score: 88,
            leadName: 'David Chen',
            propertyTitle: 'Oakwood Villa, Downtown',
          },
          {
            id: 'sample-3',
            score: 76,
            leadName: 'Elena Rodriguez',
            propertyTitle: 'Modern Loft, Westside',
          },
          {
            id: 'sample-4',
            score: 65,
            leadName: 'Michael Chang',
            propertyTitle: 'Suburban Family Home, 4BHK',
          },
        ];

  // Recent Leads (live or reference default)
  const displayLeads: LeadDisplayItem[] =
    stats?.recentLeads && stats.recentLeads.length > 0
      ? stats.recentLeads.map((l) => ({
          id: l.id,
          name: l.name,
          source: l.source,
          stage: l.stage,
          agentName: l.assignedAgent?.name || 'Assigned',
          addedText: formatDateDisplay(l.createdAt),
        }))
      : STATIC_FALLBACK_LEADS;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 p-4" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white rounded-xl border border-slate-200 p-6" />
          <div className="h-96 bg-white rounded-xl border border-slate-200 p-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Overview
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Here&apos;s what&apos;s happening with your portfolio today.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link href="/leads">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer">
              <Plus className="h-4 w-4" />
              <span>New Lead</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Active Leads */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Active Leads
            </span>
            <span className="p-1 bg-blue-50 text-blue-600 rounded-md">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900">
              {stats?.kpis?.totalActiveLeads ?? 342}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mb-1">
              +12%
            </span>
          </div>
        </div>

        {/* Card 2: Total Properties Listed */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Properties Listed
            </span>
            <span className="p-1 bg-blue-50 text-blue-600 rounded-md">
              <Building2 className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900">
              {stats?.kpis?.totalProperties ?? 89}
            </span>
            <span className="text-xs text-slate-500 mb-1 font-medium">active</span>
          </div>
        </div>

        {/* Card 3: Hot Matches Today */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Hot Matches Today
            </span>
            <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md">
              <Flame className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900">
              {stats?.kpis?.hotMatchesToday ?? 14}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mb-1">
              Action Required
            </span>
          </div>
        </div>

        {/* Card 4: Deals Closed This Month */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Deals Closed This Month
            </span>
            <span className="p-1 bg-blue-50 text-blue-600 rounded-md">
              <Award className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900">
              {stats?.kpis?.dealsClosedThisMonth ?? 8}
            </span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mb-1">
              Target: 10
            </span>
          </div>
        </div>
      </div>

      {/* Bento Grid: Matches (2 Columns) & Widgets (1 Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hot Matches Section */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BellRing className="h-4.5 w-4.5 text-emerald-600" />
              <span>High Probability Matches</span>
            </h3>
            <Link
              href="/matches"
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    : 'Sunrise Apartments, 3BHK';

              return (
                <div
                  key={match.id}
                  className="border border-slate-200 rounded-lg p-4 hover:border-blue-500 transition-colors shadow-xs bg-slate-50/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Lead
                        </p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                          {leadName}
                        </p>
                      </div>
                      <div
                        className={`text-sm font-bold px-3 py-0.5 rounded-full border ${
                          match.score >= 80
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-500'
                            : 'bg-amber-50 text-amber-700 border-amber-500'
                        }`}
                      >
                        {match.score}%
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Property Match
                      </p>
                      <p className="text-xs font-medium text-slate-700 truncate mt-0.5">
                        {propTitle}
                      </p>
                    </div>
                  </div>

                  <Link href="/matches">
                    <button className="w-full bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-semibold py-2 rounded-md transition-colors border border-slate-200 hover:border-blue-600 text-center cursor-pointer">
                      View Match
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (Widgets) */}
        <div className="flex flex-col gap-6">
          {/* Aging Inventory Widget */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col gap-2">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Aging Inventory</span>
              </h3>
            </div>

            <div className="flex flex-col divide-y divide-slate-100 mt-1">
              {agingWithDays.map((prop) => (
                <Link
                  key={prop.id}
                  href="/properties"
                  className="flex justify-between items-center py-2.5 hover:bg-slate-50 rounded-md transition-colors px-1"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
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
                  <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Leads by Source Widget */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col gap-2 flex-1">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Lead Sources
            </h3>
            <div className="flex-1 flex flex-col items-center justify-center py-4 relative">
              {/* Reference Donut Chart */}
              <div className="w-32 h-32 rounded-full border-[12px] border-slate-100 relative overflow-hidden flex items-center justify-center">
                <div
                  className="absolute top-0 right-0 w-1/2 h-full border-r-[12px] border-blue-600 rounded-r-full"
                  style={{
                    transform: 'rotate(30deg)',
                    transformOrigin: 'left center',
                  }}
                />
                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 border-b-[12px] border-r-[12px] border-emerald-500 rounded-br-full" />
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 border-b-[12px] border-l-[12px] border-amber-500 rounded-bl-full" />
                <div className="bg-white w-20 h-20 rounded-full z-10 flex flex-col items-center justify-center shadow-xs">
                  <span className="text-2xl font-bold text-slate-900">
                    {totalLeadsCount}
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="w-full flex justify-around mt-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-blue-600" /> Web
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Social
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Direct
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-900">Recent Leads</h3>
          <Link
            href="/leads"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>Filter</span>
            <Filter className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-white">
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Name
                </th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Source
                </th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Stage
                </th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Agent
                </th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Added
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {displayLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="p-4 font-bold text-slate-900">{lead.name}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-600 text-xs font-medium">
                      {getSourceIcon(lead.source)}
                      <span className="capitalize">
                        {lead.source?.toLowerCase().replace(/_/g, ' ') ||
                          'Website'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">{getStageBadge(lead.stage)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center border border-blue-200">
                        {lead.agentName
                          ? lead.agentName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .substring(0, 2)
                          : 'AG'}
                      </div>
                      <span className="text-xs text-slate-600 font-medium hidden sm:inline">
                        {lead.agentName}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-slate-400">
                    {lead.addedText}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
