"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { BazarnaStore } from "@/lib/store";
import { BrandProfile } from "@/lib/types";
import { readFileAsOptimizedDataUrl } from "@/lib/image-util";
import {
  Sparkles,
  Save,
  Instagram,
  Facebook,
  Globe,
  Camera,
  Trash2,
  CheckCircle2,
  User,
  Mail,
  Phone,
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
  const { currentBrand, addToast, user } = useAuth();

  // Local state initialized with current permanent brand profile
  const [formData, setFormData] = useState<BrandProfile>({ ...currentBrand });
  const [activeTab, setActiveTab] = useState<"brand" | "contact">("brand");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Keep formData in sync whenever currentBrand updates or switches
  useEffect(() => {
    if (currentBrand) {
      setFormData({ ...currentBrand });
    }
  }, [currentBrand]);

  const handleTextChange = (field: keyof BrandProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast("error", "File Too Large", "Maximum supported image size is 10MB.");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const optimizedUrl = await readFileAsOptimizedDataUrl(file, 400, 0.82);
      const updated = { ...formData, logoUrl: optimizedUrl };
      setFormData(updated);
      BazarnaStore.saveBrand(updated);
      addToast("success", "Photo Uploaded", "Profile photo / brand logo updated successfully.");
    } catch (err) {
      console.error("Photo upload error:", err);
      addToast("error", "Upload Failed", "Could not process image file.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    const updated = { ...formData, logoUrl: undefined };
    setFormData(updated);
    BazarnaStore.saveBrand(updated);
    addToast("info", "Photo Removed", "Profile photo removed.");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.brandName?.trim()) {
      addToast("error", "Required Field", "Brand Name is required.");
      setActiveTab("brand");
      return;
    }

    if (!formData.contactName?.trim()) {
      addToast("error", "Required Field", "Contact Person Name is required.");
      setActiveTab("contact");
      return;
    }

    if (!formData.contactEmail?.trim()) {
      addToast("error", "Required Field", "Contact Email is required.");
      setActiveTab("contact");
      return;
    }

    if (!formData.contactPhone?.trim()) {
      addToast("error", "Required Field", "Contact Phone is required.");
      setActiveTab("contact");
      return;
    }

    setIsSaving(true);

    try {
      BazarnaStore.saveBrand(formData);
      addToast(
        "success",
        "Brand Profile Saved",
        "Your brand information and contact details have been updated successfully."
      );
    } catch (err) {
      addToast("error", "Save Failed", "Could not save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const initialLetter = (formData.brandName || user?.name || "B").charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-bazarna-red bg-red-50 border border-red-200 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-bazarna-red" />
            Brand Profile
          </div>
          <h1 className="text-3xl font-black text-zinc-950 font-display">
            {formData.brandName || "Brand Profile"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Manage your brand identity, photo, and official contact information.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-sm shadow-soft-sm transition disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {/* Tabs: Brand Information & Contact Details */}
      <div className="flex border-b border-zinc-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("brand")}
          className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "brand"
              ? "border-bazarna-red text-zinc-950"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          1. Brand Information
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("contact")}
          className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "contact"
              ? "border-bazarna-red text-zinc-950"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          2. Contact Details
        </button>
      </div>

      {/* Tab 1: Brand Information */}
      {activeTab === "brand" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-md space-y-8 animate-in fade-in">
          {/* User / Brand Profile Photo Upload Widget */}
          <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar Preview */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-bazarna-red to-rose-700 text-white flex items-center justify-center font-black text-3xl shadow-soft-md ring-4 ring-white overflow-hidden border border-zinc-200">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt={formData.brandName || "Brand Logo"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initialLetter}</span>
                )}
              </div>
              {formData.logoUrl && (
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-soft-xs ring-2 ring-white">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              )}
            </div>

            {/* Upload Controls */}
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div>
                <h3 className="text-sm font-bold text-zinc-950">Brand Profile Photo / Logo</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Upload a high-resolution logo or avatar. Displayed across your profile, bookings, and navigation menu.
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Supported: JPG, PNG, WEBP (Max 10MB)
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs border border-zinc-300 shadow-soft-xs transition">
                  <Camera className="w-4 h-4 text-bazarna-red" />
                  {formData.logoUrl ? "Change Photo" : "Upload Photo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                    className="hidden"
                  />
                </label>

                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
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
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleTextChange("category", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30 bg-white"
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
                rows={4}
                value={formData.aboutBrand || ""}
                onChange={(e) => handleTextChange("aboutBrand", e.target.value)}
                placeholder="Tell Bazarna shoppers and curation team more about your brand story, aesthetics, and vision..."
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
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
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
              />
            </div>

            {/* Social Media & Links */}
            <div className="pt-6 border-t border-zinc-100 space-y-4">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Social Media & Online Links
              </h3>
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
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700">TikTok URL</label>
                  <input
                    type="text"
                    value={formData.tiktok || ""}
                    onChange={(e) => handleTextChange("tiktok", e.target.value)}
                    placeholder="https://tiktok.com/@yourbrand"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="pt-6 border-t border-zinc-100 flex items-center justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-sm shadow-soft-sm transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Contact Details */}
      {activeTab === "contact" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-md space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-zinc-950">Official Contact Person Details</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              These details will be used by Bazarna organizers for official coordination, notices, and on-ground logistics.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-bazarna-red" />
                Contact Person Name (اسم الشخص ثلاثي) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => handleTextChange("contactName", e.target.value)}
                placeholder="e.g. Farida Mansour"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  Contact Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleTextChange("contactEmail", e.target.value)}
                  placeholder="contact@yourbrand.eg"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-500" />
                  Mobile Number (رقم التليفون) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleTextChange("contactPhone", e.target.value)}
                  placeholder="+20 100 000 0000"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
                />
              </div>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="pt-6 border-t border-zinc-100 flex items-center justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-sm shadow-soft-sm transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
