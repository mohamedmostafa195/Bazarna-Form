"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, MapPin, Mail, Instagram, Shield, ArrowUpRight } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="w-full bg-bazarna-black text-zinc-400 border-t border-zinc-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: About */}
          <div className="space-y-4 md:col-span-1">
            <div className="relative h-10 w-48">
              <Image
                src="/images/bazarna-logo-light.png"
                alt="Bazarna Pop-Up Society"
                fill
                sizes="192px"
                className="object-contain object-left"
              />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Egypt&apos;s leading pop-up growth platform & incubator since 2010. Accelerating local
              fashion, lifestyle, and homegrown brands through visibility, sales, and community.
            </p>
            <div className="flex flex-col gap-1.5 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-bazarna-red" />
                <span>Cairo, Egypt</span>
              </div>
              <a
                href="https://instagram.com/bazarnasociety"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-white transition"
              >
                <Instagram className="w-3.5 h-3.5 text-bazarna-gold" />
                <span>@bazarnasociety</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-500" />
              </a>
            </div>
          </div>

          {/* Col 2: Pop-Up Concepts */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Pop-Up Concepts</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/events" className="hover:text-white transition flex items-center justify-between">
                  <span>The Market (Flagship)</span>
                  <span className="text-[10px] text-zinc-500">Pop-up</span>
                </Link>
              </li>
              <li>
                <Link href="/events/byouth-summer-outlet-downtown" className="hover:text-white transition flex items-center justify-between">
                  <span>B.YOUTH</span>
                  <span className="text-[10px] text-bazarna-gold font-bold">Gen Z</span>
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-white transition flex items-center justify-between">
                  <span>Premium Outlet</span>
                  <span className="text-[10px] text-bazarna-red font-bold">Up to 70%</span>
                </Link>
              </li>
              <li>
                <span className="text-zinc-500 flex items-center justify-between">
                  <span>The Showcase & Expo</span>
                  <span className="text-[10px] text-zinc-600">Curated</span>
                </span>
              </li>
              <li>
                <span className="text-zinc-500 flex items-center justify-between">
                  <span>The Store & The Motion</span>
                  <span className="text-[10px] text-zinc-600">Retail</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Brand Operations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">For Brands & Admin</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard/profile" className="hover:text-white transition">
                  Permanent Brand Profile
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition">
                  Track Applications & Status
                </Link>
              </li>
              <li>
                <Link href="/events/byouth-summer-outlet-downtown/apply" className="hover:text-white transition">
                  B.youth Registration Wizard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-bazarna-gold" />
                  Admin Operations Portal
                </Link>
              </li>
              <li>
                <Link href="/admin/export" className="hover:text-white transition">
                  Operations Excel Export
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Visual Identity Badge */}
          <div className="space-y-3 bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Sparkles className="w-4 h-4 text-bazarna-red" />
              <span>Bazarna Visual Identity</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Rooted in Egyptian creativity since 2010. Championing local talent and transforming &ldquo;Made in Egypt&rdquo; into a source of pride.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="flex -space-x-1">
                <span className="w-5 h-5 rounded-full bg-bazarna-red border border-zinc-900" title="Bazarna Red" />
                <span className="w-5 h-5 rounded-full bg-bazarna-gold border border-zinc-900" title="Warm Gold" />
                <span className="w-5 h-5 rounded-full bg-bazarna-green border border-zinc-900" title="Emerald Green" />
                <span className="w-5 h-5 rounded-full bg-bazarna-blue border border-zinc-900" title="Cobalt Blue" />
                <span className="w-5 h-5 rounded-full bg-bazarna-sand border border-zinc-900" title="Sand Cream" />
              </div>
              <span className="text-[11px] font-mono text-zinc-400">Deck Palette</span>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} BAZARNA POP-UP SOCIETY. Founded by Yasmine Medhat in 2010. Cairo, Egypt.</p>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400">@bazarnasociety</span>
            <span>•</span>
            <span className="text-zinc-400">Egypt&apos;s Leading Pop-Up Growth Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
