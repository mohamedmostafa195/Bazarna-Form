"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { BazarnaStore } from "@/lib/store";
import { EventApplication } from "@/lib/types";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  CreditCard,
  Building2,
  Eye,
  ShieldCheck,
  Package,
  Store,
  Sparkles,
  Info,
} from "lucide-react";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { addToast } = useAuth();
  const [application, setApplication] = useState<EventApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  useEffect(() => {
    if (id) {
      const found = BazarnaStore.getApplicationById(id);
      if (found) setApplication(found);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-kiwi-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs font-semibold text-zinc-500">Loading application details...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-zinc-950">Application Not Found</h2>
        <Link href="/dashboard" className="text-xs font-bold text-kiwi-700 underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Calculate timeline stages
  const timelineStages = [
    {
      title: "Application Submitted",
      desc: new Date(application.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      completed: true,
      current: application.appStatus === "SUBMITTED",
    },
    {
      title: "Documents Reviewed",
      desc: "Tax ID & National ID verification",
      completed:
        application.appStatus === "UNDER_REVIEW" ||
        application.appStatus === "APPROVED" ||
        application.paymentStatus === "PAID",
      current: application.appStatus === "UNDER_REVIEW",
    },
    {
      title: "Application Approved",
      desc: "Brand acceptance confirmed",
      completed:
        application.appStatus === "APPROVED" || application.paymentStatus === "PAID",
      current: application.appStatus === "APPROVED" && application.paymentStatus !== "PAID",
    },
    {
      title: "Payment Receipt Uploaded",
      desc: application.payment?.uploadedAt
        ? new Date(application.payment.uploadedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          })
        : "Awaiting upload",
      completed:
        application.paymentStatus === "RECEIPT_UPLOADED" ||
        application.paymentStatus === "UNDER_REVIEW" ||
        application.paymentStatus === "PAID",
      current: application.paymentStatus === "RECEIPT_UPLOADED",
    },
    {
      title: "Payment Approved",
      desc: "Finance team verified transfer",
      completed: application.paymentStatus === "PAID",
      current: application.paymentStatus === "PAID" && !application.assignedBooth,
    },
    {
      title: "Booking Confirmed & Booth Assigned",
      desc: application.assignedBooth ? `Assigned: ${application.assignedBooth}` : "Pending assignment",
      completed: !!application.assignedBooth && application.paymentStatus === "PAID",
      current: !!application.assignedBooth && application.paymentStatus === "PAID",
    },
  ];

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      BazarnaStore.updatePaymentStatus(
        application.id,
        "RECEIPT_UPLOADED",
        "Brand User",
        `Uploaded receipt: ${file.name}`
      );
      if (application.payment) {
        application.payment.receiptFileUrl = reader.result as string;
        application.payment.receiptFileName = file.name;
        application.payment.paymentStatus = "RECEIPT_UPLOADED";
      }
      setApplication({ ...application, paymentStatus: "RECEIPT_UPLOADED" });
      addToast("success", "Receipt Uploaded", `${file.name} uploaded for review.`);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Top Breadcrumb & Header */}
      <div className="space-y-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-lg">
                {application.applicationCode}
              </span>
              <span className="text-xs font-bold text-kiwi-700 bg-kiwi-100 px-3 py-1 rounded-full">
                {application.appStatus.replace("_", " ")}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 font-display mt-2">
              {application.event?.name || "B.youth Summer Outlet Market"}
            </h1>
          </div>

          {application.assignedBooth && (
            <div className="p-3 bg-kiwi-100 border border-kiwi-300 rounded-2xl text-right">
              <span className="text-[10px] uppercase font-bold text-kiwi-800 block">
                Official Booth
              </span>
              <span className="text-lg font-black text-kiwi-950">
                {application.assignedBooth}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Changes Requested / Admin Feedback Alert Banner */}
      {application.appStatus === "CHANGES_REQUESTED" && (
        <div className="p-6 rounded-3xl bg-red-50/95 border-2 border-red-300 shadow-soft-sm space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2.5 text-red-900 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 animate-pulse" />
            <span>Action Required: Changes Requested by Bazarna Operations</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-red-200 text-xs text-zinc-900 leading-relaxed font-medium shadow-soft-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 block mb-1">
              Required Updates / Problem Description:
            </span>
            <p className="text-sm font-semibold text-zinc-950 whitespace-pre-wrap">
              {application.adminFeedback || "The operations team has requested updates to your application. Please review your documents and information."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-red-800">
            <p className="text-[11px]">
              Please review the feedback above and make the required corrections to your profile or documents.
            </p>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-soft-xs transition"
            >
              Update Brand Profile & Docs
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Live Application Timeline Tracker */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-950 font-display">
            Application & Booking Timeline
          </h2>
          <span className="text-xs text-zinc-500 font-medium">Live Status Updates</span>
        </div>

        <div className="relative pl-6 border-l-2 border-zinc-200 space-y-8 my-2">
          {timelineStages.map((stage, idx) => (
            <div key={idx} className="relative group">
              <div
                className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  stage.completed
                    ? "bg-kiwi-500 text-white shadow-kiwi-glow"
                    : stage.current
                    ? "bg-butter-400 text-zinc-950 ring-4 ring-butter-100"
                    : "bg-zinc-200 text-zinc-500"
                }`}
              >
                {stage.completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>

              <div className="space-y-0.5">
                <h4
                  className={`text-sm font-bold ${
                    stage.completed || stage.current ? "text-zinc-950" : "text-zinc-400"
                  }`}
                >
                  {stage.title}
                </h4>
                <p className="text-xs text-zinc-500">{stage.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Package & Payment */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-950">Package & Payment</h3>
            <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-lg">
              {application.paymentStatus.replace("_", " ")}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Selected Package:</span>
              <strong className="text-zinc-900">{application.package?.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Package Price:</span>
              <strong className="text-zinc-900 font-bold text-sm">
                {application.package?.price.toLocaleString()} EGP
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">PR Campaign:</span>
              <strong className={application.prParticipation ? "text-kiwi-700 font-bold" : "text-zinc-600"}>
                {application.prParticipation ? "YES (Included Gifting)" : "NO"}
              </strong>
            </div>
          </div>

          {/* Receipt Section */}
          <div className="pt-2 space-y-2">
            <span className="text-xs font-bold text-zinc-900 block">Payment Receipt:</span>
            {application.payment?.receiptFileUrl ? (
              <div className="p-3 rounded-2xl bg-kiwi-50 border border-kiwi-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-800 truncate max-w-[200px]">
                  {application.payment.receiptFileName || "payment_receipt.jpg"}
                </span>
                <a
                  href={application.payment.receiptFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-kiwi-700 font-bold hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Receipt
                </a>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-amber-300 bg-amber-50/50 rounded-2xl text-center space-y-2">
                <p className="text-xs text-amber-900 font-medium">
                  Payment receipt has not been uploaded yet.
                </p>
                <label className="cursor-pointer inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition">
                  <Upload className="w-3.5 h-3.5 text-butter-300" />
                  Upload Receipt Now
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleReceiptUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Brand & Contact Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-sm space-y-4">
          <h3 className="text-base font-bold text-zinc-950">Brand & Contact</h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-zinc-100 pb-2">
              <span className="text-zinc-500">Brand Name:</span>
              <strong className="text-zinc-900">{application.brand.brandName}</strong>
            </div>
            <div className="flex justify-between border-b border-zinc-100 pb-2">
              <span className="text-zinc-500">Category:</span>
              <strong className="text-zinc-900">{application.brand.category}</strong>
            </div>
            <div className="flex justify-between border-b border-zinc-100 pb-2">
              <span className="text-zinc-500">Contact Person:</span>
              <strong className="text-zinc-900">{application.brand.contactName}</strong>
            </div>
            <div className="flex justify-between border-b border-zinc-100 pb-2">
              <span className="text-zinc-500">Contact Email:</span>
              <strong className="text-zinc-900">{application.brand.contactEmail}</strong>
            </div>
            <div className="flex justify-between border-b border-zinc-100 pb-2">
              <span className="text-zinc-500">Mobile:</span>
              <strong className="text-zinc-900">{application.brand.contactPhone}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">T&C Acceptance:</span>
              <strong className="text-kiwi-700">
                Agreed (v{application.tcVersion})
              </strong>
            </div>
          </div>

          {application.notes && (
            <div className="pt-2 border-t border-zinc-100">
              <span className="text-xs font-bold text-zinc-900 block mb-1">Notes:</span>
              <p className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                {application.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
