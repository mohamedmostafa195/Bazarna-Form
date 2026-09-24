"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { BazarnaStore } from "@/lib/store";
import {
  EventApplication,
  ApplicationStatus,
  PaymentStatus,
} from "@/lib/types";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  CreditCard,
  Building2,
  Eye,
  ShieldCheck,
  Package,
  Store,
  Sparkles,
  ExternalLink,
  MapPin,
  Check,
  X,
  Send,
} from "lucide-react";

export default function AdminApplicationReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { addToast } = useAuth();
  const [application, setApplication] = useState<EventApplication | null>(null);
  const [loading, setLoading] = useState(true);

  // Booth assign state
  const [boothInput, setBoothInput] = useState("");
  // Change request note
  const [changeNote, setChangeNote] = useState("");
  const [showChangeModal, setShowChangeModal] = useState(false);

  // Document preview modal
  const [previewModal, setPreviewModal] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadApplication = () => {
      const found = BazarnaStore.getApplicationById(id);
      if (found) {
        setApplication(found);
        setBoothInput(found.assignedBooth || "");
      }
      setLoading(false);
    };

    loadApplication();

    window.addEventListener("bazarna_store_updated", loadApplication);

    // Also attempt fetching from server API if available
    fetch(`/api/applications/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.application) {
          setApplication(data.application);
          setBoothInput(data.application.assignedBooth || "");
        }
      })
      .catch(() => null);

    return () => window.removeEventListener("bazarna_store_updated", loadApplication);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-kiwi-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs font-semibold text-zinc-500">Loading application dossier...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-zinc-950">Application Not Found</h2>
        <Link href="/admin/applications" className="text-xs font-bold text-kiwi-700 underline">
          Return to Applications
        </Link>
      </div>
    );
  }

  const handleAppStatus = (status: ApplicationStatus, reason?: string) => {
    BazarnaStore.updateApplicationStatus(application.id, status, "Ahmed Operations", reason);
    setApplication({
      ...application,
      appStatus: status,
      adminFeedback: reason !== undefined ? reason : application.adminFeedback,
    });
    addToast("success", "Application Status Updated", `Status changed to ${status.replace("_", " ")}`);
    if (showChangeModal) setShowChangeModal(false);
  };

  const handlePaymentStatus = (status: PaymentStatus) => {
    BazarnaStore.updatePaymentStatus(application.id, status, "Dina Finance");
    setApplication({
      ...application,
      paymentStatus: status,
      payment: application.payment
        ? { ...application.payment, paymentStatus: status }
        : undefined,
    });
    addToast("success", "Payment Status Updated", `Payment marked as ${status.replace("_", " ")}`);
  };

  const handleAssignBooth = () => {
    if (!boothInput.trim()) return;
    BazarnaStore.assignBooth(application.id, boothInput.trim(), "Tamer Logistics");
    setApplication({ ...application, assignedBooth: boothInput.trim() });
    addToast("success", "Booth Assigned", `Assigned ${boothInput.trim()} to ${application.brand.brandName}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="space-y-3">
        <Link
          href="/admin/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Applications Table
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-zinc-950 bg-zinc-100 px-2.5 py-1 rounded-lg">
                {application.applicationCode}
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  application.appStatus === "APPROVED"
                    ? "bg-kiwi-100 text-kiwi-800"
                    : application.appStatus === "UNDER_REVIEW"
                    ? "bg-butter-100 text-butter-800"
                    : "bg-babyblue-100 text-babyblue-800"
                }`}
              >
                {application.appStatus.replace("_", " ")}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 font-display mt-2">
              {application.brand.brandName} — Application Dossier
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Event: <strong className="text-zinc-800">{application.event?.name}</strong> • Submitted:{" "}
              {new Date(application.createdAt).toLocaleString("en-GB")}
            </p>
          </div>

          {/* Action Buttons Toolbar */}
          {application.appStatus === "APPROVED" ? (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kiwi-100 border border-kiwi-300 text-kiwi-900 font-bold text-xs shadow-soft-xs">
              <Check className="w-4 h-4 text-kiwi-700" />
              <span>Brand Approved & Confirmed</span>
            </div>
          ) : application.appStatus === "REJECTED" ? (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 font-bold text-xs shadow-soft-xs">
              <X className="w-4 h-4 text-rose-700" />
              <span>Application Rejected</span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleAppStatus("APPROVED")}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-kiwi-500 hover:bg-kiwi-600 text-white font-bold text-xs shadow-kiwi-glow transition"
              >
                <Check className="w-4 h-4" />
                Approve Brand
              </button>

              <button
                onClick={() => handleAppStatus("UNDER_REVIEW")}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-butter-100 hover:bg-butter-200 text-butter-900 border border-butter-300 font-bold text-xs transition shadow-soft-xs"
              >
                <Clock className="w-4 h-4 text-butter-700" />
                Under Review
              </button>

              <button
                onClick={() => setShowChangeModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition"
              >
                Request Changes
              </button>

              <button
                onClick={() => handleAppStatus("REJECTED")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-100 hover:bg-rose-50 text-rose-700 font-bold text-xs transition"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Dossier Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Brand Info Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-sm space-y-4">
            <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
              <Store className="w-4 h-4 text-kiwi-600" />
              Brand & Contact Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-zinc-400 block font-semibold">Category</span>
                <span className="font-bold text-zinc-900">{application.brand.category}</span>
              </div>
              <div>
                <span className="text-zinc-400 block font-semibold">Contact Person</span>
                <span className="font-bold text-zinc-900">{application.brand.contactName}</span>
              </div>
              <div>
                <span className="text-zinc-400 block font-semibold">Email</span>
                <span className="font-bold text-zinc-900">{application.brand.contactEmail}</span>
              </div>
              <div>
                <span className="text-zinc-400 block font-semibold">Mobile</span>
                <span className="font-bold text-zinc-900">{application.brand.contactPhone}</span>
              </div>
            </div>

            {application.brand.aboutBrand && (
              <div className="pt-2 border-t border-zinc-100 text-xs space-y-1">
                <span className="text-zinc-400 font-semibold block">About Brand:</span>
                <p className="text-zinc-700 leading-relaxed">{application.brand.aboutBrand}</p>
              </div>
            )}

            {application.brand.products && (
              <div className="text-xs space-y-1">
                <span className="text-zinc-400 font-semibold block">Products:</span>
                <p className="text-zinc-700">{application.brand.products}</p>
              </div>
            )}

            {/* Social handles */}
            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              {application.brand.instagram && (
                <a
                  href={application.brand.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold flex items-center gap-1"
                >
                  Instagram
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {application.brand.website && (
                <a
                  href={application.brand.website}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold flex items-center gap-1"
                >
                  Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Legal Identification & Uploaded Documents */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-sm space-y-4">
            <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-butter-600" />
              Legal Documents & Verification
            </h3>

            {(() => {
              const brandProfile =
                BazarnaStore.getBrandById(application.brandId) ||
                BazarnaStore.getBrands().find(
                  (b) =>
                    (b.brandName && application.brand?.brandName && b.brandName.toLowerCase() === application.brand.brandName.toLowerCase()) ||
                    (b.contactEmail && application.brand?.contactEmail && b.contactEmail.toLowerCase() === application.brand.contactEmail.toLowerCase())
                );

              const taxIdValue = application.brand.taxId || brandProfile?.taxId || "Not Provided";
              const nationalIdValue = application.brand.nationalId || brandProfile?.nationalId || "Not Provided";

              const taxDoc =
                application.brand.documents?.find((d) => d.documentType === "TAX_ID_CARD") ||
                brandProfile?.documents?.find((d) => d.documentType === "TAX_ID_CARD");

              const nationalDoc =
                application.brand.documents?.find((d) => d.documentType === "NATIONAL_ID") ||
                brandProfile?.documents?.find((d) => d.documentType === "NATIONAL_ID");

              return (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-zinc-400 block font-semibold">TAX ID Number</span>
                      <span className="font-mono font-bold text-zinc-900">
                        {taxIdValue}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-semibold">National ID Number</span>
                      <span className="font-mono font-bold text-zinc-900">
                        {nationalIdValue}
                      </span>
                    </div>
                  </div>

                  {/* Document Previews */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                    {/* Tax ID Doc */}
                    <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
                      <span className="font-bold text-zinc-900 block">Tax ID Card Scan</span>
                      {taxDoc ? (
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-600 truncate max-w-[140px]">{taxDoc.fileName}</span>
                          <button
                            type="button"
                            onClick={() => setPreviewModal({ url: taxDoc.fileUrl, title: "Tax ID Card" })}
                            className="text-kiwi-700 font-bold hover:underline flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Preview
                          </button>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic">No document uploaded</span>
                      )}
                    </div>

                    {/* National ID Doc */}
                    <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
                      <span className="font-bold text-zinc-900 block">National ID Scan</span>
                      {nationalDoc ? (
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-600 truncate max-w-[140px]">{nationalDoc.fileName}</span>
                          <button
                            type="button"
                            onClick={() => setPreviewModal({ url: nationalDoc.fileUrl, title: "National ID" })}
                            className="text-kiwi-700 font-bold hover:underline flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Preview
                          </button>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic">No document uploaded</span>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* PR Participation & Custom Questions */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-sm space-y-4">
            <h3 className="text-base font-bold text-zinc-950">
              PR Participation & Custom Requirements
            </h3>

            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-700">PR Campaign (Gifted items to bloggers):</span>
              <span
                className={`font-bold px-2.5 py-0.5 rounded-full ${
                  application.prParticipation
                    ? "bg-kiwi-100 text-kiwi-800"
                    : "bg-zinc-200 text-zinc-700"
                }`}
              >
                {application.prParticipation ? "YES — Confirmed Gifting" : "NO"}
              </span>
            </div>

            {/* Custom Answers */}
            {application.answers && application.answers.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider block">
                  Event Questions:
                </span>
                {application.answers.map((ans) => {
                  const qText =
                    ans.question?.questionText ||
                    application.event?.questions.find((q) => q.id === ans.questionId)?.questionText ||
                    "Question";
                  return (
                    <div key={ans.id} className="p-3 bg-zinc-50 rounded-xl text-xs space-y-0.5">
                      <span className="text-zinc-500 font-medium block">{qText}</span>
                      <strong className="text-zinc-900">{ans.answerText}</strong>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Notes */}
            {application.notes && (
              <div className="text-xs space-y-1 pt-2 border-t border-zinc-100">
                <span className="font-bold text-zinc-900 block">Brand Special Notes:</span>
                <p className="p-3 bg-zinc-50 rounded-xl text-zinc-700">{application.notes}</p>
              </div>
            )}

            {/* T&C Log */}
            <div className="pt-2 text-[11px] text-zinc-400 flex items-center justify-between border-t border-zinc-100">
              <span>Accepted Terms & Conditions Version: v{application.tcVersion}</span>
              <span>Timestamp: {new Date(application.tcAcceptedAt).toLocaleString("en-GB")}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Package, Payment & Booth Assignment */}
        <div className="lg:col-span-4 space-y-6">
          {/* Package & Payment Actions */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-soft-sm space-y-4">
            <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-babyblue-600" />
              Payment & Finance
            </h3>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Package:</span>
                <strong className="text-zinc-900">{application.package?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Total Amount:</span>
                <strong className="text-sm font-black text-zinc-950">
                  {application.package?.price.toLocaleString()} EGP
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Payment Status:</span>
                <span className="font-bold text-zinc-900">
                  {application.paymentStatus.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Receipt Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-900 block">Uploaded Receipt:</span>
              {application.payment?.receiptFileUrl ? (
                <div className="space-y-2">
                  <div className="h-44 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 relative group">
                    <img
                      src={application.payment.receiptFileUrl}
                      alt="Receipt preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewModal({
                          url: application.payment?.receiptFileUrl || "",
                          title: "Payment Receipt",
                        })
                      }
                      className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition"
                    >
                      Click to Enlarge
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePaymentStatus("PAID")}
                      className="flex-1 py-2 rounded-xl bg-kiwi-500 hover:bg-kiwi-600 text-white font-bold text-xs shadow-kiwi-glow transition"
                    >
                      Verify & Mark Paid
                    </button>
                    <button
                      onClick={() => handlePaymentStatus("REJECTED")}
                      className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-rose-50 text-rose-700 font-bold text-xs transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-dashed border-zinc-300 rounded-2xl text-center text-xs text-zinc-400">
                  No payment receipt uploaded yet.
                </div>
              )}
            </div>
          </div>

          {/* Booth Assignment Card */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-soft-sm space-y-4">
            <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-kiwi-600" />
              Assign Booth Location
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-700">
                Booth Number / Code
              </label>
              <input
                type="text"
                value={boothInput}
                onChange={(e) => setBoothInput(e.target.value)}
                placeholder="e.g. Booth A-04"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold uppercase focus:ring-2 focus:ring-kiwi-400"
              />
              <button
                type="button"
                onClick={handleAssignBooth}
                className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs transition"
              >
                Save Booth Assignment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Changes Request Modal */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-soft-xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h4 className="text-sm font-bold text-zinc-900">Request Changes from Brand</h4>
              <button
                onClick={() => setShowChangeModal(false)}
                className="text-xs text-zinc-400 hover:text-zinc-800"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-700">
                Reason / Required Updates
              </label>
              <textarea
                rows={3}
                value={changeNote}
                onChange={(e) => setChangeNote(e.target.value)}
                placeholder="e.g. Please upload a higher resolution copy of your Tax ID card."
                className="w-full p-3 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-kiwi-400"
              />
            </div>

            <button
              onClick={() => handleAppStatus("CHANGES_REQUESTED", changeNote)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition"
            >
              Send Request to Brand
            </button>
          </div>
        </div>
      )}

      {/* Document / Receipt Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 shadow-soft-xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h4 className="text-sm font-bold text-zinc-900">{previewModal.title}</h4>
              <button
                onClick={() => setPreviewModal(null)}
                className="text-xs font-bold text-zinc-400 hover:text-zinc-800"
              >
                Close (ESC)
              </button>
            </div>

            <div className="max-h-[75vh] overflow-auto rounded-2xl bg-zinc-100 flex items-center justify-center p-2">
              <img
                src={previewModal.url}
                alt={previewModal.title}
                className="max-w-full h-auto rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
