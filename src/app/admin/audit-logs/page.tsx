"use client";

import React, { useState, useEffect } from "react";
import { BazarnaStore } from "@/lib/store";
import { AuditLogEntry } from "@/lib/types";
import { ShieldAlert, Search, Calendar, User, Clock, FileText } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLogs(BazarnaStore.getAuditLogs());

    const handleUpdate = () => {
      setLogs(BazarnaStore.getAuditLogs());
    };
    window.addEventListener("bazarna_store_updated", handleUpdate);
    return () => window.removeEventListener("bazarna_store_updated", handleUpdate);
  }, []);

  const filtered = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.adminName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      (log.details && log.details.toLowerCase().includes(q)) ||
      log.targetId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div>
        <h2 className="text-2xl font-black text-zinc-950 font-display">
          Operations & Financial Audit Trail
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500">
          Immutable logging of application approvals, payment reconciliations, booth assignments, and event modifications.
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-soft-sm flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by admin name, action, application code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-kiwi-400"
          />
        </div>
        <span className="text-xs text-zinc-400">{filtered.length} log entries</span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-soft-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-4">Admin / Actor</th>
                <th className="py-4 px-4">Action</th>
                <th className="py-4 px-4">Target Type</th>
                <th className="py-4 px-6">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50/70 transition">
                  <td className="py-4 px-6 whitespace-nowrap text-zinc-500 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-4 px-4 font-bold text-zinc-900 whitespace-nowrap">
                    {log.adminName}
                  </td>
                  <td className="py-4 px-4 font-medium text-zinc-900">
                    {log.action}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 text-zinc-700">
                      {log.targetType}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-zinc-500 text-[11px] max-w-xs truncate">
                    {log.details || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
