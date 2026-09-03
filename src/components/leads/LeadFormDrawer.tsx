'use client';

import React, { useState, useEffect } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
  const [budgetMin, setBudgetMin] = useState<number>(5000000);
  const [budgetMax, setBudgetMax] = useState<number>(10000000);
  const [preferredLocations, setPreferredLocations] = useState<string>('Downtown, Westside');
  const [urgency, setUrgency] = useState<LeadUrgency>('WITHIN_1_MONTH');
  const [stage, setStage] = useState<LeadStage>('NEW');
  const [assignedAgentId, setAssignedAgentId] = useState<string>('');

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
        setPreferredLocations(lead.preferredLocations?.join(', ') || '');
        setUrgency(lead.urgency || 'WITHIN_1_MONTH');
        setStage(lead.stage || 'NEW');
        setAssignedAgentId(lead.assignedAgentId || '');
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
        setPreferredLocations('Downtown, Westside');
        setUrgency('WITHIN_1_MONTH');
        setStage('NEW');
        setAssignedAgentId('');
      }
    }, 0);
    return () => clearTimeout(t);
  }, [isOpen, lead]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !phone) {
      setError('Lead Name and Phone Number are required.');
      return;
    }

    const locationsArray = preferredLocations
      .split(',')
      .map((loc) => loc.trim())
      .filter(Boolean);

    const payload = {
      name,
      phone,
      email: email || undefined,
      source,
      purpose,
      propertyType,
      bhk,
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      preferredLocations: locationsArray,
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

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={lead ? 'Edit Lead' : 'Add New Lead'}
      description={
        lead
          ? 'Update client preferences, stage, and assigned agent.'
          : 'Record a new buyer or tenant inquiry to run automated property matching.'
      }
      width="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {error}
          </div>
        )}

        {/* Section 1: Contact Information */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                Full Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Jenkins"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                Phone Number *
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@gmail.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                Lead Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-hidden"
              >
                <option value="WEBSITE">Website</option>
                <option value="PORTAL">Real Estate Portal</option>
                <option value="REFERRAL">Referral</option>
                <option value="DIRECT_CALL">Direct Call</option>
                <option value="WALK_IN">Walk-in</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Property Preferences */}
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Property Requirements & Budget
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                Purpose
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as LeadPurpose)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-hidden"
              >
                <option value="BUY">Buy</option>
                <option value="RENT">Rent</option>
                <option value="INVESTMENT">Investment</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                Property Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-hidden"
              >
                <option value="APARTMENT">Apartment</option>
                <option value="VILLA">Villa</option>
                <option value="PLOT">Plot / Land</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="INDEPENDENT_HOUSE">Independent House</option>
                <option value="PENTHOUSE">Penthouse</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                BHK Configuration
              </label>
              <select
                value={bhk}
                onChange={(e) => setBhk(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-hidden"
              >
                <option value="1BHK">1 BHK</option>
                <option value="2BHK">2 BHK</option>
                <option value="3BHK">3 BHK</option>
                <option value="4BHK">4 BHK</option>
                <option value="5BHK+">5 BHK+</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                Budget Min (₹)
              </label>
              <Input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(Number(e.target.value))}
                step="100000"
                required
              />
              <span className="mt-0.5 block text-[11px] text-slate-400">
                ₹{(budgetMin / 100000).toFixed(0)} Lakhs
              </span>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                Budget Max (₹)
              </label>
              <Input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                step="100000"
                required
              />
              <span className="mt-0.5 block text-[11px] text-slate-400">
                ₹{(budgetMax / 100000).toFixed(0)} Lakhs
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold tracking-wider text-slate-700 uppercase">
              Preferred Locations (comma separated)
            </label>
            <Input
              value={preferredLocations}
              onChange={(e) => setPreferredLocations(e.target.value)}
              placeholder="Downtown, Westside, Indiranagar"
            />
          </div>
        </div>

        {/* Section 3: Status & Team Assignment */}
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Pipeline & Assignment
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                Urgency
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as LeadUrgency)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-hidden"
              >
                <option value="IMMEDIATE">Immediate</option>
                <option value="WITHIN_1_MONTH">Within 1 Month</option>
                <option value="WITHIN_3_MONTHS">Within 3 Months</option>
                <option value="EXPLORING">Exploring</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                Pipeline Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as LeadStage)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-hidden"
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="REQUIREMENT_GATHERED">Requirement Gathered</option>
                <option value="SITE_VISIT_SCHEDULED">Site Visit Scheduled</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="CLOSED_WON">Closed Won</option>
                <option value="CLOSED_LOST">Closed Lost</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                Assigned Agent
              </label>
              <select
                value={assignedAgentId}
                onChange={(e) => setAssignedAgentId(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-hidden"
              >
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="font-bold shadow-md shadow-blue-500/20"
            isLoading={isSubmitting}
          >
            {lead ? 'Update Lead' : 'Create & Match Lead'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
