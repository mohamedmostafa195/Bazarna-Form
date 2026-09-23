"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { BazarnaStore } from "@/lib/store";
import { BrandProfile, BrandDocument, DocumentStatus } from "@/lib/types";
import {
  Store,
  User,
  ShieldCheck,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Save,
  Instagram,
  Facebook,
  Globe,
  Trash2,
  ExternalLink,
  Eye,
} from "lucide-react";

const CATEGORIES = [
  "Girl's Fashion",
  "Guy's Fashion",
  "Unisex Fashion",
  "Fashion Wear",
  "Accessories",
  "Fashion Accessories (Hats, Sunglasses..)",
  "Handbags & Footwear",
  "Home Accessories",
  "Skin, Hair care & Makeup",
  "Stationery & Supplies",
  "Kids Wear",
  "Arts & Portraits",
  "Farmers Market",
  "Food & Beverage",
  "Retail",
  "NGO",
  "Others",
];

export default function BrandProfilePage() {
  const { currentBrand, addToast } = useAuth();

  // Local state initialized with current permanent brand profile
  const [formData, setFormData] = useState<BrandProfile>({ ...currentBrand });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"brand" | "contact" | "legal" | "documents">("brand");

  const handleTextChange = (field: keyof BrandProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      BazarnaStore.saveBrand(formData);
      addToast(
        "success",
        "Brand Profile Saved",
        "Your permanent brand profile has been updated and will automatically apply to all events."
      );
    } catch (err) {
      addToast("error", "Save Failed", "Could not save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Mock file upload handler
  const handleFileUpload = (docType: "TAX_ID_CARD" | "NATIONAL_ID", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast("error", "File Too Large", "Maximum supported file size is 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const newDoc: BrandDocument = {
        id: `doc-${Date.now()}`,
        brandId: formData.id,
        documentType: docType,
        fileName: file.name,
        fileUrl: reader.result as string,
        fileSize: file.size,
        status: "UNDER_REVIEW",
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existingDocs = formData.documents || [];
      const updatedDocs = [
        ...existingDocs.filter((d) => d.documentType !== docType),
        newDoc,
      ];

      const updatedProfile = { ...formData, documents: updatedDocs };
      setFormData(updatedProfile);
      BazarnaStore.saveBrand(updatedProfile);

      addToast(
        "success",
        "Document Uploaded",
        `${file.name} uploaded and set for operations review.`
      );
    };
    reader.readAsDataURL(file);
  };

  const getDoc = (docType: string) => {
    return formData.documents?.find((d) => d.documentType === docType);
  };

  const getDocStatusBadge = (status?: DocumentStatus) => {
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
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      case "UPLOADED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-babyblue-100 text-babyblue-800 border border-babyblue-300">
            Uploaded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-500">
            Missing Document
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-kiwi-700 bg-kiwi-100 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Permanent Brand Profile
          </div>
          <h1 className="text-3xl font-black text-zinc-950 font-display">
            {formData.brandName || "Brand Profile"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Your brand info, legal details, and documents are saved once and automatically pre-filled into all event applications.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-kiwi-500 hover:bg-kiwi-600 text-white font-bold text-sm shadow-kiwi-glow transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("brand")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "brand"
              ? "border-kiwi-500 text-zinc-950"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          1. Brand Information
        </button>
        <button
          onClick={() => setActiveTab("contact")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "contact"
              ? "border-kiwi-500 text-zinc-950"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          2. Contact Details
        </button>
        <button
          onClick={() => setActiveTab("legal")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "legal"
              ? "border-kiwi-500 text-zinc-950"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          3. Legal & Tax IDs
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "documents"
              ? "border-kiwi-500 text-zinc-950"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          4. Documents
          <span className="w-2 h-2 rounded-full bg-kiwi-500" />
        </button>
      </div>

      {/* Tab 1: Brand Info */}
      {activeTab === "brand" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-soft-sm space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">
                Brand Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) => handleTextChange("brandName", e.target.value)}
                placeholder="e.g. Cairo Threads"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kiwi-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleTextChange("category", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kiwi-400 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-800">About Your Brand</label>
            <textarea
              rows={3}
              value={formData.aboutBrand || ""}
              onChange={(e) => handleTextChange("aboutBrand", e.target.value)}
              placeholder="Tell Bazarna shoppers and curation team more about your brand story, aesthetics, and vision..."
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kiwi-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-800">
              List Your Products <span className="text-zinc-400 font-normal">(The types of items you exhibit)</span>
            </label>
            <input
              type="text"
              value={formData.products || ""}
              onChange={(e) => handleTextChange("products", e.target.value)}
              placeholder="e.g. Oversized tees, hoodies, embroidered caps, tote bags"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kiwi-400"
            />
          </div>

          <div className="pt-4 border-t border-zinc-100 space-y-4">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Social Media & Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                  Instagram URL / Handle
                </label>
                <input
                  type="text"
                  value={formData.instagram || ""}
                  onChange={(e) => handleTextChange("instagram", e.target.value)}
                  placeholder="https://instagram.com/yourbrand"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-kiwi-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                  <Facebook className="w-3.5 h-3.5 text-blue-600" />
                  Facebook URL
                </label>
                <input
                  type="text"
                  value={formData.facebook || ""}
                  onChange={(e) => handleTextChange("facebook", e.target.value)}
                  placeholder="https://facebook.com/yourbrand"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-kiwi-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">TikTok URL</label>
                <input
                  type="text"
                  value={formData.tiktok || ""}
                  onChange={(e) => handleTextChange("tiktok", e.target.value)}
                  placeholder="https://tiktok.com/@yourbrand"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-kiwi-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-zinc-500" />
                  Website
                </label>
                <input
                  type="text"
                  value={formData.website || ""}
                  onChange={(e) => handleTextChange("website", e.target.value)}
                  placeholder="https://yourbrand.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-kiwi-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Contact Details */}
      {activeTab === "contact" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-soft-sm space-y-6 animate-in fade-in">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-800">
              Primary Contact Name (اسم الشخص ثلاثي) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => handleTextChange("contactName", e.target.value)}
              placeholder="e.g. Farida Mansour"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kiwi-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">
                Contact Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleTextChange("contactEmail", e.target.value)}
                placeholder="contact@yourbrand.eg"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kiwi-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">
                Mobile Number (رقم التليفون) <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleTextChange("contactPhone", e.target.value)}
                placeholder="+20 100 000 0000"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kiwi-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Legal & Tax */}
      {activeTab === "legal" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-soft-sm space-y-6 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-babyblue-50 border border-babyblue-200 text-xs text-babyblue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-babyblue-700" />
              Official Egyptian Operations Compliance
            </div>
            <p>
              In accordance with Egyptian event licensing, all participating brands are required to provide their Tax ID and National ID numbers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">
                TAX ID Number (الرقم الضريبي)
              </label>
              <input
                type="text"
                value={formData.taxId || ""}
                onChange={(e) => handleTextChange("taxId", e.target.value)}
                placeholder="e.g. 492-819-204"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-kiwi-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">
                National ID Number (رقم القومي)
              </label>
              <input
                type="text"
                value={formData.nationalId || ""}
                onChange={(e) => handleTextChange("nationalId", e.target.value)}
                placeholder="14-digit Egyptian National ID"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-kiwi-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Documents */}
      {activeTab === "documents" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-soft-sm space-y-8 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-zinc-950">Brand Verification Documents</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Upload your documents once. When you apply to future Bazarna events, your approved documents remain active.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tax ID Card */}
            {(() => {
              const doc = getDoc("TAX_ID_CARD");
              return (
                <div className="p-6 rounded-2xl border border-zinc-200 bg-zinc-50/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-kiwi-600" />
                      <h4 className="text-sm font-bold text-zinc-900">Tax ID Card (صورة البطاقة الضريبية)</h4>
                    </div>
                    {getDocStatusBadge(doc?.status)}
                  </div>

                  {doc ? (
                    <div className="p-3 bg-white rounded-xl border border-zinc-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-800 truncate max-w-[200px]">
                          {doc.fileName}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          {(doc.fileSize / 1024).toFixed(0)} KB
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-kiwi-700 hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View Document
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-zinc-300 rounded-xl text-center space-y-1">
                      <p className="text-xs text-zinc-500">No Tax ID card uploaded yet.</p>
                    </div>
                  )}

                  <div>
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 shadow-soft-sm transition">
                      <Upload className="w-3.5 h-3.5 text-zinc-500" />
                      {doc ? "Replace Tax ID Card" : "Upload Tax ID Card"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => handleFileUpload("TAX_ID_CARD", e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              );
            })()}

            {/* National ID */}
            {(() => {
              const doc = getDoc("NATIONAL_ID");
              return (
                <div className="p-6 rounded-2xl border border-zinc-200 bg-zinc-50/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-butter-600" />
                      <h4 className="text-sm font-bold text-zinc-900">National ID (صورة البطاقة الشخصية)</h4>
                    </div>
                    {getDocStatusBadge(doc?.status)}
                  </div>

                  {doc ? (
                    <div className="p-3 bg-white rounded-xl border border-zinc-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-800 truncate max-w-[200px]">
                          {doc.fileName}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          {(doc.fileSize / 1024).toFixed(0)} KB
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-kiwi-700 hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View Document
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-zinc-300 rounded-xl text-center space-y-1">
                      <p className="text-xs text-zinc-500">No National ID uploaded yet.</p>
                    </div>
                  )}

                  <div>
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 shadow-soft-sm transition">
                      <Upload className="w-3.5 h-3.5 text-zinc-500" />
                      {doc ? "Replace National ID" : "Upload National ID"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => handleFileUpload("NATIONAL_ID", e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
