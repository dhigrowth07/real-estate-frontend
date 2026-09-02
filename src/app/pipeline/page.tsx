import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lead Pipeline</h1>
          <p className="text-sm text-slate-500">
            Kanban workflow stages from New Lead to Closed Won.
          </p>
        </div>
        <Badge variant="primary">Kanban Scaffolding</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kanban Pipeline View</CardTitle>
          <CardDescription>
            Visual stage progression: New &rarr; Contacted &rarr; Requirement Gathered &rarr; Site
            Visit &rarr; Negotiation &rarr; Closed Won.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            Kanban board and drag-and-drop / stage update actions will be implemented in subsequent
            feature slices.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
