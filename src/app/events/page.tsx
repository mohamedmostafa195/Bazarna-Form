"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BazarnaStore } from "@/lib/store";
import { BazarnaEvent, EventStatus } from "@/lib/types";
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertCircle,
  Flame,
  Tag,
} from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState<BazarnaEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    setEvents(BazarnaStore.getEvents());

    const handleUpdate = () => {
      setEvents(BazarnaStore.getEvents());
    };
    window.addEventListener("bazarna_store_updated", handleUpdate);
    return () => window.removeEventListener("bazarna_store_updated", handleUpdate);
  }, []);

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === "ALL") return true;
    return evt.status === statusFilter;
  });

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case "REGISTRATION_OPEN":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-kiwi-100 text-kiwi-800 border border-kiwi-300">
            <Flame className="w-3.5 h-3.5 text-kiwi-600" />
            Registration Open
          </span>
        );
      case "UPCOMING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-babyblue-100 text-babyblue-800 border border-babyblue-300">
            <Calendar className="w-3.5 h-3.5 text-babyblue-600" />
            Upcoming
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
            Draft Preview
          </span>
        );
      case "REGISTRATION_CLOSED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Registration Closed
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-500">
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-bazarna-red bg-red-50 border border-red-200 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-bazarna-gold" />
            Curated Pop-Up Calendar • 2026 Season
          </div>
          <h1 className="text-4xl sm:text-6xl font-normal text-zinc-950 font-display uppercase tracking-wide">
            Bazarna Pop-Ups
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-xl">
            Discover upcoming pop-up markets, review package offerings, and register your brand with your saved profile.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search event or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30 focus:border-bazarna-red transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-bazarna-red/30 transition"
          >
            <option value="ALL">All Statuses</option>
            <option value="REGISTRATION_OPEN">Registration Open</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="DRAFT">Draft</option>
            <option value="REGISTRATION_CLOSED">Registration Closed</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200 p-8 space-y-3">
          <AlertCircle className="w-10 h-10 text-zinc-300 mx-auto" />
          <h3 className="text-base font-bold text-zinc-800">No events match your criteria</h3>
          <p className="text-xs text-zinc-500">Try adjusting your search query or status filter.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-bazarna-red bg-red-50 hover:bg-red-100 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => {
            const startDateFormatted = new Date(event.startDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            const regCloseFormatted = new Date(event.regCloseDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            });

            const minPrice =
              event.packages.length > 0
                ? Math.min(...event.packages.map((p) => p.price)).toLocaleString()
                : null;

            return (
              <div
                key={event.id}
                className="group flex flex-col rounded-3xl bg-white border border-zinc-200/90 shadow-soft-md hover:shadow-soft-xl hover:-translate-y-1 transition duration-300 overflow-hidden"
              >
                {/* Image Cover */}
                <div className="relative h-52 w-full overflow-hidden bg-zinc-100">
                  <img
                    src={event.coverImage}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-4 left-4">{getStatusBadge(event.status)}</div>
                  <div className="absolute bottom-3 right-3 bg-zinc-950/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold">
                    {event.capacity} Brand Spots
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <h3 className="text-xl font-normal font-display text-zinc-950 group-hover:text-bazarna-red transition leading-tight uppercase tracking-wide">
                      {event.name}
                    </h3>

                    <div className="space-y-1.5 text-xs text-zinc-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{startDateFormatted}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{event.startTime} – {event.endTime}</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  {/* Footer card info */}
                  <div className="pt-4 border-t border-zinc-100 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                          Packages
                        </span>
                        <span className="font-bold text-zinc-900">
                          {minPrice ? `From ${minPrice} EGP` : "TBA"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                          Deadline
                        </span>
                        <span className="font-semibold text-bazarna-red">{regCloseFormatted}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href={`/events/${event.slug}`}
                        className="w-full inline-flex items-center justify-center py-2.5 px-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-xs font-bold text-zinc-800 transition"
                      >
                        View Event
                      </Link>

                      {event.status === "REGISTRATION_OPEN" ? (
                        <Link
                          href={`/events/${event.slug}/apply`}
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-bazarna-red hover:bg-bazarna-darkred text-white text-xs font-bold shadow-bazarna-glow transition"
                        >
                          Apply Now
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2.5 px-3 rounded-xl bg-zinc-100 text-zinc-400 text-xs font-semibold cursor-not-allowed"
                        >
                          {event.status === "UPCOMING" ? "Opening Soon" : "Closed"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
