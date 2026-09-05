'use client';

import React, { useEffect, useState, useCallback, use, useRef } from 'react';
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
  Sparkles,
  ExternalLink,
  Check,
  CheckCheck,
  Loader2,
  AlertCircle,
  Globe,
  Radio,
} from 'lucide-react';
import { LeadFormDrawer } from '@/components/leads/LeadFormDrawer';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import {
  Lead,
  Match,
  Interaction,
  InteractionChannel,
  InteractionType,
  Conversation,
  Message,
} from '@/types';
import { getImageUrl } from '@/lib/utils';

// Lightweight Channel Icons
function WhatsAppIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function InstagramIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function formatPrice(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(0)} Lakhs`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatTime(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const leadId =
    typeof resolvedParams.id === 'string' ? decodeURIComponent(resolvedParams.id).trim() : '';
  const router = useRouter();

  const [lead, setLead] = useState<Lead | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  const [activeTab, setActiveTab] = useState<'matches' | 'conversations' | 'activity' | 'documents'>('matches');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Edit Drawer
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Log interaction form
  const [newNote, setNewNote] = useState('');
  const [channel, setChannel] = useState<InteractionChannel>('CALL');
  const [interactionType, setInteractionType] = useState<InteractionType>('FOLLOW_UP');
  const [isLogging, setIsLogging] = useState(false);

  // Conversations Reply State
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversationsForLead = useCallback(async (lId: string) => {
    try {
      const res = await apiClient.get<Conversation[]>(
        API_ENDPOINTS.CONVERSATIONS.LIST,
        { leadId: lId }
      );
      const convs = Array.isArray(res) ? res : [];
      setConversations(convs);
      if (convs.length > 0) {
        setSelectedConvId((prev) => prev || convs[0].id);
      }
    } catch {
      setConversations([]);
    }
  }, []);

  const fetchConversationDetail = useCallback(async (convId: string) => {
    setIsLoadingMessages(true);
    try {
      const data = await apiClient.get<Conversation>(
        API_ENDPOINTS.CONVERSATIONS.DETAIL(convId)
      );
      setActiveConversation(data);
    } catch {
      setActiveConversation(null);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

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

      // 2. Fetch conversations
      void fetchConversationsForLead(leadId);

      // 3. Background sync
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
      setLead(null);
    } finally {
      setIsLoading(false);
    }
  }, [leadId, fetchConversationsForLead]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchLeadDetails();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchLeadDetails]);

  // Load detailed conversation when selected
  useEffect(() => {
    if (selectedConvId) {
      void fetchConversationDetail(selectedConvId);
    }
  }, [selectedConvId, fetchConversationDetail]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (activeTab === 'conversations' && activeConversation?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, activeConversation?.messages]);

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
      setNewNote('');
    } finally {
      setIsLogging(false);
    }
  };

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedConvId || !replyText.trim() || isSendingReply) return;

    const text = replyText.trim();
    setIsSendingReply(true);
    setReplyError(null);

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      conversationId: selectedConvId,
      direction: 'OUTBOUND',
      rawText: text,
      messageType: 'TEXT',
      status: 'SENT',
      createdAt: new Date().toISOString(),
    };

    setActiveConversation((prev) =>
      prev
        ? {
            ...prev,
            messages: [...(prev.messages || []), optimisticMsg],
          }
        : prev
    );
    setReplyText('');

    try {
      const savedMsg = await apiClient.post<Message>(
        API_ENDPOINTS.CONVERSATIONS.SEND_MESSAGE(selectedConvId),
        { rawText: text }
      );

      setActiveConversation((prev) =>
        prev
          ? {
              ...prev,
              messages: (prev.messages || []).map((m) => (m.id === tempId ? savedMsg : m)),
            }
          : prev
      );
      void fetchLeadDetails();
    } catch (err: any) {
      setReplyError(err?.message || 'Failed to send reply.');
      setActiveConversation((prev) =>
        prev
          ? {
              ...prev,
              messages: (prev.messages || []).filter((m) => m.id !== tempId),
            }
          : prev
      );
      setReplyText(text);
    } finally {
      setIsSendingReplyReply: false as any;
      setIsSendingReply(false);
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
  const displayMatches = matches.map((m) => ({
    id: m.property?.id || m.id,
    title: m.property?.title || 'Listing',
    location: m.property?.location || 'City',
    price: m.property?.price || 0,
    score: m.score,
    isExplicit: m.isExplicit,
    image:
      m.property?.images && m.property.images.length > 0
        ? m.property.images[0]
        : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  }));

  // Unique sources array with fallback
  const allSources =
    lead.sources && lead.sources.length > 0
      ? Array.from(new Set(lead.sources))
      : [lead.source || 'WEBSITE'];

  const interestedProp = lead.interestedProperty;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-16">
      {/* 1. Header & Actions with Multi-Channel Source Badges */}
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
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{lead.name}</h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
              {lead.stage.replace(/_/g, ' ')}
            </span>
            {isHighUrgency && (
              <span className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                <Flame className="h-3 w-3 fill-rose-600" />
                <span>High Urgency</span>
              </span>
            )}
            {lead.whatsappOptIn && (
              <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                <WhatsAppIcon className="h-3 w-3 text-emerald-600" />
                <span>Opted-In</span>
              </span>
            )}
          </div>

          {/* Contact & Omnichannel Sources Row */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
            {lead.phone && (
              <span className="flex items-center gap-1 font-mono text-slate-700">
                <span>📱 {lead.phone}</span>
              </span>
            )}
            {lead.email && <span>✉️ {lead.email}</span>}

            {/* Omnichannel Source Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 text-[11px]">Sources:</span>
              {allSources.map((src) => {
                const isWa = src.toUpperCase().includes('WHATSAPP');
                const isIg = src.toUpperCase().includes('INSTAGRAM');

                if (isWa) {
                  return (
                    <span
                      key={src}
                      className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 shadow-2xs"
                    >
                      <WhatsAppIcon className="h-3 w-3 text-emerald-600" />
                      <span>WhatsApp</span>
                    </span>
                  );
                }

                if (isIg) {
                  return (
                    <span
                      key={src}
                      className="inline-flex items-center gap-1 rounded-md border border-pink-200 bg-pink-50 px-2 py-0.5 text-[11px] font-bold text-pink-700 shadow-2xs"
                    >
                      <InstagramIcon className="h-3 w-3 text-pink-600" />
                      <span>Instagram</span>
                    </span>
                  );
                }

                return (
                  <span
                    key={src}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                  >
                    <Globe className="h-3 w-3 text-slate-400" />
                    <span>{src.replace(/_/g, ' ')}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          {lead.phone && (
            <>
              <a
                href={`tel:${lead.phone}`}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Call</span>
              </a>

              <a
                href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 shadow-2xs transition-colors hover:bg-emerald-100"
              >
                <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            </>
          )}

          <button
            onClick={() => setIsEditOpen(true)}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-2xs transition-colors hover:bg-slate-50"
            title="Edit Lead"
          >
            <Edit className="h-4 w-4" />
          </button>

          <button
            onClick={handleDeleteLead}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-2xs transition-colors hover:bg-rose-50 hover:text-rose-600"
            title="Delete Lead"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column & Right Column */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Preferences + Notes */}
        <div className="space-y-5 lg:col-span-4 xl:col-span-3">
          {/* Preferences Card */}
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

            {/* Configuration */}
            <div className="pt-1">
              <div className="mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Configuration
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  {lead.bhk || '2BHK / 3BHK'}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="pt-2">
              <div className="mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Timeline
              </div>
              <div className="flex items-center gap-1 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-1.5 text-xs font-bold text-blue-700">
                <Zap className="h-3.5 w-3.5 fill-blue-600 text-blue-600" />
                <span>{lead.urgency.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>

          {/* Quick Notes Card */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Notes</h3>
              <button
                onClick={() => setActiveTab('activity')}
                className="cursor-pointer p-0.5 text-slate-400 hover:text-slate-700"
                title="Add Note"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {interactions.find((i) => i.channel === 'NOTE' || i.notes) ? (
              <p className="border-l-2 border-blue-400 pl-3 text-xs leading-relaxed text-slate-600 italic">
                &ldquo;{interactions.find((i) => i.channel === 'NOTE' || i.notes)?.notes}&rdquo;
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No notes added yet.</p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Prominent Interested Property + Tabs */}
        <div className="space-y-6 lg:col-span-8 xl:col-span-9">
          
          {/* Prominent Original Interested Property Card */}
          {interestedProp && (
            <div className="overflow-hidden rounded-2xl border-2 border-indigo-200 bg-linear-to-r from-indigo-50/70 via-blue-50/40 to-white p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-indigo-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-2xs">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Original Property of Interest
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      This lead originated from a direct inquiry on this listing.
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 w-fit">
                  Direct Inquiry (Score: 100%)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="relative h-24 w-full sm:w-36 shrink-0 overflow-hidden rounded-xl bg-slate-200 border border-slate-300 shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getImageUrl(interestedProp.images?.[0])}
                    alt={interestedProp.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-base text-slate-900 truncate">
                        {interestedProp.title}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{interestedProp.location}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-extrabold text-indigo-700">
                        {formatPrice(interestedProp.price)}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {interestedProp.propertyType}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-slate-600">
                    {interestedProp.bhk && (
                      <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {interestedProp.bhk}
                      </span>
                    )}
                    {interestedProp.sqft && (
                      <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {interestedProp.sqft.toLocaleString()} sqft
                      </span>
                    )}
                    <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {interestedProp.possessionStatus?.replace(/_/g, ' ') || 'Ready to Move'}
                    </span>

                    <Link
                      href={`/properties/${interestedProp.id}`}
                      className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      <span>View Listing</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
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
              <span>Matched Properties ({displayMatches.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('conversations')}
              className={`flex cursor-pointer items-center gap-1.5 border-b-2 pb-3 text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'conversations'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>
                Conversations ({conversations.length})
              </span>
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
              <span>Activity Timeline ({interactions.length})</span>
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

          {/* TAB 1: Matched Properties Cards Grid */}
          {activeTab === 'matches' && (
            <div className="space-y-6">
              {displayMatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                  <Building2 className="mb-2 h-8 w-8 text-slate-300" />
                  <p className="text-xs font-bold text-slate-700">No Matched Properties Yet</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Properties matching this lead&apos;s budget and criteria will automatically
                    appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {displayMatches.map((prop, idx) => {
                    const isExplicit = prop.isExplicit;
                    const isHigh = prop.score >= 80;

                    return (
                      <div
                        key={prop.id || idx}
                        className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-2xs transition-all hover:shadow-md ${
                          isExplicit
                            ? 'border-indigo-300 ring-2 ring-indigo-100'
                            : 'border-slate-200'
                        }`}
                      >
                        {/* Property Image with Score Badge */}
                        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getImageUrl(prop.image)}
                            alt={prop.title}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                          <div
                            className={`absolute top-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-xs backdrop-blur-md ${
                              isExplicit
                                ? 'bg-indigo-600 text-white'
                                : isHigh
                                ? 'bg-blue-600/90 text-white'
                                : 'border border-slate-200 bg-white/90 text-slate-800'
                            }`}
                          >
                            {isExplicit ? (
                              <>
                                <Sparkles className="h-3 w-3" />
                                <span>Direct Inquiry</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                <span>{prop.score}% Match</span>
                              </>
                            )}
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

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-1">
                            <Link
                              href={`/properties/${prop.id}`}
                              className={`flex-1 cursor-pointer rounded-xl py-2 text-center text-xs font-bold shadow-2xs transition-colors ${
                                isExplicit
                                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                  : isHigh
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
              )}
            </div>
          )}

          {/* TAB 2: Scoped Conversations Chat Thread */}
          {activeTab === 'conversations' && (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
              {conversations.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <MessageSquare className="mx-auto h-10 w-10 text-slate-200 mb-2" />
                  <h4 className="text-xs font-bold text-slate-700">No Chat History Found</h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    Incoming DMs from Instagram or WhatsApp messages from this lead will appear here automatically.
                  </p>
                </div>
              ) : (
                <>
                  {/* Channel Switcher Tabs if multiple channels exist */}
                  {conversations.length > 1 && (
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Channels:
                      </span>
                      {conversations.map((c) => {
                        const isSelected = selectedConvId === c.id;
                        const isWa = c.channel === 'WHATSAPP';

                        return (
                          <button
                            key={c.id}
                            onClick={() => setSelectedConvId(c.id)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              isSelected
                                ? isWa
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-pink-100 text-pink-800 border border-pink-300'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {isWa ? <WhatsAppIcon /> : <InstagramIcon />}
                            <span>{c.channel}</span>
                            <span className="font-mono text-[10px] text-slate-400">
                              ({c.externalId})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Chat Container */}
                  <div className="h-[420px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                    {isLoadingMessages ? (
                      <div className="h-full flex items-center justify-center text-slate-400">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span className="text-xs">Loading message thread...</span>
                      </div>
                    ) : !activeConversation?.messages || activeConversation.messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                        No messages in this channel yet.
                      </div>
                    ) : (
                      activeConversation.messages.map((msg) => {
                        const isInbound = msg.direction === 'INBOUND';
                        const isTemplate = msg.messageType === 'TEMPLATE';

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${
                              isInbound ? 'items-start' : 'items-end'
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-2xs ${
                                isInbound
                                  ? 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs'
                                  : 'bg-blue-600 text-white rounded-tr-xs'
                              }`}
                            >
                              {isTemplate && (
                                <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-200">
                                  <Sparkles className="h-3 w-3" />
                                  <span>Brochure Template</span>
                                </div>
                              )}
                              <p className="text-xs leading-relaxed whitespace-pre-wrap select-text font-normal">
                                {msg.rawText}
                              </p>
                              <div
                                className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                                  isInbound ? 'text-slate-400' : 'text-blue-200'
                                }`}
                              >
                                <span>{formatTime(msg.createdAt)}</span>
                                {!isInbound && (
                                  <span>
                                    {msg.status === 'READ' ? (
                                      <CheckCheck className="h-3 w-3 text-sky-200 inline" />
                                    ) : msg.status === 'DELIVERED' ? (
                                      <CheckCheck className="h-3 w-3 text-blue-200 inline" />
                                    ) : (
                                      <Check className="h-3 w-3 text-blue-200 inline" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply Input Box */}
                  {selectedConvId && (
                    <div className="pt-2">
                      {replyError && (
                        <div className="mb-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800">
                          <AlertCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />
                          <span>{replyError}</span>
                        </div>
                      )}

                      <form onSubmit={handleSendReply} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply to ${lead.name} on ${activeConversation?.channel || 'chat'}...`}
                          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-hidden"
                          disabled={isSendingReply}
                        />
                        <button
                          type="submit"
                          disabled={isSendingReply || !replyText.trim()}
                          className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {isSendingReply ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="h-3.5 w-3.5" />
                              <span>Send</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 3: Activity Timeline */}
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

          {/* TAB 4: Documents */}
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
