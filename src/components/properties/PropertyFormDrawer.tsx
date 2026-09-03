'use client';

import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Trash2 } from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { Property, PropertyType, PossessionStatus, PropertyStatus } from '@/types';

export interface PropertyFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null;
  onSuccess: (property: Property) => void;
}

const ALL_AMENITIES = [
  'Parking',
  'Swimming Pool',
  'Gym',
  'Club House',
  'Power Backup',
  '24/7 Security',
  'Elevator',
  'Garden',
  'Balcony',
  'Air Conditioning',
];

export function PropertyFormDrawer({
  isOpen,
  onClose,
  property,
  onSuccess,
}: PropertyFormDrawerProps) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState<number | ''>(8500000);
  const [propertyType, setPropertyType] = useState<PropertyType>('APARTMENT');
  const [bhk, setBhk] = useState<string>('3BHK');
  const [sqft, setSqft] = useState<number | ''>(1850);
  const [possessionStatus, setPossessionStatus] = useState<PossessionStatus>('READY_TO_MOVE');
  const [status, setStatus] = useState<PropertyStatus>('AVAILABLE');
  const [ownerContact, setOwnerContact] = useState('');
  const [amenities, setAmenities] = useState<string[]>(['Parking', 'Gym', '24/7 Security']);
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state with open/property props
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      if (property) {
        setTitle(property.title || '');
        setLocation(property.location || '');
        setPrice(property.price || 8500000);
        setPropertyType(property.propertyType || 'APARTMENT');
        setBhk(property.bhk || '3BHK');
        setSqft(property.sqft || 1850);
        setPossessionStatus(property.possessionStatus || 'READY_TO_MOVE');
        setStatus(property.status || 'AVAILABLE');
        setOwnerContact(property.ownerContact || '');
        setAmenities(
          property.amenities && property.amenities.length > 0
            ? property.amenities
            : ['Parking', 'Gym', '24/7 Security']
        );
        setImages(
          property.images && property.images.length > 0
            ? property.images
            : [
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
              ]
        );
      } else {
        setTitle('');
        setLocation('');
        setPrice(8500000);
        setPropertyType('APARTMENT');
        setBhk('3BHK');
        setSqft(1850);
        setPossessionStatus('READY_TO_MOVE');
        setStatus('AVAILABLE');
        setOwnerContact('');
        setAmenities(['Parking', 'Gym', '24/7 Security']);
        setImages([
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        ]);
      }
      setImageUrlInput('');
      setError(null);
    }, 0);
    return () => clearTimeout(t);
  }, [isOpen, property]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const toggleAmenity = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((a) => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrlInput.trim() && !images.includes(imageUrlInput.trim())) {
      setImages([...images, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = (imgToRemove: string) => {
    setImages(images.filter((img) => img !== imgToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !location || price === '') {
      setError('Title, Location, and Price are required.');
      return;
    }

    const payload = {
      title,
      location,
      price: Number(price),
      propertyType,
      bhk,
      sqft: sqft ? Number(sqft) : undefined,
      possessionStatus,
      status,
      ownerContact: ownerContact || undefined,
      amenities,
      images,
    };

    try {
      setIsSubmitting(true);
      let result: Property;
      if (property?.id) {
        result = await apiClient.patch<Property>(
          API_ENDPOINTS.PROPERTIES.UPDATE(property.id),
          payload
        );
      } else {
        result = await apiClient.post<Property>(API_ENDPOINTS.PROPERTIES.CREATE, payload);
      }
      onSuccess(result);
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to save property. Please check your inputs.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      {/* Full-Page Backdrop Overlay */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Side Panel Drawer (Full Height, 520px width) */}
      <aside className="relative z-50 flex h-screen w-full flex-col border-l border-slate-200 bg-white shadow-2xl sm:w-[520px]">
        {/* Drawer Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4.5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {property ? 'Edit Property' : 'Add New Property'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              List a new property to trigger automatic matching against active leads
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Scrollable Form Body */}
        <div className="flex-1 space-y-5 overflow-y-auto bg-white p-6">
          <form id="property-form" onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {error}
              </div>
            )}

            {/* Section 1: Basic Information */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                Property Overview
              </h3>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Property Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Serene Heights Apartment, 3BHK"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-hidden transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Downtown Core"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-hidden transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="8500000"
                    step="50000"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-hidden transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                Price: ₹{typeof price === 'number' ? (price / 100000).toFixed(0) : '0'} Lakhs
              </div>
            </div>

            <hr className="my-4 border-slate-100" />

            {/* Section 2: Specifications */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                Property Specifications
              </h3>

              {/* Property Type Grid */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Property Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      'APARTMENT',
                      'VILLA',
                      'COMMERCIAL',
                      'PLOT',
                      'INDEPENDENT_HOUSE',
                      'PENTHOUSE',
                    ] as PropertyType[]
                  ).map((type) => {
                    const isSelected = propertyType === type;
                    const label = type
                      .toLowerCase()
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase());

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPropertyType(type)}
                        className={`cursor-pointer rounded-xl border p-2 text-center text-xs font-semibold transition-colors ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 text-blue-700 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Configuration (BHK) & Sqft */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Configuration (BHK)
                  </label>
                  <select
                    value={bhk}
                    onChange={(e) => setBhk(e.target.value)}
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="1BHK">1 BHK</option>
                    <option value="2BHK">2 BHK</option>
                    <option value="3BHK">3 BHK</option>
                    <option value="4BHK">4 BHK</option>
                    <option value="5BHK+">5 BHK+</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Area (Sq. Ft)
                  </label>
                  <input
                    type="number"
                    value={sqft}
                    onChange={(e) => setSqft(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="1850"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Possession & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Possession Status
                  </label>
                  <select
                    value={possessionStatus}
                    onChange={(e) => setPossessionStatus(e.target.value as PossessionStatus)}
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="READY_TO_MOVE">Ready to Move</option>
                    <option value="UNDER_CONSTRUCTION">Under Construction</option>
                    <option value="WITHIN_3_MONTHS">Within 3 Months</option>
                    <option value="WITHIN_6_MONTHS">Within 6 Months</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Listing Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="UNDER_OFFER">Under Offer</option>
                    <option value="SOLD">Sold</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Owner / Seller Contact
                </label>
                <input
                  type="text"
                  value={ownerContact}
                  onChange={(e) => setOwnerContact(e.target.value)}
                  placeholder="+1 (555) 999-8888 or owner@mail.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-hidden placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <hr className="my-4 border-slate-100" />

            {/* Section 3: Amenities Chips */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                Amenities & Features
              </h3>
              <div className="flex flex-wrap gap-2">
                {ALL_AMENITIES.map((amenity) => {
                  const isSelected = amenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="my-4 border-slate-100" />

            {/* Section 4: Property Images */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                Property Photos
              </h3>

              {/* Add image URL input */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Paste Image URL..."
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-hidden placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="cursor-pointer rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-200"
                >
                  Add Image
                </button>
              </div>

              {/* Drag/Upload hint box */}
              <div className="space-y-1 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
                <UploadCloud className="mx-auto h-6 w-6 text-slate-400" />
                <p className="text-xs font-medium text-slate-600">
                  Upload property photos or paste image links
                </p>
                <p className="text-[11px] text-slate-400">Supports JPG, PNG, WebP up to 10MB</p>
              </div>

              {/* Images Grid preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="group relative h-20 overflow-hidden rounded-lg border border-slate-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`Property preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img)}
                        className="absolute top-1 right-1 cursor-pointer rounded-md bg-rose-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex shrink-0 items-center gap-3 border-t border-slate-200 bg-white p-4 shadow-[0_-4px_10px_rgba(30,41,59,0.02)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="property-form"
            disabled={isSubmitting}
            className="flex-1 cursor-pointer rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : property ? 'Update Property' : 'Save Property'}
          </button>
        </div>
      </aside>
    </div>
  );
}
