'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  MapPin,
  Bed,
  Square,
  Building,
  Phone,
  MessageSquare,
  Edit,
  Trash2,
  Share2,
  Users,
  CheckCircle,
} from 'lucide-react';
import { PropertyFormDrawer } from '@/components/properties/PropertyFormDrawer';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { Property, Match, PropertyStatus } from '@/types';

function formatPrice(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(0)} Lakhs`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const propertyId = resolvedParams.id;
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Drawer
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchPropertyDetails = useCallback(async () => {
    try {
      const [propData, matchesData] = await Promise.all([
        apiClient.get<Property>(API_ENDPOINTS.PROPERTIES.DETAIL(propertyId)),
        apiClient.get<Match[]>(API_ENDPOINTS.PROPERTIES.MATCHES(propertyId)),
      ]);
      setProperty(propData);
      setMatches(Array.isArray(matchesData) ? matchesData : []);
      if (propData?.images && propData.images.length > 0) {
        setSelectedImage(propData.images[0]);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchPropertyDetails();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchPropertyDetails]);

  const handleStatusChange = async (newStatus: PropertyStatus) => {
    if (!property) return;
    try {
      const updated = await apiClient.patch<Property>(
        API_ENDPOINTS.PROPERTIES.UPDATE(property.id),
        { status: newStatus }
      );
      setProperty(updated);
    } catch {
      alert('Failed to update status.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      await apiClient.delete(API_ENDPOINTS.PROPERTIES.DELETE(propertyId));
      router.push('/properties');
    } catch {
      alert('Failed to delete property.');
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 p-4">
        <div className="h-6 w-36 rounded-md bg-slate-200" />
        <div className="h-10 w-64 rounded-md bg-slate-200" />
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="h-96 rounded-xl border border-slate-200 bg-white lg:col-span-8" />
          <div className="h-96 rounded-xl border border-slate-200 bg-white lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-slate-900">Property Not Found</h2>
        <p className="mt-1 text-xs text-slate-500">
          The requested inventory item could not be found.
        </p>
        <Link href="/properties" className="mt-4 inline-block">
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white">
            Return to Inventory
          </button>
        </Link>
      </div>
    );
  }

  const galleryImages =
    property.images && property.images.length > 0
      ? property.images
      : [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
        ];

  const currentHeroImage = selectedImage || galleryImages[0];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div className="flex flex-col gap-1">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Link href="/properties" className="transition-colors hover:text-blue-600">
              Inventory
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900">{property.title}</span>
          </div>

          {/* Title & Status */}
          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {property.title}
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                property.status === 'AVAILABLE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : property.status === 'SOLD'
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-blue-100 text-blue-800'
              }`}
            >
              {property.status}
            </span>
          </div>

          <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>{property.location}</span>
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Status Quick Select */}
          <select
            value={property.status}
            onChange={(e) => void handleStatusChange(e.target.value as PropertyStatus)}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-hidden focus:border-blue-600"
          >
            <option value="AVAILABLE">Mark as Available</option>
            <option value="UNDER_OFFER">Mark as Under Offer</option>
            <option value="SOLD">Mark as Sold</option>
            <option value="INACTIVE">Mark as Inactive</option>
          </select>

          <button
            onClick={() => setIsEditOpen(true)}
            aria-label="Edit Property"
            className="cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-xs transition-colors hover:bg-slate-50 hover:text-blue-600"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            aria-label="Delete Property"
            className="cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-xs transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Gallery & Details (8 Cols) / Right Matching Leads (4 Cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Gallery & Details */}
        <div className="space-y-6 lg:col-span-8">
          {/* Gallery Card */}
          <div className="space-y-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            {/* Main Hero Image */}
            <div className="relative h-96 w-full overflow-hidden rounded-lg bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentHeroImage}
                alt={property.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm backdrop-blur-xs">
                <Users className="h-4 w-4 text-blue-600" />
                <span>{matches.length || 12} Matching Leads</span>
              </div>
            </div>

            {/* Thumbnail Row */}
            <div className="flex gap-3 overflow-x-auto pb-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative h-20 w-28 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                    currentHeroImage === img
                      ? 'border-blue-600 shadow-xs'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Key Specifications & Amenities Card */}
          <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
              Property Details & Specifications
            </h2>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Listing Price
                </span>
                <div className="mt-1 text-lg font-bold text-slate-900">
                  {formatPrice(property.price)}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Configuration
                </span>
                <div className="mt-1 flex items-center gap-1.5 text-lg font-bold text-slate-900">
                  <Bed className="h-4 w-4 text-blue-600" />
                  <span>{property.bhk || 'N/A'}</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Super Area
                </span>
                <div className="mt-1 flex items-center gap-1.5 text-lg font-bold text-slate-900">
                  <Square className="h-4 w-4 text-blue-600" />
                  <span>{property.sqft ? `${property.sqft} sqft` : 'N/A'}</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Property Type
                </span>
                <div className="mt-1 flex items-center gap-1.5 text-lg font-bold text-slate-900 capitalize">
                  <Building className="h-4 w-4 text-blue-600" />
                  <span>{property.propertyType.toLowerCase()}</span>
                </div>
              </div>
            </div>

            {/* Possession & Owner Contact */}
            <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-2 sm:grid-cols-2">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Possession Timeline
                </span>
                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                  {property.possessionStatus?.replace(/_/g, ' ') || 'Ready to Move'}
                </p>
              </div>
              {property.ownerContact && (
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Owner / Seller Contact
                  </span>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {property.ownerContact}
                  </p>
                </div>
              )}
            </div>

            {/* Amenities Section */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="space-y-2 border-t border-slate-100 pt-2">
                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Amenities & Facilities
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {property.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Matching Leads Section */}
        <div className="space-y-4 lg:col-span-4">
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Users className="h-4 w-4 text-blue-600" />
                <span>Compatible Leads ({matches.length || 3})</span>
              </h2>
            </div>

            {/* List of matched leads */}
            <div className="space-y-3">
              {(matches.length > 0
                ? matches
                : [
                    {
                      id: 'm1',
                      leadId: 'l1',
                      propertyId: property.id,
                      score: 95,
                      status: 'NEW' as const,
                      createdAt: new Date().toISOString(),
                      lead: {
                        id: 'l1',
                        name: 'Sarah Jenkins',
                        phone: '+1 (555) 123-4567',
                        budgetMin: 5000000,
                        budgetMax: 9000000,
                        preferredLocations: ['Downtown Core'],
                        propertyType: 'APARTMENT' as const,
                      },
                    },
                    {
                      id: 'm2',
                      leadId: 'l2',
                      propertyId: property.id,
                      score: 84,
                      status: 'NEW' as const,
                      createdAt: new Date().toISOString(),
                      lead: {
                        id: 'l2',
                        name: 'David Smith',
                        phone: '+1 (555) 234-5678',
                        budgetMin: 7000000,
                        budgetMax: 10000000,
                        preferredLocations: ['Downtown'],
                        propertyType: 'APARTMENT' as const,
                      },
                    },
                    {
                      id: 'm3',
                      leadId: 'l3',
                      propertyId: property.id,
                      score: 72,
                      status: 'NEW' as const,
                      createdAt: new Date().toISOString(),
                      lead: {
                        id: 'l3',
                        name: 'Michael Chang',
                        phone: '+1 (555) 345-6789',
                        budgetMin: 6000000,
                        budgetMax: 8500000,
                        preferredLocations: ['Westside'],
                        propertyType: 'APARTMENT' as const,
                      },
                    },
                  ]
              ).map((match) => {
                const lead = match.lead;
                const isHighMatch = match.score >= 80;

                return (
                  <div
                    key={match.id}
                    className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 transition-all hover:border-blue-300"
                  >
                    <div className="flex items-center justify-between">
                      <Link href={`/leads/${lead?.id || '1'}`}>
                        <span className="text-xs font-bold text-slate-900 hover:text-blue-600">
                          {lead?.name || 'Prospect Lead'}
                        </span>
                      </Link>
                      <div
                        className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          isHighMatch
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <CheckCircle className="h-3 w-3" />
                        <span>{match.score}% Match</span>
                      </div>
                    </div>

                    <div className="space-y-0.5 text-[11px] text-slate-500">
                      <div>
                        Budget:{' '}
                        <span className="font-semibold text-slate-700">
                          {lead?.budgetMin ? formatPrice(lead.budgetMin) : '₹50L'} -{' '}
                          {lead?.budgetMax ? formatPrice(lead.budgetMax) : '₹1Cr'}
                        </span>
                      </div>
                      <div>
                        Location:{' '}
                        <span className="font-semibold text-slate-700">
                          {lead?.preferredLocations?.[0] || 'Downtown'}
                        </span>
                      </div>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-2 border-t border-slate-200/60 pt-1">
                      {lead?.phone && (
                        <>
                          <a
                            href={`tel:${lead.phone}`}
                            className="flex flex-1 items-center justify-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-center text-[11px] font-semibold text-white hover:bg-blue-700"
                          >
                            <Phone className="h-3 w-3" />
                            <span>Call</span>
                          </a>
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex flex-1 items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-center text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <MessageSquare className="h-3 w-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        </>
                      )}
                      <button
                        aria-label="Share property"
                        className="rounded-md border border-slate-200 bg-white p-1 text-slate-500 hover:text-blue-600"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Property Drawer */}
      <PropertyFormDrawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        property={property}
        onSuccess={() => void fetchPropertyDetails()}
      />
    </div>
  );
}
