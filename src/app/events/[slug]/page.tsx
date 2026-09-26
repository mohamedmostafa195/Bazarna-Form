"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BazarnaStore } from "@/lib/store";
import { BazarnaEvent } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Package,
  FileText,
  AlertTriangle,
  Flame,
  ChevronLeft,
} from "lucide-react";

export default function EventDetailsPage() {
  const { isLoggedIn, currentBrand } = useAuth();
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [event, setEvent] = useState<BazarnaEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const existingApplication =
    event && currentBrand && isLoggedIn
      ? BazarnaStore.getApplicationForEvent(currentBrand, event.id)
      : undefined;

  useEffect(() => {
    if (slug) {
      const found = BazarnaStore.getEventBySlug(slug);
      if (found) {
        setEvent(found);
      }
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-bazarna-red border-t-transparent animate-spin mx-auto" />
        <p className="text-sm font-semibold text-zinc-500">Loading Bazarna event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-zinc-950">Event Not Found</h2>
        <p className="text-sm text-zinc-600">The event you are looking for does not exist or has been moved.</p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-950 text-white font-bold text-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Events
        </Link>
      </div>
    );
  }

  const startDateFormatted = new Date(event.startDate).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const deadlineFormatted = new Date(event.regCloseDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full pb-24">
      {/* Hero Cover Header */}
      <div className="relative w-full h-72 sm:h-96 bg-zinc-900 overflow-hidden">
        <img
          src={event.coverImage}
          alt={event.name}
          className="w-full h-full object-cover opacity-60 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold hover:bg-white/30 transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            All Events
          </Link>
        </div>

        <div className="absolute bottom-8 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {event.status === "REGISTRATION_OPEN" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-bazarna-red text-white shadow-bazarna-glow">
                <Flame className="w-3.5 h-3.5" />
                REGISTRATION OPEN
              </span>
            )}
            <span className="text-xs font-medium text-zinc-300">
              Capacity: {event.capacity} Brands
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-display text-white max-w-4xl leading-tight">
            {event.name}
          </h1>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left / Main Details */}
          <div className="lg:col-span-8 space-y-12">
            {/* Quick Meta Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-soft-sm space-y-1">
                <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold">
                  <Calendar className="w-4 h-4 text-bazarna-red" />
                  <span>Event Date</span>
                </div>
                <p className="text-sm font-bold text-zinc-900">{startDateFormatted}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-soft-sm space-y-1">
                <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold">
                  <Clock className="w-4 h-4 text-butter-600" />
                  <span>Operating Hours</span>
                </div>
                <p className="text-sm font-bold text-zinc-900">{event.startTime} – {event.endTime}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-soft-sm space-y-1">
                <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold">
                  <MapPin className="w-4 h-4 text-babyblue-600" />
                  <span>Location</span>
                </div>
                <p className="text-sm font-bold text-zinc-900 truncate">{event.location}</p>
                {event.googleMapsUrl && (
                  <a
                    href={event.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-babyblue-700 hover:underline pt-0.5"
                  >
                    Open in Google Maps
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Description & Highlights */}
            <div className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-soft-sm">
              <h2 className="text-xl font-bold text-zinc-950 font-display">About This Event</h2>
              <p className="text-sm text-zinc-700 leading-relaxed">{event.description}</p>

              {(() => {
                let highlightsList: string[] = [];
                const rawHighlights = event.highlights as any;
                if (Array.isArray(rawHighlights)) {
                  highlightsList = rawHighlights.filter(Boolean);
                } else if (typeof rawHighlights === "string" && rawHighlights.trim()) {
                  try {
                    const parsed = JSON.parse(rawHighlights);
                    if (Array.isArray(parsed)) {
                      highlightsList = parsed.filter(Boolean);
                    } else if (typeof parsed === "string") {
                      highlightsList = [parsed];
                    }
                  } catch (_) {
                    highlightsList = rawHighlights.split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean);
                  }
                }

                if (highlightsList.length === 0) return null;

                return (
                  <div className="pt-4 border-t border-zinc-100 space-y-3">
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                      Event Highlights
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {highlightsList.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-zinc-700">
                          <CheckCircle2 className="w-4 h-4 text-bazarna-red shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
            </div>

            {/* Packages Section */}
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-xs font-bold text-bazarna-red bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase">
                    Exhibitor Packages
                  </span>
                  <h2 className="text-2xl font-black text-zinc-950 font-display mt-2">
                    Choose Your Space
                  </h2>
                </div>
                <span className="text-xs text-zinc-500 font-medium">All prices include VAT</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {event.packages.map((pkg) => {
                  const isSoldOut = pkg.remainingQty <= 0;
                  return (
                    <div
                      key={pkg.id}
                      className={`flex flex-col justify-between rounded-3xl border p-6 bg-white transition ${
                        isSoldOut
                          ? "border-zinc-200 opacity-60"
                          : "border-zinc-200/90 shadow-soft-md hover:shadow-soft-xl hover:border-red-300"
                      }`}
                    >
                      <div className="space-y-4">
                        {pkg.image && (
                          <div className="h-40 w-full rounded-2xl overflow-hidden bg-zinc-100 relative">
                            <img
                              src={pkg.image}
                              alt={pkg.name}
                              className="w-full h-full object-cover"
                            />
                            {isSoldOut ? (
                              <div className="absolute inset-0 bg-zinc-950/70 flex items-center justify-center">
                                <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-extrabold text-xs tracking-wider">
                                  SOLD OUT
                                </span>
                              </div>
                            ) : (
                              <div className="absolute top-3 right-3 bg-zinc-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                                {pkg.remainingQty} spots left
                              </div>
                            )}
                          </div>
                        )}

                        <div>
                          <h3 className="text-lg font-bold text-zinc-950">{pkg.name}</h3>
                          <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-2xl font-black text-zinc-950">
                              {pkg.price.toLocaleString()}
                            </span>
                            <span className="text-xs font-bold text-zinc-500">EGP</span>
                          </div>
                          <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                            {pkg.description}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1.5">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                            Includes:
                          </span>
                          <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                            {pkg.includedItems}
                          </p>
                        </div>
                      </div>

                      <div className="pt-6">
                        {existingApplication ? (
                          <Link
                            href={`/dashboard/applications/${existingApplication.id}`}
                            className="w-full inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-kiwi-50 hover:bg-kiwi-100 text-kiwi-800 border border-kiwi-200 text-xs font-bold transition shadow-soft-xs"
                          >
                            <CheckCircle2 className="w-4 h-4 text-kiwi-600" />
                            Already Subscribed
                          </Link>
                        ) : isSoldOut ? (
                          <button
                            disabled
                            className="w-full py-3 rounded-xl bg-zinc-100 text-zinc-400 text-xs font-bold cursor-not-allowed"
                          >
                            Sold Out
                          </button>
                        ) : (
                          <Link
                            href={
                              isLoggedIn
                                ? `/events/${event.slug}/apply?pkg=${pkg.id}`
                                : `/register?redirect=${encodeURIComponent(`/events/${event.slug}/apply?pkg=${pkg.id}`)}`
                            }
                            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-soft-sm transition"
                          >
                            <Package className="w-4 h-4 text-butter-300" />
                            Select & Apply
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Terms & Conditions preview */}
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-50 border border-zinc-200/80 space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-zinc-700" />
                <h3 className="text-base font-bold text-zinc-950">Event Terms & Conditions Preview</h3>
              </div>
              <div className="text-xs text-zinc-600 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto pr-2 border-l-2 border-zinc-300 pl-4">
                {event.termsAndConditions}
              </div>
              <p className="text-[11px] text-zinc-500">
                You will review and electronically sign version {event.tcVersion} during the application wizard.
              </p>
            </div>
          </div>

          {/* Right Sidebar / Sticky Booking Action */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-28 bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-soft-lg space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Registration Window
                </span>
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 space-y-1">
                  <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Deadline: {deadlineFormatted}
                  </span>
                  <p className="text-[11px] text-rose-700 leading-tight">
                    Spaces are allocated on a first-come, first-verified payment basis.
                  </p>
                </div>
              </div>

              {/* Payment info summary */}
              <div className="space-y-3 text-xs border-t border-b border-zinc-100 py-4">
                <div className="flex justify-between text-zinc-600">
                  <span>Official Bank:</span>
                  <strong className="text-zinc-900">{event.bankName}</strong>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Account Name:</span>
                  <strong className="text-zinc-900 text-right truncate max-w-[170px]">
                    {event.accountName}
                  </strong>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Account Number:</span>
                  <strong className="font-mono text-zinc-900">{event.accountNumber}</strong>
                </div>
                {event.instapayHandle && (
                  <div className="flex justify-between text-zinc-600">
                    <span>Instapay:</span>
                    <strong className="font-mono text-bazarna-red">{event.instapayHandle}</strong>
                  </div>
                )}
              </div>

              {/* Primary CTA */}
              {existingApplication ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-kiwi-50 border border-kiwi-200 text-xs space-y-1.5">
                    <span className="font-bold text-kiwi-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-kiwi-600" />
                      Already Subscribed & Registered
                    </span>
                    <p className="text-[11px] text-kiwi-700 leading-relaxed">
                      Your brand is already registered for this event.
                      <br />
                      Application Code: <strong className="font-mono text-zinc-950">{existingApplication.applicationCode}</strong>
                      <br />
                      Status: <strong className="text-zinc-900">{existingApplication.appStatus.replace("_", " ")}</strong>
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/applications/${existingApplication.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-kiwi-600 hover:bg-kiwi-700 text-white font-black text-sm shadow-kiwi-glow transition transform hover:-translate-y-0.5"
                  >
                    View Application Status
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : event.status === "REGISTRATION_OPEN" ? (
                <div className="space-y-3">
                  <Link
                    href={
                      isLoggedIn
                        ? `/events/${event.slug}/apply`
                        : `/register?redirect=${encodeURIComponent(`/events/${event.slug}/apply`)}`
                    }
                    className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-bazarna-red hover:bg-bazarna-darkred text-white font-black text-sm shadow-bazarna-glow transition transform hover:-translate-y-0.5"
                  >
                    <Sparkles className="w-4 h-4 text-butter-200" />
                    {isLoggedIn ? "Apply for this Event" : "Register Brand & Apply"}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="text-[11px] text-center text-zinc-500">
                    {isLoggedIn
                      ? "Your saved brand profile will be automatically loaded into the application."
                      : "Brand registration required. Create your profile in under 1 minute to apply."}
                  </p>
                </div>
              ) : (
                <div className="text-center p-4 bg-zinc-50 rounded-2xl text-xs font-semibold text-zinc-500">
                  Registration for this event is currently {event.status.toLowerCase().replace("_", " ")}.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
