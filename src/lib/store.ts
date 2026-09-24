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

// Background sync with MongoDB Atlas
async function syncWithServer(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    // 1. Sync events from MongoDB
    const eventsRes = await fetch("/api/events", { cache: "no-store" });
    if (eventsRes.ok) {
      const data = await eventsRes.json();
      if (data.success && Array.isArray(data.events) && data.events.length > 0) {
        setStored(STORAGE_KEYS.EVENTS, data.events);
      }
    }

    // 2. Sync applications from MongoDB
    const appsRes = await fetch("/api/applications", { cache: "no-store" });
    if (appsRes.ok) {
      const data = await appsRes.json();
      if (data.success && Array.isArray(data.applications)) {
        setStored(STORAGE_KEYS.APPLICATIONS, data.applications);
      }
    }

    // 3. Sync brands from MongoDB
    const brandsRes = await fetch("/api/brands", { cache: "no-store" });
    if (brandsRes.ok) {
      const data = await brandsRes.json();
      if (data.success && Array.isArray(data.brands)) {
        setStored(STORAGE_KEYS.BRANDS, data.brands);
      }
    }

    // 4. Sync audit logs from MongoDB
    const logsRes = await fetch("/api/audit-logs", { cache: "no-store" });
    if (logsRes.ok) {
      const data = await logsRes.json();
      if (data.success && Array.isArray(data.logs) && data.logs.length > 0) {
        setStored(STORAGE_KEYS.AUDIT_LOGS, data.logs);
      }
    }
  } catch (err) {
    console.warn("MongoDB sync: using local cache", err);
  }
}

// Auto-run sync on client load
if (typeof window !== "undefined") {
  setTimeout(() => {
    syncWithServer();
  }, 100);
}

