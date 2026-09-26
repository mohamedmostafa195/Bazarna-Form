"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import {
  Store,
  Mail,
  Lock,
  User,
  Phone,
  Tag,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";

const BRAND_CATEGORIES = [
  "Fashion & Apparel",
  "Jewelry & Accessories",
  "Footwear & Bags",
  "Beauty & Skincare",
  "Home Décor & Living",
  "Gourmet & Packaged Food",
  "Kids & Baby",
  "Art, Stationery & Gifts",
  "Other",
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const { register } = useAuth();

  const [brandName, setBrandName] = useState("");
  const [category, setCategory] = useState(BRAND_CATEGORIES[0]);
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!brandName || !email || !password || !contactName || !contactPhone) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address (e.g. name@brand.com).");
      return;
    }

    const cleanPhoneDigits = contactPhone.replace(/\D/g, "");
    if (cleanPhoneDigits.length !== 11) {
      setErrorMessage(
        "Phone / WhatsApp must be exactly 11 digits (e.g. 01012345678). / رقم الهاتف يجب أن يتكون من 11 رقماً بالضبط."
      );
      return;
    }

    if (!/^01[0125][0-9]{8}$/.test(cleanPhoneDigits)) {
      setErrorMessage(
        "Please enter a valid Egyptian mobile number starting with 010, 011, 012, or 015. / يرجى إدخال رقم موبايل مصري صحيح يبدأ بـ 01."
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const result = await register({
      brandName,
      category,
      contactName,
      email,
      password,
      contactPhone,
    });
    setLoading(false);

    if (result.success) {
      router.push(redirectUrl || "/events");
    } else {
      setErrorMessage(result.error || "Failed to create brand account.");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="relative h-12 w-48 mx-auto">
            <Image
              src="/images/bazarna-logo-dark.png"
              alt="Bazarna Pop-Up Society"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-black text-zinc-950 font-display">
            Create Your Brand Profile
          </h1>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Join 3,500+ premium Egyptian brands. Apply to any Bazarna pop-up market in one click.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-7 sm:p-9 rounded-3xl border border-zinc-200/90 shadow-soft-md space-y-5">
          {redirectUrl && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-bazarna-red shrink-0" />
              <span>Please create your brand profile first to complete your event application.</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800">
                  Brand Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Kemet Studio"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-zinc-900 transition"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800">Category</label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-zinc-900 transition bg-white"
                  >
                    {BRAND_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800">
                  Contact Person <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Founder / Manager name"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-zinc-900 transition"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800 flex justify-between items-center">
                  <span>
                    Phone / WhatsApp <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono font-normal">
                    {contactPhone.length}/11
                  </span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={11}
                    value={contactPhone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                      setContactPhone(digits);
                    }}
                    placeholder="01012345678"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-zinc-900 transition font-mono tracking-wider"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@yourbrand.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-zinc-900 transition"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-zinc-900 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-bazarna-red hover:bg-bazarna-darkred text-white text-xs font-bold shadow-bazarna-glow transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Permanent Brand Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-zinc-100 text-center">
            <p className="text-xs text-zinc-500">
              Already have an account?{" "}
              <Link
                href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login"}
                className="font-bold text-zinc-900 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-bazarna-red border-t-transparent animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

