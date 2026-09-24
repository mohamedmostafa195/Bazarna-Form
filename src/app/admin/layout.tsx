"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Calendar,
  FileCheck2,
  Users,
  Download,
  ShieldAlert,
  PlusCircle,
  ExternalLink,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  Lock,
  ArrowRight,
  Store,
  Sparkles,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isLoggedIn, user, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
    setProfileDropdownOpen(false);
  }, [pathname]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Determine current active page title for the breadcrumb
  const currentNavItem = navItems.find((item) => isActive(item));
  const pageTitle = currentNavItem ? currentNavItem.name : "Admin";

  // Guard: Restrict access to Admin only
  if (!isAdmin) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center px-4 py-16 bg-[#F8F9FA]">
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
    <div className="min-h-screen bg-[#F8F9FA] flex text-zinc-900">
      {/* ========================================================
          1. DESKTOP LEFT SIDEBAR (Dark theme matching reference)
         ======================================================== */}
      <aside
        className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-40 bg-[#0E1013] text-zinc-300 border-r border-zinc-800/80 transition-all duration-300 ease-in-out ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800/80 shrink-0">
          <Link
            href="/admin"
            className={`flex items-center gap-3 overflow-hidden ${
              collapsed ? "justify-center w-full" : ""
            }`}
            title="Bazarna Operations"
          >
            <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-soft-xs bg-zinc-900 border border-zinc-700/60 flex items-center justify-center">
              <Image
                src="/images/bazarna-symbol.png"
                alt="Bazarna Symbol"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black tracking-wider text-white font-display truncate">
                  BAZARNA
                </span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">
                  OPS PORTAL
                </span>
              </div>
            )}
          </Link>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed expand trigger */}
        {collapsed && (
          <div className="pt-2 px-3 flex justify-center">
            <button
              onClick={() => setCollapsed(false)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-zinc-500">
              Management
            </div>
          )}

          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  active
                    ? "bg-zinc-800 text-white shadow-soft-xs"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-850 hover:bg-zinc-800/40"
                } ${collapsed ? "justify-center px-2" : ""}`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    active ? "text-butter-300" : "text-zinc-400 group-hover:text-zinc-200"
                  }`}
                />
                {!collapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            );
          })}


        </div>

        {/* Sidebar Footer: User Account (Matching reference image) */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60 relative" ref={profileRef}>
          <div
            className={`flex items-center gap-3 p-1.5 rounded-xl transition ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {/* User Avatar */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/80 text-bazarna-gold flex items-center justify-center font-bold text-xs shadow-soft-xs">
                <ShieldCheck className="w-4 h-4 text-bazarna-gold" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0E1013]" />
            </div>

            {/* User Info */}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {user?.name || "Ahmed Operations"}
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {user?.email || "admin@bazarna.com"}
                </div>
              </div>
            )}

            {/* Popover / Options Trigger */}
            {!collapsed && (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                  aria-label="Admin settings"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-zinc-900 border border-zinc-800 text-white rounded-xl shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-zinc-800 text-[11px] text-zinc-400">
                      Logged in as <span className="font-bold text-white block truncate">{user?.email || "admin"}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================
          2. MOBILE SLIDE-OVER DRAWER (From the LEFT)
         ======================================================== */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 md:hidden transition-opacity duration-300"
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-[#0E1013] text-zinc-300 z-50 md:hidden shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-r border-zinc-800 ${
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        {/* Drawer Header */}
        <div className="h-16 px-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-700/60 flex items-center justify-center">
              <Image
                src="/images/bazarna-symbol.png"
                alt="Bazarna Symbol"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <span className="text-sm font-black tracking-wider text-white font-display block">
                BAZARNA
              </span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                OPS PORTAL
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Nav Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-zinc-500">
            Management
          </div>
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileDrawerOpen(false)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition ${
                  active
                    ? "bg-zinc-800 text-white shadow-soft-xs"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-850 hover:bg-zinc-800/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? "text-butter-300" : "text-zinc-400"}`} />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${active ? "text-butter-300" : "text-zinc-600"}`} />
              </Link>
            );
          })}


        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 text-bazarna-gold flex items-center justify-center font-bold text-xs shrink-0">
                <ShieldCheck className="w-4 h-4 text-bazarna-gold" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {user?.name || "Ahmed Operations"}
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {user?.email || "admin@bazarna.com"}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-rose-400 hover:bg-rose-950/40 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. MAIN CONTENT AREA (Offset by sidebar width on desktop)
         ======================================================== */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          collapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-zinc-200/90 px-4 sm:px-8 flex items-center justify-between shadow-soft-xs">
          {/* Left: Mobile trigger & Breadcrumbs */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-xl text-zinc-700 hover:bg-zinc-100 transition"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label="Toggle sidebar"
            >
              {collapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="font-semibold text-zinc-400">Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
              <span className="font-bold text-zinc-900">{pageTitle}</span>
            </div>
          </div>
        </header>

        {/* Page Children */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
