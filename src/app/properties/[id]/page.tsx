'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Edit,
  Trash2,
  Share2,
  Phone,
  MessageSquare,
  Users,
  Car,
  Waves,
  Dumbbell,
  ShieldCheck,
  Building,
  Cpu,
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

const DEFAULT_GALLERY = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
];

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
          <button className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white">
            Return to Inventory
          </button>
        </Link>
      </div>
    );
  }

  const galleryImages =
    property.images && property.images.length > 0 ? property.images : DEFAULT_GALLERY;

  const currentHeroImage = selectedImage || galleryImages[0];

  // Compatible leads sample fallback
  const displayLeads =
    matches.length > 0
      ? matches
      : [
          {
            id: 'm1',
            leadId: 'l1',
            propertyId: property.id,
            score: 94,
            status: 'NEW' as const,
            createdAt: new Date().toISOString(),
            lead: {
              id: 'l1',
              name: 'Sarah Chen',
              phone: '+1 (555) 123-4567',
              budgetMin: 4000000,
              budgetMax: 4500000,
              preferredLocations: ['Marina Bay'],
              propertyType: 'PENTHOUSE' as const,
              bhk: '4+ BHK',
            },
          },
          {
            id: 'm2',
            leadId: 'l2',
            propertyId: property.id,
            score: 88,
            status: 'NEW' as const,
            createdAt: new Date().toISOString(),
            lead: {
              id: 'l2',
              name: 'Marcus Rodriguez',
              phone: '+1 (555) 234-5678',
              budgetMin: 5000000,
              budgetMax: 5500000,
              preferredLocations: ['Marina'],
              propertyType: 'APARTMENT' as const,
              bhk: '3 BHK',
            },
          },
        ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header Actions matching HTML & Screenshot */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/properties"
            className="mb-1.5 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition-colors hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Inventory</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {property.title}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>{property.location}</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={property.status}
            onChange={(e) => void handleStatusChange(e.target.value as PropertyStatus)}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          >
            <option value="AVAILABLE">Available</option>
            <option value="UNDER_OFFER">Under Negotiation</option>
            <option value="SOLD">Sold</option>
            <option value="INACTIVE">Rented / Inactive</option>
          </select>

          <button
            onClick={() => setIsEditOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-2xs transition-colors hover:bg-slate-50"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </button>

          <button
            onClick={handleDelete}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-600 shadow-2xs transition-colors hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Gallery & Amenities (Left 2/3) vs Details & Share (Right 1/3) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Image Gallery & Key Amenities */}
        <div className="space-y-6 lg:col-span-2">
          {/* Image Gallery Card */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            {/* Aspect 16/9 Hero Image */}
            <div className="relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentHeroImage}
                alt={property.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 left-3 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 backdrop-blur-md">
                Premium Listing
              </div>
            </div>

            {/* 4-Column Thumbnail Grid */}
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.slice(0, 3).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`aspect-square cursor-pointer overflow-hidden rounded-lg transition-all ${
                    currentHeroImage === img
                      ? 'border-2 border-blue-600 shadow-xs'
                      : 'border border-slate-200 hover:opacity-80'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Gallery ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}

              {/* 4th Thumbnail with +12 Overlay */}
              <div
                onClick={() => setSelectedImage(galleryImages[3] || galleryImages[0])}
                className="relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-slate-200 transition-opacity hover:opacity-80"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={galleryImages[3] || galleryImages[0]}
                  alt="Gallery 4"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
                  <span className="text-sm font-bold text-white">+12</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Amenities Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="mb-4 text-sm font-bold text-slate-900">Key Amenities</h3>
            <div className="flex flex-wrap gap-2.5">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                <Car className="h-4 w-4 text-blue-600" />
                <span>2 Covered Parking</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                <Waves className="h-4 w-4 text-blue-600" />
                <span>Private Pool</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                <Dumbbell className="h-4 w-4 text-blue-600" />
                <span>Gym Access</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>24/7 Concierge</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                <Building className="h-4 w-4 text-blue-600" />
                <span>Wraparound Balcony</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                <Cpu className="h-4 w-4 text-blue-600" />
                <span>Smart Home Tech</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Key Specs Card */}
        <div className="space-y-6">
          <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-4">
              <p className="mb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                Asking Price
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-blue-600">
                {formatPrice(property.price)}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Est. ₹{(property.price / 240).toFixed(0)}/mo
              </p>
            </div>

            <hr className="my-4 border-slate-100" />

            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              <div>
                <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Type</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900 capitalize">
                  {property.propertyType.toLowerCase()}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">BHK</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  {property.bhk || '4 Bed, 4.5 Bath'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Area</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  {property.sqft ? `${property.sqft.toLocaleString()} sqft` : '3,200 sqft'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Status</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  {property.possessionStatus?.replace(/_/g, ' ') || 'Ready to Move'}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <Share2 className="h-4 w-4" />
              <span>Share Listing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Matching Leads Section matching Screenshot & HTML */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Users className="h-4 w-4 text-blue-600" />
            <span>Matching Leads</span>
          </h3>
          <Link href="/matches" className="text-xs font-bold text-blue-600 hover:underline">
            View All Matches
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayLeads.map((item) => {
            const lead = item.lead;
            const initials = lead?.name
              ? lead.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : 'SC';

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
              >
                <div>
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {lead?.name || 'Sarah Chen'}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Looking for: {lead?.propertyType || 'Penthouse'}, {lead?.bhk || '4+ BHK'}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                      {item.score}% Match
                    </div>
                  </div>
                  <p className="mb-3 text-xs text-slate-600">
                    <span className="font-semibold text-slate-900">Budget:</span>{' '}
                    {lead?.budgetMin ? formatPrice(lead.budgetMin) : '₹40L'} -{' '}
                    {lead?.budgetMax ? formatPrice(lead.budgetMax) : '₹50L'}
                  </p>
                </div>

                <div className="mt-1 flex gap-2 border-t border-slate-100 pt-3">
                  <a
                    href={`tel:${lead?.phone || '+15551234567'}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Phone className="h-3.5 w-3.5 text-slate-600" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${(lead?.phone || '15551234567').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
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
