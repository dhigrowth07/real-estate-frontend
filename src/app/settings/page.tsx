'use client';

import React from 'react';
import { Shield, Sliders, Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Agency Settings</h1>
        <p className="text-sm text-slate-500">
          Configure single-tenant visibility rules, matching engine weights, and alerting
          thresholds.
        </p>
      </div>

      {/* Visibility Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle>Agent Visibility Policy</CardTitle>
          </div>
          <CardDescription>
            Control whether agents can browse the entire agency inventory or only their assigned
            leads/properties.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="cursor-pointer rounded-xl border-2 border-blue-600 bg-blue-50/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Shared Visibility (ALL)</span>
                <span className="h-3 w-3 rounded-full bg-blue-600" />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Agents can view all active leads and properties across the agency.
              </p>
            </div>

            <div className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Restricted (ASSIGNED_ONLY)</span>
                <span className="h-3 w-3 rounded-full border border-slate-300" />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Agents strictly see only leads and properties assigned to them.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matching Weights Configuration Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-blue-600" />
            <CardTitle>Matching Engine Weights (100 Points Total)</CardTitle>
          </div>
          <CardDescription>
            Scoring algorithm configuration dynamically evaluated during bi-directional matching
            scans.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between border-b border-slate-100 py-2">
            <span className="font-medium text-slate-700">Budget Overlap (Full Match)</span>
            <span className="font-bold text-slate-900">35 Points</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 py-2">
            <span className="font-medium text-slate-700">Location Match</span>
            <span className="font-bold text-slate-900">25 Points</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 py-2">
            <span className="font-medium text-slate-700">Property Type Match</span>
            <span className="font-bold text-slate-900">20 Points</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 py-2">
            <span className="font-medium text-slate-700">BHK Configuration Match</span>
            <span className="font-bold text-slate-900">10 Points</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="font-medium text-slate-700">Possession Timeline Match</span>
            <span className="font-bold text-slate-900">10 Points</span>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Alerts Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-600" />
            <CardTitle>Alert Notification Threshold</CardTitle>
          </div>
          <CardDescription>
            Matches with a compatibility score at or above this threshold trigger real-time
            WebSocket alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Minimum Alert Score</span>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
            70% Score
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
