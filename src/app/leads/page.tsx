import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leads</h1>
          <p className="text-sm text-slate-500">
            Manage real estate buyers, tenants, and investors.
          </p>
        </div>
        <Badge variant="primary">Scaffolding Ready</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Pipeline &amp; Directory</CardTitle>
          <CardDescription>
            Ready for Phase 1 MVP Lead CRUD, filtering, and bi-directional property match triggers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            Lead list and creation flows will be implemented in subsequent feature slices.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
