'use client';

import React from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MatchScoreBadge } from '@/components/ui/MatchScoreBadge';
import { StatusPill } from '@/components/ui/StatusPill';

export default function MatchesPage() {
  const sampleMatches = [
    {
      id: 'm1',
      leadName: 'Vipul Sharma',
      leadBudget: '₹60L - ₹80L',
      leadType: '3BHK VILLA',
      leadLocation: 'Whitefield',
      propertyTitle: 'Spacious 3BHK Villa in Whitefield',
      propertyPrice: '₹70 Lakhs',
      propertyLocation: 'Whitefield, Bangalore',
      score: 100,
      status: 'NEW',
      breakdown: {
        budgetScore: 35,
        locationScore: 25,
        propertyTypeScore: 20,
        bhkScore: 10,
        possessionScore: 10,
      },
    },
    {
      id: 'm2',
      leadName: 'Kavita Rao',
      leadBudget: '₹70L - ₹90L',
      leadType: '2BHK APARTMENT',
      leadLocation: 'Indiranagar',
      propertyTitle: 'Modern 2BHK Apartment in Indiranagar',
      propertyPrice: '₹85 Lakhs',
      propertyLocation: 'Indiranagar, Bangalore',
      score: 85,
      status: 'NOTIFIED',
      breakdown: {
        budgetScore: 20,
        locationScore: 25,
        propertyTypeScore: 20,
        bhkScore: 10,
        possessionScore: 10,
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Matches & Alerts</h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
              Matching Engine
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Bi-directional compatibility matching between active buyers and property inventory.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="md">
            <RefreshCw className="h-4 w-4" />
            <span>Re-Scan All Matches</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm">
              All Matches
            </Button>
            <Button variant="outline" size="sm">
              🔥 Hot (&gt; 80%)
            </Button>
            <Button variant="outline" size="sm">
              Moderate (50-80%)
            </Button>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
            <span>Filter by Agent</span>
          </Button>
        </div>
      </Card>

      {/* Matches Grid */}
      <div className="space-y-4">
        {sampleMatches.map((match) => (
          <Card key={match.id} hoverable className="border-l-4 border-l-blue-600">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Left: Lead details */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Buyer</span>
                  <StatusPill status={match.status} />
                </div>
                <h4 className="text-base font-bold text-slate-900">{match.leadName}</h4>
                <p className="text-xs text-slate-600">
                  Budget: <strong>{match.leadBudget}</strong> • Prefers: {match.leadLocation} (
                  {match.leadType})
                </p>
              </div>

              {/* Middle: Match Badge */}
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
                <MatchScoreBadge score={match.score} size="lg" showLabel />
                <span className="mt-1 text-[11px] font-semibold text-slate-500">Compatibility</span>
              </div>

              {/* Right: Property details */}
              <div className="flex-1 space-y-1 md:text-right">
                <span className="text-xs font-bold text-slate-400 uppercase">Property</span>
                <h4 className="text-base font-bold text-slate-900">{match.propertyTitle}</h4>
                <p className="text-xs text-slate-600">
                  Price: <strong className="text-slate-900">{match.propertyPrice}</strong> •{' '}
                  {match.propertyLocation}
                </p>
              </div>
            </div>

            {/* Score Breakdown Pills */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                  Budget: +{match.breakdown.budgetScore}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                  Location: +{match.breakdown.locationScore}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                  Type: +{match.breakdown.propertyTypeScore}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                  BHK: +{match.breakdown.bhkScore}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                  Possession: +{match.breakdown.possessionScore}
                </span>
              </div>
              <Button variant="outline" size="sm">
                Mark as Contacted
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
