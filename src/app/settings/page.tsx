'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Bell,
  Network,
  Shield,
  Check,
  Building,
  CheckCircle2,
  Flame,
  Clock,
  Archive,
  MessageSquare,
  Mail,
  Smartphone,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';

type TabKey = 'profile' | 'matching' | 'notifications' | 'integrations' | 'security';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('matching');
  const [isSaved, setIsSaved] = useState(false);

  // Match Threshold State
  const [matchThreshold, setMatchThreshold] = useState<number>(80);

  // Automated Dispatch Rules State
  const [autoNotifyWhatsApp, setAutoNotifyWhatsApp] = useState(true);
  const [autoAssignListingAgent, setAutoAssignListingAgent] = useState(true);
  const [includeAdjacentLocalities, setIncludeAdjacentLocalities] = useState(true);

  // Notification Toggles
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [smsDispatch, setSmsDispatch] = useState(true);
  const [emailDigests, setEmailDigests] = useState(true);
  const [leadEscalations, setLeadEscalations] = useState(true);

  // Profile & Business Details
  const [fullName, setFullName] = useState('Sarah Jenkins');
  const [email] = useState('sarah.j@estatenexus.com');
  const [phone, setPhone] = useState('+91 98201 44521');
  const [roleTitle, setRoleTitle] = useState('Admin / Principal Broker');
  const [businessName, setBusinessName] = useState('Nexus Realty Advisors Pvt Ltd');
  const [primaryMarket, setPrimaryMarket] = useState('Bengaluru & Mumbai Prime');
  const [reraNumber, setReraNumber] = useState('PRM/KA/RERA/1251/310/AG/220815');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDiscard = () => {
    setMatchThreshold(80);
    setAutoNotifyWhatsApp(true);
    setAutoAssignListingAgent(true);
    setIncludeAdjacentLocalities(true);
    setWhatsappAlerts(true);
    setSmsDispatch(true);
    setEmailDigests(true);
    setLeadEscalations(true);
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-16">
      {/* Top Header strictly matching Screenshot */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-400">
            <span>Agency Portal</span>
            <span>›</span>
            <span className="text-blue-600">Settings</span>
          </div>
          <h1 className="mt-0.5 text-3xl font-extrabold tracking-tight text-slate-900">Settings</h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500 md:text-sm">
            Manage your account preferences, automated match thresholds, notifications, and
            integrations.
          </p>
        </div>

        {/* Action Buttons: Discard & Save Changes */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDiscard}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700"
          >
            <Check className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="animate-in fade-in flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>All configuration settings saved and activated in real-time!</span>
        </div>
      )}

      {/* Tabs Navigation matching Screenshot */}
      <div className="flex gap-4 overflow-x-auto border-b border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex cursor-pointer items-center gap-2 border-b-2 pb-3 text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building className="h-4 w-4" />
          <span>Profile & Business</span>
        </button>

        <button
          onClick={() => setActiveTab('matching')}
          className={`flex cursor-pointer items-center gap-2 border-b-2 pb-3 text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'matching'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Match Engine Logic</span>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-600">
            Core
          </span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex cursor-pointer items-center gap-2 border-b-2 pb-3 text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'notifications'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Notification Channels</span>
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex cursor-pointer items-center gap-2 border-b-2 pb-3 text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'integrations'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Network className="h-4 w-4" />
          <span>Integrations (Phase 2)</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex cursor-pointer items-center gap-2 border-b-2 pb-3 text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Security</span>
        </button>
      </div>

      {/* MATCH ENGINE LOGIC & ALL SETTINGS SECTIONS */}
      <div className="space-y-8">
        {/* SECTION 1: Automated Match Engine Configuration Card */}
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          {/* Engine Header */}
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Automated Match Engine Configuration
                  </h3>
                  <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Active Engine v2.4</span>
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Defines how AI compatibility is calculated between client requirements (budget,
                  BHK, micro-market) and active listings.
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Algorithm Status
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 sm:justify-end">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Real-time Scoring</span>
              </div>
            </div>
          </div>

          {/* Hot Match Alert Threshold Slider Section matching Screenshot */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Hot Match Alert Threshold</h4>
                <p className="mt-0.5 text-xs text-slate-500">
                  Listings scoring at or above this threshold trigger proactive automated actions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-blue-600">{matchThreshold}%</span>
                <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                  Recommended
                </span>
              </div>
            </div>

            {/* Slider with Scale Markers */}
            <div className="space-y-2 pt-2">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={matchThreshold}
                onChange={(e) => setMatchThreshold(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600"
              />
              <div className="flex justify-between px-1 text-xs font-semibold text-slate-400">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span className="font-bold text-blue-600">{matchThreshold}% (Current)</span>
                <span>100%</span>
              </div>
            </div>

            {/* 3 Threshold Category Cards matching Screenshot */}
            <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-3">
              {/* 1. Hot Match */}
              <div className="space-y-1.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <Flame className="h-4 w-4 fill-emerald-600 text-emerald-600" />
                    <span>Hot Match (&gt;80%)</span>
                  </div>
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    High Conf.
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed font-medium text-emerald-800/80">
                  Triggers instant WhatsApp/SMS dispatch to buyer & broker.
                </p>
              </div>

              {/* 2. Medium Match */}
              <div className="space-y-1.5 rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span>Medium (50% – 80%)</span>
                  </div>
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    Queued
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed font-medium text-amber-800/80">
                  Appears in daily agent digest for manual review.
                </p>
              </div>

              {/* 3. Low Match */}
              <div className="space-y-1.5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Archive className="h-4 w-4 text-slate-500" />
                    <span>Low Match (&lt;50%)</span>
                  </div>
                  <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                    Archive
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed font-medium text-slate-600">
                  Stored in background archive; visible on explicit filter.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Automated Dispatch Rules */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Automated Dispatch Rules
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Rule 1 */}
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition-colors hover:bg-slate-50">
              <input
                type="checkbox"
                checked={autoNotifyWhatsApp}
                onChange={(e) => setAutoNotifyWhatsApp(e.target.checked)}
                className="mt-1 h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">Auto-notify client via WhatsApp</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Dispatches interactive property card when score &gt; 85%.
                </p>
              </div>
            </label>

            {/* Rule 2 */}
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition-colors hover:bg-slate-50">
              <input
                type="checkbox"
                checked={autoAssignListingAgent}
                onChange={(e) => setAutoAssignListingAgent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Auto-assign lead to listing agent
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Instantly alerts primary broker upon 90%+ match score.
                </p>
              </div>
            </label>

            {/* Rule 3 */}
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition-colors hover:bg-slate-50">
              <input
                type="checkbox"
                checked={includeAdjacentLocalities}
                onChange={(e) => setIncludeAdjacentLocalities(e.target.checked)}
                className="mt-1 h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">Include adjacent localities</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Expands geo-perimeter with a flexible +5 km buffer radius.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* SECTION 3: 2-Column Grid (Notification Preferences & Connected Integrations) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Notification Preferences */}
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Notification Preferences</h3>
                  <p className="text-[11px] text-slate-500">
                    Configure multichannel client & agent alerts
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                All Active
              </span>
            </div>

            <div className="space-y-3">
              {/* Item 1 */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">WhatsApp Business Alerts</h4>
                    <p className="text-[11px] text-slate-500">Active line: +91 98201 44521</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappAlerts}
                  onChange={(e) => setWhatsappAlerts(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded-md border-slate-300 text-blue-600 focus:ring-blue-600"
                />
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">SMS Instant Dispatch</h4>
                    <p className="text-[11px] text-slate-500">High priority lead drops & OTPs</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={smsDispatch}
                  onChange={(e) => setSmsDispatch(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded-md border-slate-300 text-blue-600 focus:ring-blue-600"
                />
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Email Summary Digests</h4>
                    <p className="text-[11px] text-slate-500">Sent daily at 9:00 AM IST</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailDigests}
                  onChange={(e) => setEmailDigests(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded-md border-slate-300 text-blue-600 focus:ring-blue-600"
                />
              </div>

              {/* Item 4 */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Team Lead Escalations</h4>
                    <p className="text-[11px] text-slate-500">
                      For uncontacted hot matches (&gt; 2 hours)
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={leadEscalations}
                  onChange={(e) => setLeadEscalations(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded-md border-slate-300 text-blue-600 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Right: Connected Integrations */}
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-purple-50 p-2 text-purple-600">
                  <Network className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Connected Integrations</h3>
                  <p className="text-[11px] text-slate-500">
                    Sync portals, social lead ads & CRM pipelines
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                Phase 2 Sync
              </span>
            </div>

            <div className="space-y-3">
              {/* Integration 1 */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700">
                    WA
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">WhatsApp Business API</h4>
                    <p className="text-[11px] font-semibold text-emerald-600">• Connected</p>
                  </div>
                </div>
                <button className="cursor-pointer rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-200">
                  Manage
                </button>
              </div>

              {/* Integration 2 */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700">
                    <RotateCw className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">MagicBricks & 99acres Sync</h4>
                    <p className="text-[11px] font-semibold text-emerald-600">
                      • Syncing 42 active listings
                    </p>
                  </div>
                </div>
                <button className="cursor-pointer rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-200">
                  Sync Now
                </button>
              </div>

              {/* Integration 3 */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-pink-200 bg-pink-50 text-xs font-bold text-pink-700">
                    IG
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Instagram & Meta Lead Ads</h4>
                    <p className="text-[11px] text-slate-500">Ingest instant form leads</p>
                  </div>
                </div>
                <button className="cursor-pointer rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100">
                  Connect
                </button>
              </div>

              {/* Integration 4 */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700">
                    CT
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Cloud Telephony / Exotel</h4>
                    <p className="text-[11px] text-slate-500">Virtual numbers & call recordings</p>
                  </div>
                </div>
                <button className="cursor-pointer rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-200">
                  Configure
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Agency & Broker Profile Details strictly matching Screenshot */}
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Agency & Broker Profile Details
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Legal business entity credentials, licensing, and primary agent contact
                </p>
              </div>
            </div>
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-xs font-semibold text-slate-500">
              Account ID: EN-BLR-8921
            </span>
          </div>

          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-4">
            {/* Left Photo & Role Card */}
            <div className="flex flex-col items-center space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 text-center md:col-span-1">
              <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-white shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
                  alt="Sarah Jenkins"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <button
                  type="button"
                  className="cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  Change Photo
                </button>
                <p className="mt-0.5 text-[10px] text-slate-400">JPG or PNG. Max 2MB</p>
              </div>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                Admin / Principal Broker
              </span>
            </div>

            {/* Right Profile Fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-3">
              {/* Full Name */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-500 outline-hidden"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>

              {/* Role Title */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Role Title
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>

              {/* Registered Business Name */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Registered Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>

              {/* Primary Market Focus */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Primary Market Focus
                </label>
                <input
                  type="text"
                  value={primaryMarket}
                  onChange={(e) => setPrimaryMarket(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>

              {/* RERA Registration */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  RERA Registration / Agent License Number
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={reraNumber}
                      onChange={(e) => setReraNumber(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-900 outline-hidden focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Verified</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
