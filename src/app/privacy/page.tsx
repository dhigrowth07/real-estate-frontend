import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Effective Date: September 9, 2026 • Last updated: September 2026
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">1. Overview</h2>
            <p>
              PropCRM (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy describes how we collect, use, process, and protect your personal information when you interact with our real estate CRM software, website, and integrated Meta (Facebook, Instagram, WhatsApp) automation services.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">2. Information We Collect</h2>
            <p className="mb-2">When you interact with our real estate listings or services, we may collect:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Contact Information:</strong> Name, phone number, email address, and WhatsApp contact details.</li>
              <li><strong>Social & Messaging Data:</strong> Public Instagram handle, Instagram Scoped User ID (IGSID), comments on property posts/reels, and direct messages voluntarily submitted to request property brochures or pricing.</li>
              <li><strong>Real Estate Preferences:</strong> Desired budget range, preferred locations, property types (Apartment, Villa, Plot), configuration (BHK), and purchasing timeline.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>To provide property details, brochures, floor plans, and pricing via WhatsApp or SMS upon your explicit request.</li>
              <li>To evaluate compatibility between your buyer preferences and our real estate inventory using our automated matching engine.</li>
              <li>To allow our licensed real estate agents to assist you with scheduling site visits and answering property inquiries.</li>
              <li>To comply with regulatory real estate compliance and data security obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">4. WhatsApp & Meta Platform Compliance</h2>
            <p>
              We strictly enforce verified opt-in consent before sending outbound WhatsApp messages. Outbound property details and templates are only dispatched when you have explicitly requested information and provided your phone number. We do not sell, rent, or trade your contact information to third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">5. Data Retention & Security</h2>
            <p>
              We implement industry-standard administrative, technical, and cryptographic security measures (including HMAC-SHA256 signature verification and encrypted data storage) to safeguard your information against unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">6. User Data Deletion & Rights</h2>
            <p>
              You have the right to request access, correction, or complete deletion of your personal data at any time. To request deletion of your information, please visit our <Link href="/data-deletion" className="font-semibold text-blue-600 hover:underline">Data Deletion Instructions</Link> page or contact us at <a href="mailto:propcrmai@gmail.com" className="font-semibold text-blue-600 hover:underline">propcrmai@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">7. Contact Us</h2>
            <p>
              If you have any questions or concerns regarding this Privacy Policy, please contact us at:
            </p>
            <div className="mt-2 rounded-lg bg-slate-50 p-4 border border-slate-200/80 text-xs space-y-1">
              <p><strong>PropCRM Support & Compliance</strong></p>
              <p>Email: <a href="mailto:propcrmai@gmail.com" className="text-blue-600 hover:underline">propcrmai@gmail.com</a></p>
              <p>Website: <a href="https://propcrm.dhigrowth.com" className="text-blue-600 hover:underline">https://propcrm.dhigrowth.com</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
