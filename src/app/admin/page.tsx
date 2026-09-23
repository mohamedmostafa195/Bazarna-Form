"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BazarnaStore } from "@/lib/store";
import {
  BazarnaEvent,
  BrandProfile,
  EventApplication,
  AuditLogEntry,
} from "@/lib/types";
import {
  Calendar,
  Users,
  FileCheck2,
  CreditCard,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Download,
  Eye,
  Building2,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [events, setEvents] = useState<BazarnaEvent[]>([]);
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [applications, setApplications] = useState<EventApplication[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    setEvents(BazarnaStore.getEvents());
    setBrands(BazarnaStore.getBrands());
    setApplications(BazarnaStore.getApplications());
    setAuditLogs(BazarnaStore.getAuditLogs());

    const handleUpdate = () => {
      setEvents(BazarnaStore.getEvents());
      setBrands(BazarnaStore.getBrands());
      setApplications(BazarnaStore.getApplications());
      setAuditLogs(BazarnaStore.getAuditLogs());
    };
    window.addEventListener("bazarna_store_updated", handleUpdate);
    return () => window.removeEventListener("bazarna_store_updated", handleUpdate);
  }, []);

  // Compute metrics
  const totalEvents = events.length;
  const upcomingEvents = events.filter(
    (e) => e.status === "UPCOMING" || e.status === "REGISTRATION_OPEN"
  ).length;
  const totalBrands = brands.length;
  const pendingApplications = applications.filter(
    (a) => a.appStatus === "SUBMITTED" || a.appStatus === "UNDER_REVIEW"
  ).length;
  const approvedApplications = applications.filter((a) => a.appStatus === "APPROVED").length;
  const pendingPayments = applications.filter(
    (a) => a.paymentStatus === "PENDING" || a.paymentStatus === "RECEIPT_UPLOADED"
  ).length;

  const totalRevenue = applications
    .filter((a) => a.paymentStatus === "PAID")
    .reduce((acc, a) => acc + (a.package?.price || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-950 font-display">
            Operational Overview
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Real-time status of all active Bazarna events, brand applications, and revenue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs shadow-soft-sm transition"
          >
            <Plus className="w-3.5 h-3.5 text-butter-300" />
            New Event
          </Link>
          <Link
            href="/admin/export"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 font-bold text-xs shadow-soft-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-kiwi-600" />
            Export Data
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-soft-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Events</span>
            <Calendar className="w-4 h-4 text-kiwi-600" />
          </div>
          <div className="text-3xl font-black text-zinc-950 font-display">{totalEvents}</div>
          <p className="text-[11px] text-zinc-500">{upcomingEvents} active / upcoming</p>
        </div>

        {/* Metric 2 */}
        <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-soft-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Brands</span>
            <Users className="w-4 h-4 text-butter-600" />
          </div>
          <div className="text-3xl font-black text-zinc-950 font-display">{totalBrands}</div>
          <p className="text-[11px] text-zinc-500">Reusable brand database</p>
        </div>

        {/* Metric 3 */}
        <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-soft-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-600 font-display">
            {pendingApplications}
          </div>
          <p className="text-[11px] text-zinc-500">
            {approvedApplications} approved applications
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-soft-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <CreditCard className="w-4 h-4 text-babyblue-600" />
          </div>
          <div className="text-3xl font-black text-zinc-950 font-display">
            {totalRevenue.toLocaleString()}{" "}
            <span className="text-sm font-bold text-zinc-400">EGP</span>
          </div>
          <p className="text-[11px] text-zinc-500">{pendingPayments} pending payments</p>
        </div>
      </div>

      {/* Main 2-Column Split: Applications & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Applications */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-sm space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-950">Recent Applications</h3>
              <p className="text-xs text-zinc-500">Latest brand submissions across all events</p>
            </div>
            <Link
              href="/admin/applications"
              className="text-xs font-bold text-kiwi-700 hover:underline flex items-center gap-1"
            >
              View all ({applications.length})
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase">
                  <th className="pb-3">App ID</th>
                  <th className="pb-3">Brand</th>
                  <th className="pb-3">Package</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.id} className="hover:bg-zinc-50/60 transition">
                    <td className="py-3 font-mono font-bold text-zinc-900">
                      {app.applicationCode}
                    </td>
                    <td className="py-3">
                      <div className="font-bold text-zinc-900">{app.brand.brandName}</div>
                      <div className="text-[10px] text-zinc-400">{app.brand.category}</div>
                    </td>
                    <td className="py-3">
                      <div className="text-zinc-800">{app.package?.name || "Package"}</div>
                      <div className="text-[10px] text-zinc-500">
                        {app.package?.price.toLocaleString()} EGP
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          app.appStatus === "APPROVED"
                            ? "bg-kiwi-100 text-kiwi-800"
                            : app.appStatus === "UNDER_REVIEW"
                            ? "bg-butter-100 text-butter-800"
                            : "bg-babyblue-100 text-babyblue-800"
                        }`}
                      >
                        {app.appStatus.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-[11px] transition"
                      >
                        <Eye className="w-3 h-3" />
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Live Audit Log */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-sm space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-950">Live Audit Trail</h3>
              <p className="text-xs text-zinc-500">Recorded administrative actions</p>
            </div>
            <Link
              href="/admin/audit-logs"
              className="text-xs font-bold text-zinc-500 hover:text-zinc-900"
            >
              Full Log
            </Link>
          </div>

          <div className="space-y-4">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="text-xs space-y-1 p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900">{log.adminName}</span>
                  <span className="text-[10px] text-zinc-400">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-zinc-700 leading-snug">{log.action}</p>
                {log.details && (
                  <p className="text-[11px] text-zinc-500 leading-tight pt-0.5">{log.details}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
