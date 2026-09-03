import React from 'react';
import Link from 'next/link';
import { Users, Building2, Sparkles, Kanban, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MatchScoreBadge } from '@/components/ui/MatchScoreBadge';
import { StatusPill } from '@/components/ui/StatusPill';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Agency Overview
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Real Estate CRM with Bi-directional Lead-Property Matching Engine
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/leads">
            <Button variant="outline" size="md">
              <Users className="h-4 w-4" />
              <span>Add Lead</span>
            </Button>
          </Link>
          <Link href="/properties">
            <Button variant="primary" size="md">
              <Building2 className="h-4 w-4" />
              <span>Add Property</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1 */}
        <Card className="border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Total Active Leads
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black tracking-tight text-slate-900">42</span>
            <span className="ml-2 text-xs font-semibold text-emerald-600">+12% this week</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">In active stages (excl. won/lost)</p>
        </Card>

        {/* KPI 2 */}
        <Card className="border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Available Properties
            </span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black tracking-tight text-slate-900">28</span>
            <span className="ml-2 text-xs font-semibold text-slate-500">Listed inventory</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Ready for buyer matching</p>
        </Card>

        {/* KPI 3 */}
        <Card className="border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Hot Matches Today
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black tracking-tight text-emerald-600">8</span>
            <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
              &gt; 80% Score
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">High-probability conversions</p>
        </Card>

        {/* KPI 4 */}
        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Deals Closed Month
            </span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black tracking-tight text-slate-900">6</span>
            <span className="ml-2 text-xs font-semibold text-emerald-600">+2 from last month</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Total closed won pipeline</p>
        </Card>
      </div>

      {/* Main Grid: Recent Matches & Lead Activity */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Live Matching Engine Preview */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <span>Top Compatibility Matches</span>
                </CardTitle>
                <CardDescription>
                  Automated bi-directional compatibility scored by the matching engine
                </CardDescription>
              </div>
              <Link href="/matches">
                <Button variant="ghost" size="sm" className="text-blue-600">
                  <span>View all</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100">
              {/* Sample Match Item 1 */}
              <div className="flex items-center justify-between py-3.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">Vipul Sharma</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-medium text-slate-600">₹6M - ₹8M Budget</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Matches: <strong className="text-slate-700">3BHK Luxury Villa</strong> in
                    Whitefield
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <MatchScoreBadge score={100} size="md" showLabel />
                  <Link href="/matches">
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Sample Match Item 2 */}
              <div className="flex items-center justify-between py-3.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">Kavita Rao</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-medium text-slate-600">₹7M - ₹9M Budget</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Matches: <strong className="text-slate-700">2BHK Apartment</strong> in
                    Indiranagar
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <MatchScoreBadge score={85} size="md" showLabel />
                  <Link href="/matches">
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Sample Match Item 3 */}
              <div className="flex items-center justify-between py-3.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">Rajesh Verma</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-medium text-slate-600">₹4M - ₹5.5M Budget</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Matches: <strong className="text-slate-700">Budget 2BHK Flat</strong> in
                    Electronic City
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <MatchScoreBadge score={65} size="md" showLabel />
                  <Link href="/matches">
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link href="/leads" className="block">
              <Card hoverable className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Leads CRM</h4>
                    <p className="text-xs text-slate-500">Filter & manage buyers</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/properties" className="block">
              <Card hoverable className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Inventory</h4>
                    <p className="text-xs text-slate-500">Manage listings</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/pipeline" className="block">
              <Card hoverable className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600">
                    <Kanban className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Pipeline</h4>
                    <p className="text-xs text-slate-500">Kanban stage board</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right Col: Recent Activity & Aging Inventory Warning */}
        <div className="space-y-6">
          {/* Recent Leads Feed */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-slate-600" />
                <span>Recent Leads</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <p className="text-xs font-bold text-slate-900">Deepa Mehta</p>
                  <p className="text-[11px] text-slate-500">Website • 3BHK Villa</p>
                </div>
                <StatusPill status="NEW" />
              </div>
              <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <p className="text-xs font-bold text-slate-900">Rohan Iyer</p>
                  <p className="text-[11px] text-slate-500">Referral • 2BHK Flat</p>
                </div>
                <StatusPill status="SITE_VISIT_SCHEDULED" />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Ananya Sen</p>
                  <p className="text-[11px] text-slate-500">Direct Call • Plot</p>
                </div>
                <StatusPill status="CONTACTED" />
              </div>
            </CardContent>
          </Card>

          {/* Aging Inventory Alert Card */}
          <Card className="border-amber-200 bg-amber-50/40">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-amber-800">
                <Clock className="h-4 w-4 text-amber-600" />
                <CardTitle className="text-sm text-amber-900">Aging Inventory (30+ Days)</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-amber-800">
                1 property has been listed for over 30 days without any match score above 50%.
                Consider revising pricing or expanding buyer criteria.
              </p>
              <div className="mt-3">
                <Link href="/properties">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-amber-300 bg-white text-xs text-amber-900 hover:bg-amber-50"
                  >
                    Review Aging Listings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
