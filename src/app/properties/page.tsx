'use client';

import React from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusPill } from '@/components/ui/StatusPill';
import { Property } from '@/types';

export default function PropertiesPage() {
  const sampleProperties: Property[] = [
    {
      id: '1',
      title: 'Spacious 3BHK Villa in Whitefield',
      location: 'Whitefield, Bangalore',
      price: 7000000,
      propertyType: 'VILLA',
      bhk: '3BHK',
      sqft: 2200,
      possessionStatus: 'READY_TO_MOVE',
      amenities: ['Clubhouse', 'Swimming Pool', 'Security'],
      ownerContact: '+91 98765 43210',
      images: [],
      status: 'AVAILABLE',
      createdAt: '2026-09-02T10:00:00Z',
    },
    {
      id: '2',
      title: 'Modern 2BHK Apartment in Indiranagar',
      location: 'Indiranagar, Bangalore',
      price: 8500000,
      propertyType: 'APARTMENT',
      bhk: '2BHK',
      sqft: 1350,
      possessionStatus: 'READY_TO_MOVE',
      amenities: ['Gym', 'Power Backup', 'Lift'],
      ownerContact: '+91 98765 43211',
      images: [],
      status: 'AVAILABLE',
      createdAt: '2026-09-01T14:00:00Z',
    },
    {
      id: '3',
      title: 'Prime Commercial Office Space',
      location: 'Koramangala, Bangalore',
      price: 25000000,
      propertyType: 'COMMERCIAL',
      sqft: 4000,
      possessionStatus: 'UNDER_CONSTRUCTION',
      amenities: ['Central AC', 'Covered Parking'],
      ownerContact: '+91 98765 43212',
      images: [],
      status: 'AVAILABLE',
      createdAt: '2026-08-28T16:00:00Z',
    },
  ];

  const columns: Column<Property>[] = [
    {
      header: 'Property Details',
      cell: (prop) => (
        <div>
          <div className="font-bold text-slate-900">{prop.title}</div>
          <div className="text-xs text-slate-500">{prop.location}</div>
        </div>
      ),
    },
    {
      header: 'Price',
      cell: (prop) => (
        <span className="font-bold text-slate-900">₹{(prop.price / 100000).toFixed(0)} Lakhs</span>
      ),
    },
    {
      header: 'Configuration',
      cell: (prop) => (
        <div>
          <span className="font-medium text-slate-800">
            {prop.bhk || ''} {prop.propertyType}
          </span>
          {prop.sqft && <div className="text-xs text-slate-500">{prop.sqft} sq.ft</div>}
        </div>
      ),
    },
    {
      header: 'Possession',
      cell: (prop) => (
        <span className="text-xs font-semibold text-slate-600">
          {prop.possessionStatus.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (prop) => <StatusPill status={prop.status} />,
    },
    {
      header: 'Actions',
      cell: () => (
        <Button variant="outline" size="sm">
          Find Buyers
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Property Inventory</h1>
          <p className="text-sm text-slate-500">
            Real estate inventory listings with pricing, specifications, and buyer compatibility.
          </p>
        </div>
        <Button variant="primary" size="md">
          <Plus className="h-4 w-4" />
          <span>Add Property</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, location, BHK..."
              className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 pr-4 pl-9 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-hidden"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
              <span>All Types</span>
            </Button>
            <Button variant="outline" size="sm">
              <span>Price Filter</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Properties Table */}
      <DataTable columns={columns} data={sampleProperties} keyExtractor={(prop) => prop.id} />
    </div>
  );
}
