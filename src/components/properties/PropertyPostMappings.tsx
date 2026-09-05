'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Link2,
  Plus,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { PostPropertyMapping } from '@/types';

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

interface PropertyPostMappingsProps {
  propertyId: string;
  propertyTitle?: string;
}

interface PostMappingsApiResponse {
  data: PostPropertyMapping[];
  total: number;
  page: number;
  limit: number;
}

export function PropertyPostMappings({
  propertyId,
  propertyTitle,
}: PropertyPostMappingsProps) {
  const [mappings, setMappings] = useState<PostPropertyMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [urlOrMediaId, setUrlOrMediaId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchMappings = useCallback(async () => {
    if (!propertyId) return;
    try {
      setErrorMessage(null);
      const res = await apiClient.get<PostMappingsApiResponse | PostPropertyMapping[]>(
        API_ENDPOINTS.POST_MAPPINGS.BY_PROPERTY(propertyId)
      );
      if (res && 'data' in res && Array.isArray(res.data)) {
        setMappings(res.data);
      } else if (Array.isArray(res)) {
        setMappings(res);
      } else {
        setMappings([]);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load linked Instagram posts.');
      setMappings([]);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchMappings();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchMappings]);

  const handleCreateMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = urlOrMediaId.trim();
    if (!input) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await apiClient.post(API_ENDPOINTS.POST_MAPPINGS.CREATE, {
        propertyId,
        instagramMediaIdOrUrl: input,
      });

      setUrlOrMediaId('');
      setSuccessMessage('Instagram post linked successfully!');
      await fetchMappings();

      // Clear success banner after 4 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          'Failed to link post. Ensure the URL is valid and not already linked.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMapping = async (mappingId: string) => {
    setDeletingId(mappingId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await apiClient.delete(API_ENDPOINTS.POST_MAPPINGS.DELETE(mappingId));
      setSuccessMessage('Link removed successfully.');
      await fetchMappings();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to remove linked Instagram post.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatInstagramUrl = (mediaId: string): string => {
    if (mediaId.startsWith('http://') || mediaId.startsWith('https://')) {
      return mediaId;
    }
    // If it is a standard alphanumeric shortcode or ID
    return `https://www.instagram.com/p/${mediaId}/`;
  };

  const formatDate = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-50 text-pink-600 border border-pink-100">
            <InstagramIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Linked Instagram Posts & Reels
            </h3>
            <p className="text-xs text-slate-500">
              Incoming comments on linked posts automatically correlate to{' '}
              <span className="font-semibold text-slate-700">
                {propertyTitle || 'this property'}
              </span>
              .
            </p>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 w-fit">
          {mappings.length} Linked {mappings.length === 1 ? 'Post' : 'Posts'}
        </span>
      </div>

      {/* Error / Success Feedback Alerts */}
      {errorMessage && (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50/80 p-3 text-xs text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {/* Link Form */}
      <form onSubmit={handleCreateMapping} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Link2 className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={urlOrMediaId}
              onChange={(e) => setUrlOrMediaId(e.target.value)}
              placeholder="Paste Instagram post URL (e.g. https://www.instagram.com/p/C_abc123/) or media ID"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 transition-colors"
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !urlOrMediaId.trim()}
            className="flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Linking...</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>Link Post</span>
              </>
            )}
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-400">
          Supports full Instagram URLs (
          <code className="text-slate-600 font-mono">/p/</code>,{' '}
          <code className="text-slate-600 font-mono">/reel/</code>) or raw Meta
          media IDs.
        </p>
      </form>

      {/* Linked Posts List */}
      <div>
        <h4 className="mb-2.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          Active Links
        </h4>

        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-xs">Loading linked posts...</span>
          </div>
        ) : mappings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
            <InstagramIcon className="h-8 w-8 text-slate-300 mb-1.5" />
            <p className="text-xs font-bold text-slate-700">
              No Instagram posts linked yet
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400 max-w-sm">
              Link this listing to your published reels or feed posts so when
              leads comment on Instagram, their inquiries automatically connect
              to this property.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {mappings.map((mapping) => {
              const postUrl = formatInstagramUrl(mapping.instagramMediaId);
              const isDeleting = deletingId === mapping.id;

              return (
                <div
                  key={mapping.id}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-pink-50 text-pink-600 border border-pink-100/60">
                      <InstagramIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-mono text-xs font-bold text-slate-900">
                          {mapping.instagramMediaId}
                        </span>
                        <a
                          href={postUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <span>Open</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Linked on {formatDate(mapping.createdAt)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteMapping(mapping.id)}
                    disabled={isDeleting}
                    title="Remove Link"
                    className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
