"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, BrandProfile, UserAccount } from "./types";
import { BazarnaStore } from "./store";
import { arePhoneNumbersEqual } from "./phone-utils";

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message: string;
}

interface AuthContextType {
  user: UserAccount | null;
  isLoggedIn: boolean;
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentBrand: BrandProfile;
  setCurrentBrandId: (brandId: string) => void;
  availableBrands: BrandProfile[];
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: UserAccount; error?: string }>;
  register: (params: {
    brandName: string;
    category: string;
    contactName: string;
    email: string;
    password: string;
    contactPhone: string;
  }) => Promise<{ success: boolean; user?: UserAccount; error?: string }>;
  logout: () => void;
  toasts: ToastMessage[];
  addToast: (type: "success" | "error" | "info", title: string, message: string) => void;
  removeToast: (id: string) => void;
  resetAllDemoData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [role, setRoleState] = useState<UserRole>("BRAND");
  const [currentBrand, setCurrentBrandState] = useState<BrandProfile>(BazarnaStore.getCurrentBrand());
  const [availableBrands, setAvailableBrands] = useState<BrandProfile[]>(BazarnaStore.getBrands());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    // Load initial data
    const currentUser = BazarnaStore.getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      setRoleState(currentUser.role);
    }
    setCurrentBrandState(BazarnaStore.getCurrentBrand());
    setAvailableBrands(BazarnaStore.getBrands());

    const handleUpdate = () => {
      const updatedUser = BazarnaStore.getCurrentUser();
      setUser(updatedUser);
      if (updatedUser) {
        setRoleState(updatedUser.role);
      }
      setCurrentBrandState(BazarnaStore.getCurrentBrand());
      setAvailableBrands(BazarnaStore.getBrands());
    };

    window.addEventListener("bazarna_store_updated", handleUpdate);
    return () => window.removeEventListener("bazarna_store_updated", handleUpdate);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const authenticatedUser = data.user;
        setUser(authenticatedUser);
        setRoleState(authenticatedUser.role);
        BazarnaStore.setCurrentUser(authenticatedUser);
        if (authenticatedUser.brand) {
          BazarnaStore.saveBrand(authenticatedUser.brand);
          BazarnaStore.setCurrentBrand(authenticatedUser.brand.id);
          setCurrentBrandState(authenticatedUser.brand);
        }
        addToast("success", "Welcome back!", `Logged in as ${authenticatedUser.name}`);
        return { success: true, user: authenticatedUser };
      }
      if (res.status >= 500) {
        throw new Error("Server unavailable, trying local login");
      }
      return { success: false, error: data.error || "Invalid email or password." };
    } catch (err) {
      // Local fallback
      const authenticatedUser = BazarnaStore.authenticate(email, password);
      if (!authenticatedUser) {
        return { success: false, error: "Invalid email or password. Please try again." };
      }
      setUser(authenticatedUser);
      setRoleState(authenticatedUser.role);
      BazarnaStore.setCurrentUser(authenticatedUser);
      if (authenticatedUser.brandId) {
        const brand = BazarnaStore.getBrandById(authenticatedUser.brandId);
        if (brand) {
          BazarnaStore.setCurrentBrand(brand.id);
          setCurrentBrandState(brand);
        }
      }
      addToast("success", "Welcome back!", `Logged in as ${authenticatedUser.name}`);
      return { success: true, user: authenticatedUser };
    }
  };

  const register = async (params: {
    brandName: string;
    category: string;
    contactName: string;
    email: string;
    password: string;
    contactPhone: string;
  }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const newUser = data.user;
        setUser(newUser);
        setRoleState(newUser.role);
        BazarnaStore.setCurrentUser(newUser);
        if (newUser.brand) {
          BazarnaStore.saveBrand(newUser.brand);
          BazarnaStore.setCurrentBrand(newUser.brand.id);
          setCurrentBrandState(newUser.brand);
        }
        setAvailableBrands(BazarnaStore.getBrands());
        addToast("success", "Brand Account Created 🎉", `Welcome to Bazarna, ${params.brandName}!`);
        return { success: true, user: newUser };
      }
      if (res.status >= 500) {
        throw new Error("Server unavailable, trying local registration");
      }
      return { success: false, error: data.error || "Failed to create account." };
    } catch (err: any) {
      // Local fallback
      const cleanEmail = params.email.toLowerCase().trim();
      const existingUsers = BazarnaStore.getUsers();
      const existingBrands = BazarnaStore.getBrands();

      if (
        existingUsers.some((u) => u.email.toLowerCase().trim() === cleanEmail) ||
        existingBrands.some((b) => b.contactEmail?.toLowerCase().trim() === cleanEmail)
      ) {
        return {
          success: false,
          error: "An account with this email address already exists. / هذا البريد الإلكتروني مسجل بالفعل.",
        };
      }

      if (existingBrands.some((b) => arePhoneNumbersEqual(b.contactPhone, params.contactPhone))) {
        return {
          success: false,
          error:
            "This mobile phone number is already registered to another brand account. / رقم الهاتف المحمول مسجل بالفعل لحساب آخر.",
        };
      }

      try {
        const { user: newUser, brand: newBrand } = BazarnaStore.registerBrand(params);
        setUser(newUser);
        setRoleState(newUser.role);
        BazarnaStore.setCurrentUser(newUser);
        BazarnaStore.saveBrand(newBrand);
        BazarnaStore.setCurrentBrand(newBrand.id);
        setCurrentBrandState(newBrand);
        setAvailableBrands(BazarnaStore.getBrands());
        addToast("success", "Brand Account Created 🎉", `Welcome to Bazarna, ${newBrand.brandName}!`);
        return { success: true, user: newUser };
      } catch (storeErr: any) {
        return { success: false, error: storeErr?.message || "Failed to create account." };
      }
    }
  };

  const logout = () => {
    BazarnaStore.setCurrentUser(null);
    setUser(null);
    setRoleState("BRAND");
    addToast("info", "Logged Out", "You have been signed out.");
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    addToast(
      "info",
      "Role Switched",
      `Active view is now: ${newRole.replace("_", " ")}`
    );
  };

  const setCurrentBrandId = (brandId: string) => {
    BazarnaStore.setCurrentBrand(brandId);
    const brand = BazarnaStore.getCurrentBrand();
    setCurrentBrandState(brand);
    addToast("info", "Brand Switched", `Now operating as: ${brand.brandName}`);
  };

  const addToast = (type: "success" | "error" | "info", title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const resetAllDemoData = () => {
    BazarnaStore.resetToDemo();
    setUser(null);
    setRoleState("BRAND");
    setCurrentBrandState(BazarnaStore.getCurrentBrand());
    setAvailableBrands(BazarnaStore.getBrands());
    addToast("success", "Database Reset", "All demo data reset to original state.");
  };

  const isAdmin = !!user && (user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "OPERATIONS" || user.role === "FINANCE");
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        role,
        setRole,
        currentBrand,
        setCurrentBrandId,
        availableBrands,
        isAdmin,
        login,
        register,
        logout,
        toasts,
        addToast,
        removeToast,
        resetAllDemoData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
