"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { BazarnaStore } from "@/lib/store";
import {
  BazarnaEvent,
  EventPackage,
  EventQuestion,
  QuestionType,
  EventStatus,
} from "@/lib/types";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  CreditCard,
  Layers,
  Save,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  X,
} from "lucide-react";

const WIZARD_STEPS = [
  "1. Basic Info",
  "2. Location & Dates",
  "3. Packages",
  "4. Payment Details",
  "5. Terms & Conditions",
  "6. Custom Questions",
  "7. Review & Save",
];

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;
  const { addToast } = useAuth();

  const [loading, setLoading] = useState(true);
  const [eventNotFound, setEventNotFound] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [location, setLocation] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [regOpenDate, setRegOpenDate] = useState("");
  const [regCloseDate, setRegCloseDate] = useState("");
  const [capacity, setCapacity] = useState(60);
  const [status, setStatus] = useState<EventStatus>("UPCOMING");

  // Packages list
  const [packages, setPackages] = useState<EventPackage[]>([]);

  // Payment info
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [instapayHandle, setInstapayHandle] = useState("");

  // T&C
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [tcVersion, setTcVersion] = useState("2026.1");

  // Questions
  const [questions, setQuestions] = useState<EventQuestion[]>([]);

  useEffect(() => {
    if (!eventId) return;
    const existing = BazarnaStore.getEventById(eventId) || BazarnaStore.getEventBySlug(eventId);
    if (!existing) {
      setEventNotFound(true);
      setLoading(false);
      return;
    }

    setName(existing.name || "");
    setSlug(existing.slug || "");
    setDescription(existing.description || "");
    setCoverImage(existing.coverImage || "");
    setLocation(existing.location || "");
    setGoogleMapsUrl(existing.googleMapsUrl || "");

    // Format ISO string to datetime-local input format (YYYY-MM-DDTHH:MM)
    const formatForInput = (isoString?: string) => {
      if (!isoString) return "";
      try {
        const d = new Date(isoString);
        return d.toISOString().slice(0, 16);
      } catch {
        return "";
      }
    };

    setStartDate(formatForInput(existing.startDate));
    setEndDate(formatForInput(existing.endDate));
    setStartTime(existing.startTime || "11:00 AM");
    setEndTime(existing.endTime || "11:00 PM");
    setRegOpenDate(formatForInput(existing.regOpenDate));
    setRegCloseDate(formatForInput(existing.regCloseDate));
    setCapacity(existing.capacity || 50);
    setStatus(existing.status || "UPCOMING");

    setPackages(existing.packages || []);
    setBankName(existing.bankName || "");
    setAccountName(existing.accountName || "");
    setAccountNumber(existing.accountNumber || "");
    setInstapayHandle(existing.instapayHandle || "");
    setTermsAndConditions(existing.termsAndConditions || "");
    setTcVersion(existing.tcVersion || "2026.1");
    setQuestions(existing.questions || []);

    setLoading(false);
  }, [eventId]);

  const handleAddPackage = () => {
    setPackages([
      ...packages,
      {
        id: `pkg-${Date.now()}-${packages.length}`,
        eventId: eventId,
        name: "New Custom Package",
        price: 18000,
        description: "Package details and space dimensions",
        includedItems: "Space, 2 Chairs, Power Socket",
        totalQty: 15,
        remainingQty: 15,
        isActive: true,
      },
    ]);
  };

  const handleRemovePackage = (index: number) => {
    setPackages(packages.filter((_, i) => i !== index));
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast("error", "Invalid File", "Please upload an image file (PNG, JPG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(reader.result as string);
      addToast("success", "Cover Image Selected", `"${file.name}" ready.`);
    };
    reader.readAsDataURL(file);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q-${Date.now()}-${questions.length}`,
        eventId: eventId,
        questionText: "New Question",
        questionType: "TEXT",
        isRequired: false,
        orderIndex: questions.length + 1,
      },
    ]);
  };

  const handleSave = (customStatus?: EventStatus) => {
    if (!name || !slug) {
      addToast("error", "Missing Info", "Event name and URL slug are required.");
      return;
    }

    const finalStatus = customStatus || status;

    const updatedEvent: BazarnaEvent = {
      id: eventId,
      name,
      slug,
      description,
      coverImage,
      location,
      googleMapsUrl,
      startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : new Date().toISOString(),
      startTime,
      endTime,
      regOpenDate: regOpenDate ? new Date(regOpenDate).toISOString() : new Date().toISOString(),
      regCloseDate: regCloseDate ? new Date(regCloseDate).toISOString() : new Date().toISOString(),
      status: finalStatus,
      capacity,
      termsAndConditions,
      tcVersion,
      bankName,
      accountName,
      accountNumber,
      instapayHandle,
      packages: packages.map((pkg, idx) => ({
        ...pkg,
        id: pkg.id || `pkg-${Date.now()}-${idx}`,
        eventId,
      })),
      questions: questions.map((q, idx) => ({
        ...q,
        id: q.id || `q-${Date.now()}-${idx}`,
        eventId,
      })),
    };

    BazarnaStore.saveEvent(updatedEvent);
    addToast(
      "success",
      "Event Updated 🎉",
      `Event "${updatedEvent.name}" has been updated successfully.`
    );
    router.push("/admin/events");
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      const deleted = BazarnaStore.deleteEvent(eventId);
      if (deleted) {
        addToast("success", "Event Deleted", `Event "${name}" has been permanently removed.`);
        router.push("/admin/events");
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-8 h-8 border-4 border-zinc-300 border-t-zinc-900 rounded-full animate-spin mx-auto" />
        <p className="text-sm text-zinc-500 font-medium">Loading event details...</p>
      </div>
    );
  }

  if (eventNotFound) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Event Not Found</h2>
        <p className="text-sm text-zinc-500">The event you are trying to edit does not exist or has been deleted.</p>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events Management
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header with Quick Save & Delete */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Events Management
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs shadow-soft-sm transition"
              title="Delete this event permanently"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              Delete Event
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs shadow-soft-sm transition"
            >
              <Save className="w-4 h-4 text-kiwi-400" />
              Save Changes
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-zinc-400">/{slug}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                EDITING MODE
              </span>
            </div>
            <h2 className="text-2xl font-black text-zinc-950 font-display">
              Edit: {name || "Untitled Event"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-zinc-600">Status:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-xs font-bold text-zinc-800 focus:ring-2 focus:ring-kiwi-400"
              >
                <option value="DRAFT">Draft</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="REGISTRATION_OPEN">Registration Open</option>
                <option value="REGISTRATION_CLOSED">Registration Closed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-1">
        {WIZARD_STEPS.map((stepName, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <button
              key={stepNum}
              type="button"
              onClick={() => setCurrentStep(stepNum)}
              className="text-left space-y-1 group"
            >
              <div
                className={`h-2 rounded-full transition ${
                  isCompleted
                    ? "bg-kiwi-500"
                    : isCurrent
                    ? "bg-zinc-950"
                    : "bg-zinc-200 group-hover:bg-zinc-300"
                }`}
              />
              <span
                className={`text-[10px] font-semibold truncate block ${
                  isCurrent ? "text-zinc-950 font-bold" : "text-zinc-400"
                }`}
              >
                {stepName}
              </span>
            </button>
          );
        })}
      </div>

      {/* STEP 1: BASIC INFO */}
      {currentStep === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-sm space-y-6 animate-in fade-in">
          <h3 className="text-base font-bold text-zinc-950">Step 1: Event Basic Information</h3>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-800">
              Event Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. B.youth Autumn Outlet Market | Friday 16th of October"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:ring-2 focus:ring-kiwi-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-800">
              URL Slug (Public Link) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center rounded-xl border border-zinc-200 overflow-hidden focus-within:ring-2 focus-within:ring-kiwi-400">
              <span className="bg-zinc-100 px-3 py-3 text-xs font-mono text-zinc-500 border-r border-zinc-200">
                /events/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  const cleaned = e.target.value
                    .replace(/^https?:\/\/[^\/]+\/?/i, "")
                    .toLowerCase()
                    .replace(/[^a-z0-9-_]/g, "");
                  setSlug(cleaned);
                }}
                placeholder="byouth-autumn-outlet"
                className="w-full px-3 py-3 text-xs font-mono font-medium focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-800">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the event concept, target audience, and brand experience..."
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:ring-2 focus:ring-kiwi-400"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-800 flex items-center justify-between">
              <span>Event Cover Image</span>
              <span className="text-[11px] text-zinc-400 font-normal">
                Upload from device or paste image URL
              </span>
            </label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border border-zinc-200 bg-zinc-50/70">
              {coverImage ? (
                <div className="relative w-full sm:w-44 h-28 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 shrink-0 shadow-soft-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage("")}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black text-white rounded-full transition"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-full sm:w-44 h-28 rounded-xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-400 bg-white shrink-0">
                  <ImageIcon className="w-6 h-6 text-zinc-300 mb-1" />
                  <span className="text-[10px] font-semibold">No Image Selected</span>
                </div>
              )}

              <div className="flex-1 space-y-3 w-full">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs shadow-soft-xs transition cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-bazarna-gold" />
                  <span>Choose Image from Device / Browser</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </label>

                <div>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="Or paste image URL (https://...)"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-mono font-medium focus:ring-2 focus:ring-zinc-900 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: LOCATION & DATES */}
      {currentStep === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-sm space-y-6 animate-in fade-in">
          <h3 className="text-base font-bold text-zinc-950">Step 2: Location & Timing</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">Venue / Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Downtown Katameya Mall, New Cairo"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:ring-2 focus:ring-kiwi-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">Google Maps URL</label>
              <input
                type="text"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:ring-2 focus:ring-kiwi-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">Event Start Date & Time</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:ring-2 focus:ring-kiwi-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">Operating Hours Text</label>
              <input
                type="text"
                value={`${startTime} – ${endTime}`}
                onChange={(e) => {
                  const parts = e.target.value.split("–");
                  if (parts[0]) setStartTime(parts[0].trim());
                  if (parts[1]) setEndTime(parts[1].trim());
                }}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:ring-2 focus:ring-kiwi-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">Registration Deadline</label>
              <input
                type="datetime-local"
                value={regCloseDate}
                onChange={(e) => setRegCloseDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:ring-2 focus:ring-kiwi-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">Total Brand Capacity</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:ring-2 focus:ring-kiwi-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PACKAGES */}
      {currentStep === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-sm space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-950">Step 3: Exhibitor Packages</h3>
              <p className="text-xs text-zinc-500">
                Update prices, booth capacities, or add new packages.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddPackage}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 text-white font-bold text-xs shadow-soft-sm hover:bg-zinc-800 transition"
            >
              <Plus className="w-3.5 h-3.5 text-butter-300" />
              Add Package
            </button>
          </div>

          <div className="space-y-4">
            {packages.map((pkg, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50/50 space-y-4 relative"
              >
                <button
                  type="button"
                  onClick={() => handleRemovePackage(idx)}
                  className="absolute top-4 right-4 text-zinc-400 hover:text-rose-600 transition"
                  title="Remove package"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-zinc-700">Package Name</label>
                    <input
                      type="text"
                      value={pkg.name}
                      onChange={(e) => {
                        const updated = [...packages];
                        updated[idx].name = e.target.value;
                        setPackages(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700">Price (EGP)</label>
                    <input
                      type="number"
                      value={pkg.price}
                      onChange={(e) => {
                        const updated = [...packages];
                        updated[idx].price = Number(e.target.value);
                        setPackages(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono font-bold bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700">Total / Left Spots</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={pkg.totalQty}
                        onChange={(e) => {
                          const updated = [...packages];
                          const val = Number(e.target.value);
                          const diff = val - updated[idx].totalQty;
                          updated[idx].totalQty = val;
                          updated[idx].remainingQty = Math.max(0, updated[idx].remainingQty + diff);
                          setPackages(updated);
                        }}
                        title="Total Qty"
                        className="w-1/2 px-2 py-2 rounded-xl border border-zinc-200 text-xs font-mono font-bold bg-white"
                      />
                      <span className="text-xs text-zinc-400">/</span>
                      <input
                        type="number"
                        value={pkg.remainingQty}
                        onChange={(e) => {
                          const updated = [...packages];
                          updated[idx].remainingQty = Number(e.target.value);
                          setPackages(updated);
                        }}
                        title="Remaining Qty"
                        className="w-1/2 px-2 py-2 rounded-xl border border-zinc-200 text-xs font-mono font-bold bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700">Included Items</label>
                  <input
                    type="text"
                    value={pkg.includedItems}
                    onChange={(e) => {
                      const updated = [...packages];
                      updated[idx].includedItems = e.target.value;
                      setPackages(updated);
                    }}
                    placeholder="e.g. 3 Clothes Racks, 2 Chairs, 150cm Table, 1 Power Socket"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: PAYMENT DETAILS */}
      {currentStep === 4 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-sm space-y-6 animate-in fade-in">
          <h3 className="text-base font-bold text-zinc-950">Step 4: Bank & Payment Instructions</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:ring-2 focus:ring-kiwi-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">Account Name</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:ring-2 focus:ring-kiwi-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-mono font-medium focus:ring-2 focus:ring-kiwi-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">Instapay Handle</label>
              <input
                type="text"
                value={instapayHandle}
                onChange={(e) => setInstapayHandle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-mono font-medium focus:ring-2 focus:ring-kiwi-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: TERMS & CONDITIONS */}
      {currentStep === 5 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-sm space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-950">Step 5: Event Terms & Conditions</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Version:</span>
              <input
                type="text"
                value={tcVersion}
                onChange={(e) => setTcVersion(e.target.value)}
                className="w-20 px-2 py-1 rounded-lg border border-zinc-200 text-xs font-mono text-center font-bold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-800">
              Terms & Conditions Document Content
            </label>
            <textarea
              rows={8}
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-xs font-mono leading-relaxed focus:ring-2 focus:ring-kiwi-400"
            />
          </div>
        </div>
      )}

      {/* STEP 6: CUSTOM QUESTIONS */}
      {currentStep === 6 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-sm space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-950">Step 6: Event-Specific Questions</h3>
              <p className="text-xs text-zinc-500">
                Custom questions configured for this event.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 text-white font-bold text-xs shadow-soft-sm hover:bg-zinc-800 transition"
            >
              <Plus className="w-3.5 h-3.5 text-butter-300" />
              Add Question
            </button>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex-1 space-y-1 w-full">
                  <input
                    type="text"
                    value={q.questionText}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[idx].questionText = e.target.value;
                      setQuestions(updated);
                    }}
                    placeholder="Enter question text..."
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold bg-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={q.questionType}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[idx].questionType = e.target.value as QuestionType;
                      setQuestions(updated);
                    }}
                    className="px-3 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-semibold"
                  >
                    <option value="NUMBER">Number</option>
                    <option value="YES_NO">Yes / No</option>
                    <option value="TEXT">Text</option>
                    <option value="FILE">File</option>
                  </select>

                  <label className="flex items-center gap-1 text-xs text-zinc-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={q.isRequired}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[idx].isRequired = e.target.checked;
                        setQuestions(updated);
                      }}
                      className="rounded text-kiwi-600"
                    />
                    Required
                  </label>

                  <button
                    type="button"
                    onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                    className="text-zinc-400 hover:text-rose-600 transition p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 7: REVIEW & SAVE */}
      {currentStep === 7 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-sm text-center space-y-6 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-kiwi-100 text-kiwi-700 flex items-center justify-center mx-auto shadow-kiwi-glow">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-zinc-950 font-display">Ready to Save Changes</h3>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
              All changes to packages, pricing, dates, and details will take effect immediately.
            </p>
            <div className="font-mono text-xs font-bold text-kiwi-800 bg-kiwi-50 py-2 px-4 rounded-xl inline-block">
              /events/{slug}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => handleSave()}
              className="px-8 py-3.5 rounded-xl bg-kiwi-500 hover:bg-kiwi-600 text-white font-black text-sm shadow-kiwi-glow transition inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save & Update Event
            </button>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-4">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => prev - 1)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 shadow-soft-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
        ) : (
          <div />
        )}

        {currentStep < WIZARD_STEPS.length ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => prev + 1)}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-soft-sm transition"
          >
            Next Step
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
