import React from 'react';
import Link from 'next/link';
import { Trash2, ArrowLeft } from 'lucide-react';

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-xs">
        {/* Header */}
        <div className="border-b border-slate-100 pb-6 mb-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to PropCRM</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">User Data Deletion Instructions</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Meta Platform & GDPR Compliance Data Removal Protocol
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">How to Request Data Deletion</h2>
            <p>
              In accordance with Meta Platform policies and global data privacy standards (GDPR / CCPA), you have the right to request the permanent removal of all personal data, contact numbers, chat histories, and social account IDs collected by PropCRM.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">Step-by-Step Instructions</h2>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600">
              <li>
                <strong>Submit a Deletion Request:</strong> Send an email to <a href="mailto:propcrmai@gmail.com" className="font-semibold text-blue-600 hover:underline">propcrmai@gmail.com</a> with the subject line <code>&quot;Data Deletion Request&quot;</code>.
              </li>
              <li>
                <strong>Include Identifying Details:</strong> Please provide your Instagram handle (e.g. <code>@_dhinez__03</code>) and/or the phone number submitted during your inquiry so our compliance team can identify your records.
              </li>
              <li>
                <strong>Automated Removal:</strong> Our engineering team will purge your lead profile, contact information, match history, and social interaction logs from our database within <strong>48 hours</strong> of verification.
              </li>
              <li>
                <strong>Confirmation Notice:</strong> You will receive an email confirmation containing a unique deletion verification code once all data has been completely erased.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">Contact Details</h2>
            <div className="mt-2 rounded-lg bg-slate-50 p-4 border border-slate-200/80 text-xs space-y-1">
              <p><strong>PropCRM Data Protection Officer</strong></p>
              <p>Email: <a href="mailto:propcrmai@gmail.com" className="text-blue-600 hover:underline">propcrmai@gmail.com</a></p>
              <p>Website: <a href="https://propcrm.dhigrowth.com" className="text-blue-600 hover:underline">https://propcrm.dhigrowth.com</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
