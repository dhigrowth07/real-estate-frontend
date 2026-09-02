import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function MatchesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Matches</h1>
          <p className="text-sm text-slate-500">
            Bi-directional compatibility engine scores between leads and properties.
          </p>
        </div>
        <Badge variant="success">Auto-Scoring Scaffolding</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matching Engine Feed</CardTitle>
          <CardDescription>
            Rule-based match results, compatibility breakdown, and agent notification triggers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            Match scoring list and breakdown modal will be implemented in subsequent feature slices.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
