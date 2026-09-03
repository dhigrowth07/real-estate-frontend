'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Info,
  MapPin,
  CreditCard,
  Armchair,
  Image as ImageIcon,
  UploadCloud,
  Save,
  MapPinCheck,
  Loader2,
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { Property, PropertyType, PossessionStatus, PropertyStatus } from '@/types';
import { getImageUrl } from '@/lib/utils';

export interface PropertyFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null;
  onSuccess: (property: Property) => void;
}

const ALL_AMENITIES = [
  'Parking',
  'Gated Community',
  'Swimming Pool',
  'Gymnasium',
  'School Nearby',
  'Park/Garden',
  'Power Backup',
  'Club House',
];

export function PropertyFormDrawer({
  isOpen,
  onClose,
  property,
  onSuccess,
}: PropertyFormDrawerProps) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState<number | ''>(5000000);
  const [propertyType, setPropertyType] = useState<PropertyType>('APARTMENT');
  const [bhk, setBhk] = useState<string>('1 BHK');
  const [sqft, setSqft] = useState<number | ''>(1500);
  const [possessionStatus, setPossessionStatus] = useState<PossessionStatus>('READY_TO_MOVE');
  const [status, setStatus] = useState<PropertyStatus>('AVAILABLE');
  const [amenities, setAmenities] = useState<string[]>(['Parking', 'Gated Community']);
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with open/property props
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      if (property) {
        setTitle(property.title || '');
        setLocation(property.location || '');
        setPrice(property.price || 5000000);
        setPropertyType(property.propertyType || 'APARTMENT');
        setBhk(property.bhk || '1 BHK');
        setSqft(property.sqft || 1500);
        setPossessionStatus(property.possessionStatus || 'READY_TO_MOVE');
        setStatus(property.status || 'AVAILABLE');
        setAmenities(
          property.amenities && property.amenities.length > 0
            ? property.amenities
            : ['Parking', 'Gated Community']
        );
        setImages(property.images && property.images.length > 0 ? property.images : []);
      } else {
        setTitle('');
        setLocation('');
        setPrice(5000000);
        setPropertyType('APARTMENT');
        setBhk('1 BHK');
        setSqft(1500);
        setPossessionStatus('READY_TO_MOVE');
        setStatus('AVAILABLE');
        setAmenities(['Parking', 'Gated Community']);
        setImages([]);
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

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setError(null);
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        setError(`"${file.name}" is not a valid image file.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 5MB size limit.`);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await apiClient.upload<{ files?: Array<{ url: string }>; urls?: string[] }>(
        API_ENDPOINTS.PROPERTIES.UPLOAD_IMAGES,
        formData
      );

      const newUrls = response.urls || response.files?.map((f) => f.url) || [];
      if (newUrls.length > 0) {
        setImages((prev) => [...prev, ...newUrls]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload images. Please try again.';
      setError(msg);
    } finally {
      setIsUploading(false);
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
      setError('Property Title, Address, and Price are required.');
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
        className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Side Panel Drawer (Full-Height 100vh, 600px width matching HTML) */}
      <aside className="relative z-50 flex h-screen w-full flex-col border-l border-slate-200 bg-white shadow-2xl sm:w-[600px] md:w-[600px]">
        {/* Drawer Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur-xs">
          <h2 className="text-xl font-bold text-slate-900">
            {property ? 'Edit Property' : 'Add New Property'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Scrollable Form Content */}
        <div className="flex-1 space-y-6 overflow-y-auto bg-white p-6">
          <form id="property-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {error}
              </div>
            )}

            {/* 1. Basic Details Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Info className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Basic Details</h3>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Property Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Skyline Luxury Apartments"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 shadow-2xs outline-hidden transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Property Type <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                    className="h-10 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 shadow-2xs outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="APARTMENT">Apartment</option>
                    <option value="VILLA">Villa</option>
                    <option value="COMMERCIAL">Commercial Space</option>
                    <option value="PLOT">Plot/Land</option>
                    <option value="PENTHOUSE">Penthouse</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Area (sqft) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={sqft}
                    onChange={(e) => setSqft(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 1500"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 shadow-2xs outline-hidden transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Configuration (BHK)
                </label>
                <div className="flex max-w-fit gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
                  {['1 BHK', '2 BHK', '3 BHK', '4+ BHK'].map((opt) => {
                    const isSelected = bhk === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setBhk(opt)}
                        className={`cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
                          isSelected
                            ? 'border border-slate-200 bg-white font-bold text-blue-600 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 2. Location Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Location</h3>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Full Address <span className="text-rose-600">*</span>
                </label>
                <textarea
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter complete property address..."
                  rows={2}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-900 shadow-2xs outline-hidden transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Map Location
                </label>
                <div className="group relative h-44 cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
                    alt="Map Location"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-md">
                      <MapPinCheck className="h-4 w-4 text-blue-600" />
                      <span>Adjust Pin</span>
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Pricing & Status Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Pricing & Status</h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Asking Price (₹) <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute top-2.5 left-3 text-xs font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) =>
                        setPrice(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="e.g. 5,000,000"
                      step="50000"
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-8 text-xs text-slate-900 shadow-2xs outline-hidden transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Price: ₹{typeof price === 'number' ? (price / 100000).toFixed(0) : '0'} Lakhs
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Possession Status
                  </label>
                  <select
                    value={possessionStatus}
                    onChange={(e) => setPossessionStatus(e.target.value as PossessionStatus)}
                    className="h-10 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 shadow-2xs outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="READY_TO_MOVE">Ready to Move</option>
                    <option value="UNDER_CONSTRUCTION">Under Construction</option>
                    <option value="WITHIN_3_MONTHS">Within 3 Months</option>
                    <option value="WITHIN_6_MONTHS">Within 6 Months</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 4. Amenities Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Armchair className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Amenities</h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {ALL_AMENITIES.map((amenity) => {
                  const isChecked = amenities.includes(amenity);
                  return (
                    <label
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 transition-colors ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50/60 font-semibold text-blue-900'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs">{amenity}</span>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* 5. Media Section */}
            <section className="space-y-4 pb-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Media & Photos</h3>
                </div>
                {images.length > 0 && (
                  <span className="text-xs font-semibold text-slate-500">
                    {images.length} {images.length === 1 ? 'photo' : 'photos'} added
                  </span>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    void handleFileUpload(e.target.files);
                    e.target.value = '';
                  }
                }}
              />

              {/* Interactive Drag & Drop Box */}
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    void handleFileUpload(e.dataTransfer.files);
                  }
                }}
                className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all ${
                  isDragging
                    ? 'scale-[0.99] border-blue-600 bg-blue-50/70'
                    : isUploading
                      ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-80'
                      : 'border-slate-200 bg-white hover:border-blue-500 hover:bg-slate-50/80'
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center py-2">
                    <Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-xs font-bold text-slate-800">Uploading photos...</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Please wait while files are processed
                    </p>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="mb-2 h-8 w-8 text-slate-400 transition-colors group-hover:text-blue-600" />
                    <p className="text-xs font-bold text-slate-800">
                      Drag & drop images here, or{' '}
                      <span className="text-blue-600 underline">browse</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      PNG, JPG, WEBP up to 5MB each (Max 10 photos)
                    </p>
                  </>
                )}
              </div>

              {/* Add Image URL Row */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[11px] font-semibold text-slate-500">
                  Or add image by URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://example.com/property-image.jpg"
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-hidden placeholder:text-slate-400 focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="cursor-pointer rounded-lg bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-200"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Thumbnails Preview */}
              {images.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                    Attached Photos ({images.length})
                  </p>
                  <div className="flex flex-wrap gap-2.5 overflow-x-auto py-1">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 shadow-2xs"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getImageUrl(img)}
                          alt={`Preview ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img)}
                          title="Remove photo"
                          className="absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-slate-900/75 text-white transition-opacity hover:bg-rose-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {idx === 0 && (
                          <div className="absolute inset-x-0 bottom-0 bg-blue-600/90 py-0.5 text-center text-[9px] font-bold text-white">
                            Cover
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </form>
        </div>

        {/* Drawer Footer Actions matching HTML */}
        <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white p-4 shadow-[0_-4px_10px_rgba(30,41,59,0.02)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer rounded-lg border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="property-form"
            disabled={isSubmitting}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>
              {isSubmitting ? 'Saving...' : property ? 'Update Property' : 'Save Property'}
            </span>
          </button>
        </footer>
      </aside>
    </div>
  );
}
