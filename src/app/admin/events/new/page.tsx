"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { BazarnaStore } from "@/lib/store";
import {
  BazarnaEvent,
  EventPackage,
  EventQuestion,
  QuestionType,
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
  Globe,
  FileText,
  CreditCard,
  Layers,
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
  "7. Preview",
  "8. Publish",
];

export default function CreateEventPage() {
  const router = useRouter();
  const { addToast } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState(
    "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1600&q=80"
  );
  const [location, setLocation] = useState("Downtown Katameya Mall, New Cairo");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("https://maps.google.com/?q=Downtown+Katameya");
  const [startDate, setStartDate] = useState("2026-10-15T11:00");
  const [endDate, setEndDate] = useState("2026-10-15T23:00");
  const [startTime, setStartTime] = useState("11:00 AM");
  const [endTime, setEndTime] = useState("11:00 PM");
  const [regOpenDate, setRegOpenDate] = useState("2026-09-01T00:00");
  const [regCloseDate, setRegCloseDate] = useState("2026-10-10T23:59");
  const [capacity, setCapacity] = useState(60);

  // Packages list
  const [packages, setPackages] = useState<
    Omit<EventPackage, "id" | "eventId">[]
  >([
    {
      name: "Rack Package (3x3 Space)",
      price: 24000,
      description: "Includes 2 clothes racks and display table.",
      includedItems: "3x3m Space, 2 Clothes Racks, 2 Chairs, 120cm Table, 1 Power Socket",
      totalQty: 20,
      remainingQty: 20,
      isActive: true,
    },
    {
      name: "Table Package (190cm)",
      price: 16000,
      description: "Wooden front table for accessories and skincare.",
      includedItems: "190cm Wooden Front Table, 2 Stools, 1 Power Socket",
      totalQty: 30,
      remainingQty: 30,
      isActive: true,
    },
  ]);

  // Payment info
  const [bankName, setBankName] = useState("Commercial International Bank (CIB)");
  const [accountName, setAccountName] = useState("BAZARNA SOCIETY FOR EVENTS SAE");
  const [accountNumber, setAccountNumber] = useState("100075173867");
  const [instapayHandle, setInstapayHandle] = useState("bazarnasociety@cib");

  // T&C
  const [termsAndConditions, setTermsAndConditions] = useState(
    `1. Booking is not confirmed until full payment receipt upload and administrative approval.\n2. Setup starts at 9:00 AM sharp and must conclude by 10:30 AM.\n3. Brands must keep booths open until 11:00 PM.\n4. Space cannot be subleased or transferred.`
  );
  const [tcVersion, setTcVersion] = useState("2026.4");

  // Questions
  const [questions, setQuestions] = useState<
    Omit<EventQuestion, "id" | "eventId">[]
  >([]);

  // Handle auto-generating slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setSlug(autoSlug);
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
      addToast("success", "Cover Image Selected", `"${file.name}" uploaded successfully.`);
    };
    reader.readAsDataURL(file);
  };

  const handleAddPackage = () => {
    setPackages([
      ...packages,
      {
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

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "New Question",
        questionType: "TEXT",
        isRequired: false,
        orderIndex: questions.length + 1,
      },
    ]);
  };

  const handlePublish = (status: "REGISTRATION_OPEN" | "DRAFT" = "REGISTRATION_OPEN") => {
    if (!name || !slug) {
      addToast("error", "Missing Info", "Event name and URL slug are required.");
      return;
    }

    const newEventId = `evt-${Date.now()}`;

    const newEvent: BazarnaEvent = {
      id: newEventId,
      name,
      slug,
      description,
      coverImage,
      location,
      googleMapsUrl,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      startTime,
      endTime,
      regOpenDate: new Date(regOpenDate).toISOString(),
      regCloseDate: new Date(regCloseDate).toISOString(),
      status,
      capacity,
      termsAndConditions,
      tcVersion,
      bankName,
      accountName,
      accountNumber,
      instapayHandle,
      packages: packages.map((pkg, idx) => ({
        ...pkg,
        id: `pkg-${Date.now()}-${idx}`,
        eventId: newEventId,
      })),
      questions: questions.map((q, idx) => ({
        ...q,
        id: `q-${Date.now()}-${idx}`,
        eventId: newEventId,
      })),
    };

    BazarnaStore.saveEvent(newEvent);
    addToast(
      "success",
      "Event Published 🎉",
      `Event "${newEvent.name}" is now live at /events/${newEvent.slug}`
    );
    router.push("/admin/events");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Wizard Header */}
      <div className="space-y-2">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Events Management
        </Link>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-zinc-950 font-display">
            Create New Pop-Up Event
          </h2>
          <span className="text-xs font-bold text-kiwi-700 bg-kiwi-100 px-3 py-1 rounded-full">
            Step {currentStep} of {WIZARD_STEPS.length}
          </span>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
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
              onChange={(e) => handleNameChange(e.target.value)}
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
                Create unlimited booth options for brands (Rack, Table, Pagoda, etc.).
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
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
                    <label className="text-[11px] font-bold text-zinc-700">Quantity (Spots)</label>
                    <input
                      type="number"
                      value={pkg.totalQty}
                      onChange={(e) => {
                        const updated = [...packages];
                        const val = Number(e.target.value);
                        updated[idx].totalQty = val;
                        updated[idx].remainingQty = val;
                        setPackages(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono font-bold bg-white"
                    />
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
                Add flexible questions for this event (e.g. staff count, special electricity).
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

      {/* STEP 7: PREVIEW */}
      {currentStep === 7 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-sm space-y-6 animate-in fade-in">
          <h3 className="text-base font-bold text-zinc-950">Step 7: Event Review</h3>

          <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4 text-xs">
            <div>
              <span className="text-zinc-400 block font-semibold uppercase">Event Name</span>
              <strong className="text-base font-bold text-zinc-900">{name || "Untitled Event"}</strong>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-zinc-200">
              <div>
                <span className="text-zinc-400 block font-semibold">Location</span>
                <span className="font-medium text-zinc-800">{location}</span>
              </div>
              <div>
                <span className="text-zinc-400 block font-semibold">Capacity</span>
                <span className="font-medium text-zinc-800">{capacity} Brands</span>
              </div>
              <div>
                <span className="text-zinc-400 block font-semibold">Packages</span>
                <span className="font-medium text-zinc-800">{packages.length} Configured</span>
              </div>
              <div>
                <span className="text-zinc-400 block font-semibold">T&C Version</span>
                <span className="font-medium text-zinc-800">v{tcVersion}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 8: PUBLISH */}
      {currentStep === 8 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-sm text-center space-y-6 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-kiwi-100 text-kiwi-700 flex items-center justify-center mx-auto shadow-kiwi-glow">
            <Globe className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-zinc-950 font-display">Ready to Launch</h3>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
              Your new event will receive a dedicated registration URL where brands can immediately apply using their permanent profiles.
            </p>
            <div className="font-mono text-xs font-bold text-kiwi-800 bg-kiwi-50 py-2 px-4 rounded-xl inline-block">
              /events/{slug || "new-event"}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => handlePublish("DRAFT")}
              className="px-6 py-3.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 font-bold text-xs text-zinc-800 transition"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handlePublish("REGISTRATION_OPEN")}
              className="px-8 py-3.5 rounded-xl bg-kiwi-500 hover:bg-kiwi-600 text-white font-black text-sm shadow-kiwi-glow transition"
            >
              Publish Event Now
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
