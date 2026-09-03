'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Phone,
  MessageSquare,
  Building2,
  Calendar,
  Folder,
  Edit,
  Trash2,
  Share2,
  CheckCircle,
  Flame,
  Zap,
  SlidersHorizontal,
  MapPin,
  Plus,
  Send,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import { LeadFormDrawer } from '@/components/leads/LeadFormDrawer';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { Lead, Match, Interaction, InteractionChannel, InteractionType } from '@/types';

function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(0)} Lakhs`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

const SAMPLE_PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
];

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const leadId = resolvedParams.id;
  const router = useRouter();

  const [lead, setLead] = useState<Lead | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [activeTab, setActiveTab] = useState<'matches' | 'activity' | 'documents'>('matches');
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
      <div className="animate-pulse space-y-6 p-4">
        <div className="h-6 w-36 rounded-md bg-slate-200" />
        <div className="h-10 w-64 rounded-md bg-slate-200" />
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="h-96 rounded-xl border border-slate-200 bg-white lg:col-span-4" />
          <div className="h-96 rounded-xl border border-slate-200 bg-white lg:col-span-8" />
        </div>
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
          <button className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white">
            Return to Leads
          </button>
        </Link>
      </div>
    );
  }

  // Display matched properties (live or visual defaults from reference)
  const displayMatches =
    matches.length > 0
      ? matches
      : [
          {
            id: 'sample-1',
            leadId: lead.id,
            score: 92,
            status: 'NEW' as const,
            createdAt: new Date().toISOString(),
            property: {
              id: 'p1',
              title: 'Sunrise Apartments, 3BHK',
              location: 'Downtown Core',
              price: 6500000,
              propertyType: 'APARTMENT' as const,
              bhk: '3BHK',
              status: 'AVAILABLE' as const,
              createdAt: new Date().toISOString(),
            },
          },
          {
            id: 'sample-2',
            leadId: lead.id,
            score: 88,
            status: 'NEW' as const,
            createdAt: new Date().toISOString(),
            property: {
              id: 'p2',
              title: 'The Foundry Lofts, 2BHK',
              location: 'Historic Arts District',
              price: 7150000,
              propertyType: 'APARTMENT' as const,
              bhk: '2BHK',
              status: 'AVAILABLE' as const,
              createdAt: new Date().toISOString(),
            },
          },
          {
            id: 'sample-3',
            leadId: lead.id,
            score: 75,
            status: 'NEW' as const,
            createdAt: new Date().toISOString(),
            property: {
              id: 'p3',
              title: 'Azure Riverside, 2BHK',
              location: 'West End Walk',
              price: 5200000,
              propertyType: 'APARTMENT' as const,
              bhk: '2BHK',
              status: 'AVAILABLE' as const,
              createdAt: new Date().toISOString(),
            },
          },
        ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {/* Page Header matching Screenshot & HTML */}
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div className="flex flex-col gap-1">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Link href="/leads" className="transition-colors hover:text-blue-600">
              Leads
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900">{lead.name}</span>
          </div>

          {/* Title & Badges Row */}
          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {lead.name}
            </h1>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-blue-200 bg-blue-100/70 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                Qualified
              </span>
              <span className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                <Flame className="h-3.5 w-3.5 fill-rose-600 text-rose-600" />
                <span>High Urgency</span>
              </span>
            </div>
          </div>

          {/* Contact and Source Subtitle */}
          <p className="mt-0.5 flex items-center gap-2 text-xs font-medium text-slate-500">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            <span>{lead.phone}</span>
            <span className="opacity-40">•</span>
            <span className="capitalize">
              {lead.source?.toLowerCase().replace(/_/g, ' ') || 'Website'} Lead
            </span>
          </p>
        </div>

        {/* Action Buttons matching Screenshot */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`tel:${lead.phone}`}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Call</span>
          </a>
          <a
            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-xs transition-colors hover:bg-slate-50"
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </a>

          <div className="mx-1 hidden h-6 w-[1px] bg-slate-200 sm:block" />

          <button
            onClick={() => setIsEditOpen(true)}
            aria-label="Edit Lead"
            className="cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-xs transition-colors hover:bg-slate-50 hover:text-blue-600"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={handleDeleteLead}
            aria-label="Delete Lead"
            className="cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-xs transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content Grid: 1:3 Ratio (4 Cols Left, 8 Cols Right) */}
      <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Preferences Card & Notes Card */}
        <div className="flex flex-col gap-5 lg:col-span-4 xl:col-span-3">
          {/* Property Preferences Card */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                <span>Preferences</span>
              </h2>
              <button
                onClick={() => setIsEditOpen(true)}
                className="cursor-pointer text-xs font-semibold text-blue-600 hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="flex flex-col gap-4 p-4">
              {/* Budget */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Budget
                </span>
                <span className="text-base font-bold text-slate-900">
                  {formatCurrency(lead.budgetMin)} - {formatCurrency(lead.budgetMax)}
                </span>
              </div>

              {/* Location & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    Location
                  </span>
                  <span className="inline-block w-max rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">
                    {lead.preferredLocations?.[0] || 'Downtown'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    Type
                  </span>
                  <span className="text-xs font-semibold text-slate-800 capitalize">
                    {lead.propertyType?.toLowerCase() || 'Apartment'}
                  </span>
                </div>
              </div>

              {/* Configuration */}
              <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Configuration
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    {lead.bhk || '2BHK'}
                  </span>
                  <span className="rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    3BHK
                  </span>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex flex-col gap-1 rounded-lg border border-blue-100/60 bg-blue-50/50 p-3">
                <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  Timeline
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-blue-700 capitalize">
                  <Zap className="h-3.5 w-3.5 fill-blue-600 text-blue-600" />
                  <span>{lead.urgency?.toLowerCase().replace(/_/g, ' ') || 'Immediate'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Notes Section Card */}
          <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4">
              <h2 className="text-sm font-bold text-slate-900">Notes</h2>
              <button
                onClick={() => setIsEditOpen(true)}
                className="cursor-pointer rounded-md p-1 text-slate-500 hover:bg-slate-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="border-l-2 border-blue-400 pl-3 text-xs leading-relaxed text-slate-600 italic">
                &ldquo;Looking for something with good natural light and proximity to the metro
                station. Highly motivated buyer.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Right / Main Column */}
        <div className="flex flex-col gap-4 lg:col-span-8 xl:col-span-9">
          {/* Tab Bar matching Screenshot */}
          <div className="flex gap-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex cursor-pointer items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
                activeTab === 'matches'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Matched Properties</span>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex cursor-pointer items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
                activeTab === 'activity'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Activity Timeline</span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex cursor-pointer items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
                activeTab === 'documents'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Folder className="h-4 w-4" />
              <span>Documents</span>
            </button>
          </div>

          {/* TAB 1: Matched Properties (Hero 3-Card Grid matching Screenshot) */}
          {activeTab === 'matches' && (
            <div className="mt-1 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {displayMatches.map((match, idx) => {
                const prop = match.property;
                const isHighMatch = match.score >= 80;
                const imageUrl = SAMPLE_PROPERTY_IMAGES[idx % SAMPLE_PROPERTY_IMAGES.length];

                return (
                  <div
                    key={match.id}
                    className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-shadow hover:shadow-md"
                  >
                    {/* Image Container with Match Score Badge */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt={prop?.title || 'Property'}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Match Badge Overlay */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/95 px-2.5 py-1 shadow-xs backdrop-blur-xs">
                        <CheckCircle
                          className={`h-3.5 w-3.5 ${
                            isHighMatch ? 'text-blue-600' : 'text-amber-600'
                          }`}
                        />
                        <span
                          className={`text-xs font-bold ${
                            isHighMatch ? 'text-blue-700' : 'text-amber-700'
                          }`}
                        >
                          {match.score}% Match
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col gap-2.5 p-4">
                      <div>
                        <div className="text-xl font-bold text-slate-900">
                          {formatCurrency(prop?.price || 6500000)}
                        </div>
                        <h3 className="mt-0.5 text-sm leading-tight font-bold text-slate-900">
                          {prop?.title || 'Sunrise Apartments, 3BHK'}
                        </h3>
                        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{prop?.location || 'Downtown Core'}</span>
                        </p>
                      </div>

                      {/* Actions row */}
                      <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-3">
                        <Link
                          href="/properties"
                          className={`flex-1 rounded-lg px-3 py-1.5 text-center text-xs font-semibold transition-colors ${
                            isHighMatch
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'border border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200'
                          }`}
                        >
                          View Details
                        </Link>
                        <button
                          aria-label="Share with Lead"
                          className="cursor-pointer rounded-lg border border-slate-200 p-1.5 text-slate-600 transition-colors hover:border-blue-500 hover:text-blue-600"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: Activity Timeline */}
          {activeTab === 'activity' && (
            <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
              </div>

              {/* Connected Timeline */}
              <div className="relative ml-3 flex flex-col gap-6 border-l-2 border-slate-200 py-1 pl-5">
                {/* Timeline Item 1 */}
                <div className="relative">
                  <div className="absolute -left-[27px] rounded-full border-4 border-white bg-blue-100 p-1">
                    <UserCheck className="h-3.5 w-3.5 text-blue-700" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-900">
                      Status changed to Qualified
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      2 hours ago • System Admin
                    </span>
                  </div>
                </div>

                {/* Timeline Item 2 */}
                <div className="relative">
                  <div className="absolute -left-[27px] rounded-full border-4 border-white bg-slate-100 p-1">
                    <PhoneCall className="h-3.5 w-3.5 text-slate-700" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-900">Phone call completed</span>
                    <span className="text-[11px] font-medium text-slate-400">
                      Yesterday • Agent: Sarah Agent
                    </span>
                    <p className="mt-1 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-600">
                      Discussed budget flexibility. Client is willing to go up to ₹78 Lakhs for a
                      premium high floor view.
                    </p>
                  </div>
                </div>

                {/* Timeline Item 3 */}
                <div className="relative">
                  <div className="absolute -left-[27px] rounded-full border-4 border-white bg-emerald-100 p-1">
                    <Plus className="h-3.5 w-3.5 text-emerald-700" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-900">
                      Lead created from {lead.source}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      3 days ago • Automated Integration
                    </span>
                  </div>
                </div>

                {/* Dynamic Interactions Log */}
                {interactions.map((interaction) => (
                  <div key={interaction.id} className="relative">
                    <div className="absolute -left-[27px] rounded-full border-4 border-white bg-blue-100 p-1">
                      <MessageSquare className="h-3.5 w-3.5 text-blue-700" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-900">
                        {interaction.channel} • {interaction.type}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {new Date(interaction.timestamp).toLocaleString()}
                      </span>
                      <p className="mt-0.5 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-600">
                        {interaction.notes}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Log Touchpoint Form */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="mb-3 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Log New Touchpoint
                </h4>
                <form onSubmit={handleLogInteraction} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={channel}
                      onChange={(e) => setChannel(e.target.value as InteractionChannel)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-900 outline-hidden"
                    >
                      <option value="CALL">Phone Call</option>
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="EMAIL">Email</option>
                      <option value="MEETING">In Person</option>
                      <option value="NOTE">Internal Note</option>
                    </select>
                    <select
                      value={interactionType}
                      onChange={(e) => setInteractionType(e.target.value as InteractionType)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-900 outline-hidden"
                    >
                      <option value="INITIAL_CONTACT">Initial Contact</option>
                      <option value="FOLLOW_UP">Follow Up</option>
                      <option value="SITE_VISIT">Site Visit</option>
                      <option value="PROPOSAL">Proposal</option>
                      <option value="FEEDBACK">Feedback</option>
                    </select>
                  </div>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={2}
                    placeholder="Enter touchpoint outcome or notes..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-hidden"
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLogging}
                      className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Log Note</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs">
              <Folder className="mx-auto h-8 w-8 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-800">No Documents Uploaded</h3>
              <p className="mx-auto max-w-sm text-xs text-slate-400">
                Buyer requirement sheets, KYC documents, and agreement drafts will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

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
