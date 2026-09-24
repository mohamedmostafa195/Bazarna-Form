"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { BazarnaStore } from "@/lib/store";
import {
  EventApplication,
  ApplicationStatus,
  PaymentStatus,
  BazarnaEvent,
} from "@/lib/types";
import {
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Building2,
  Check,
  X,
  MapPin,
  Download,
  Trash2,
} from "lucide-react";

export default function AdminApplicationsPage() {
  const { addToast } = useAuth();
  const [applications, setApplications] = useState<EventApplication[]>([]);
  const [events, setEvents] = useState<BazarnaEvent[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("ALL");
  const [appStatusFilter, setAppStatusFilter] = useState("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
  const [deleteApp, setDeleteApp] = useState<EventApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setApplications(BazarnaStore.getApplications());
    setEvents(BazarnaStore.getEvents());

    // Sync with MongoDB Atlas immediately
    BazarnaStore.syncWithServer();

    const handleUpdate = () => {
      setApplications(BazarnaStore.getApplications());
      setEvents(BazarnaStore.getEvents());
    };
    window.addEventListener("bazarna_store_updated", handleUpdate);
    return () => window.removeEventListener("bazarna_store_updated", handleUpdate);
  }, []);

  const handleQuickStatus = (appId: string, newStatus: ApplicationStatus) => {
    BazarnaStore.updateApplicationStatus(appId, newStatus, "Ahmed Operations");
    setApplications(BazarnaStore.getApplications());
    addToast("info", "Status Updated", `Application marked as ${newStatus.replace("_", " ")}`);
  };

  const handleQuickPayment = (appId: string, newStatus: PaymentStatus) => {
    BazarnaStore.updatePaymentStatus(appId, newStatus, "Dina Finance");
    setApplications(BazarnaStore.getApplications());
    addToast("info", "Payment Updated", `Payment marked as ${newStatus.replace("_", " ")}`);
  };

  const handleDeleteApplication = async (app: EventApplication) => {
    setIsDeleting(true);
    try {
      BazarnaStore.deleteApplication(app.id, "Ahmed Operations");
      setApplications(BazarnaStore.getApplications());
      addToast("success", "Application Deleted", `Application ${app.applicationCode} was deleted.`);
      setDeleteApp(null);
    } catch (err) {
      console.error("Error deleting application:", err);
      addToast("error", "Delete Failed", "Failed to delete application.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = applications.filter((app) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      app.applicationCode.toLowerCase().includes(q) ||
      app.brand.brandName.toLowerCase().includes(q) ||
      app.brand.contactName.toLowerCase().includes(q) ||
      app.brand.contactEmail.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (eventFilter !== "ALL" && app.eventId !== eventFilter) return false;
    if (appStatusFilter !== "ALL" && app.appStatus !== appStatusFilter) return false;
    if (paymentStatusFilter !== "ALL" && app.paymentStatus !== paymentStatusFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-950 font-display">
            Application Management
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Review brand dossiers, verify payment receipts, approve applications, and assign booth locations.
          </p>
        </div>

        <Link
          href="/admin/export"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-800 shadow-soft-sm transition"
        >
          <Download className="w-3.5 h-3.5 text-kiwi-600" />
          Export to Excel/CSV
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-soft-sm flex flex-col lg:flex-row items-center gap-3">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search brand, app code, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-kiwi-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Event Filter */}
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700"
          >
            <option value="ALL">All Events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name.split("|")[0]}
              </option>
            ))}
          </select>

          {/* App Status Filter */}
          <select
            value={appStatusFilter}
            onChange={(e) => setAppStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700"
          >
            <option value="ALL">All App Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="CHANGES_REQUESTED">Changes Requested</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="RECEIPT_UPLOADED">Receipt Uploaded</option>
            <option value="PAID">Paid & Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-soft-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="py-4 px-6">App Code</th>
                <th className="py-4 px-4">Brand</th>
                <th className="py-4 px-4">Event</th>
                <th className="py-4 px-4">Package & Price</th>
                <th className="py-4 px-4 whitespace-nowrap">Booth</th>
                <th className="py-4 px-4">App Status</th>
                <th className="py-4 px-4">Payment</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-zinc-400">
                    No applications match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-zinc-50/70 transition">
                    <td className="py-4 px-6 font-mono font-bold text-zinc-950">
                      {app.applicationCode}
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-zinc-900 block">{app.brand.brandName}</span>
                        <span className="text-[11px] text-zinc-500">{app.brand.category}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="truncate max-w-[180px] block text-zinc-700 font-medium">
                        {app.event?.name.split("|")[0] || "B.youth Summer Outlet"}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-zinc-900 block">{app.package?.name}</span>
                        <span className="font-mono text-[11px] text-kiwi-700 font-bold">
                          {app.package?.price.toLocaleString()} EGP
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {app.assignedBooth ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-kiwi-100 text-kiwi-950 font-bold border border-kiwi-300 text-xs whitespace-nowrap tracking-wide">
                          {app.assignedBooth}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[11px] whitespace-nowrap">Unassigned</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          app.appStatus === "APPROVED"
                            ? "bg-kiwi-100 text-kiwi-800"
                            : app.appStatus === "UNDER_REVIEW"
                            ? "bg-butter-100 text-butter-800"
                            : app.appStatus === "CHANGES_REQUESTED"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-babyblue-100 text-babyblue-800"
                        }`}
                      >
                        {app.appStatus.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          app.paymentStatus === "PAID"
                            ? "bg-kiwi-100 text-kiwi-800"
                            : app.paymentStatus === "RECEIPT_UPLOADED"
                            ? "bg-babyblue-100 text-babyblue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {app.paymentStatus.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/applications/${app.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-[11px] shadow-soft-sm transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-butter-300" />
                          Review Dossier
                        </Link>

                        <button
                          type="button"
                          onClick={() => setDeleteApp(app)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200/80 font-bold text-[11px] transition shadow-soft-xs"
                          title="Delete Application"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-soft-xl border border-zinc-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-900">Delete Application</h4>
                <p className="text-xs text-zinc-500">
                  Are you sure you want to permanently delete application{" "}
                  <strong className="text-zinc-950 font-mono">{deleteApp.applicationCode}</strong>?
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-1 text-xs text-zinc-600">
              <div>
                <span className="font-semibold text-zinc-400">Brand: </span>
                <strong className="text-zinc-900">{deleteApp.brand?.brandName}</strong>
              </div>
              <div>
                <span className="font-semibold text-zinc-400">Event: </span>
                <span className="text-zinc-800">{deleteApp.event?.name?.split("|")[0]}</span>
              </div>
              <div>
                <span className="font-semibold text-zinc-400">Package: </span>
                <span className="text-zinc-800">{deleteApp.package?.name}</span>
              </div>
            </div>

            <p className="text-[11px] text-rose-600 font-medium">
              ⚠️ This action cannot be undone. This application will be removed from MongoDB Atlas and package inventory will be restored.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeleteApplication(deleteApp)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition shadow-soft-sm inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
