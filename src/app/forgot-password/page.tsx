"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok && res.status !== 200) {
        setErrorMessage(data.error || "Failed to process request. Please try again.");
      } else {
        setIsSubmitted(true);
      }
    } catch {
      // In case of network glitch, still show submitted state for graceful UX or error
      setIsSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link href="/login" className="inline-block relative h-12 w-48 mx-auto">
            <Image
              src="/images/bazarna-logo-dark.png"
              alt="Bazarna Pop-Up Society"
              fill
              className="object-contain"
              priority
            />
          </Link>
          <h1 className="text-2xl font-black text-zinc-950 font-display">
            Forgot Password?
          </h1>
          <p className="text-xs text-zinc-500">
            No worries, we will send you reset instructions.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-7 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-md space-y-5">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-soft-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-zinc-950 font-display">
                  Reset Link Sent!
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
                  If an account exists for <span className="font-bold text-zinc-800">{email}</span>, we&apos;ve sent an email with password reset instructions.
                </p>
              </div>

              <div className="pt-3 space-y-2">
                <Link
                  href="/login"
                  className="w-full py-3.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-soft-sm transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition pt-1 block mx-auto"
                >
                  Didn&apos;t receive it? Try again
                </button>
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-800">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@brand.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-zinc-900 transition"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-soft-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-950 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
