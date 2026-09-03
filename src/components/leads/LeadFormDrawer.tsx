'use client';

import React, { useState, useEffect } from 'react';
import { X, UserCheck, ChevronDown, Zap } from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { Lead, LeadSource, PropertyType, LeadPurpose, LeadUrgency, LeadStage, User } from '@/types';

export interface LeadFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
  onSuccess: (lead: Lead) => void;
}

export function LeadFormDrawer({ isOpen, onClose, lead, onSuccess }: LeadFormDrawerProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<LeadSource>('WEBSITE');
  const [purpose, setPurpose] = useState<LeadPurpose>('BUY');
  const [propertyType, setPropertyType] = useState<PropertyType>('APARTMENT');
  const [bhk, setBhk] = useState<string>('2BHK');
  const [budgetMin, setBudgetMin] = useState<number | ''>(5000000);
  const [budgetMax, setBudgetMax] = useState<number | ''>(10000000);
  const [locationTags, setLocationTags] = useState<string[]>(['Downtown']);
  const [locationInput, setLocationInput] = useState<string>('');
  const [urgency, setUrgency] = useState<LeadUrgency>('IMMEDIATE');
  const [stage, setStage] = useState<LeadStage>('NEW');
  const [assignedAgentId, setAssignedAgentId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [agents, setAgents] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state with open/lead props
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      if (lead) {
        setName(lead.name || '');
        setPhone(lead.phone || '');
        setEmail(lead.email || '');
        setSource(lead.source || 'WEBSITE');
        setPurpose(lead.purpose || 'BUY');
        setPropertyType(lead.propertyType || 'APARTMENT');
        setBhk(lead.bhk || '2BHK');
        setBudgetMin(lead.budgetMin || 5000000);
        setBudgetMax(lead.budgetMax || 10000000);
        setLocationTags(
          lead.preferredLocations && lead.preferredLocations.length > 0
            ? lead.preferredLocations
            : ['Downtown']
        );
        setLocationInput('');
        setUrgency(lead.urgency || 'IMMEDIATE');
        setStage(lead.stage || 'NEW');
        setAssignedAgentId(lead.assignedAgentId || '');
        setNotes('');
      } else {
        setName('');
        setPhone('');
        setEmail('');
        setSource('WEBSITE');
        setPurpose('BUY');
        setPropertyType('APARTMENT');
        setBhk('2BHK');
        setBudgetMin(5000000);
        setBudgetMax(10000000);
        setLocationTags(['Downtown']);
        setLocationInput('');
        setUrgency('IMMEDIATE');
        setStage('NEW');
        setAssignedAgentId('');
        setNotes('');
      }
    }, 0);
    return () => clearTimeout(t);
  }, [isOpen, lead]);

  // Load agents
  useEffect(() => {
    let isMounted = true;
    async function loadAgents() {
      try {
        const users = await apiClient.get<User[]>(API_ENDPOINTS.USERS.LIST);
        if (isMounted && Array.isArray(users)) {
          setAgents(users);
        }
      } catch {
        // Fallback
      }
    }
    if (isOpen) {
      void loadAgents();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleAddLocation = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = locationInput.trim().replace(/^,|,$/g, '');
      if (trimmed && !locationTags.includes(trimmed)) {
        setLocationTags([...locationTags, trimmed]);
        setLocationInput('');
      }
    }
  };

  const handleRemoveLocation = (tagToRemove: string) => {
    setLocationTags(locationTags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !phone) {
      setError('Full Name and Phone Number are required.');
      return;
    }

    const minNum = typeof budgetMin === 'number' ? budgetMin : 5000000;
    const maxNum = typeof budgetMax === 'number' ? budgetMax : 10000000;

    const payload = {
      name,
      phone,
      email: email || undefined,
      source,
      purpose,
      propertyType,
      bhk,
      budgetMin: minNum,
      budgetMax: maxNum,
      preferredLocations: locationTags.length > 0 ? locationTags : ['Downtown'],
      urgency,
      stage,
      assignedAgentId: assignedAgentId || undefined,
    };

    try {
      setIsSubmitting(true);
      let result: Lead;
      if (lead?.id) {
        result = await apiClient.patch<Lead>(API_ENDPOINTS.LEADS.UPDATE(lead.id), payload);
      } else {
        result = await apiClient.post<Lead>(API_ENDPOINTS.LEADS.CREATE, payload);
      }
      onSuccess(result);
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to save lead. Please check your inputs.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      {/* Full-Page Backdrop Overlay */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Side Panel Drawer (Full-Height 100vh, 480px width) */}
      <aside className="relative z-50 flex h-screen w-full flex-col border-l border-slate-200 bg-white shadow-2xl sm:w-[480px] md:w-[480px]">
        {/* Drawer Header matching Screenshot */}
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4.5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {lead ? 'Edit Lead' : 'Add New Lead'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">Quick entry form for new prospects</p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Scrollable Form Area */}
        <div className="flex-1 space-y-5 overflow-y-auto bg-white p-6">
          <form id="lead-form" onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {error}
              </div>
            )}

            {/* Contact Details Section */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                Contact Details
              </h3>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-hidden transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-hidden transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Email <span className="font-normal text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-hidden transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Source</label>
                <div className="relative">
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as LeadSource)}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2 pr-8 pl-9 text-xs font-medium text-slate-800 outline-hidden transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="WEBSITE">Website</option>
                    <option value="PORTAL">Portal</option>
                    <option value="DIRECT_CALL">Phone Call</option>
                    <option value="REFERRAL">Referral</option>
                    <option value="WALK_IN">Walk-in</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <UserCheck className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <ChevronDown className="pointer-events-none absolute top-2.5 right-3 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            <hr className="my-4 border-slate-100" />

            {/* Property Requirements Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                Property Requirements
              </h3>

              {/* Purpose Segmented Control matching Screenshot */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Purpose</label>
                <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setPurpose('BUY')}
                    className={`flex-1 cursor-pointer rounded-lg px-3 py-1.5 text-center text-xs font-semibold transition-all ${
                      purpose === 'BUY'
                        ? 'border border-slate-200 bg-white font-bold text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setPurpose('RENT')}
                    className={`flex-1 cursor-pointer rounded-lg px-3 py-1.5 text-center text-xs font-semibold transition-all ${
                      purpose === 'RENT'
                        ? 'border border-slate-200 bg-white font-bold text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Rent
                  </button>
                  <button
                    type="button"
                    onClick={() => setPurpose('INVESTMENT')}
                    className={`flex-1 cursor-pointer rounded-lg px-3 py-1.5 text-center text-xs font-semibold transition-all ${
                      purpose === 'INVESTMENT' || purpose === 'INVEST'
                        ? 'border border-slate-200 bg-white font-bold text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Invest
                  </button>
                </div>
              </div>

              {/* Budget Range with Currency prefix */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Budget Range
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute top-2 left-3 text-xs font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={budgetMin}
                      onChange={(e) =>
                        setBudgetMin(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="Min"
                      step="100000"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-3 pl-7 text-xs text-slate-900 outline-hidden transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-400">-</span>
                  <div className="relative flex-1">
                    <span className="absolute top-2 left-3 text-xs font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={budgetMax}
                      onChange={(e) =>
                        setBudgetMax(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="Max"
                      step="100000"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-3 pl-7 text-xs text-slate-900 outline-hidden transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                  <span>
                    Min: ₹{typeof budgetMin === 'number' ? (budgetMin / 100000).toFixed(0) : '0'}{' '}
                    Lakhs
                  </span>
                  <span>
                    Max: ₹{typeof budgetMax === 'number' ? (budgetMax / 100000).toFixed(0) : '0'}{' '}
                    Lakhs
                  </span>
                </div>
              </div>

              {/* Location Tags matching Screenshot */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Preferred Location(s)
                </label>
                <div className="flex min-h-[42px] flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 transition-all focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
                  {locationTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(tag)}
                        className="cursor-pointer transition-colors hover:text-rose-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={handleAddLocation}
                    placeholder="Add location..."
                    className="min-w-[120px] flex-1 border-none bg-transparent p-0 text-xs text-slate-900 outline-hidden placeholder:text-slate-400 focus:ring-0"
                  />
                </div>
              </div>

              {/* Property Type Radio Cards matching Screenshot */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Property Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['APARTMENT', 'VILLA', 'COMMERCIAL'] as PropertyType[]).map((type) => {
                    const isSelected = propertyType === type;
                    const label =
                      type === 'APARTMENT'
                        ? 'Apartment'
                        : type === 'VILLA'
                          ? 'Villa'
                          : 'Commercial';

                    return (
                      <label
                        key={type}
                        onClick={() => setPropertyType(type)}
                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-2.5 text-center text-xs font-semibold transition-colors ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 text-blue-700 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="property_type"
                          checked={isSelected}
                          onChange={() => setPropertyType(type)}
                          className="sr-only"
                        />
                        <span>{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Configuration (BHK) Pills matching Screenshot */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Configuration
                </label>
                <div className="flex flex-wrap gap-2">
                  {['1BHK', '2BHK', '3BHK', '4BHK+'].map((opt) => {
                    const isSelected = bhk === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setBhk(opt)}
                        className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 font-bold text-blue-700 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <hr className="my-4 border-slate-100" />

            {/* Additional Details Section matching Screenshot */}
            <div className="space-y-4 pb-2">
              <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                Additional Details
              </h3>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Timeline / Urgency
                </label>
                <div className="relative">
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as LeadUrgency)}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2 pr-8 pl-3.5 text-xs font-medium text-slate-800 outline-hidden transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="IMMEDIATE">Immediate (0-30 days)</option>
                    <option value="WITHIN_1_MONTH">Within 3 months</option>
                    <option value="WITHIN_3_MONTHS">Within 6 months</option>
                    <option value="EXPLORING">Just browsing</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-2.5 right-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Assign To</label>
                <div className="relative">
                  <select
                    value={assignedAgentId}
                    onChange={(e) => setAssignedAgentId(e.target.value)}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2 pr-8 pl-3.5 text-xs font-medium text-slate-800 outline-hidden transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="">Unassigned (Pool)</option>
                    {agents.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name} ({ag.role})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-2.5 right-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any specific requirements or conversation notes..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-hidden transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions & Live Match Preview matching Screenshot */}
        <div className="flex shrink-0 flex-col gap-2.5 border-t border-slate-200 bg-white p-4 shadow-[0_-4px_10px_rgba(30,41,59,0.02)]">
          {/* Live Match Preview banner */}
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 fill-emerald-600 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-800">
                Matches found: 14 properties
              </span>
            </div>
            <span className="cursor-pointer text-xs font-bold text-emerald-700 hover:underline">
              View
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="lead-form"
              disabled={isSubmitting}
              className="flex-1 cursor-pointer rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : lead ? 'Update Lead' : 'Save Lead'}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
