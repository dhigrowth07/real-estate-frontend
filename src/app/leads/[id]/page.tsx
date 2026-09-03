'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Phone,
  MessageSquare,
  Mail,
  Building2,
  Sparkles,
  Calendar,
  Edit,
  Trash2,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MatchScoreBadge } from '@/components/ui/MatchScoreBadge';
import { StatusPill } from '@/components/ui/StatusPill';
import { LeadFormDrawer } from '@/components/leads/LeadFormDrawer';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import {
  Lead,
  Match,
  Interaction,
  InteractionChannel,
  InteractionType,
  MatchStatus,
} from '@/types';

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const leadId = resolvedParams.id;
  const router = useRouter();

  const [lead, setLead] = useState<Lead | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [activeTab, setActiveTab] = useState<'matches' | 'activity' | 'specs'>('matches');
  const [isLoading, setIsLoading] = useState(true);

  // Edit Drawer
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Log interaction form
  const [newNote, setNewNote] = useState('');
  const [channel, setChannel] = useState<InteractionChannel>('CALL');
  const [interactionType, setInteractionType] = useState<InteractionType>('FOLLOW_UP');
  const [isLogging, setIsLogging] = useState(false);

  const fetchLeadDetails = useCallback(async () => {
    try {
      const [leadData, matchesData, interactionsData] = await Promise.all([
        apiClient.get<Lead>(API_ENDPOINTS.LEADS.DETAIL(leadId)),
        apiClient.get<Match[]>(API_ENDPOINTS.LEADS.MATCHES(leadId)),
        apiClient.get<Interaction[]>(API_ENDPOINTS.LEADS.INTERACTIONS(leadId)),
      ]);
      setLead(leadData);
      setMatches(Array.isArray(matchesData) ? matchesData : []);
      setInteractions(Array.isArray(interactionsData) ? interactionsData : []);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchLeadDetails();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchLeadDetails]);

  const handleMatchStatusChange = async (matchId: string, newStatus: MatchStatus) => {
    try {
      await apiClient.patch(API_ENDPOINTS.MATCHES.UPDATE_STATUS(matchId), {
        status: newStatus,
      });
      setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, status: newStatus } : m)));
    } catch {
      // Error
    }
  };

  const handleLogInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setIsLogging(true);
      const created = await apiClient.post<Interaction>(API_ENDPOINTS.LEADS.INTERACTIONS(leadId), {
        channel,
        type: interactionType,
        notes: newNote,
      });
      setInteractions((prev) => [created, ...prev]);
      setNewNote('');
    } catch {
      // Error
    } finally {
      setIsLogging(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await apiClient.delete(API_ENDPOINTS.LEADS.DELETE(leadId));
      router.push('/leads');
    } catch {
      alert('Failed to delete lead.');
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded-lg bg-slate-200" />
        <div className="h-44 rounded-2xl border border-slate-200 bg-white" />
        <div className="h-80 rounded-2xl border border-slate-200 bg-white" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-slate-900">Lead Not Found</h2>
        <p className="mt-1 text-xs text-slate-500">
          The requested lead profile could not be located.
        </p>
        <Link href="/leads" className="mt-4 inline-block">
          <Button variant="primary" size="sm">
            Return to Leads
          </Button>
        </Link>
      </div>
    );
  }

  const initials = lead.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link
          href="/leads"
          className="flex items-center gap-1 transition-colors hover:text-blue-600"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Leads</span>
        </Link>
        <span>/</span>
        <span className="font-bold text-slate-900">{lead.name}</span>
      </div>

      {/* Profile Header Summary Card */}
      <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-md shadow-blue-500/20">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900">{lead.name}</h1>
                <StatusPill status={lead.stage} />
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  <Sparkles className="h-3 w-3" />
                  <span>{matches.length} Matches</span>
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Looking for {lead.bhk ? `${lead.bhk} ` : ''}
                {lead.propertyType?.toLowerCase()} in{' '}
                {lead.preferredLocations?.join(', ') || 'Any Location'} • Added on{' '}
                {new Date(lead.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`tel:${lead.phone}`}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition-colors hover:bg-slate-50"
            >
              <Phone className="h-3.5 w-3.5 text-blue-600" />
              <span>Call</span>
            </a>
            <a
              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition-colors hover:bg-slate-50"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-1"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteLead}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Quick Details Bar */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-xs sm:grid-cols-4">
          <div>
            <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Phone
            </span>
            <span className="mt-0.5 block font-bold text-slate-900">{lead.phone}</span>
          </div>
          <div>
            <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Budget Range
            </span>
            <span className="mt-0.5 block font-bold text-slate-900">
              ₹{(lead.budgetMin / 100000).toFixed(0)}L - ₹{(lead.budgetMax / 100000).toFixed(0)}L
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Assigned Agent
            </span>
            <span className="mt-0.5 block font-bold text-slate-900">
              {lead.assignedAgent?.name || 'Unassigned'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Urgency
            </span>
            <span className="mt-0.5 block font-bold text-slate-900 capitalize">
              {lead.urgency?.toLowerCase().replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <div className="flex gap-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('matches')}
          className={`flex cursor-pointer items-center gap-2 border-b-2 pb-3 text-sm font-bold transition-colors ${
            activeTab === 'matches'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Matched Properties ({matches.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex cursor-pointer items-center gap-2 border-b-2 pb-3 text-sm font-bold transition-colors ${
            activeTab === 'activity'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Activity & Interactions ({interactions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('specs')}
          className={`flex cursor-pointer items-center gap-2 border-b-2 pb-3 text-sm font-bold transition-colors ${
            activeTab === 'specs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Requirements & Specs</span>
        </button>
      </div>

      {/* Tab 1: Matched Properties */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {matches.length === 0 ? (
            <Card className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
              <Sparkles className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <h3 className="text-base font-bold text-slate-900">No Matched Properties Yet</h3>
              <p className="mx-auto mt-1 max-w-md text-xs text-slate-400">
                The matching engine recalculates compatibility when properties are added or lead
                preferences are updated.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {matches.map((match) => (
                <Card
                  key={match.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-colors hover:border-blue-500"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                        {match.property?.propertyType} • {match.property?.bhk}
                      </span>
                      <h3 className="mt-0.5 text-base font-bold text-slate-900">
                        {match.property?.title}
                      </h3>
                      <p className="mt-0.5 text-xs font-semibold text-blue-700">
                        ₹{((match.property?.price || 0) / 100000).toFixed(0)} Lakhs •{' '}
                        {match.property?.location}
                      </p>
                    </div>
                    <MatchScoreBadge score={match.score} size="lg" />
                  </div>

                  {/* Match Status Controls */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-semibold text-slate-500">
                      Status:{' '}
                      <strong className="tracking-wide text-slate-900 uppercase">
                        {match.status}
                      </strong>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleMatchStatusChange(match.id, 'NOTIFIED')}
                        className="cursor-pointer rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 transition-colors hover:bg-blue-100"
                        title="Mark Notified"
                      >
                        Notified
                      </button>
                      <button
                        onClick={() => handleMatchStatusChange(match.id, 'VIEWED')}
                        className="cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
                        title="Mark Viewed"
                      >
                        Viewed
                      </button>
                      <button
                        onClick={() => handleMatchStatusChange(match.id, 'DISMISSED')}
                        className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-500 transition-colors hover:bg-slate-100"
                        title="Dismiss"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Activity & Interactions */}
      {activeTab === 'activity' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left 2 Cols: Timeline */}
          <div className="space-y-4 lg:col-span-2">
            <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="mb-4 text-base font-bold text-slate-900">Interaction Timeline</h3>
              {interactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No touchpoints logged yet. Log your first note or client call on the right.
                </div>
              ) : (
                <div className="space-y-4">
                  {interactions.map((interaction) => (
                    <div
                      key={interaction.id}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                        {interaction.channel === 'CALL' ? (
                          <Phone className="h-4 w-4" />
                        ) : interaction.channel === 'WHATSAPP' ? (
                          <MessageSquare className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">
                            {interaction.channel} • {interaction.type}
                          </span>
                          <span className="text-slate-400">
                            {new Date(interaction.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-slate-700">
                          {interaction.notes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right 1 Col: Log Interaction Form */}
          <div>
            <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="mb-4 text-base font-bold text-slate-900">Log Touchpoint</h3>
              <form onSubmit={handleLogInteraction} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as InteractionChannel)}
                    className="h-9.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  >
                    <option value="CALL">Phone Call</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="EMAIL">Email</option>
                    <option value="MEETING">In Person / Site Visit</option>
                    <option value="NOTE">Internal Note</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Interaction Type
                  </label>
                  <select
                    value={interactionType}
                    onChange={(e) => setInteractionType(e.target.value as InteractionType)}
                    className="h-9.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  >
                    <option value="INITIAL_CONTACT">Initial Contact</option>
                    <option value="FOLLOW_UP">Follow Up</option>
                    <option value="SITE_VISIT">Site Visit Completed</option>
                    <option value="PROPOSAL">Proposal / Negotiation</option>
                    <option value="FEEDBACK">Feedback</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Notes & Outcome
                  </label>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                    placeholder="Discussed budget flexibility and scheduled site visit for Saturday..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full font-bold shadow-md shadow-blue-500/20"
                  isLoading={isLogging}
                >
                  <Send className="mr-1 h-3.5 w-3.5" />
                  <span>Log Interaction</span>
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 3: Requirements & Specs */}
      {activeTab === 'specs' && (
        <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h3 className="mb-4 text-base font-bold text-slate-900">Buyer / Tenant Specifications</h3>
          <div className="grid grid-cols-1 gap-6 text-xs sm:grid-cols-2 md:grid-cols-3">
            <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Property Type
              </span>
              <p className="text-sm font-bold text-slate-900">{lead.propertyType}</p>
            </div>
            <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                BHK Configuration
              </span>
              <p className="text-sm font-bold text-slate-900">{lead.bhk || 'Not specified'}</p>
            </div>
            <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Purpose
              </span>
              <p className="text-sm font-bold text-slate-900 capitalize">
                {lead.purpose?.toLowerCase()}
              </p>
            </div>
            <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Budget Range
              </span>
              <p className="text-sm font-bold text-slate-900">
                ₹{(lead.budgetMin / 100000).toFixed(0)}L - ₹{(lead.budgetMax / 100000).toFixed(0)}L
              </p>
            </div>
            <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Preferred Locations
              </span>
              <p className="text-sm font-bold text-slate-900">
                {lead.preferredLocations?.join(', ') || 'Any Location'}
              </p>
            </div>
            <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Timeline Urgency
              </span>
              <p className="text-sm font-bold text-slate-900 capitalize">
                {lead.urgency?.toLowerCase().replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Edit Lead Drawer */}
      <LeadFormDrawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        lead={lead}
        onSuccess={() => void fetchLeadDetails()}
      />
    </div>
  );
}
