"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { BazarnaStore } from "@/lib/store";
import { BazarnaEvent, EventStatus, EventApplication } from "@/lib/types";
import {
  Calendar,
  Plus,
  Edit,
  Clock,
  MapPin,
  ExternalLink,
  Trash2,
  Search,
  Package,
  Users,
  Eye,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

export default function AdminEventsPage() {
  const router = useRouter();
  const { addToast } = useAuth();
  const [events, setEvents] = useState<BazarnaEvent[]>([]);
  const [applications, setApplications] = useState<EventApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deleteEventItem, setDeleteEventItem] = useState<BazarnaEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setEvents(BazarnaStore.getEvents());
    setApplications(BazarnaStore.getApplications());

    // Sync with MongoDB Atlas immediately
    BazarnaStore.syncWithServer();

    const handleUpdate = () => {
      setEvents(BazarnaStore.getEvents());
      setApplications(BazarnaStore.getApplications());
    };
    window.addEventListener("bazarna_store_updated", handleUpdate);
    return () => window.removeEventListener("bazarna_store_updated", handleUpdate);
  }, []);

  const handleStatusChange = (eventId: string, newStatus: EventStatus) => {
    BazarnaStore.updateEventStatus(eventId, newStatus);
    setEvents(BazarnaStore.getEvents());
    addToast("info", "Status Updated", `Event status set to ${newStatus.replace("_", " ")}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteEventItem) return;
    setIsDeleting(true);
    try {
      const deleted = BazarnaStore.deleteEvent(deleteEventItem.id);
      if (deleted) {
        addToast("success", "Event Deleted", `Event "${deleteEventItem.name}" has been permanently removed.`);
        setEvents(BazarnaStore.getEvents());
        setDeleteEventItem(null);
      }
    } catch (err) {
      console.error(err);
      addToast("error", "Error", "Failed to delete event.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getEventAppCount = (event: BazarnaEvent) => {
    return applications.filter(
      (a) => a.eventId === event.id || (event.slug && a.event?.slug === event.slug)
    ).length;
  };

  const filteredEvents = events.filter((e) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      e.name.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      (e.slug && e.slug.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (statusFilter !== "ALL" && e.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case "REGISTRATION_OPEN":
        return {
          bg: "bg-kiwi-50 border-kiwi-300 text-kiwi-900",
          dot: "bg-kiwi-500",
          label: "Registration Open",
          topBar: "from-kiwi-400 via-emerald-500 to-teal-400",
        };
      case "UPCOMING":
        return {
          bg: "bg-babyblue-50 border-babyblue-300 text-babyblue-900",
          dot: "bg-babyblue-500",
          label: "Upcoming",
          topBar: "from-babyblue-400 via-blue-500 to-indigo-500",
        };
      case "REGISTRATION_CLOSED":
        return {
          bg: "bg-amber-50 border-amber-300 text-amber-900",
          dot: "bg-amber-500",
          label: "Registration Closed",
          topBar: "from-amber-400 via-orange-400 to-amber-500",
        };
      case "DRAFT":
        return {
          bg: "bg-zinc-100 border-zinc-300 text-zinc-700",
          dot: "bg-zinc-400",
          label: "Draft",
          topBar: "from-zinc-300 via-zinc-400 to-zinc-300",
        };
      case "COMPLETED":
        return {
          bg: "bg-zinc-100 border-zinc-200 text-zinc-600",
          dot: "bg-zinc-500",
          label: "Completed",
          topBar: "from-zinc-400 via-zinc-500 to-zinc-400",
        };
      case "CANCELLED":
        return {
          bg: "bg-rose-50 border-rose-300 text-rose-800",
          dot: "bg-rose-500",
          label: "Cancelled",
          topBar: "from-rose-400 via-red-500 to-rose-400",
        };
      default:
        return {
          bg: "bg-zinc-100 border-zinc-200 text-zinc-700",
          dot: "bg-zinc-400",
          label: status,
          topBar: "from-zinc-300 to-zinc-400",
        };
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-950 font-display">
            Events & Package Management
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Create, duplicate, publish, and manage packages across all Bazarna pop-up events.
          </p>
        </div>

        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs shadow-soft-sm transition"
        >
          <Plus className="w-4 h-4 text-kiwi-400" />
          Create New Event
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-zinc-200/90 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by event title, location, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-kiwi-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          {[
            { id: "ALL", label: "All Events" },
            { id: "REGISTRATION_OPEN", label: "Open" },
            { id: "UPCOMING", label: "Upcoming" },
            { id: "DRAFT", label: "Drafts" },
            { id: "REGISTRATION_CLOSED", label: "Closed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-2 rounded-xl transition whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-zinc-950 text-white font-bold"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events List — Structured & Distinct */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-zinc-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-800">No events found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            No events match your current search or status filters. Try clearing your filters or create a new event.
          </p>
          {(searchQuery || statusFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
              className="text-xs font-bold text-kiwi-700 underline pt-2 inline-block"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          {filteredEvents.map((event, index) => {
            const startDateFormatted = new Date(event.startDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const statusConfig = getStatusBadge(event.status);
            const totalRemaining = event.packages.reduce((acc, p) => acc + (p.remainingQty || 0), 0);
            const totalCapacity = event.packages.reduce((acc, p) => acc + (p.totalQty || 0), 0);
            const appCount = getEventAppCount(event);

            return (
              <React.Fragment key={event.id}>
                <div
                  className="bg-white rounded-3xl border border-zinc-200/90 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.07),0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_24px_50px_-10px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden"
                >
                  {/* Top Status Gradient Bar */}
                  <div className={`h-2 w-full bg-gradient-to-r ${statusConfig.topBar}`} />

                  {/* 1. Event Master Header & Actions */}
                  <div className="p-6 sm:p-7 flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-zinc-100 bg-white">
                    {/* Left: Thumbnail & Core Info */}
                    <div className="flex flex-col sm:flex-row items-start gap-5 flex-1 min-w-0">
                      <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/80 shadow-soft-xs relative group">
                        <img
                          src={event.coverImage}
                          alt={event.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>

                      <div className="space-y-2 flex-1 min-w-0">
                        {/* Meta Tags Row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-black text-zinc-950 bg-zinc-100 px-2.5 py-1 rounded-xl border border-zinc-200/90 shadow-soft-xs">
                            Event #{String(index + 1).padStart(2, "0")}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border ${statusConfig.bg}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse`} />
                            {statusConfig.label}
                          </span>

                          <span className="font-mono text-xs font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-lg">
                            /{event.slug}
                          </span>
                        </div>

                      {/* Event Title */}
                      <h3 className="text-lg sm:text-xl font-black text-zinc-950 leading-snug">
                        {event.name}
                      </h3>

                      {/* Event Key Meta */}
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-zinc-500 pt-1">
                        <span className="flex items-center gap-1.5 font-medium text-zinc-700">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate max-w-[220px]">{event.location}</span>
                        </span>

                        <span className="flex items-center gap-1.5 font-medium text-zinc-700">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>{startDateFormatted}</span>
                        </span>

                        <span className="flex items-center gap-1.5 font-medium text-zinc-700">
                          <Users className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>{event.capacity || totalCapacity} Total Capacity</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Controls & Actions Toolbar */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 self-start shrink-0 pt-2 lg:pt-0">
                    {/* Status Dropdown */}
                    <div className="relative">
                      <select
                        value={event.status}
                        onChange={(e) => handleStatusChange(event.id, e.target.value as EventStatus)}
                        className="pl-3 pr-8 py-2 rounded-xl border border-zinc-200 bg-zinc-50/80 hover:bg-zinc-100 text-xs font-bold text-zinc-800 focus:ring-2 focus:ring-kiwi-400 transition cursor-pointer appearance-none"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="UPCOMING">Upcoming</option>
                        <option value="REGISTRATION_OPEN">Registration Open</option>
                        <option value="REGISTRATION_CLOSED">Registration Closed</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px]">
                        ▼
                      </div>
                    </div>

                    {/* Edit Event Button */}
                    <Link
                      href={`/admin/events/${event.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-soft-sm"
                      title="Edit event details, packages, and pricing"
                    >
                      <Edit className="w-3.5 h-3.5 text-kiwi-400" />
                      <span>Edit</span>
                    </Link>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => setDeleteEventItem(event)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-xs font-bold text-rose-600 transition shadow-soft-xs"
                      title="Delete this event"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    </button>
                  </div>
                </div>

                {/* 2. Event Metrics Summary Bar */}
                <div className="bg-zinc-50/70 px-6 sm:px-7 py-3 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-6">
                    <span className="font-semibold text-zinc-500">
                      Applications Received:{" "}
                      <strong className="text-zinc-950 font-bold">{appCount}</strong>
                    </span>

                    <span className="hidden sm:inline text-zinc-300">•</span>

                    <span className="font-semibold text-zinc-500">
                      Available Spots:{" "}
                      <strong className="text-kiwi-800 font-bold font-mono">
                        {totalRemaining} / {totalCapacity}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* 3. Event Packages Grid — Clearly Organized */}
                <div className="p-6 sm:p-7 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-zinc-500" />
                      Configured Packages ({event.packages.length})
                    </span>
                  </div>

                  {event.packages.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-zinc-50 border border-dashed border-zinc-200 text-center text-xs text-zinc-400">
                      No booth packages configured yet. Click "Edit" to configure packages.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {event.packages.map((pkg) => {
                        const total = pkg.totalQty || 1;
                        const remaining = pkg.remainingQty !== undefined ? pkg.remainingQty : total;
                        const isSoldOut = remaining <= 0;
                        const percentLeft = Math.max(0, Math.min(100, Math.round((remaining / total) * 100)));

                        return (
                          <div
                            key={pkg.id}
                            className="bg-white rounded-2xl border border-zinc-200/90 p-4 space-y-3 shadow-soft-xs hover:border-zinc-300 transition flex flex-col justify-between"
                          >
                            <div className="space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs font-black text-zinc-900 leading-tight">
                                  {pkg.name}
                                </h4>
                                {isSoldOut ? (
                                  <span className="text-[9px] font-black uppercase text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full shrink-0">
                                    Sold Out
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold uppercase text-kiwi-800 bg-kiwi-50 border border-kiwi-200 px-2 py-0.5 rounded-full shrink-0">
                                    Active
                                  </span>
                                )}
                              </div>

                              <div className="text-base font-black text-zinc-950 font-mono pt-1">
                                {pkg.price ? pkg.price.toLocaleString() : "0"} <span className="text-[11px] font-sans font-bold text-zinc-500">EGP</span>
                              </div>
                            </div>

                            {/* Inventory Progress Bar */}
                            <div className="space-y-1.5 pt-2 border-t border-zinc-100 text-[11px]">
                              <div className="flex items-center justify-between text-zinc-500 font-semibold">
                                <span>Spots Left:</span>
                                <span className={`font-mono font-bold ${isSoldOut ? "text-rose-600" : "text-zinc-800"}`}>
                                  {remaining} / {total}
                                </span>
                              </div>

                              <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 rounded-full ${
                                    isSoldOut ? "bg-rose-500" : percentLeft < 30 ? "bg-amber-400" : "bg-kiwi-500"
                                  }`}
                                  style={{ width: `${percentLeft}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Visual Separator Between Event Cards */}
              {index < filteredEvents.length - 1 && (
                <div className="relative flex items-center justify-center py-4 my-2 select-none" aria-hidden="true">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-dashed border-zinc-200" />
                  </div>
                  <div className="relative bg-white px-5 py-2 rounded-full border border-zinc-200/90 text-[11px] font-black text-zinc-500 tracking-wider uppercase flex items-center gap-3 shadow-soft-sm">
                    <span className="w-2 h-2 rounded-full bg-kiwi-500" />
                    <span>Event #{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-zinc-300 font-normal">✦</span>
                    <span className="text-zinc-400 font-semibold lowercase">next event below</span>
                    <span className="w-2 h-2 rounded-full bg-zinc-300" />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteEventItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-soft-xl border border-zinc-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-900">Delete Event</h4>
                <p className="text-xs text-zinc-500">
                  Are you sure you want to permanently delete this event?
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-1 text-xs text-zinc-600">
              <div>
                <span className="font-semibold text-zinc-400">Event: </span>
                <strong className="text-zinc-900">{deleteEventItem.name}</strong>
              </div>
              <div>
                <span className="font-semibold text-zinc-400">Location: </span>
                <span className="text-zinc-800">{deleteEventItem.location}</span>
              </div>
              <div>
                <span className="font-semibold text-zinc-400">Packages: </span>
                <span className="text-zinc-800">{deleteEventItem.packages?.length || 0} packages configured</span>
              </div>
            </div>

            <p className="text-[11px] text-rose-600 font-medium">
              ⚠️ This will remove the event, its booth packages, and questions permanently from the database.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteEventItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
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