export const BazarnaStore = {
  // Manual sync trigger
  async syncWithServer(): Promise<void> {
    await syncWithServer();
  },

  // --- EVENTS ---
  getEvents(): BazarnaEvent[] {
    const rawEvents = getStored<BazarnaEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    let modified = false;
    const events = rawEvents.map((evt) => {
      let evtModified = false;
      let newSlug = evt.slug;

      // Auto-sanitize corrupted slugs
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
        (eSlug.length > 5 && decodedSlug.includes(eSlug.slice(0, 10)))
      );
    });
  },

  getEventById(id: string): BazarnaEvent | undefined {
    return this.getEvents().find((e) => e.id === id);
  },

  saveEvent(event: BazarnaEvent): void {
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

    // Persist to MongoDB Atlas
    if (typeof window !== "undefined") {
      const isExisting = event.id && event.id.length === 24;
      const url = isExisting ? `/api/events/${event.id}` : "/api/events";
      const method = isExisting ? "PUT" : "POST";
      fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      }).catch((err) => console.error("Error saving event to MongoDB:", err));
    }
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

    // Delete in MongoDB Atlas
    if (typeof window !== "undefined" && id.length === 24) {
      fetch(`/api/events/${id}`, { method: "DELETE" }).catch((err) =>
        console.error("Error deleting event in MongoDB:", err)
      );
    }

    return true;
  },

  duplicateEvent(eventId: string, newName?: string): BazarnaEvent | null {
    const original = this.getEventById(eventId);
    if (!original) return null;

    const baseName = newName || `${original.name} (Copy)`;
    const newSlug =
      baseName
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

      if (typeof window !== "undefined" && eventId.length === 24) {
        fetch(`/api/events/${eventId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }).catch((err) => console.error("Error updating event status in MongoDB:", err));
      }
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
    const index = brands.findIndex((b) => b.id === brand.id || (b.brandName && brand.brandName && b.brandName.toLowerCase() === brand.brandName.toLowerCase()));
    if (index >= 0) {
      const existingBrandDocs = brands[index].documents || [];
      const incomingBrandDocs = brand.documents || [];
      const docTypes = new Set([...existingBrandDocs.map((d) => d.documentType), ...incomingBrandDocs.map((d) => d.documentType)]);
      const mergedBrandDocs = Array.from(docTypes).map((type) => {
        return incomingBrandDocs.find((d) => d.documentType === type) || existingBrandDocs.find((d) => d.documentType === type)!;
      });

      brands[index] = {
        ...brands[index],
        ...brand,
        documents: mergedBrandDocs,
        updatedAt: new Date().toISOString(),
      };
    } else {
      brands.push({ ...brand, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setStored(STORAGE_KEYS.BRANDS, brands);

    // Also update any existing applications for this brand so their documents & legal details stay in sync
    const apps = this.getApplications();
    let appsModified = false;
    const updatedApps = apps.map((app) => {
      const isMatch =
        app.brandId === brand.id ||
        (app.brand?.id && brand.id && app.brand.id === brand.id) ||
        (app.brand?.brandName && brand.brandName && app.brand.brandName.toLowerCase() === brand.brandName.toLowerCase()) ||
        (app.brand?.contactEmail && brand.contactEmail && app.brand.contactEmail.toLowerCase() === brand.contactEmail.toLowerCase());

      if (isMatch) {
        appsModified = true;
        const existingDocs = app.brand?.documents || [];
        const incomingDocs = brand.documents || [];
        const docTypes = new Set([...existingDocs.map((d) => d.documentType), ...incomingDocs.map((d) => d.documentType)]);
        const mergedDocs = Array.from(docTypes).map((type) => {
          return incomingDocs.find((d) => d.documentType === type) || existingDocs.find((d) => d.documentType === type)!;
        });

        return {
          ...app,
          brand: {
            ...app.brand,
            ...brand,
            taxId: brand.taxId || app.brand?.taxId,
            nationalId: brand.nationalId || app.brand?.nationalId,
            documents: mergedDocs,
          },
        };
      }
      return app;
    });

    if (appsModified) {
      setStored(STORAGE_KEYS.APPLICATIONS, updatedApps);
    }

    // Persist to MongoDB Atlas
    if (typeof window !== "undefined" && brand.id && brand.id.length === 24) {
      fetch(`/api/brands/${brand.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brand),
      }).catch((err) => console.error("Error saving brand to MongoDB:", err));
    }
  },

  // --- APPLICATIONS ---
  getApplications(): EventApplication[] {
    return getStored<EventApplication[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  },

  getApplicationById(id: string): EventApplication | undefined {
    const app = this.getApplications().find((a) => a.id === id || a.applicationCode === id);
    if (!app) return undefined;

    // Enrich with latest brand profile details and documents if available
    const brand =
      this.getBrandById(app.brandId) ||
      this.getBrands().find(
        (b) =>
          (b.brandName && app.brand?.brandName && b.brandName.toLowerCase() === app.brand.brandName.toLowerCase()) ||
          (b.contactEmail && app.brand?.contactEmail && b.contactEmail.toLowerCase() === app.brand.contactEmail.toLowerCase())
      );

    if (brand) {
      const existingDocs = app.brand?.documents || [];
      const brandDocs = brand.documents || [];
      const docTypes = new Set([...existingDocs.map((d) => d.documentType), ...brandDocs.map((d) => d.documentType)]);
      const mergedDocs = Array.from(docTypes).map((type) => {
        return brandDocs.find((d) => d.documentType === type) || existingDocs.find((d) => d.documentType === type)!;
      });

      return {
        ...app,
        brand: {
          ...brand,
          ...app.brand,
          taxId: app.brand?.taxId || brand.taxId,
          nationalId: app.brand?.nationalId || brand.nationalId,
          documents: mergedDocs,
        },
      };
    }

    return app;
  },

  getApplicationsByBrand(brandId: string): EventApplication[] {
    const brand = this.getBrandById(brandId);
    return this.getApplications().filter((a) => {
      if (a.brandId === brandId) return true;
      if (brand && a.brand?.brandName && brand.brandName && a.brand.brandName.toLowerCase() === brand.brandName.toLowerCase()) return true;
      if (brand && a.brand?.contactEmail && brand.contactEmail && a.brand.contactEmail.toLowerCase() === brand.contactEmail.toLowerCase()) return true;
      return false;
    });
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

    const seq = (applications.length + 124).toString().padStart(6, "0");
    const appCode = `BY-2026-${seq}`;

    // Decrement package quantity
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

    this.saveBrand(data.brand);

    this.addAuditLog(
      data.brand.contactName || data.brand.brandName,
      `Submitted Application ${appCode} for ${data.event.name}`,
      "APPLICATION",
      newApp.id,
      `Package: ${selectedPackage?.name} (${selectedPackage?.price} EGP)`
    );

    // Asynchronously push to MongoDB Atlas
    if (typeof window !== "undefined") {
      fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: data.brand.id,
          brand: data.brand,
          eventId: data.event.id,
          packageId: data.packageId,
          prParticipation: data.prParticipation,
          notes: data.notes,
          paymentMethod: data.paymentMethod,
          receiptFileUrl: data.receiptFileUrl,
          receiptFileName: data.receiptFileName,
          answers: data.answers,
          tcAccepted: data.tcAccepted,
          tcVersion: data.tcVersion,
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.success && result.application) {
            // Update local ID with MongoDB ObjectId
            const apps = getStored<EventApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
            const idx = apps.findIndex((a) => a.applicationCode === appCode);
            if (idx >= 0) {
              apps[idx].id = result.application.id;
              setStored(STORAGE_KEYS.APPLICATIONS, apps);
            }
          }
        })
        .catch((err) => console.error("Error pushing application to MongoDB:", err));
    }

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

      // Persist to MongoDB Atlas
      if (typeof window !== "undefined") {
        fetch(`/api/applications/${appId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appStatus: status,
            adminName,
            adminNote: reason,
          }),
        }).catch((err) => console.error("Error updating application in MongoDB:", err));
      }
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

      // Persist to MongoDB Atlas
      if (typeof window !== "undefined") {
        fetch(`/api/applications/${appId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentStatus: status,
            adminName,
            adminNote,
          }),
        }).catch((err) => console.error("Error updating payment in MongoDB:", err));
      }
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

      // Persist to MongoDB Atlas
      if (typeof window !== "undefined") {
        fetch(`/api/applications/${appId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assignedBooth: boothName,
            adminName,
          }),
        }).catch((err) => console.error("Error assigning booth in MongoDB:", err));
      }
    }
  },

  deleteApplication(appId: string, adminName: string = "Ahmed Operations"): boolean {
    const apps = this.getApplications();
    const app = apps.find((a) => a.id === appId || a.applicationCode === appId);
    if (!app) return false;

    const filtered = apps.filter((a) => a.id !== app.id && a.applicationCode !== app.applicationCode);
    setStored(STORAGE_KEYS.APPLICATIONS, filtered);

    this.addAuditLog(
      adminName,
      `Permanently deleted application ${app.applicationCode}`,
      "APPLICATION",
      app.id,
      `Application for ${app.brand.brandName} was deleted.`
    );

    // Delete in MongoDB Atlas
    if (typeof window !== "undefined") {
      fetch(`/api/applications/${app.id}`, { method: "DELETE" }).catch((err) =>
        console.error("Error deleting application in MongoDB:", err)
      );
    }

    return true;
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

    // Persist to MongoDB Atlas
    if (typeof window !== "undefined") {
      fetch("/api/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminName, action, targetType, targetId, details }),
      }).catch((err) => console.error("Error creating audit log in MongoDB:", err));
    }
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
