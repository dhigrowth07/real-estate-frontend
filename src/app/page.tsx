import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { MatchScoreBadge } from '@/components/ui/MatchScoreBadge';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Real Estate Lead–Property Matching Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Project scaffolding initialized. Configured for standalone execution with REST API
            connection.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">Frontend Scaffolding Ready</Badge>
          <Badge variant="primary">Light Theme Active</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Bi-directional Matching Engine</CardTitle>
            <CardDescription>Rule-based score evaluation (0–100%)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">High Compatibility</span>
              <MatchScoreBadge score={92} showLabel />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Moderate Match</span>
              <MatchScoreBadge score={68} showLabel />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Low Compatibility</span>
              <MatchScoreBadge score={42} showLabel />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Architecture &amp; Connectivity</CardTitle>
            <CardDescription>Single-tenant standalone repo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <div>
              <span className="font-semibold text-slate-800">Target Backend:</span>{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
                {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}
              </code>
            </div>
            <div>
              <span className="font-semibold text-slate-800">Communication:</span> REST API over
              HTTP
            </div>
            <div>
              <span className="font-semibold text-slate-800">Scope:</span> Single-Tenant (No
              multi-tenancy)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phase 1 MVP Modules</CardTitle>
            <CardDescription>Scaffolded routes and components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Link
              href="/leads"
              className="flex items-center justify-between rounded-lg p-2 font-medium text-blue-600 hover:bg-slate-50"
            >
              <span>Leads Management</span>
              <span className="text-xs text-slate-400">/leads &rarr;</span>
            </Link>
            <Link
              href="/properties"
              className="flex items-center justify-between rounded-lg p-2 font-medium text-blue-600 hover:bg-slate-50"
            >
              <span>Properties Directory</span>
              <span className="text-xs text-slate-400">/properties &rarr;</span>
            </Link>
            <Link
              href="/matches"
              className="flex items-center justify-between rounded-lg p-2 font-medium text-blue-600 hover:bg-slate-50"
            >
              <span>Match Scoring Feed</span>
              <span className="text-xs text-slate-400">/matches &rarr;</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
