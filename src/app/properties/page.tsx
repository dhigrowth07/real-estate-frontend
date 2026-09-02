import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Properties</h1>
          <p className="text-sm text-slate-500">
            Manage available inventory, listings, and property specifications.
          </p>
        </div>
        <Badge variant="primary">Scaffolding Ready</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Listings Inventory</CardTitle>
          <CardDescription>
            Ready for Phase 1 Property entry and reverse-matching against active leads.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            Property catalog and creation flows will be implemented in subsequent feature slices.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
