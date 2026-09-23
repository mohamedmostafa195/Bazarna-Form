"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { BazarnaStore } from "@/lib/store";
import { BazarnaEvent, EventApplication } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import {
  Download,
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";

export default function AdminExportPage() {
  const { addToast } = useAuth();
  const [events, setEvents] = useState<BazarnaEvent[]>([]);
  const [applications, setApplications] = useState<EventApplication[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("ALL");

  useEffect(() => {
    setEvents(BazarnaStore.getEvents());
    setApplications(BazarnaStore.getApplications());
  }, []);

  const handleExportExcel = () => {
    const dataToExport = (
      selectedEventId === "ALL"
        ? applications
        : applications.filter((a) => a.eventId === selectedEventId)
    ).map((app) => ({
      "Application ID": app.applicationCode,
      "Event Name": app.event?.name || "B.youth Summer Outlet",
      "Brand Name": app.brand.brandName,
      Category: app.brand.category,
      "Contact Person": app.brand.contactName,
      "Contact Email": app.brand.contactEmail,
      "Contact Phone": app.brand.contactPhone,
      "TAX ID Number": app.brand.taxId || "N/A",
      "National ID Number": app.brand.nationalId || "N/A",
      "Instagram URL": app.brand.instagram || "N/A",
      "Selected Package": app.package?.name || "N/A",
      "Package Price (EGP)": app.package?.price || 0,
      "PR Campaign Participation": app.prParticipation ? "YES" : "NO",
      "Payment Method": app.payment?.method || "BANK_TRANSFER",
      "Payment Status": app.paymentStatus,
      "Application Status": app.appStatus,
      "Assigned Booth": app.assignedBooth || "Unassigned",
      "Submission Date": new Date(app.createdAt).toISOString(),
      "T&C Accepted Version": app.tcVersion,
      "Special Requests & Notes": app.notes || "None",
    }));

    if (dataToExport.length === 0) {
      addToast("error", "No Data", "No applications available to export.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bazarna_Applications");

    // Write file
    const dateStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `Bazarna_Event_Export_${dateStr}.xlsx`);

    addToast(
      "success",
      "Excel Exported",
      `Exported ${dataToExport.length} brand records to Excel.`
    );
  };

  const handleExportCSV = () => {
    const dataToExport = (
      selectedEventId === "ALL"
        ? applications
        : applications.filter((a) => a.eventId === selectedEventId)
    ).map((app) => ({
      "Application ID": app.applicationCode,
      "Event Name": app.event?.name || "B.youth Summer Outlet",
      "Brand Name": app.brand.brandName,
      Category: app.brand.category,
      "Contact Person": app.brand.contactName,
      "Contact Email": app.brand.contactEmail,
      "Contact Phone": app.brand.contactPhone,
      "TAX ID Number": app.brand.taxId || "N/A",
      "National ID Number": app.brand.nationalId || "N/A",
      "Selected Package": app.package?.name || "N/A",
      "Package Price (EGP)": app.package?.price || 0,
      "PR Campaign": app.prParticipation ? "YES" : "NO",
      "Payment Status": app.paymentStatus,
      "Application Status": app.appStatus,
      "Assigned Booth": app.assignedBooth || "Unassigned",
      "Submission Date": new Date(app.createdAt).toISOString(),
    }));

    if (dataToExport.length === 0) {
      addToast("error", "No Data", "No applications available to export.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Bazarna_Applications_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast("success", "CSV Exported", `Downloaded CSV file.`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-zinc-950 font-display">
          Export Operational Data
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500">
          Generate complete spreadsheets for on-ground logistics, gate passes, badge printing, and accounting.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-sm space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-800">Select Event to Export</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-800 focus:ring-2 focus:ring-kiwi-400 bg-white"
          >
            <option value="ALL">All Events (Consolidated Master File)</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
        </div>

        {/* Columns Included Notice */}
        <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
          <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider block">
            Included Columns in Export:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-zinc-600 font-medium">
            <span>✓ Application ID</span>
            <span>✓ Brand Name</span>
            <span>✓ Category</span>
            <span>✓ Contact Person</span>
            <span>✓ Email & Mobile</span>
            <span>✓ Tax ID Number</span>
            <span>✓ National ID Number</span>
            <span>✓ Instagram Handle</span>
            <span>✓ Package & Price</span>
            <span>✓ PR Participation</span>
            <span>✓ Payment Method</span>
            <span>✓ Payment Status</span>
            <span>✓ Application Status</span>
            <span>✓ Assigned Booth</span>
            <span>✓ Submission Timestamp</span>
            <span>✓ Special Requests/Notes</span>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-zinc-100">
          <button
            onClick={handleExportExcel}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-kiwi-500 hover:bg-kiwi-600 text-white font-bold text-xs shadow-kiwi-glow transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-butter-200" />
            Export to Excel (.xlsx)
          </button>

          <button
            onClick={handleExportCSV}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 font-bold text-xs shadow-soft-sm transition"
          >
            <Download className="w-4 h-4 text-zinc-500" />
            Export to CSV
          </button>
        </div>
      </div>
    </div>
  );
}
