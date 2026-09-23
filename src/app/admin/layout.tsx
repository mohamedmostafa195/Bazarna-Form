"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Calendar,
  FileCheck2,
  Users,
  Download,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  PlusCircle,
  ShieldCheck,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAdmin, isLoggedIn } = useAuth();

  const navItems = [
    {
      name: "Dashboard Overview",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Events & Packages",
      href: "/admin/events",
      icon: Calendar,
      exact: false,
    },
    {
      name: "Applications",
      href: "/admin/applications",
      icon: FileCheck2,
      exact: false,
    },
    {
      name: "Brand Database",
      href: "/admin/brands",
      icon: Users,
      exact: false,
    },
    {
      name: "Export Operations Data",
      href: "/admin/export",
      icon: Download,
      exact: false,
    },
    {
      name: "Audit Trail",
      href: "/admin/audit-logs",
      icon: ShieldAlert,
      exact: false,
    },
  ];

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  // Guard: Restrict access to Admin only
  if (!isAdmin) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#F8F9FA]">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-zinc-200/90 shadow-soft-lg">
          <div className="w-16 h-16 rounded-2xl bg-zinc-950 text-bazarna-gold flex items-center justify-center mx-auto shadow-soft-md">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
              Restricted Area
            </span>
            <h2 className="text-2xl font-black text-zinc-950 font-display">
              Admin Portal Access
            </h2>
            <p className="text-xs text-zinc-600 leading-relaxed">
              This section is reserved for Bazarna Operations & Management. Please log in with your administrative credentials to continue.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
            <span className="font-bold text-zinc-700 block">Default Admin Login:</span>
            <span className="font-mono text-zinc-500 block">admin@bazarna.com / admin123</span>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-soft-sm transition"
            >
              <ShieldCheck className="w-4 h-4 text-bazarna-gold" />
              <span>Log In as Admin</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/events"
              className="w-full flex items-center justify-center py-2.5 px-4 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition"
            >
              Back to Explore Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8F9FA] pb-20">
      {/* Admin Top Header Banner */}
      <div className="bg-zinc-950 text-white border-b border-zinc-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-bazarna-gold flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white leading-none">
                  Bazarna Operations Portal
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-butter-300">
                  Internal
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Manage events, review brand applications, assign booths & verify payments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/events/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-kiwi-500 hover:bg-kiwi-600 text-white font-bold text-xs shadow-kiwi-glow transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Create New Event
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Sub-navigation Bar (Desktop only, mobile accesses via right-side drawer) */}
      <div className="hidden md:block bg-white border-b border-zinc-200 sticky top-16 sm:top-20 z-30 shadow-soft-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2.5">
            {navItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    active
                      ? "bg-zinc-900 text-white shadow-soft-sm"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-butter-300" : "text-zinc-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Admin Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {children}
      </div>
    </div>
  );
}
