'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  Building,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { PostPropertyMapping, Property } from '@/types';

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

export default function PostMappingsManagementPage() {
  const [mappings, setMappings] = useState<PostPropertyMapping[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Notifications
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setErrorMessage(null);
      const [mappingsRes, propsRes] = await Promise.all([
        apiClient.get<any>(API_ENDPOINTS.POST_MAPPINGS.LIST),
        apiClient.get<any>(API_ENDPOINTS.PROPERTIES.LIST),
      ]);

      if (mappingsRes && 'data' in mappingsRes && Array.isArray(mappingsRes.data)) {
        setMappings(mappingsRes.data);
      } else if (Array.isArray(mappingsRes)) {
        setMappings(mappingsRes);
      } else {
        setMappings([]);
      }

      if (Array.isArray(propsRes)) {
        setProperties(propsRes);
        if (propsRes.length > 0 && !selectedPropertyId) {
          setSelectedPropertyId(propsRes[0].id);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load post-property mappings.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedPropertyId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void fetchData();
  };

  const handleCreateMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId || !instagramUrl.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await apiClient.post(API_ENDPOINTS.POST_MAPPINGS.CREATE, {
        propertyId: selectedPropertyId,
        instagramMediaIdOrUrl: instagramUrl.trim(),
      });

      setInstagramUrl('');
      setSuccessMessage('Instagram post linked to property successfully!');
      await fetchData();

      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Failed to link post. Check URL format and ensure it is not already linked.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await apiClient.delete(API_ENDPOINTS.POST_MAPPINGS.DELETE(id));
      setSuccessMessage('Mapping removed successfully.');
      await fetchData();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to remove mapping.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatInstagramUrl = (mediaId: string): string => {
    if (mediaId.startsWith('http://') || mediaId.startsWith('https://')) {
      return mediaId;
    }
    return `https://www.instagram.com/p/${mediaId}/`;
  };

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const filteredMappings = mappings.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const propTitle = m.property?.title?.toLowerCase() || '';
    const propLoc = m.property?.location?.toLowerCase() || '';
    const mediaId = m.instagramMediaId.toLowerCase();
    return propTitle.includes(q) || propLoc.includes(q) || mediaId.includes(q);
  });

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/properties"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Properties</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50 text-pink-600 border border-pink-100">
              <InstagramIcon className="h-4 w-4" />
            </span>
            <span>Instagram Post-to-Property Links</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Correlate published Instagram posts and reels to property listings in your catalog.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors w-fit"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50/80 p-3 text-xs text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {/* Grid: Create Form on Left, List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs sticky top-24">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-blue-600" />
              <span>Link New Post / Reel</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Select a property and paste the Instagram post URL or media ID.
            </p>

            <form onSubmit={handleCreateMapping} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Target Property
                </label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 transition-colors"
                  required
                >
                  <option value="" disabled>
                    Select a property listing
                  </option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Instagram Post / Reel URL
                </label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/C_12345/ or media ID"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 transition-colors"
                  required
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Paste the public link after publishing the reel or post.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedPropertyId || !instagramUrl.trim()}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving Mapping...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    <span>Save Link</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Existing Mappings List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Active Linked Posts ({filteredMappings.length})
                </h2>
                <p className="text-xs text-slate-500">
                  All active correlations across your property portfolio.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search property or media ID..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                <p className="text-xs">Loading mappings...</p>
              </div>
            ) : filteredMappings.length === 0 ? (
              <div className="py-12 text-center text-slate-400 rounded-lg border border-dashed border-slate-200 bg-slate-50/50">
                <InstagramIcon className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">No linked posts found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {searchQuery ? 'No links match your search query.' : 'Use the form on the left to link your first Instagram post.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredMappings.map((mapping) => {
                  const postUrl = formatInstagramUrl(mapping.instagramMediaId);
                  const isDeleting = deletingId === mapping.id;

                  return (
                    <div
                      key={mapping.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/60 transition-colors rounded-lg px-2"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-600 border border-pink-100 mt-0.5">
                          <InstagramIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-slate-900 truncate">
                              {mapping.instagramMediaId}
                            </span>
                            <a
                              href={postUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <span>View Post</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                            <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <Link
                              href={`/properties/${mapping.propertyId}`}
                              className="font-semibold text-slate-800 hover:text-blue-600 truncate"
                            >
                              {mapping.property?.title || `Property (${mapping.propertyId.slice(0, 8)})`}
                            </Link>
                            {mapping.property?.location && (
                              <span className="text-slate-400 text-[11px]">
                                • {mapping.property.location}
                              </span>
                            )}
                          </div>

                          <p className="text-[10px] text-slate-400 mt-1">
                            Linked on {formatDate(mapping.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleDelete(mapping.id)}
                          disabled={isDeleting}
                          title="Remove Link"
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          <span>Unlink</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
