'use client';

import React from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { User } from '@/types';

export default function TeamPage() {
  const sampleUsers: User[] = [
    {
      id: '1',
      name: 'Sarah Admin',
      email: 'admin@infragen.com',
      role: 'ADMIN',
      createdAt: '2026-09-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'John Agent',
      email: 'john.agent@infragen.com',
      role: 'AGENT',
      createdAt: '2026-09-02T10:00:00Z',
    },
  ];

  const columns: Column<User>[] = [
    {
      header: 'Member',
      cell: (user) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-slate-900">{user.name}</div>
            <div className="text-xs text-slate-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (user) => (
        <Badge variant={user.role === 'ADMIN' ? 'primary' : 'success'}>{user.role}</Badge>
      ),
    },
    {
      header: 'Joined',
      cell: (user) => (
        <span className="text-xs text-slate-500">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: () => (
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-rose-600">
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Team & Invites</h1>
          <p className="text-sm text-slate-500">
            Manage agency users, assign roles, and invite new real estate agents.
          </p>
        </div>
        <Button variant="primary" size="md">
          <UserPlus className="h-4 w-4" />
          <span>Invite Agent</span>
        </Button>
      </div>

      {/* Team Table */}
      <DataTable columns={columns} data={sampleUsers} keyExtractor={(user) => user.id} />
    </div>
  );
}
