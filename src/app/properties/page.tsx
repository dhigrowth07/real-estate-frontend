'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  LayoutGrid,
  Table as TableIcon,
  MapPin,
  Bed,
  Square,
  Users,
  Building,
  RefreshCw,
} from 'lucide-react';
import { PropertyFormDrawer } from '@/components/properties/PropertyFormDrawer';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { Property, PropertyStatus } from '@/types';

function formatPrice(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(0)} Lakhs`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

function getStatusPill(status: PropertyStatus) {
  switch (status) {
    case 'AVAILABLE':
      return (
        <div className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 backdrop-blur-xs">
          Available
        </div>
      );
    case 'SOLD':
      return (
        <div className="rounded border border-slate-600/20 bg-slate-600/10 px-2.5 py-1 text-xs font-bold text-slate-700 backdrop-blur-xs">
          Sold
        </div>
      );
    case 'UNDER_OFFER':
      return (
        <div className="rounded border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-600 backdrop-blur-xs">
          Rented / Offer
        </div>
      );
    default:
      return (
        <div className="rounded bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700">
          {status}
        </div>
      );
  }
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [locationFilter, setLocationFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [bhkFilter, setBhkFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const fetchProperties = useCallback(async () => {
    try {
      const params: Record<string, string | undefined> = {};
      if (locationFilter) params.location = locationFilter;
      if (typeFilter) params.propertyType = typeFilter;
      if (statusFilter) params.status = statusFilter;
      if (bhkFilter) params.bhk = bhkFilter;

      const data = await apiClient.get<Property[]>(API_ENDPOINTS.PROPERTIES.LIST, params);
      setProperties(Array.isArray(data) ? data : []);
    } catch {
      setProperties([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [locationFilter, typeFilter, statusFilter, bhkFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchProperties();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProperties]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void fetchProperties();
  };

  const handleOpenAdd = () => {
    setEditingProperty(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (prop: Property) => {
    setEditingProperty(prop);
    setIsDrawerOpen(true);
  };

  const handleFormSuccess = () => {
    void fetchProperties();
  };

  // Filter and Sort in-memory
  const displayedProperties = properties.filter((p) => {
    if (priceFilter === '0-500k' && p.price > 5000000) return false;
    if (priceFilter === '500k-1m' && (p.price < 5000000 || p.price > 10000000)) return false;
    if (priceFilter === '1m+' && p.price < 10000000) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {/* Filter & Action Bar strictly matching property-inventory.html & screenshot */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          {/* Dropdown Filters */}
          <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
            <span className="mr-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
              Filters:
            </span>

            {/* Location */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:border-blue-600"
            >
              <option value="">Location</option>
              <option value="downtown">Downtown Core</option>
              <option value="westside">Westside Suburbs</option>
              <option value="innovation">Innovation District</option>
            </select>

            {/* Price Range */}
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:border-blue-600"
            >
              <option value="">Price Range</option>
              <option value="0-500k">Under ₹50L</option>
              <option value="500k-1m">₹50L - ₹1Cr</option>
              <option value="1m+">₹1Cr+</option>
            </select>

            {/* Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:border-blue-600"
            >
              <option value="">Type</option>
              <option value="APARTMENT">Apartment</option>
              <option value="VILLA">Villa</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="PLOT">Plot</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:border-blue-600"
            >
              <option value="">Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="SOLD">Sold</option>
              <option value="UNDER_OFFER">Under Offer</option>
            </select>

            {/* BHK */}
            <select
              value={bhkFilter}
              onChange={(e) => setBhkFilter(e.target.value)}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:border-blue-600"
            >
              <option value="">BHK</option>
              <option value="1BHK">1 BHK</option>
              <option value="2BHK">2 BHK</option>
              <option value="3BHK">3 BHK</option>
              <option value="4BHK">4+ BHK</option>
            </select>
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex w-full items-center justify-between gap-2.5 border-t border-slate-100 pt-3 lg:w-auto lg:justify-end lg:border-t-0 lg:pt-0">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-2xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`cursor-pointer rounded p-1 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-slate-100 font-bold text-blue-600'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`cursor-pointer rounded p-1 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-slate-100 font-bold text-blue-600'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
                title="Table View"
              >
                <TableIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="hidden cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:border-blue-600 sm:block"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="matches">Match Count</option>
            </select>

            <button
              onClick={handleRefresh}
              className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Add Property Primary Button */}
            <button
              onClick={handleOpenAdd}
              className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700 lg:ml-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add Property</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Grid vs Table */}
      {isLoading ? (
        <div className="grid animate-pulse grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-xl border border-slate-200 bg-white" />
          ))}
        </div>
      ) : displayedProperties.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-base font-bold text-slate-900">No properties found</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
            Try resetting your filters or list a new property inventory.
          </p>
          <div className="mt-4">
            <button
              onClick={handleOpenAdd}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white"
            >
              Add First Property
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Bento Card Grid matching Screenshot */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedProperties.map((prop) => {
            const matchCount = prop.matches?.length || prop._count?.matches || 0;
            const imageUrl =
              prop.images && prop.images.length > 0
                ? prop.images[0]
                : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={prop.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-all hover:border-blue-400"
              >
                {/* Image container */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={prop.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Top-Right Matching Leads Overlay Badge */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 rounded-md border border-slate-200/80 bg-white/95 px-2.5 py-1 text-xs font-bold text-blue-700 shadow-xs backdrop-blur-xs">
                    <Users className="h-3.5 w-3.5 text-blue-600" />
                    <span>{matchCount} Matches</span>
                  </div>
                  {/* Bottom-Left Status Badge */}
                  <div className="absolute bottom-2.5 left-2.5">{getStatusPill(prop.status)}</div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <Link href={`/properties/${prop.id}`}>
                      <h3 className="truncate text-base font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                        {prop.title}
                      </h3>
                    </Link>
                    <p className="mt-1 mb-3 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{prop.location}</span>
                    </p>
                  </div>

                  <div className="mt-auto">
                    <div className="mb-3 text-2xl font-bold text-slate-900">
                      {formatPrice(prop.price)}
                    </div>
                    <div className="flex items-center gap-4 border-t border-slate-100 pt-3 text-xs font-medium text-slate-600">
                      {prop.bhk && (
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4 text-slate-400" />
                          <span>{prop.bhk}</span>
                        </div>
                      )}
                      {prop.propertyType === 'COMMERCIAL' && (
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4 text-slate-400" />
                          <span>Commercial</span>
                        </div>
                      )}
                      {prop.sqft && (
                        <div className="flex items-center gap-1">
                          <Square className="h-4 w-4 text-slate-400" />
                          <span>{prop.sqft.toLocaleString()} sqft</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Type & BHK</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Matching Leads</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-normal">
                {displayedProperties.map((prop) => (
                  <tr key={prop.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-4 py-3.5">
                      <Link href={`/properties/${prop.id}`}>
                        <div className="font-bold text-slate-900 hover:text-blue-600">
                          {prop.title}
                        </div>
                        <div className="text-xs text-slate-500">{prop.location}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {formatPrice(prop.price)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-700">
                      {prop.bhk || ''} {prop.propertyType}
                    </td>
                    <td className="px-4 py-3.5">{getStatusPill(prop.status)}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                        {prop.matches?.length || prop._count?.matches || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenEdit(prop)}
                        className="cursor-pointer text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Property Form Drawer */}
      <PropertyFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        property={editingProperty}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
