"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import EventsPage from "@/app/events/page";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Users,
  Store,
  MapPin,
  Flame,
  Layers,
  ChevronRight,
  ShoppingBag,
  Zap,
  Tag,
  Award,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, isAdmin } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isLoggedIn && isAdmin) {
      router.replace("/admin");
    }
  }, [mounted, isLoggedIn, isAdmin, router]);

  if (!mounted) return null;

  // If Admin -> Redirecting to /admin, never render EventsPage
  if (isLoggedIn && isAdmin) {
    return null;
  }

  // When logged in as Brand -> Show "Curated Pop-Up Calendar • 2026 Season" (Events Page)
  // When not logged in / guest -> Show Landing Page
  if (isLoggedIn) {
    return <EventsPage />;
  }

  return <LandingPageView />;
}

function LandingPageView() {
  const { currentBrand, isLoggedIn } = useAuth();

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-bazarna-hero border-b border-zinc-200/70 pt-16 sm:pt-24 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-bazarna-gold/10 via-bazarna-red/10 to-bazarna-green/10 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Top Pill / Deck Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-zinc-200/80 shadow-soft-sm text-xs font-semibold text-zinc-700 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <span className="w-2 h-2 rounded-full bg-bazarna-red animate-pulse" />
            <span className="font-mono text-zinc-500 uppercase tracking-wider">@bazarnasociety</span>
            <span className="text-zinc-300">|</span>
            <span className="text-zinc-900 font-bold">Egypt&apos;s Leading Pop-Up Growth Platform Since 2010</span>
          </div>

          {/* Main Hero Typography - Condensed Editorial with Red Script Accent */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-normal text-zinc-950 font-display leading-[0.95] tracking-tight uppercase">
              Where Egyptian Brands <br />
              <span className="text-zinc-900">Meet Their </span>
              <span className="font-script text-bazarna-red text-6xl sm:text-8xl lg:text-9xl normal-case font-normal inline-block transform -rotate-2 hover:rotate-0 transition-transform">
                community
              </span>
            </h1>

            <p className="text-base sm:text-xl text-zinc-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Egypt&apos;s most influential seasonal pop-up events and curated retail markets. 
              Connecting ambitious local brands with over <strong className="text-zinc-900 font-semibold">100,000+ targeted shoppers</strong> across West & East Cairo.
            </p>
          </div>

          {/* Hero CTAs */}
          <div className="flex items-center justify-center pt-2">
            <Link
              href="/events"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-sm shadow-soft-sm transition transform hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4 text-bazarna-gold" />
              <span>View 2026 Calendar</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Key Metrics / Credibility Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-zinc-200/80 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-zinc-200/70">
              <span className="text-3xl font-black text-zinc-950 font-display block">15+</span>
              <span className="text-xs text-zinc-500 font-medium">Years in Egyptian Market</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-zinc-200/70">
              <span className="text-3xl font-black text-zinc-950 font-display block">3,500+</span>
              <span className="text-xs text-zinc-500 font-medium">Local Brands Launched</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-zinc-200/70">
              <span className="text-3xl font-black text-zinc-950 font-display block">100K+</span>
              <span className="text-xs text-zinc-500 font-medium">Footfall Per Season</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-zinc-200/70">
              <span className="text-3xl font-black text-bazarna-red font-display block">Prime</span>
              <span className="text-xs text-zinc-500 font-medium">Venues in Cairo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pop-Up Concepts Showcase (From the Deck Outline: The Market, B.Youth, Premium Outlet) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold text-bazarna-red uppercase tracking-widest block mb-1">
              03 • OUR POP-UP CONCEPTS
            </span>
            <h2 className="text-4xl sm:text-5xl font-normal text-zinc-950 font-display uppercase tracking-wide">
              Curated Event Formats
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Tailored platforms built for brand acceleration, community footfall, and distinct audience demographics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Concept 1: THE MARKET */}
          <div className="p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-soft-md hover:shadow-soft-xl transition flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-bazarna-gold">01</span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Flagship
                </span>
              </div>
              <h3 className="text-3xl font-normal font-display text-zinc-950 uppercase tracking-wide">
                THE MARKET
              </h3>
              <p className="font-script text-bazarna-red text-xl leading-none">
                The heart of BAZARNA&apos;s community
              </p>
              <p className="text-xs text-zinc-600 leading-relaxed">
                BAZARNA&apos;s flagship pop-up market is where shopping meets excitement. Medium-to-large in scale,
                designed for discovery, connection, and unforgettable experiences.
              </p>
            </div>
            <div className="pt-6 border-t border-zinc-100 mt-6 flex items-center justify-between text-xs font-semibold text-zinc-900">
              <span>Medium-to-large scale</span>
              <span className="text-bazarna-red font-bold">Flagship Drop</span>
            </div>
          </div>

          {/* Concept 2: B.YOUTH */}
          <div className="p-8 rounded-3xl bg-white border-2 border-bazarna-red/30 shadow-soft-md hover:shadow-soft-xl transition flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full pointer-events-none" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-bazarna-red">02</span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-100 text-bazarna-red border border-red-200">
                  Gen Z & Alpha
                </span>
              </div>
              <h3 className="text-3xl font-normal font-display text-zinc-950 uppercase tracking-wide">
                B.YOUTH
              </h3>
              <p className="font-script text-bazarna-red text-xl leading-none">
                BAZARNA&apos;s youth-first experience
              </p>
              <p className="text-xs text-zinc-600 leading-relaxed">
                A lifestyle moment where the next wave of creators shine, the youth community vibes together,
                and every visit is a chance to discover fresh homegrown streetwear and culture.
              </p>
            </div>
            <div className="pt-6 border-t border-zinc-100 mt-6 flex items-center justify-between text-xs font-semibold text-zinc-900">
              <span>Next-Gen Creators</span>
              <span className="text-bazarna-red font-bold">Now Registering</span>
            </div>
          </div>

          {/* Concept 3: PREMIUM OUTLET */}
          <div className="p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-soft-md hover:shadow-soft-xl transition flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-bazarna-green">03</span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Up to 70% Off
                </span>
              </div>
              <h3 className="text-3xl font-normal font-display text-zinc-950 uppercase tracking-wide">
                PREMIUM OUTLET
              </h3>
              <p className="font-script text-bazarna-red text-xl leading-none">
                Seasonal powerhouse markets
              </p>
              <p className="text-xs text-zinc-600 leading-relaxed">
                BAZARNA&apos;s seasonal powerhouse markets, one for Summer and one for Winter, where 120+ brands
                come together to move end-of-season stock and generate strong cash flow.
              </p>
            </div>
            <div className="pt-6 border-t border-zinc-100 mt-6 flex items-center justify-between text-xs font-semibold text-zinc-900">
              <span>120+ Brands Together</span>
              <span className="text-bazarna-green font-bold">Cash Flow Engine</span>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative Section: "Our Story" (Page 5 of Deck) */}
      <section className="w-full bg-[#F3EFE6] border-y border-zinc-200/70 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-bazarna-red uppercase tracking-widest">
              <span>01 • ABOUT BAZARNA</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-normal text-zinc-950 font-display uppercase leading-tight tracking-tight">
              Every Great Movement <br />
              Begins With A <span className="font-script text-bazarna-red text-5xl sm:text-7xl lowercase font-normal">spark.</span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-700 leading-relaxed">
              For Bazarna, that spark ignited in 2010 when founder Yasmine Medhat set out to change how local
              talent was seen and supported in Egypt. Inspired by her mother&apos;s simple act of selling handmade silk scarves,
              she transformed an empty apartment into a space where designers could finally be seen, heard, and celebrated.
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Bazarna redefined the meaning of a bazaar, creating a platform built for local creators to grow.
              Today, Bazarna stands as Egypt&apos;s leading pop-up growth platform and incubator, championing &ldquo;Made in Egypt&rdquo;
              and turning it into a source of pride.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-semibold text-zinc-800">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-bazarna-red" />
                <span>Founded in Cairo, 2010</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-bazarna-gold" />
                <span>15+ Years Empowering Creators</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            {/* Signature red framed editorial photo presentation */}
            <div className="relative p-3 rounded-3xl bg-white shadow-soft-xl border-4 border-bazarna-red max-w-md w-full">
              <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden bg-zinc-900">
                <Image
                  src="/extracted_branding/page_1.png"
                  alt="Bazarna Pop-Up Society Atmosphere"
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-mono tracking-widest text-bazarna-gold uppercase block">
                    Pop-Up Movement
                  </span>
                  <p className="text-base font-bold font-display tracking-wide">
                    CHAMPIONING &ldquo;MADE IN EGYPT&rdquo;
                  </p>
                  <p className="text-xs text-zinc-300">Cairo • North Coast • Marassi Marina</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principle Feature: "One Profile, Unlimited Events" */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="text-xs font-bold text-bazarna-red bg-red-50 px-3 py-1 rounded-full uppercase tracking-wider border border-red-200">
            The Bazarna Advantage
          </span>
          <h2 className="text-4xl sm:text-5xl font-normal text-zinc-950 font-display uppercase tracking-wide">
            Enter Your Brand Data Once. <br className="hidden sm:inline" />
            Apply to Every Event in Seconds.
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
            No more re-entering your brand bio, Instagram handles, contact info, Tax ID card, and
            National ID scans into separate Jotforms every month.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-soft-md hover:shadow-soft-xl transition space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-bazarna-red font-bold text-lg group-hover:scale-110 transition border border-red-100">
              1
            </div>
            <h3 className="text-lg font-bold text-zinc-950">Permanent Brand Profile</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Upload your Tax ID card, National ID, social handles, and brand details once. They are
              safely stored in your profile and verified by our operations team.
            </p>
            <div className="pt-2 text-xs font-semibold text-bazarna-red flex items-center gap-1">
              <span>View profile page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-soft-md hover:shadow-soft-xl transition space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-bazarna-gold font-bold text-lg group-hover:scale-110 transition border border-amber-100">
              2
            </div>
            <h3 className="text-lg font-bold text-zinc-950">Curated Event Selection</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Browse pop-ups across East Cairo, West Cairo, and North Coast. Choose booth packages
              (Rack, Table, Cart) with transparent pricing and live availability.
            </p>
            <div className="pt-2 text-xs font-semibold text-bazarna-gold flex items-center gap-1">
              <span>Explore active catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-soft-md hover:shadow-soft-xl transition space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-bazarna-green font-bold text-lg group-hover:scale-110 transition border border-emerald-100">
              3
            </div>
            <h3 className="text-lg font-bold text-zinc-950">Transparent Tracking & Booths</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Follow your application timeline from submission to payment approval, and receive your
              assigned booth number (e.g. Booth A-04) right on your dashboard.
            </p>
            <div className="pt-2 text-xs font-semibold text-bazarna-green flex items-center gap-1">
              <span>Open brand dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Banner - Authentic Bazarna Black & Deck Metrics */}
      <section className="w-full bg-bazarna-black text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <span className="text-4xl sm:text-5xl font-normal font-display text-bazarna-red">15+</span>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Years of Movement</p>
          </div>
          <div className="space-y-1">
            <span className="text-4xl sm:text-5xl font-normal font-display text-bazarna-gold">120+</span>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Brands Under One Roof</p>
          </div>
          <div className="space-y-1">
            <span className="text-4xl sm:text-5xl font-normal font-display text-bazarna-green">70%</span>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Outlet Discount Steals</p>
          </div>
          <div className="space-y-1">
            <span className="text-4xl sm:text-5xl font-normal font-display text-bazarna-blue">100%</span>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Made in Egypt Pride</p>
          </div>
        </div>
      </section>
    </div>
  );
}
