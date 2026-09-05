'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  Send,
  Building,
  User,
  Phone,
  ExternalLink,
  Loader2,
  RefreshCw,
  Clock,
  Check,
  CheckCheck,
  Sparkles,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { Conversation, Message, ChannelType, Property } from '@/types';
import { getImageUrl } from '@/lib/utils';

// Lightweight inline icons for channels
function WhatsAppIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function InstagramIcon({ className = 'h-4 w-4' }: { className?: string }) {
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

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [channelFilter, setChannelFilter] = useState<'ALL' | ChannelType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reply Composer State
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Conversations List
  const fetchConversations = useCallback(
    async (preserveSelection = true) => {
      try {
        const params: Record<string, string> = {};
        if (channelFilter !== 'ALL') {
          params.channel = channelFilter;
        }
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        const res = await apiClient.get<Conversation[]>(
          API_ENDPOINTS.CONVERSATIONS.LIST,
          params
        );
        const list = Array.isArray(res) ? res : [];
        setConversations(list);

        // Auto-select first conversation if none selected
        if ((!preserveSelection || !selectedConvId) && list.length > 0) {
          setSelectedConvId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setIsLoadingList(false);
        setIsRefreshing(false);
      }
    },
    [channelFilter, searchQuery, selectedConvId]
  );

  // 2. Fetch Single Conversation Detail & Messages
  const fetchConversationDetail = useCallback(async (convId: string) => {
    setIsLoadingDetail(true);
    try {
      const data = await apiClient.get<Conversation>(
        API_ENDPOINTS.CONVERSATIONS.DETAIL(convId)
      );
      setActiveConversation(data);

      // Mark as read in background
      try {
        await apiClient.patch(API_ENDPOINTS.CONVERSATIONS.MARK_READ(convId), {});
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
        );
      } catch {
        // Silently ignore mark-read errors
      }
    } catch (err) {
      console.error('Failed to load conversation detail:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  // Initial list load
  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchConversations(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchConversations]);

  // Load detail whenever selected conversation changes
  useEffect(() => {
    if (selectedConvId) {
      void fetchConversationDetail(selectedConvId);
    } else {
      setActiveConversation(null);
    }
  }, [selectedConvId, fetchConversationDetail]);

  // Auto-scroll chat thread to bottom on new message
  useEffect(() => {
    if (activeConversation?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void fetchConversations(true);
    if (selectedConvId) {
      void fetchConversationDetail(selectedConvId);
    }
  };

  // Send Reply
  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedConvId || !replyText.trim() || isSending) return;

    const textToSend = replyText.trim();
    setIsSending(true);
    setSendError(null);

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      conversationId: selectedConvId,
      direction: 'OUTBOUND',
      rawText: textToSend,
      messageType: 'TEXT',
      status: 'SENT',
      createdAt: new Date().toISOString(),
    };

    setActiveConversation((prev) =>
      prev
        ? {
            ...prev,
            messages: [...(prev.messages || []), optimisticMsg],
            updatedAt: new Date().toISOString(),
          }
        : prev
    );
    setReplyText('');

    try {
      const savedMsg = await apiClient.post<Message>(
        API_ENDPOINTS.CONVERSATIONS.SEND_MESSAGE(selectedConvId),
        { rawText: textToSend }
      );

      // Replace optimistic message with actual DB record
      setActiveConversation((prev) =>
        prev
          ? {
              ...prev,
              messages: (prev.messages || []).map((m) =>
                m.id === tempId ? savedMsg : m
              ),
            }
          : prev
      );

      // Update list preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConvId
            ? {
                ...c,
                lastMessage: savedMsg,
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
    } catch (err: any) {
      setSendError(err?.message || 'Failed to send reply. Please try again.');
      // Revert optimistic message on error
      setActiveConversation((prev) =>
        prev
          ? {
              ...prev,
              messages: (prev.messages || []).filter((m) => m.id !== tempId),
            }
          : prev
      );
      setReplyText(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendReply();
    }
  };

  // Helper to determine display name
  const getLeadDisplayName = (conv: Conversation): string => {
    if (conv.lead?.name && conv.lead.name.trim()) {
      return conv.lead.name;
    }
    if (conv.channel === 'INSTAGRAM') {
      return 'Unknown — Instagram';
    }
    return conv.externalId ? `WhatsApp (${conv.externalId})` : 'Unknown — WhatsApp';
  };

  // Determine linked property from lead or mapping
  const linkedProperty: Property | undefined = activeConversation?.lead?.interestedProperty;

  return (
    <div className="mx-auto max-w-[1600px] h-[calc(100vh-100px)] flex flex-col space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <span>Conversation Inbox</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Omnichannel messaging center for WhatsApp and Instagram direct inquiries.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Split Layout: 35% Left List | 65% Right Chat Panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Left Pane: Conversation List (4 cols on lg, 12 on mobile) */}
        <div className="lg:col-span-5 xl:col-span-4 border-r border-slate-200 flex flex-col h-full bg-slate-50/40">
          
          {/* Top Search & Filter Bar */}
          <div className="p-3.5 border-b border-slate-200 bg-white space-y-3 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads, phone, or message..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setChannelFilter('ALL')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  channelFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Channels
              </button>
              <button
                type="button"
                onClick={() => setChannelFilter('WHATSAPP')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  channelFilter === 'WHATSAPP'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setChannelFilter('INSTAGRAM')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  channelFilter === 'INSTAGRAM'
                    ? 'bg-white text-pink-700 shadow-2xs'
                    : 'text-slate-600 hover:text-pink-700'
                }`}
              >
                <InstagramIcon className="h-3.5 w-3.5 text-pink-600" />
                <span>Instagram</span>
              </button>
            </div>
          </div>

          {/* Conversations Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoadingList ? (
              <div className="py-16 text-center text-slate-400">
                <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                <p className="text-xs">Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-16 px-4 text-center text-slate-400">
                <MessageSquare className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">No conversations yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Incoming DMs from Instagram and WhatsApp webhook messages will appear here in real-time.
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = selectedConvId === conv.id;
                const displayName = getLeadDisplayName(conv);
                const isWhatsApp = conv.channel === 'WHATSAPP';
                const hasUnread = (conv.unreadCount || 0) > 0;
                const lastText =
                  conv.lastMessage?.rawText || 'Started conversation';

                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-blue-600'
                        : 'hover:bg-slate-100/60 bg-white'
                    }`}
                  >
                    {/* Channel Avatar */}
                    <div
                      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        isWhatsApp
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-pink-100 text-pink-700 border border-pink-200'
                      }`}
                    >
                      {isWhatsApp ? (
                        <WhatsAppIcon className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <InstagramIcon className="h-5 w-5 text-pink-600" />
                      )}

                      {/* Small Channel Indicator Badge */}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white ${
                          isWhatsApp ? 'bg-emerald-500' : 'bg-pink-500'
                        }`}
                      >
                        {isWhatsApp ? (
                          <WhatsAppIcon className="h-2.5 w-2.5 text-white" />
                        ) : (
                          <InstagramIcon className="h-2.5 w-2.5 text-white" />
                        )}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {displayName}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                          {formatTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-slate-500 truncate font-normal">
                          {conv.lastMessage?.direction === 'OUTBOUND' && (
                            <span className="font-semibold text-slate-700 mr-1">You:</span>
                          )}
                          {lastText}
                        </p>

                        {hasUnread && (
                          <span className="shrink-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Phone or ID tag */}
                      {conv.externalId && (
                        <p className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                          {conv.externalId}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Conversation Detail Panel & Chat Thread */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full bg-white">
          {isLoadingDetail ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-xs font-semibold">Loading message thread...</span>
            </div>
          ) : !activeConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="h-12 w-12 text-slate-200 mb-3" />
              <h3 className="text-sm font-bold text-slate-700">Select a Conversation</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Choose a conversation from the left to view the live chat thread and send instant replies.
              </p>
            </div>
          ) : (
            <>
              {/* Detail Header */}
              <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      activeConversation.channel === 'WHATSAPP'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-pink-100 text-pink-700'
                    }`}
                  >
                    {activeConversation.channel === 'WHATSAPP' ? (
                      <WhatsAppIcon className="h-5 w-5" />
                    ) : (
                      <InstagramIcon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-sm text-slate-900 truncate">
                        {getLeadDisplayName(activeConversation)}
                      </h2>
                      {activeConversation.lead?.stage && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                          {activeConversation.lead.stage.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                      <span className="font-mono text-[11px]">{activeConversation.externalId}</span>
                      {activeConversation.lead?.id && (
                        <>
                          <span>•</span>
                          <Link
                            href={`/leads/${activeConversation.lead.id}`}
                            className="text-blue-600 hover:underline inline-flex items-center gap-0.5 font-semibold text-[11px]"
                          >
                            <span>Lead Profile</span>
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2">
                  {activeConversation.channel === 'WHATSAPP' && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>24h Session Active</span>
                    </div>
                  )}

                  {activeConversation.lead?.whatsappOptIn && (
                    <div className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      <span>Opted-in</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Linked Property Banner (if any) */}
              {linkedProperty && (
                <div className="mx-4 mt-3 p-3 rounded-lg border border-blue-200 bg-blue-50/50 flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-slate-200 border border-slate-300">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getImageUrl(linkedProperty.images?.[0])}
                        alt={linkedProperty.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                          Inquired Property
                        </span>
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {linkedProperty.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {formatPrice(linkedProperty.price)} • {linkedProperty.location}{' '}
                        {linkedProperty.bhk && `• ${linkedProperty.bhk}`}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/properties/${linkedProperty.id}`}
                    className="shrink-0 flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-2xs"
                  >
                    <span>View</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}

              {/* Messages Chat Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
                {(!activeConversation.messages || activeConversation.messages.length === 0) ? (
                  <div className="py-12 text-center text-slate-400">
                    <p className="text-xs">No messages recorded in this conversation yet.</p>
                  </div>
                ) : (
                  activeConversation.messages.map((msg) => {
                    const isInbound = msg.direction === 'INBOUND';
                    const isTemplate = msg.messageType === 'TEMPLATE';
                    const isAutoReply = msg.messageType === 'AUTO_REPLY';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          isInbound ? 'items-start' : 'items-end'
                        }`}
                      >
                        {/* Message Bubble Container */}
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-2xs transition-all ${
                            isInbound
                              ? 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs'
                              : 'bg-blue-600 text-white rounded-tr-xs'
                          }`}
                        >
                          {/* Type Badges */}
                          {isTemplate && (
                            <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-200">
                              <Sparkles className="h-3 w-3" />
                              <span>Brochure Template</span>
                            </div>
                          )}

                          {isAutoReply && (
                            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-blue-200">
                              Auto-Reply
                            </div>
                          )}

                          {/* Message Content */}
                          <p className="text-xs leading-relaxed whitespace-pre-wrap select-text font-normal">
                            {msg.rawText}
                          </p>

                          {/* Time & Delivery Status Footer */}
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

              {/* Reply Box Composer */}
              <div className="p-3 border-t border-slate-200 bg-white shrink-0">
                {sendError && (
                  <div className="mb-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800">
                    <AlertCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />
                    <span>{sendError}</span>
                  </div>
                )}

                <form onSubmit={handleSendReply} className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Type reply to ${getLeadDisplayName(activeConversation)}... (Press Enter to send, Shift+Enter for new line)`}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-hidden transition-colors"
                      disabled={isSending}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending || !replyText.trim()}
                    className="flex shrink-0 h-10 px-4 items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    {isSending ? (
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
