"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { BazarnaStore } from "@/lib/store";
import { EventApplication } from "@/lib/types";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LayoutDashboard,
  FileText,
  Mail,
  Calendar,
  Building2,
} from "lucide-react";

export default function ApplicationSuccessPage() {
  const searchParams = useSearchParams();
  const appId = searchParams.get("appId");

  const [application, setApplication] = useState<EventApplication | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#8ebf42", "#fde047", "#fbcfe8", "#bae6fd", "#09090b"],
    });

    if (appId) {
      const found = BazarnaStore.getApplicationById(appId);
      if (found) setApplication(found);
    }
  }, [appId]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-8">
      {/* Icon & Title */}
      <div className="space-y-4">
        <div className="w-20 h-20 rounded-full bg-red-50 border-4 border-red-200 flex items-center justify-center mx-auto text-bazarna-red shadow-bazarna-glow">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-bazarna-red bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase">
            Application Received 🎉
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 font-display">
            Application Submitted Successfully!
          </h1>
          <p className="text-sm text-zinc-600 max-w-lg mx-auto leading-relaxed">
            Your application for{" "}
            <strong className="text-zinc-900">
              {application?.event?.name || "B.youth Summer Outlet Market"}
            </strong>{" "}
            has been received by Bazarna Operations.
          </p>
        </div>
      </div>

      {/* Confirmation Badge Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/90 shadow-soft-lg max-w-md mx-auto space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <span className="text-xs text-zinc-500 font-medium">Application ID</span>
          <span className="font-mono text-sm font-black text-zinc-950 bg-zinc-100 px-2.5 py-0.5 rounded-lg">
            {application?.applicationCode || "BY-2026-000127"}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <span className="text-xs text-zinc-500 font-medium">Brand</span>
          <span className="text-xs font-bold text-zinc-900">
            {application?.brand.brandName || "Your Brand"}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <span className="text-xs text-zinc-500 font-medium">Package</span>
          <span className="text-xs font-bold text-zinc-900 truncate max-w-[200px]">
            {application?.package?.name || "Selected Package"}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <span className="text-xs text-zinc-500 font-medium">Status</span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            Pending Review
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500 font-medium">Payment Status</span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-bazarna-red bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
            {application?.paymentStatus?.replace("_", " ") || "Receipt Uploaded"}
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {application && (
          <Link
            href={`/dashboard/applications/${application.id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs shadow-soft-md transition"
          >
            <FileText className="w-4 h-4 text-butter-300" />
            View My Application
          </Link>
        )}

        <Link
          href="/dashboard"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 font-bold text-xs shadow-soft-sm transition"
        >
          <LayoutDashboard className="w-4 h-4 text-zinc-500" />
          Back to Dashboard
        </Link>

        <button
          onClick={() => setShowEmailModal(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-babyblue-50 hover:bg-babyblue-100 text-babyblue-800 font-bold text-xs transition"
        >
          <Mail className="w-4 h-4 text-babyblue-600" />
          Preview Confirmation Email
        </button>
      </div>

      {/* Email Simulation Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-soft-xl border border-zinc-200 text-left space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <span className="text-xs font-mono text-zinc-400">Transactional Email Preview</span>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-xs font-bold text-zinc-500 hover:text-zinc-900"
              >
                Close
              </button>
            </div>

            <div className="p-6 bg-[#FAFAFA] rounded-2xl border border-zinc-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-xs">
                    B
                  </div>
                  <span className="font-extrabold text-zinc-950 text-sm">BAZARNA SOCIETY</span>
                </div>
                <span className="text-[11px] text-zinc-400">Auto-Generated</span>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-black text-zinc-950">Application Submitted</h4>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  Hello <strong>{application?.brand.brandName || "Brand"}</strong>,
                  <br />
                  Your application for{" "}
                  <strong>{application?.event?.name || "B.youth Summer Outlet"}</strong> has been
                  successfully submitted.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-zinc-200 text-xs space-y-1">
                <div>
                  <strong>Application ID:</strong>{" "}
                  <span className="font-mono text-zinc-900">
                    {application?.applicationCode || "BY-2026-000127"}
                  </span>
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  <span className="text-amber-700 font-semibold">Under Review</span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-500">
                Our operations team will review your submitted documents and payment receipt. You can
                track real-time updates directly on your Bazarna brand dashboard.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
