export type UserRole = "SUPER_ADMIN" | "ADMIN" | "OPERATIONS" | "FINANCE" | "BRAND";

export interface UserAccount {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  brandId?: string;
  avatarUrl?: string;
  createdAt: string;
}

export type EventStatus =
  | "DRAFT"
  | "UPCOMING"
  | "REGISTRATION_OPEN"
  | "REGISTRATION_CLOSED"
  | "COMPLETED"
  | "CANCELLED";

export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CHANGES_REQUESTED";

export type PaymentStatus =
  | "PENDING"
  | "RECEIPT_UPLOADED"
  | "UNDER_REVIEW"
  | "PAID"
  | "REJECTED";

export type DocumentStatus = "UPLOADED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

export type QuestionType = "NUMBER" | "YES_NO" | "TEXT" | "FILE";

export interface BrandDocument {
  id: string;
  brandId: string;
  documentType: "TAX_ID_CARD" | "NATIONAL_ID" | "COMMERCIAL_REG" | string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  status: DocumentStatus;
  uploadedAt: string;
  updatedAt: string;
}

export interface BrandProfile {
  id: string;
  userId: string;
  brandName: string;
  category: string;
  logoUrl?: string;
  aboutBrand?: string;
  products?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  website?: string;
  otherSocial?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  taxId?: string;
  nationalId?: string;
  documents?: BrandDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface EventPackage {
  id: string;
  eventId: string;
  name: string;
  price: number;
  description: string;
  includedItems: string;
  image?: string;
  totalQty: number;
  remainingQty: number;
  isActive: boolean;
}

export interface EventQuestion {
  id: string;
  eventId: string;
  questionText: string;
  questionType: QuestionType;
  isRequired: boolean;
  orderIndex: number;
}

export interface BazarnaEvent {
  id: string;
  name: string;
  slug: string;
  description: string;
  highlights?: string[] | string;
  coverImage: string;
  location: string;
  googleMapsUrl?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  regOpenDate: string;
  regCloseDate: string;
  status: EventStatus;
  capacity: number;
  termsAndConditions: string;
  tcVersion: string;
  paymentInstructions?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  instapayHandle?: string;
  packages: EventPackage[];
  questions: EventQuestion[];
}

export interface ApplicationAnswer {
  id: string;
  applicationId: string;
  questionId: string;
  answerText: string;
  question?: EventQuestion;
}

export interface PaymentRecord {
  id: string;
  applicationId: string;
  amount: number;
  currency: string;
  method: string;
  receiptFileUrl?: string;
  receiptFileName?: string;
  paymentStatus: PaymentStatus;
  adminNote?: string;
  uploadedAt?: string;
  verifiedAt?: string;
}

export interface EventApplication {
  id: string;
  applicationCode: string; // e.g. BY-2026-000123
  brandId: string;
  brand: BrandProfile;
  eventId: string;
  event?: BazarnaEvent;
  packageId: string;
  package?: EventPackage;
  prParticipation: boolean;
  notes?: string;
  assignedBooth?: string;
  adminFeedback?: string;
  appStatus: ApplicationStatus;
  paymentStatus: PaymentStatus;
  tcAccepted: boolean;
  tcAcceptedAt: string;
  tcVersion: string;
  payment?: PaymentRecord;
  answers: ApplicationAnswer[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId?: string;
  adminName: string;
  action: string;
  targetType: "APPLICATION" | "EVENT" | "PAYMENT" | "BRAND";
  targetId: string;
  details?: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}
