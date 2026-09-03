'use client';

import React, { useState } from 'react';
import { User, Building, Bell, Sliders, Check, Save, Lock, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type TabType = 'profile' | 'business' | 'notifications' | 'matching';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('matching');
  const [isSaved, setIsSaved] = useState(false);

  // Profile State
  const [name, setName] = useState(user?.name || 'Alex Mercer');
  const [email] = useState(user?.email || 'alex.mercer@estatenexus.com');
  const [phone, setPhone] = useState('+91 98765 43210');

  // Business Info State (Single-Tenant)
  const [businessName, setBusinessName] = useState('EstateNexus Realty Pvt Ltd');
  const [primaryCity, setPrimaryCity] = useState('Bangalore');
  const [licenseNo, setLicenseNo] = useState('RERA-KA-2024-08912');

  // Notification Preferences
  const [notifyWebSocket, setNotifyWebSocket] = useState(true);
  const [notifyEmailDigest, setNotifyEmailDigest] = useState(true);
  const [notifyHotMatchesOnly, setNotifyHotMatchesOnly] = useState(false);

  // Matching Engine Settings
  const [minMatchThreshold, setMinMatchThreshold] = useState<number>(75);
  const [budgetWeight, setBudgetWeight] = useState<number>(35);
  const [locationWeight, setLocationWeight] = useState<number>(25);
  const [propertyTypeWeight, setPropertyTypeWeight] = useState<number>(20);
  const [bhkWeight, setBhkWeight] = useState<number>(10);
  const [timelineWeight, setTimelineWeight] = useState<number>(10);

  const totalWeights =
    budgetWeight + locationWeight + propertyTypeWeight + bhkWeight + timelineWeight;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Settings & Preferences
        </h1>
        <p className="mt-1 text-xs font-medium text-slate-500 md:text-sm">
          Manage your account, business profile, notification rules, and matching engine weights.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 overflow-x-auto border-b border-slate-200">
        <button
          onClick={() => setActiveTab('matching')}
          className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'matching'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Matching Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('business')}
          className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'business'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building className="h-4 w-4" />
          <span>Business Info</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'notifications'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Notifications</span>
        </button>
      </div>

      {/* Tab Contents */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. MATCHING ENGINE SETTINGS TAB */}
        {activeTab === 'matching' && (
          <div className="space-y-6">
            {/* Minimum Threshold Card */}
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Match Confidence Notification Threshold
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Lead–property pairs with scores at or above this threshold trigger automatic
                    real-time alerts.
                  </p>
                </div>
                <div className="text-2xl font-black text-blue-600">{minMatchThreshold}%</div>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={minMatchThreshold}
                  onChange={(e) => setMinMatchThreshold(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600"
                />
                <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                  <span>50% (Loose)</span>
                  <span>75% (Recommended)</span>
                  <span>95% (Strict)</span>
                </div>
              </div>
            </div>

            {/* Configurable Weights Breakdown */}
            <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Rule-Based Scoring Engine Weights (Max: 100 pts)
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Adjust point distribution across compatibility parameters.
                  </p>
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    totalWeights === 100
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border border-rose-200 bg-rose-50 text-rose-700'
                  }`}
                >
                  Total Weight: {totalWeights} / 100
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Budget Overlap */}
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>Budget Overlap Match</span>
                    <span className="font-extrabold text-blue-600">{budgetWeight} pts</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={budgetWeight}
                    onChange={(e) => setBudgetWeight(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer rounded-lg bg-slate-200 accent-blue-600"
                  />
                  <p className="text-[11px] text-slate-400">
                    Full budget match = full points, within 10% = 60% partial.
                  </p>
                </div>

                {/* Location Match */}
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>Location Proximity Match</span>
                    <span className="font-extrabold text-blue-600">{locationWeight} pts</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    value={locationWeight}
                    onChange={(e) => setLocationWeight(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer rounded-lg bg-slate-200 accent-blue-600"
                  />
                  <p className="text-[11px] text-slate-400">
                    Preferred city and micro-market locality matching.
                  </p>
                </div>

                {/* Property Type */}
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>Property Type Match</span>
                    <span className="font-extrabold text-blue-600">{propertyTypeWeight} pts</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="30"
                    value={propertyTypeWeight}
                    onChange={(e) => setPropertyTypeWeight(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer rounded-lg bg-slate-200 accent-blue-600"
                  />
                  <p className="text-[11px] text-slate-400">
                    Apartment, Villa, Commercial, Penthouse, Plot.
                  </p>
                </div>

                {/* BHK / Specs */}
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>BHK Configuration Match</span>
                    <span className="font-extrabold text-blue-600">{bhkWeight} pts</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    value={bhkWeight}
                    onChange={(e) => setBhkWeight(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer rounded-lg bg-slate-200 accent-blue-600"
                  />
                  <p className="text-[11px] text-slate-400">
                    Bedrooms count matching lead requirement.
                  </p>
                </div>

                {/* Possession Timeline */}
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4 md:col-span-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>Possession Timeline Match</span>
                    <span className="font-extrabold text-blue-600">{timelineWeight} pts</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    value={timelineWeight}
                    onChange={(e) => setTimelineWeight(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer rounded-lg bg-slate-200 accent-blue-600"
                  />
                  <p className="text-[11px] text-slate-400">
                    Ready to move vs under construction alignment with urgency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <h3 className="border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-900 outline-hidden focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-2 pr-3 pl-9 text-xs text-slate-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-900 outline-hidden focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Assigned Role
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.role || 'ADMIN'}
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-900">Change Password</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="New Password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-900 outline-hidden focus:border-blue-600 focus:bg-white"
                  />
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-900 outline-hidden focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. BUSINESS INFO TAB (Single-Tenant) */}
        {activeTab === 'business' && (
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <h3 className="border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
              Agency & Business Details
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Business / Agency Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Primary Market / City
                </label>
                <input
                  type="text"
                  value={primaryCity}
                  onChange={(e) => setPrimaryCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Real Estate License / RERA Registration No.
                </label>
                <input
                  type="text"
                  value={licenseNo}
                  onChange={(e) => setLicenseNo(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-900 outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <h3 className="border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
              Notification Channels & Triggers
            </h3>

            <div className="space-y-3">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3.5 hover:bg-slate-50">
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Real-Time In-App Alert Banners (WebSocket)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Receive instant toast alerts when a new hot match (&gt;80%) is computed.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyWebSocket}
                  onChange={(e) => setNotifyWebSocket(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-600"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3.5 hover:bg-slate-50">
                <div>
                  <p className="text-xs font-bold text-slate-900">Daily Summary Email Digest</p>
                  <p className="text-[11px] text-slate-500">
                    Receive a morning digest of all new leads and top match opportunities.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyEmailDigest}
                  onChange={(e) => setNotifyEmailDigest(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-600"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3.5 hover:bg-slate-50">
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Only Notify for High Confidence Matches
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Mute notifications for match scores below 80%.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyHotMatchesOnly}
                  onChange={(e) => setNotifyHotMatchesOnly(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-600"
                />
              </label>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {isSaved ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Settings saved successfully!</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Changes take effect immediately across all agents.
            </div>
          )}

          <button
            type="submit"
            className="ml-auto flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
