"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { BazarnaStore } from "@/lib/store";
import { BazarnaEvent, EventStatus } from "@/lib/types";
import {
  Calendar,
  Plus,
  Edit,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  MapPin,
  ExternalLink,
  Trash2,
} from "lucide-react";

export default function AdminEventsPage() {
  const router = useRouter();
  const { addToast } = useAuth();
  const [events, setEvents] = useState<BazarnaEvent[]>([]);

  useEffect(() => {
    setEvents(BazarnaStore.getEvents());

    const handleUpdate = () => {
      setEvents(BazarnaStore.getEvents());
    };
    window.addEventListener("bazarna_store_updated", handleUpdate);
    return () => window.removeEventListener("bazarna_store_updated", handleUpdate);
  }, []);

  const handleStatusChange = (eventId: string, newStatus: EventStatus) => {
    BazarnaStore.updateEventStatus(eventId, newStatus);
    setEvents(BazarnaStore.getEvents());
    addToast("info", "Status Updated", `Event status set to ${newStatus.replace("_", " ")}`);
  };

  const handleDelete = (eventId: string, eventName: string) => {
    if (window.confirm(`Are you sure you want to delete "${eventName}"? This action cannot be undone.`)) {
      const deleted = BazarnaStore.deleteEvent(eventId);
      if (deleted) {
        addToast("success", "Event Deleted", `Event "${eventName}" has been permanently removed.`);
        setEvents(BazarnaStore.getEvents());
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
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
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-kiwi-500 hover:bg-kiwi-600 text-white font-bold text-xs shadow-kiwi-glow transition"
        >
          <Plus className="w-4 h-4" />
          Create New Event
        </Link>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 gap-6">
        {events.map((event) => {
          const startDateFormatted = new Date(event.startDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={event.id}
              className="bg-white rounded-3xl border border-zinc-200/90 shadow-soft-sm hover:shadow-soft-md transition p-6 sm:p-8 space-y-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 shrink-0">
                    <img
                      src={event.coverImage}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] text-zinc-400">/{event.slug}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          event.status === "REGISTRATION_OPEN"
                            ? "bg-kiwi-100 text-kiwi-800"
                            : event.status === "UPCOMING"
                            ? "bg-babyblue-100 text-babyblue-800"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {event.status.replace("_", " ")}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-zinc-950 leading-snug">
                      {event.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        {startDateFormatted}
                      </span>
                      <span className="text-zinc-400">•</span>
                      <span>{event.capacity} Capacity</span>
                    </div>
                  </div>
                </div>

                {/* Quick Status Dropdown & Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={event.status}
                    onChange={(e) =>
                      handleStatusChange(event.id, e.target.value as EventStatus)
                    }
                    className="px-3 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-bold text-zinc-800 focus:ring-2 focus:ring-kiwi-400 transition"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="REGISTRATION_OPEN">Registration Open</option>
                    <option value="REGISTRATION_CLOSED">Registration Closed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>

                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-xs font-bold text-zinc-800 transition shadow-soft-sm"
                    title="Edit event details, packages, and pricing"
                  >
                    <Edit className="w-3.5 h-3.5 text-zinc-600" />
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(event.id, event.name)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-xs font-bold text-rose-600 transition shadow-soft-sm"
                    title="Delete this event"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Event Packages Snapshot */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-900 uppercase tracking-wider">
                    Configured Packages ({event.packages.length})
                  </span>
                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="text-zinc-500 hover:text-zinc-900 font-semibold underline decoration-dotted transition"
                  >
                    Manage pricing and inventory →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {event.packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-zinc-900 truncate max-w-[150px]">
                          {pkg.name}
                        </strong>
                        <span className="font-mono font-bold text-kiwi-700">
                          {pkg.price.toLocaleString()} EGP
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500">
                        <span>
                          {pkg.remainingQty} / {pkg.totalQty} spots left
                        </span>
                        {pkg.remainingQty <= 0 ? (
                          <span className="text-rose-600 font-bold">SOLD OUT</span>
                        ) : (
                          <span className="text-kiwi-700 font-semibold">Active</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
