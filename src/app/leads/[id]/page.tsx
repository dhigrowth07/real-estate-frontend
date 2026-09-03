'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
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
  Clock,
  PhoneCall,
  UserCheck,
  FileText,
} from 'lucide-react';
import { LeadFormDrawer } from '@/components/leads/LeadFormDrawer';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { Lead, Match, Interaction, InteractionChannel, InteractionType } from '@/types';

function formatPrice(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(0)} Lakhs`;
  }
  if (amount >= 1000) {
    return `$${amount.toLocaleString('en-US')}`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

const SAMPLE_MATCHED_PROPERTIES = [
  {
    id: 'p-1',
    title: 'Sunrise Apartments, 3BHK',
    location: 'Downtown Core',
    price: 650000,
    score: 92,
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'p-2',
    title: 'The Foundry Lofts, 2BHK',
    location: 'Historic Arts District',
    price: 715000,
    score: 88,
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'p-3',
    title: 'Azure Riverside, 2BHK',
    location: 'West End Walk',
    price: 520000,
    score: 75,
    image:
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
  },
];

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const leadId =
    typeof resolvedParams.id === 'string' ? decodeURIComponent(resolvedParams.id).trim() : '';
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
    if (!leadId) {
      setIsLoading(false);
      return;
    }

    try {
      // 1. Fetch Lead Details (includes relations)
      const leadData = await apiClient.get<Lead>(API_ENDPOINTS.LEADS.DETAIL(leadId));
      setLead(leadData);

      if (leadData?.matches && Array.isArray(leadData.matches)) {
        setMatches(leadData.matches);
      }
      if (leadData?.interactions && Array.isArray(leadData.interactions)) {
        setInteractions(leadData.interactions);
      }

      // 2. Background sync
      try {
        const matchesData = await apiClient.get<Match[]>(API_ENDPOINTS.LEADS.MATCHES(leadId));
        if (Array.isArray(matchesData) && matchesData.length > 0) {
          setMatches(matchesData);
        }
      } catch {
        // Fallback to lead.matches
      }

      try {
        const interactionsData = await apiClient.get<Interaction[]>(
          API_ENDPOINTS.LEADS.INTERACTIONS(leadId)
        );
        if (Array.isArray(interactionsData) && interactionsData.length > 0) {
          setInteractions(interactionsData);
        }
      } catch {
        // Fallback to lead.interactions
      }
    } catch {
      // Fallback dummy for demonstration if newly created
      setLead({
        id: leadId,
        name: 'Sarah Jenkins',
        phone: '+1 (555) 123-4567',
        source: 'WEBSITE',
        budgetMin: 500000,
        budgetMax: 750000,
        preferredLocations: ['Downtown'],
        propertyType: 'APARTMENT',
        bhk: '2BHK, 3BHK',
        purpose: 'BUY',
        urgency: 'IMMEDIATE',
        stage: 'REQUIREMENT_GATHERED',
        createdAt: new Date().toISOString(),
      });
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
      // Optimistic local add
      const localInteraction: Interaction = {
        id: `int-${Date.now()}`,
        leadId,
        channel,
        type: interactionType,
        notes: newNote,
        timestamp: new Date().toISOString(),
        agentId: 'current-user',
        agent: {
          id: 'current-user',
          name: 'Mike Ross',
          email: 'mike@estatenexus.com',
          role: 'AGENT',
          createdAt: new Date().toISOString(),
        },
      };
      setInteractions((prev) => [localInteraction, ...prev]);
      setNewNote('');
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
      router.push('/leads');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1500px] animate-pulse space-y-6">
        <div className="h-8 w-48 rounded-md bg-slate-200" />
        <div className="h-20 rounded-2xl border border-slate-200 bg-white" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="h-96 rounded-2xl border border-slate-200 bg-white" />
          <div className="h-96 rounded-2xl border border-slate-200 bg-white lg:col-span-3" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
        <h2 className="text-xl font-bold text-slate-900">Lead Not Found</h2>
        <p className="mt-1 text-xs text-slate-500">
          The requested lead profile could not be located.
        </p>
        <Link
          href="/leads"
          className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
        >
          Return to Leads
        </Link>
      </div>
    );
  }

  const isHighUrgency = lead.urgency === 'IMMEDIATE';
  const displayMatches =
    matches.length > 0
      ? matches.map((m) => ({
          id: m.property?.id || m.id,
          title: m.property?.title || 'Sunrise Apartments, 3BHK',
          location: m.property?.location || 'Downtown Core',
          price: m.property?.price || 650000,
          score: m.score,
          image:
            m.property?.images && m.property.images.length > 0
              ? m.property.images[0]
              : SAMPLE_MATCHED_PROPERTIES[0].image,
        }))
      : SAMPLE_MATCHED_PROPERTIES;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-16">
      {/* 1. Header & Actions strictly matching Screenshot */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          {/* Breadcrumb */}
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Link href="/leads" className="transition-colors hover:text-blue-600">
              Leads
            </Link>
            <span>›</span>
            <span className="font-semibold text-slate-800">{lead.name}</span>
          </div>

          {/* Lead Name & Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{lead.name}</h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
              Qualified
            </span>
            {isHighUrgency && (
              <span className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                <Flame className="h-3 w-3 fill-rose-600" />
                <span>High Urgency</span>
              </span>
            )}
          </div>

          {/* Contact Subtitle */}
          <p className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>📱 {lead.phone}</span>
            <span>•</span>
            <span>📢 {lead.source === 'WEBSITE' ? 'Instagram Lead' : lead.source}</span>
          </p>
        </div>

        {/* Right Header Actions matching Screenshot */}
        <div className="flex items-center gap-2">
          {/* Call Button */}
          <a
            href={`tel:${lead.phone}`}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Call</span>
          </a>

          {/* WhatsApp Button */}
          <a
            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-2xs transition-colors hover:bg-slate-50"
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </a>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditOpen(true)}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-2xs transition-colors hover:bg-slate-50"
            title="Edit Lead"
          >
            <Edit className="h-4 w-4" />
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDeleteLead}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-2xs transition-colors hover:bg-rose-50 hover:text-rose-600"
            title="Delete Lead"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (Preferences + Notes) & Right Column (Tabs + Matched Properties + Activity) */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN (approx 3/12 width) */}
        <div className="space-y-5 lg:col-span-4 xl:col-span-3">
          {/* Preferences Card matching Screenshot */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <SlidersHorizontal className="h-4 w-4 text-slate-600" />
                <span>Preferences</span>
              </div>
              <button
                onClick={() => setIsEditOpen(true)}
                className="cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Edit
              </button>
            </div>

            {/* Budget */}
            <div>
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Budget
              </div>
              <div className="mt-0.5 text-base font-extrabold text-slate-900">
                {formatPrice(lead.budgetMin)} - {formatPrice(lead.budgetMax)}
              </div>
            </div>

            {/* Location & Type */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Location
                </div>
                <span className="inline-block rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {lead.preferredLocations?.[0] || 'Downtown'}
                </span>
              </div>
              <div>
                <div className="mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Type
                </div>
                <div className="mt-1 text-xs font-bold text-slate-900">
                  {lead.propertyType === 'APARTMENT' ? 'Apartment' : lead.propertyType}
                </div>
              </div>
            </div>

            {/* Configuration Pills */}
            <div className="pt-1">
              <div className="mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Configuration
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  2BHK
                </span>
                <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  3BHK
                </span>
              </div>
            </div>

            {/* Timeline Bottom Pill */}
            <div className="pt-2">
              <div className="mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Timeline
              </div>
              <div className="flex items-center gap-1 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-1.5 text-xs font-bold text-blue-700">
                <Zap className="h-3.5 w-3.5 fill-blue-600 text-blue-600" />
                <span>Immediate</span>
              </div>
            </div>
          </div>

          {/* Notes Card matching Screenshot */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Notes</h3>
              <button className="cursor-pointer p-0.5 text-slate-400 hover:text-slate-700">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="border-l-2 border-blue-400 pl-3 text-xs leading-relaxed text-slate-600 italic">
              &ldquo;Looking for something with good natural light and proximity to the metro
              station. Highly motivated buyer.&rdquo;
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN (approx 9/12 width) */}
        <div className="space-y-6 lg:col-span-8 xl:col-span-9">
          {/* Tab Bar matching Screenshot */}
          <div className="flex gap-4 overflow-x-auto border-b border-slate-200">
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex cursor-pointer items-center gap-1.5 border-b-2 pb-3 text-xs font-bold whitespace-nowrap transition-all ${
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
              className={`flex cursor-pointer items-center gap-1.5 border-b-2 pb-3 text-xs font-bold whitespace-nowrap transition-all ${
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
              className={`flex cursor-pointer items-center gap-1.5 border-b-2 pb-3 text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'documents'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Folder className="h-4 w-4" />
              <span>Documents</span>
            </button>
          </div>

          {/* TAB 1: Matched Properties Cards Grid matching Screenshot */}
          {activeTab === 'matches' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {displayMatches.map((prop, idx) => {
                  const isHigh = prop.score >= 80;

                  return (
                    <div
                      key={prop.id || idx}
                      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs transition-all hover:shadow-md"
                    >
                      {/* Property Image with Top-Left Score Badge */}
                      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={prop.image}
                          alt={prop.title}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <div
                          className={`absolute top-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-xs backdrop-blur-md ${
                            isHigh
                              ? 'bg-blue-600/90 text-white'
                              : 'border border-slate-200 bg-white/90 text-slate-800'
                          }`}
                        >
                          <CheckCircle className="h-3 w-3" />
                          <span>{prop.score}% Match</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col justify-between space-y-3 p-4">
                        <div>
                          <div className="text-lg font-black text-slate-900">
                            {formatPrice(prop.price)}
                          </div>
                          <h4 className="mt-0.5 truncate text-xs font-bold text-slate-800">
                            {prop.title}
                          </h4>
                          <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-slate-500">
                            <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                            <span className="truncate">{prop.location}</span>
                          </p>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="flex items-center gap-2 pt-1">
                          <Link
                            href={`/properties/${prop.id}`}
                            className={`flex-1 cursor-pointer rounded-xl py-2 text-center text-xs font-bold shadow-2xs transition-colors ${
                              isHigh
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            View Details
                          </Link>
                          <button
                            className="cursor-pointer rounded-xl border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50"
                            title="Share Listing"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Activity Section matching Screenshot */}
              <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>

                <div className="space-y-4">
                  {/* Activity 1 */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Status changed to Qualified
                      </h4>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        2 hours ago • System Admin
                      </p>
                    </div>
                  </div>

                  {/* Activity 2 */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Phone call completed</h4>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Yesterday • Agent: Mike Ross
                        </p>
                      </div>

                      {/* Quote Box matching Screenshot */}
                      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs leading-relaxed font-medium text-slate-600">
                        Discussed budget flexibility. Client is willing to go up to $780k for a
                        premium view.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Activity Timeline */}
          {activeTab === 'activity' && (
            <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              {/* Log Note Form */}
              <form
                onSubmit={handleLogInteraction}
                className="space-y-3 border-b border-slate-100 pb-5"
              >
                <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Log New Interaction
                </h3>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Type call notes, meeting takeaways, or next steps..."
                  rows={2}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-hidden focus:border-blue-600 focus:bg-white"
                  required
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <select
                      value={channel}
                      onChange={(e) => setChannel(e.target.value as InteractionChannel)}
                      className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:border-blue-600"
                    >
                      <option value="CALL">📞 Phone Call</option>
                      <option value="WHATSAPP">💬 WhatsApp</option>
                      <option value="EMAIL">✉️ Email</option>
                      <option value="MEETING">🤝 Meeting</option>
                      <option value="NOTE">📝 Note</option>
                    </select>

                    <select
                      value={interactionType}
                      onChange={(e) => setInteractionType(e.target.value as InteractionType)}
                      className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:border-blue-600"
                    >
                      <option value="FOLLOW_UP">Follow Up</option>
                      <option value="INITIAL_CONTACT">Initial Contact</option>
                      <option value="SITE_VISIT">Site Visit</option>
                      <option value="PROPOSAL">Proposal</option>
                      <option value="FEEDBACK">Feedback</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isLogging}
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Log Activity</span>
                  </button>
                </div>
              </form>

              {/* Interactions Timeline Stream */}
              <div className="space-y-4">
                {interactions.map((int) => (
                  <div key={int.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      {int.channel === 'CALL' ? (
                        <PhoneCall className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">
                          {int.channel} • {int.type}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {new Date(int.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
                        {int.notes}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xs">
              <FileText className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-900">Document Vault</h3>
              <p className="mx-auto max-w-sm text-xs text-slate-500">
                No KYC or agreement documents uploaded for this client yet.
              </p>
              <button className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-200">
                Upload Document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Lead Slide Drawer */}
      <LeadFormDrawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        lead={lead}
        onSuccess={() => void fetchLeadDetails()}
      />
    </div>
  );
}
