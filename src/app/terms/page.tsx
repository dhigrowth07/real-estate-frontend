import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Terms of Service</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Effective Date: September 9, 2026 • Last updated: September 2026
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using PropCRM, our real estate matching CRM software, or interacting with our social media property inquiry automations, you agree to be bound by these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">2. Real Estate Inquiries & Communications</h2>
            <p>
              When submitting an inquiry via Instagram, WhatsApp, or our website for real estate inventory, you confirm that the contact details provided are accurate and that you consent to receiving property specifications, pricing, and consultation from our licensed real estate agents.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">3. Property Information Disclaimer</h2>
            <p>
              Property listings, prices, floor plans, configurations, and possession statuses provided through our CRM and WhatsApp brochures are subject to availability, developer confirmation, and market price revisions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">4. User Conduct & Security</h2>
            <p>
              You agree not to misuse our API endpoints, inject malicious automated scripts, or attempt unauthorized access to our agency CRM or database.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">5. Contact Information</h2>
            <p>
              For any questions regarding these Terms, please reach out to us at <a href="mailto:propcrmai@gmail.com" className="font-semibold text-blue-600 hover:underline">propcrmai@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
