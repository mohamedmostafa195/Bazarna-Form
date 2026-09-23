"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, isAdmin } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!isLoggedIn) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (isAdmin) {
        router.replace("/admin");
      }
    }
  }, [mounted, isLoggedIn, isAdmin, router, pathname]);

  // If not mounted, not logged in, or is admin, render nothing so events page never flashes or appears
  if (!mounted || !isLoggedIn || isAdmin) {
    return null;
  }

  return <>{children}</>;
}
