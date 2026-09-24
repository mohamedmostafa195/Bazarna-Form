"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Calendar,
  LayoutDashboard,
  User,
  ShieldCheck,
  Menu,
  X,
  FileCheck2,
  LogOut,
  ChevronDown,
  Store,
  Users,
  Download,
  ShieldAlert,
  PlusCircle,
  ChevronRight,
} from "lucide-react";

const ADMIN_NAV_ITEMS = [
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

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, isAdmin, currentBrand, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push("/login");
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-[#FAF8F5]/90 backdrop-blur-md">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href={isAdmin ? "/admin" : "/"} className="flex items-center gap-2 group">
              <div className="relative h-10 w-44 sm:h-12 sm:w-52 transition-transform group-hover:scale-[1.02]">
                <Image
                  src="/images/bazarna-logo-dark.png"
                  alt="Bazarna Pop-Up Society"
                  fill
                  sizes="(max-width: 640px) 176px, 208px"
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Links: Clean & Uncluttered */}
            {isAdmin && (
              <nav className="hidden md:flex items-center gap-2">
                <Link
                  href="/admin"
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                    pathname.startsWith("/admin")
                      ? "bg-bazarna-black text-white font-semibold"
                      : "text-zinc-700 bg-zinc-200/50 hover:bg-zinc-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-bazarna-gold" />
                    Admin Portal
                  </span>
                </Link>
              </nav>
            )}
          </div>

          {/* Desktop Right Side Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* User Profile Badge & Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="group flex items-center gap-3 pl-2 pr-3.5 py-1.5 rounded-2xl border border-zinc-200/90 bg-white hover:border-zinc-300 hover:bg-zinc-50/80 transition-all duration-200 shadow-soft-xs hover:shadow-soft-sm text-left"
                    aria-label="User profile menu"
                  >
                    {isAdmin ? (
                      <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 text-bazarna-gold flex items-center justify-center shadow-soft-xs">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bazarna-red to-rose-700 text-white flex items-center justify-center font-black text-sm shadow-soft-xs ring-2 ring-red-100/60">
                          {(currentBrand.brandName || user?.name || "B").charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                      </div>
                    )}

                    <div className="flex flex-col">
                      <span className="text-xs font-black text-zinc-950 capitalize max-w-[140px] truncate leading-tight">
                        {isAdmin ? user?.name || "Operations Admin" : currentBrand.brandName || user?.name}
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400 leading-tight">
                        {isAdmin ? "Admin Portal" : currentBrand.category || "Brand Account"}
                      </span>
                    </div>

                    <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 transition-transform duration-200 group-hover:translate-y-0.5 ml-1" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white text-zinc-900 rounded-2xl shadow-soft-2xl border border-zinc-200/90 py-2.5 z-50 animate-in fade-in zoom-in-95">
                      {/* User Header Card */}
                      <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-3">
                        {isAdmin ? (
                          <div className="w-10 h-10 rounded-xl bg-zinc-950 text-bazarna-gold flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bazarna-red to-rose-700 text-white flex items-center justify-center font-black text-base shrink-0 ring-2 ring-red-100">
                            {(currentBrand.brandName || user?.name || "B").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-zinc-950 truncate">
                            {isAdmin ? user?.name || "Admin" : currentBrand.brandName || user?.name}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate">
                            {user?.email}
                          </div>
                          <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                            {isAdmin ? "Super Admin" : currentBrand.category || "Verified Brand"}
                          </span>
                        </div>
                      </div>

                      {/* Brand Links */}
                      {!isAdmin && (
                        <div className="py-1.5 px-1.5 space-y-0.5">
                          <Link
                            href="/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-950 transition"
                          >
                            <LayoutDashboard className="w-4 h-4 text-zinc-500" />
                            <span>Brand Dashboard</span>
                          </Link>
                          <Link
                            href="/dashboard/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-950 transition"
                          >
                            <User className="w-4 h-4 text-zinc-500" />
                            <span>Brand Profile</span>
                            <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500" title="Profile Active" />
                          </Link>
                        </div>
                      )}

                      {/* Admin Links */}
                      {isAdmin && (
                        <div className="py-1.5 px-1.5 space-y-0.5">
                          <Link
                            href="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-950 transition"
                          >
                            <ShieldCheck className="w-4 h-4 text-bazarna-gold" />
                            <span>Admin Portal</span>
                          </Link>
                          <Link
                            href="/admin/applications"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-950 transition"
                          >
                            <FileCheck2 className="w-4 h-4 text-zinc-500" />
                            <span>Applications</span>
                          </Link>
                          <Link
                            href="/admin/events"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-950 transition"
                          >
                            <Calendar className="w-4 h-4 text-zinc-500" />
                            <span>Events & Packages</span>
                          </Link>
                        </div>
                      )}

                      <div className="pt-1.5 mt-1 border-t border-zinc-100 px-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Logged Out: Clean Login & Register buttons */
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-zinc-800 text-white shadow-soft-xs transition"
                >
                  Register Brand
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-zinc-700 hover:bg-zinc-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-over Drawer (Right Side) */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[310px] max-w-[85vw] bg-white z-50 md:hidden shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-l border-zinc-200 ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="relative h-8 w-36">
            <Image
              src="/images/bazarna-logo-dark.png"
              alt="Bazarna Pop-Up Society"
              fill
              className="object-contain object-left"
            />
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/60 transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoggedIn ? (
            <>
              {/* User / Admin Card */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center gap-3">
                {isAdmin ? (
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 text-bazarna-gold flex items-center justify-center shrink-0 shadow-soft-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bazarna-red to-rose-700 text-white flex items-center justify-center font-black text-base shrink-0 ring-2 ring-red-100">
                    {(currentBrand.brandName || user?.name || "B").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="overflow-hidden">
                  <div className="text-xs font-black text-zinc-950 truncate">
                    {isAdmin ? user?.name || "Operations Admin" : currentBrand.brandName || user?.name}
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate">
                    {user?.email}
                  </div>
                  <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-200/80 text-zinc-700">
                    {isAdmin ? "Super Admin" : currentBrand.category || "Verified Brand"}
                  </span>
                </div>
              </div>

              {/* Admin Navigation Menu */}
              {isAdmin ? (
                <div className="space-y-1">
                  <div className="px-2 pb-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Admin Navigation
                  </div>

                  <div className="space-y-1">
                    {ADMIN_NAV_ITEMS.map((item) => {
                      const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                            active
                              ? "bg-zinc-950 text-white shadow-soft-xs"
                              : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${active ? "text-butter-300" : "text-zinc-400"}`} />
                            <span>{item.name}</span>
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 ${active ? "text-butter-300" : "text-zinc-300"}`} />
                        </Link>
                      );
                    })}
                  </div>

                  <div className="pt-3">
                    <Link
                      href="/admin/events/new"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-kiwi-500 hover:bg-kiwi-600 text-white text-xs font-bold shadow-kiwi-glow transition"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Create New Event</span>
                    </Link>
                  </div>
                </div>
              ) : (
                /* Brand Navigation */
                <div className="space-y-1">
                  <div className="px-2 pb-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Brand Portal
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                      pathname === "/dashboard"
                        ? "bg-zinc-950 text-white shadow-soft-xs"
                        : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                      <span>Brand Dashboard</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                      pathname.startsWith("/dashboard/profile")
                        ? "bg-zinc-950 text-white shadow-soft-xs"
                        : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-zinc-400" />
                      <span>Brand Profile</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
                  </Link>
                </div>
              )}
            </>
          ) : (
            /* Logged Out / Guests */
            <div className="space-y-3 pt-2">
              <div className="space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-zinc-200 text-zinc-800 hover:bg-zinc-50 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-zinc-950 text-white shadow-soft-xs hover:bg-zinc-800 transition"
                >
                  Register Brand
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {isLoggedIn && (
          <div className="p-4 border-t border-zinc-100 bg-zinc-50/60">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200/70 bg-white transition shadow-soft-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
