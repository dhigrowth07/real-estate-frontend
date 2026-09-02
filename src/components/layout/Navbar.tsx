'use client';

import React from 'react';
import Link from 'next/link';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
            R
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            RealEstate <span className="text-blue-600">MatchCRM</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="font-medium text-slate-700">Matching Engine Active</span>
        </div>

        <div className="h-4 w-px bg-slate-200" />

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700">
            AD
          </div>
          <div className="hidden text-left text-xs sm:block">
            <div className="font-medium text-slate-900">Admin User</div>
            <div className="text-slate-500">Single-Tenant Team</div>
          </div>
        </div>
      </div>
    </header>
  );
}
