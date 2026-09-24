"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BazarnaStore } from "@/lib/store";
import { BrandProfile, EventApplication } from "@/lib/types";
import {
  Users,
  Search,
  Store,
  MapPin,
  Calendar,
  CheckCircle2,
  FileText,
  Eye,
  Instagram,
  ExternalLink,
  ShieldCheck,
  Building2,
} from "lucide-react";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [applications, setApplications] = useState<EventApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<BrandProfile | null>(null);

  useEffect(() => {
    setBrands(BazarnaStore.getBrands());
    setApplications(BazarnaStore.getApplications());

    // Immediately trigger server sync to reflect any manual database changes
    BazarnaStore.syncWithServer();

    const handleUpdate = () => {
      setBrands(BazarnaStore.getBrands());
      setApplications(BazarnaStore.getApplications());
    };
    window.addEventListener("bazarna_store_updated", handleUpdate);
    return () => window.removeEventListener("bazarna_store_updated", handleUpdate);
  }, []);

  const filtered = brands.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.brandName.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.contactName.toLowerCase().includes(q) ||
      b.contactEmail.toLowerCase().includes(q)
    );
  });

  const getBrandHistory = (brand: BrandProfile) => {
    return applications.filter(
      (a) =>
        a.brandId === brand.id ||
        (a.brand?.brandName && a.brand.brandName.toLowerCase() === brand.brandName.toLowerCase()) ||
        (a.brand?.contactEmail && a.brand.contactEmail.toLowerCase() === brand.contactEmail.toLowerCase())
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-950 font-display">
            Reusable Brand Database
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Persistent profiles of all participating Egyptian brands and their cumulative event history.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-soft-sm flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by brand name, category, contact, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-kiwi-400"
          />
        </div>
        <span className="text-xs text-zinc-400">{filtered.length} brands found</span>
      </div>

      {/* Grid of Brands */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((brand) => {
          const history = getBrandHistory(brand);
          const hasDocs = brand.documents && brand.documents.length > 0;

          return (
            <div
              key={brand.id}
              className="bg-white rounded-3xl border border-zinc-200/90 shadow-soft-sm hover:shadow-soft-md transition p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-zinc-950">{brand.brandName}</h3>
                    <span className="text-xs font-semibold text-kiwi-700 bg-kiwi-50 px-2.5 py-0.5 rounded-full inline-block">
                      {brand.category}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-xs">
                    {brand.brandName[0]}
                  </div>
                </div>

                <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                  {brand.aboutBrand || "No description provided."}
                </p>

                <div className="pt-2 border-t border-zinc-100 space-y-1.5 text-xs text-zinc-600">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Contact:</span>
                    <strong className="text-zinc-900">{brand.contactName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Email:</span>
                    <span className="truncate max-w-[170px] text-zinc-800">{brand.contactEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Tax ID:</span>
                    <span className="font-mono text-zinc-900">{brand.taxId || "Not on file"}</span>
                  </div>
                </div>

                {/* Event History Chips */}
                <div className="pt-2 border-t border-zinc-100 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                    Event History ({history.length}):
                  </span>
                  {history.length > 0 ? (
                    <div className="space-y-1">
                      {history.map((app) => (
                        <div
                          key={app.id}
                          className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between text-[11px]"
                        >
                          <span className="font-medium text-zinc-800 truncate max-w-[150px]">
                            {app.event?.name.split("|")[0]}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              app.appStatus === "APPROVED"
                                ? "bg-kiwi-100 text-kiwi-800"
                                : "bg-zinc-200 text-zinc-700"
                            }`}
                          >
                            {app.appStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-400 italic">No events joined yet</span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">
                  {hasDocs ? "✓ Legal Docs Saved" : "Missing Docs"}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedBrand(brand)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-kiwi-700 hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Full Dossier
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Brand Dossier Modal */}
      {selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white max-w-xl w-full rounded-3xl p-6 sm:p-8 shadow-soft-xl border border-zinc-200 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
              <div>
                <span className="text-xs font-bold text-kiwi-700 bg-kiwi-50 px-2.5 py-0.5 rounded-full">
                  {selectedBrand.category}
                </span>
                <h3 className="text-xl font-black text-zinc-950 font-display mt-1">
                  {selectedBrand.brandName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBrand(null)}
                className="text-xs font-bold text-zinc-400 hover:text-zinc-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-50 space-y-2">
                <span className="font-bold text-zinc-900 block">Brand Details:</span>
                <p className="text-zinc-700 leading-relaxed">{selectedBrand.aboutBrand}</p>
                {selectedBrand.products && (
                  <p className="text-zinc-600">
                    <strong>Products:</strong> {selectedBrand.products}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-50">
                <div>
                  <span className="text-zinc-400 block font-semibold">Contact Name</span>
                  <strong className="text-zinc-900">{selectedBrand.contactName}</strong>
                </div>
                <div>
                  <span className="text-zinc-400 block font-semibold">Phone</span>
                  <strong className="text-zinc-900">{selectedBrand.contactPhone}</strong>
                </div>
                <div>
                  <span className="text-zinc-400 block font-semibold">Email</span>
                  <strong className="text-zinc-900">{selectedBrand.contactEmail}</strong>
                </div>
                <div>
                  <span className="text-zinc-400 block font-semibold">Tax ID</span>
                  <strong className="font-mono text-zinc-900">{selectedBrand.taxId || "N/A"}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
