"use client";

import {
  BazarnaEvent,
  BrandProfile,
  EventApplication,
  AuditLogEntry,
  AppNotification,
  ApplicationStatus,
  PaymentStatus,
  DocumentStatus,
  EventPackage,
  EventQuestion,
  UserAccount,
} from "./types";
import {
  INITIAL_EVENTS,
  INITIAL_BRANDS,
  INITIAL_APPLICATIONS,
  INITIAL_AUDIT_LOGS,
} from "./seed-data";

const STORAGE_KEYS = {
  EVENTS: "bazarna_events_v1",
  BRANDS: "bazarna_brands_v1",
  APPLICATIONS: "bazarna_applications_v1",
  AUDIT_LOGS: "bazarna_audit_logs_v1",
  NOTIFICATIONS: "bazarna_notifications_v1",
  CURRENT_BRAND: "bazarna_current_brand_v1",
  USERS: "bazarna_users_v1",
  CURRENT_USER: "bazarna_current_user_v1",
};

const INITIAL_USERS: UserAccount[] = [
  {
    id: "usr-admin-1",
    email: "admin@bazarna.com",
    password: "admin123",
    name: "Ahmed Operations (Admin)",
    role: "SUPER_ADMIN",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "usr-brand-1",
    email: "brand@bazarna.com",
    password: "password123",
    name: "Kemet Studio",
    role: "BRAND",
    brandId: "brand-1",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

// Safe localStorage helper
function getStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Dispatch custom storage event so other components update reactively
    window.dispatchEvent(new Event("bazarna_store_updated"));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

export const BazarnaStore = {
  // --- EVENTS ---
  getEvents(): BazarnaEvent[] {
    const rawEvents = getStored<BazarnaEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    let modified = false;
    const events = rawEvents.map((evt) => {
      let evtModified = false;
      let newSlug = evt.slug;

      // Auto-sanitize corrupted slugs (e.g. if someone pasted an Instagram URL or external link)
      if (
        !evt.slug ||
        evt.slug.includes("http") ||
        evt.slug.includes("/") ||
        evt.slug.includes(":") ||
        evt.slug.includes("instagram")
      ) {
        newSlug =
          evt.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") || "byouth-summer-outlet-downtown";
        evtModified = true;
      }

      // Auto-remove staff question
      const filteredQuestions = (evt.questions || []).filter(
        (q) => !q.questionText.toLowerCase().includes("staff")
      );
      if (filteredQuestions.length !== (evt.questions || []).length) {
        evtModified = true;
      }

      if (evtModified) {
        modified = true;
        return {
          ...evt,
          slug: newSlug,
          questions: filteredQuestions,
        };
      }

      return evt;
    });

    if (modified) {
      setStored(STORAGE_KEYS.EVENTS, events);
    }
    return events;
  },

  getEventBySlug(slug: string): BazarnaEvent | undefined {
    const events = this.getEvents();
    const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();
    return events.find((e) => {
      const eSlug = (e.slug || "").toLowerCase();
      return (
        eSlug === decodedSlug ||
        e.id === decodedSlug ||
        decodedSlug.includes(eSlug) ||
        (eSlug.length > 3 && decodedSlug.endsWith(eSlug))
      );
    });
  },

  getEventById(id: string): BazarnaEvent | undefined {
    const events = this.getEvents();
    return events.find((e) => e.id === id);
  },

  saveEvent(event: BazarnaEvent): void {
    // Ensure slug is clean and valid URL-friendly string (not a full URL)
    const cleanSlug = (event.slug || event.name)
      .replace(/^https?:\/\/[^\/]+\/?/i, "")
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/(^-|-$)/g, "");
    event.slug = cleanSlug || "event-" + Date.now();

    const events = this.getEvents();
    const index = events.findIndex((e) => e.id === event.id);
    if (index >= 0) {
      events[index] = event;
    } else {
      events.unshift(event);
    }
    setStored(STORAGE_KEYS.EVENTS, events);
    this.addAuditLog(
      "Ahmed Operations",
      index >= 0 ? `Updated Event: ${event.name}` : `Created Event: ${event.name}`,
      "EVENT",
      event.id,
      `Event status: ${event.status}`
    );
  },

  deleteEvent(id: string): boolean {
    const events = this.getEvents();
    const event = events.find((e) => e.id === id);
    if (!event) return false;

    const filtered = events.filter((e) => e.id !== id);
    setStored(STORAGE_KEYS.EVENTS, filtered);
    this.addAuditLog(
      "Ahmed Operations",
      `Deleted Event: ${event.name}`,
      "EVENT",
      event.id,
      `Event ${event.name} (${event.id}) was permanently deleted`
    );
    return true;
  },

  duplicateEvent(eventId: string, newName?: string): BazarnaEvent | null {
    const original = this.getEventById(eventId);
    if (!original) return null;

    const baseName = newName || `${original.name} (Copy)`;
    const newSlug = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + `-${Date.now().toString().slice(-4)}`;

    const newEvent: BazarnaEvent = {
      ...original,
      id: `evt-${Date.now()}`,
      name: baseName,
      slug: newSlug,
      status: "DRAFT",
      packages: original.packages.map((pkg) => ({
        ...pkg,
        id: `pkg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        eventId: `evt-${Date.now()}`,
        remainingQty: pkg.totalQty,
      })),
      questions: original.questions.map((q) => ({
        ...q,
        id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        eventId: `evt-${Date.now()}`,
      })),
    };

    this.saveEvent(newEvent);
    this.addAuditLog(
      "Ahmed Operations",
      `Duplicated Event from "${original.name}" to "${newEvent.name}"`,
      "EVENT",
      newEvent.id
    );
    return newEvent;
  },

  updateEventStatus(eventId: string, status: BazarnaEvent["status"]): void {
    const events = this.getEvents();
    const event = events.find((e) => e.id === eventId);
    if (event) {
      event.status = status;
      setStored(STORAGE_KEYS.EVENTS, events);
      this.addAuditLog(
        "Ahmed Operations",
        `Changed status of "${event.name}" to ${status}`,
        "EVENT",
        event.id
      );
    }
  },

  // --- BRANDS ---
  getBrands(): BrandProfile[] {
    return getStored<BrandProfile[]>(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
  },

  getCurrentBrand(): BrandProfile {
    const brands = this.getBrands();
    const currentId = getStored<string>(STORAGE_KEYS.CURRENT_BRAND, brands[0]?.id || "");
    const brand = brands.find((b) => b.id === currentId);
    return brand || brands[0] || INITIAL_BRANDS[0];
  },

  setCurrentBrand(brandId: string): void {
    setStored(STORAGE_KEYS.CURRENT_BRAND, brandId);
  },

  getBrandById(id: string): BrandProfile | undefined {
    return this.getBrands().find((b) => b.id === id);
  },

  saveBrand(brand: BrandProfile): void {
    const brands = this.getBrands();
    const index = brands.findIndex((b) => b.id === brand.id);
    if (index >= 0) {
      brands[index] = { ...brand, updatedAt: new Date().toISOString() };
    } else {
      brands.push({ ...brand, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setStored(STORAGE_KEYS.BRANDS, brands);
  },

  // --- APPLICATIONS ---
  getApplications(): EventApplication[] {
    return getStored<EventApplication[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  },

  getApplicationById(id: string): EventApplication | undefined {
    return this.getApplications().find((a) => a.id === id || a.applicationCode === id);
  },

  getApplicationsByBrand(brandId: string): EventApplication[] {
    return this.getApplications().filter((a) => a.brandId === brandId);
  },

  submitApplication(data: {
    brand: BrandProfile;
    event: BazarnaEvent;
    packageId: string;
    prParticipation: boolean;
    notes?: string;
    paymentMethod: string;
    receiptFileUrl?: string;
    receiptFileName?: string;
    answers: { questionId: string; answerText: string }[];
    tcAccepted: boolean;
    tcVersion: string;
  }): EventApplication {
    const applications = this.getApplications();
    const selectedPackage = data.event.packages.find((p) => p.id === data.packageId);

    // Generate clean application code, e.g. BY-2026-000127
    const seq = (applications.length + 124).toString().padStart(6, "0");
    const appCode = `BY-2026-${seq}`;

    // Decrement package quantity if available
    const events = this.getEvents();
    const ev = events.find((e) => e.id === data.event.id);
    if (ev) {
      const pkg = ev.packages.find((p) => p.id === data.packageId);
      if (pkg && pkg.remainingQty > 0) {
        pkg.remainingQty -= 1;
        setStored(STORAGE_KEYS.EVENTS, events);
      }
    }

    const newApp: EventApplication = {
      id: `app-${Date.now()}`,
      applicationCode: appCode,
      brandId: data.brand.id,
      brand: data.brand,
      eventId: data.event.id,
      event: data.event,
      packageId: data.packageId,
      package: selectedPackage,
      prParticipation: data.prParticipation,
      notes: data.notes || "",
      appStatus: "SUBMITTED",
      paymentStatus: data.receiptFileUrl ? "RECEIPT_UPLOADED" : "PENDING",
      tcAccepted: data.tcAccepted,
      tcAcceptedAt: new Date().toISOString(),
      tcVersion: data.tcVersion,
      payment: {
        id: `pay-${Date.now()}`,
        applicationId: `app-${Date.now()}`,
        amount: selectedPackage?.price || 0,
        currency: "EGP",
        method: data.paymentMethod,
        receiptFileUrl: data.receiptFileUrl,
        receiptFileName: data.receiptFileName,
        paymentStatus: data.receiptFileUrl ? "RECEIPT_UPLOADED" : "PENDING",
        uploadedAt: data.receiptFileUrl ? new Date().toISOString() : undefined,
      },
      answers: data.answers.map((ans, idx) => ({
        id: `ans-${Date.now()}-${idx}`,
        applicationId: `app-${Date.now()}`,
        questionId: ans.questionId,
        answerText: ans.answerText,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    applications.unshift(newApp);
    setStored(STORAGE_KEYS.APPLICATIONS, applications);

    // Save/update brand profile if modified during application
    this.saveBrand(data.brand);

    // Log action
    this.addAuditLog(
      data.brand.contactName || data.brand.brandName,
      `Submitted Application ${appCode} for ${data.event.name}`,
      "APPLICATION",
      newApp.id,
      `Package: ${selectedPackage?.name} (${selectedPackage?.price} EGP)`
    );

    return newApp;
  },

  updateApplicationStatus(
    appId: string,
    status: ApplicationStatus,
    adminName: string = "Ahmed Operations",
    reason?: string
  ): void {
    const apps = this.getApplications();
    const app = apps.find((a) => a.id === appId);
    if (app) {
      app.appStatus = status;
      if (reason !== undefined) {
        app.adminFeedback = reason;
      }
      app.updatedAt = new Date().toISOString();
      setStored(STORAGE_KEYS.APPLICATIONS, apps);

      this.addAuditLog(
        adminName,
        `Changed application ${app.applicationCode} status to ${status}`,
        "APPLICATION",
        app.id,
        reason || `Status updated to ${status}`
      );
    }
  },

  updatePaymentStatus(
    appId: string,
    status: PaymentStatus,
    adminName: string = "Dina Finance",
    adminNote?: string
  ): void {
    const apps = this.getApplications();
    const app = apps.find((a) => a.id === appId);
    if (app) {
      app.paymentStatus = status;
      if (app.payment) {
        app.payment.paymentStatus = status;
        if (adminNote) app.payment.adminNote = adminNote;
        if (status === "PAID") app.payment.verifiedAt = new Date().toISOString();
      }
      app.updatedAt = new Date().toISOString();
      setStored(STORAGE_KEYS.APPLICATIONS, apps);

      this.addAuditLog(
        adminName,
        `Changed payment status for ${app.applicationCode} to ${status}`,
        "PAYMENT",
        app.id,
        adminNote || `Payment updated to ${status}`
      );
    }
  },

  assignBooth(appId: string, boothName: string, adminName: string = "Tamer Logistics"): void {
    const apps = this.getApplications();
    const app = apps.find((a) => a.id === appId);
    if (app) {
      app.assignedBooth = boothName;
      app.updatedAt = new Date().toISOString();
      setStored(STORAGE_KEYS.APPLICATIONS, apps);

      this.addAuditLog(
        adminName,
        `Assigned ${boothName} to ${app.brand.brandName} (${app.applicationCode})`,
        "APPLICATION",
        app.id
      );
    }
  },

  // --- AUDIT LOGS ---
  getAuditLogs(): AuditLogEntry[] {
    return getStored<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },

  addAuditLog(
    adminName: string,
    action: string,
    targetType: AuditLogEntry["targetType"],
    targetId: string,
    details?: string
  ): void {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: `log-${Date.now()}`,
      adminName,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    });
    setStored(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  // --- USERS & AUTHENTICATION ---
  getUsers(): UserAccount[] {
    return getStored<UserAccount[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  getCurrentUser(): UserAccount | null {
    return getStored<UserAccount | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  setCurrentUser(user: UserAccount | null): void {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
  },

  authenticate(email: string, password: string): UserAccount | null {
    const users = this.getUsers();
    const user = users.find(
      (u) =>
        u.email.toLowerCase().trim() === email.toLowerCase().trim() &&
        u.password === password
    );
    if (user) {
      this.setCurrentUser(user);
      if (user.brandId) {
        this.setCurrentBrand(user.brandId);
      }
      return user;
    }
    return null;
  },

  registerBrand(params: {
    brandName: string;
    category: string;
    contactName: string;
    email: string;
    password: string;
    contactPhone: string;
  }): { user: UserAccount; brand: BrandProfile } {
    const brands = this.getBrands();
    const newBrandId = `brand-${Date.now()}`;
    const newUserId = `usr-${Date.now()}`;

    const newBrand: BrandProfile = {
      id: newBrandId,
      userId: newUserId,
      brandName: params.brandName,
      category: params.category,
      contactName: params.contactName,
      contactEmail: params.email,
      contactPhone: params.contactPhone,
      aboutBrand: `Handcrafted ${params.category} brand based in Egypt.`,
      products: params.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: [],
    };

    brands.unshift(newBrand);
    setStored(STORAGE_KEYS.BRANDS, brands);

    const newUser: UserAccount = {
      id: newUserId,
      email: params.email,
      password: params.password,
      name: params.brandName,
      role: "BRAND",
      brandId: newBrandId,
      createdAt: new Date().toISOString(),
    };

    const users = this.getUsers();
    users.unshift(newUser);
    setStored(STORAGE_KEYS.USERS, users);

    this.setCurrentUser(newUser);
    this.setCurrentBrand(newBrandId);

    return { user: newUser, brand: newBrand };
  },

  // Reset store to fresh demo state
  resetToDemo(): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(INITIAL_BRANDS));
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_BRAND, JSON.stringify(INITIAL_BRANDS[0].id));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.dispatchEvent(new Event("bazarna_store_updated"));
  },
};
