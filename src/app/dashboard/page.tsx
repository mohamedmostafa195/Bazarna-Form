"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { BazarnaStore } from "@/lib/store";
import { EventApplication, ApplicationStatus, PaymentStatus } from "@/lib/types";
import {
  Store,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Eye,
  FileText,
  CreditCard,
  Building2,
  MapPin,
  ExternalLink,
} from "lucide-react";

export default function BrandDashboardPage() {
  const { currentBrand } = useAuth();
  const [applications, setApplications] = useState<EventApplication[]>([]);

  useEffect(() => {
    setApplications(BazarnaStore.getApplicationsByBrand(currentBrand.id));

    // Immediately sync with server
    BazarnaStore.syncWithServer();

    const handleUpdate = () => {
      setApplications(BazarnaStore.getApplicationsByBrand(currentBrand.id));
    };
    window.addEventListener("bazarna_store_updated", handleUpdate);
    return () => window.removeEventListener("bazarna_store_updated", handleUpdate);
  }, [currentBrand]);

  const approvedCount = applications.filter((a) => a.appStatus === "APPROVED").length;
  const pendingPaymentCount = applications.filter(
    (a) => a.paymentStatus === "PENDING" || a.paymentStatus === "RECEIPT_UPLOADED"
  ).length;

  const getAppStatusBadge = (status: ApplicationStatus, appId?: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-kiwi-100 text-kiwi-800 border border-kiwi-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-kiwi-600" />
            Approved
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-butter-100 text-butter-800 border border-butter-300">
            <Clock className="w-3.5 h-3.5 text-butter-600" />
            Under Review
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-babyblue-100 text-babyblue-800 border border-babyblue-300">
            Submitted
          </span>
        );
      case "CHANGES_REQUESTED":
        return (
          <Link
            href={appId ? `/dashboard/applications/${appId}` : "#"}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600 hover:bg-red-700 text-white border border-red-700 shadow-sm transition-all hover:scale-105 active:scale-95 group cursor-pointer"
            title="Click to view required changes"
          >
            <AlertCircle className="w-3.5 h-3.5 text-white shrink-0 animate-pulse" />
            <span>Changes Requested</span>
          </Link>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600">
            {status}
          </span>
        );
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-kiwi-100 text-kiwi-800 border border-kiwi-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-kiwi-600" />
            Paid & Verified
          </span>
        );
      case "RECEIPT_UPLOADED":
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-babyblue-100 text-babyblue-800 border border-babyblue-300">
            Receipt Under Review
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            Pending Payment
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            Payment Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-kiwi-700 bg-kiwi-100 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Brand Portal
          </div>
          <h1 className="text-3xl font-black text-zinc-950 font-display">
            Welcome back, {currentBrand.brandName}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Track your event bookings, booth assignments, payment receipts, and applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 shadow-soft-sm transition"
          >
            <Store className="w-4 h-4 text-kiwi-600" />
            Edit Profile
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-soft-sm transition"
          >
            <Calendar className="w-4 h-4 text-butter-300" />
            Browse Events
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-soft-sm space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
            Total Applications
          </span>
          <div className="text-3xl font-black text-zinc-950 font-display">
            {applications.length}
          </div>
          <p className="text-[11px] text-zinc-500">Across all Bazarna editions</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-soft-sm space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
            Approved Bookings
          </span>
          <div className="text-3xl font-black text-kiwi-600 font-display">
            {approvedCount}
          </div>
          <p className="text-[11px] text-zinc-500">Confirmed brand spots</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-soft-sm space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
            Pending Payments
          </span>
          <div className="text-3xl font-black text-amber-600 font-display">
            {pendingPaymentCount}
          </div>
          <p className="text-[11px] text-zinc-500">Receipts awaiting verification</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-soft-sm space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
            Saved Profile Status
          </span>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-kiwi-500" />
            <span className="text-sm font-bold text-zinc-900">Active & Verified</span>
          </div>
          <p className="text-[11px] text-zinc-500">Tax ID & National ID linked</p>
        </div>
      </div>

      {/* My Applications & Events Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-950 font-display">My Applications & Bookings</h2>
          <span className="text-xs text-zinc-500 font-medium">{applications.length} total</span>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200 p-8 space-y-4">
            <Calendar className="w-12 h-12 text-zinc-300 mx-auto" />
            <h3 className="text-base font-bold text-zinc-800">No applications yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              You haven&apos;t registered for any Bazarna events yet. Explore our calendar and apply with your saved profile in under 2 minutes.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-kiwi-500 hover:bg-kiwi-600 text-white font-bold text-xs shadow-kiwi-glow"
            >
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-soft-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Event</th>
                    <th className="py-4 px-4">Package</th>
                    <th className="py-4 px-4 whitespace-nowrap">Booth</th>
                    <th className="py-4 px-4">Application Status</th>
                    <th className="py-4 px-4">Payment Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {applications.map((app) => {
                    const eventTitle = app.event?.name || "B.youth Summer Outlet";
                    const eventLocation = app.event?.location || "Downtown Katameya";

                    return (
                      <tr key={app.id} className="hover:bg-zinc-50/70 transition">
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <span className="font-bold text-zinc-900 block">{eventTitle}</span>
                            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-zinc-400" />
                              {eventLocation}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-400 block">
                              ID: {app.applicationCode}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-zinc-900 block">
                              {app.package?.name || "Standard Package"}
                            </span>
                            <span className="text-[11px] text-zinc-500">
                              {app.package?.price ? `${app.package.price.toLocaleString()} EGP` : ""}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {app.assignedBooth ? (
                            <span className="inline-flex items-center font-bold text-zinc-950 bg-kiwi-100 border border-kiwi-300 text-kiwi-900 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap tracking-wide">
                              {app.assignedBooth}
                            </span>
                          ) : (
                            <span className="text-zinc-400 text-[11px] whitespace-nowrap">Pending Allocation</span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          {getAppStatusBadge(app.appStatus, app.id)}
                        </td>

                        <td className="py-4 px-4">{getPaymentBadge(app.paymentStatus)}</td>

                        <td className="py-4 px-6 text-right">
                          <Link
                            href={`/dashboard/applications/${app.id}`}
                            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-sm hover:shadow"
                          >
                            <Eye className="w-3.5 h-3.5 text-zinc-300" />
                            Details & Timeline
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
