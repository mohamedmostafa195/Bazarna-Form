"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { BazarnaStore } from "@/lib/store";
import {
  BazarnaEvent,
  BrandProfile,
  EventPackage,
  BrandDocument,
} from "@/lib/types";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  CreditCard,
  Building2,
  Eye,
  ShieldCheck,
  ChevronRight,
  Check,
  Info,
  Clock,
  Package,
} from "lucide-react";

const STEPS = [
  { id: 1, name: "Brand Info" },
  { id: 2, name: "Contact & Legal" },
  { id: 3, name: "Documents" },
  { id: 4, name: "PR Campaign" },
  { id: 5, name: "Package" },
  { id: 6, name: "Payment" },
  { id: 7, name: "Notes & Special Requests" },
  { id: 8, name: "Terms & Conditions" },
];

export default function EventApplicationWizard() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const preselectedPkgId = searchParams.get("pkg");

  const { currentBrand, addToast, isLoggedIn } = useAuth();

  const [event, setEvent] = useState<BazarnaEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  // Application Form State
  const [brandData, setBrandData] = useState<BrandProfile>({ ...currentBrand });
  const [selectedPackageId, setSelectedPackageId] = useState<string>(preselectedPkgId || "");
  const [prParticipation, setPrParticipation] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<string>("BANK_TRANSFER");
  const [receiptFile, setReceiptFile] = useState<{ url: string; name: string } | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [tcAccepted, setTcAccepted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (slug) {
      const found = BazarnaStore.getEventBySlug(slug);
      if (found) {
        setEvent(found);
        if (preselectedPkgId && found.packages.some((p) => p.id === preselectedPkgId)) {
          setSelectedPackageId(preselectedPkgId);
        } else if (found.packages.length > 0) {
          const firstAvailable = found.packages.find((p) => p.remainingQty > 0);
          if (firstAvailable) setSelectedPackageId(firstAvailable.id);
        }
      }
      setLoading(false);
    }
  }, [slug, preselectedPkgId]);

  // Sync when currentBrand in auth context changes
  useEffect(() => {
    setBrandData({ ...currentBrand });
  }, [currentBrand]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-bazarna-red border-t-transparent animate-spin mx-auto" />
        <p className="text-sm font-semibold text-zinc-500">Loading Application Wizard...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-zinc-950">Event Not Found</h2>
        <Link href="/events" className="text-xs font-bold text-bazarna-red underline">
          Return to Events
        </Link>
      </div>
    );
  }

  const selectedPackage = event.packages.find((p) => p.id === selectedPackageId);

  // File Upload Handlers
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast("error", "File Too Large", "Maximum supported receipt size is 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptFile({
        url: reader.result as string,
        name: file.name,
      });
      addToast("success", "Receipt Uploaded", `${file.name} attached successfully.`);
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentUpload = (docType: "TAX_ID_CARD" | "NATIONAL_ID", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newDoc: BrandDocument = {
        id: `doc-${Date.now()}`,
        brandId: brandData.id,
        documentType: docType,
        fileName: file.name,
        fileUrl: reader.result as string,
        fileSize: file.size,
        status: "UPLOADED",
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existing = brandData.documents || [];
      const updated = [...existing.filter((d) => d.documentType !== docType), newDoc];
      const updatedBrand = { ...brandData, documents: updated };
      setBrandData(updatedBrand);
      BazarnaStore.saveBrand(updatedBrand);

      addToast("success", "Document Saved", `${file.name} saved to your brand profile.`);
    };
    reader.readAsDataURL(file);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          brandData.brandName.trim().length > 0 &&
          brandData.category.trim().length > 0 &&
          (brandData.aboutBrand || "").trim().length > 0 &&
          (brandData.products || "").trim().length > 0 &&
          (brandData.instagram || "").trim().length > 0 &&
          (brandData.website || "").trim().length > 0
        );
      case 2:
        return (
          brandData.contactName.trim().length > 0 &&
          brandData.contactEmail.trim().length > 0 &&
          brandData.contactPhone.trim().length > 0
        );
      case 3:
        return true; // Optional or pre-filled
      case 4:
        return true;
      case 5:
        return !!selectedPackage && selectedPackage.remainingQty > 0;
      case 6:
        return true; // Can submit as pending receipt or with receipt
      case 7:
        return true;
      case 8:
        return tcAccepted;
      default:
        return true;
    }
  };

  const handleFinalSubmit = () => {
    if (!tcAccepted) {
      addToast("error", "Accept Terms", "You must agree to the Terms & Conditions to complete registration.");
      return;
    }

    setIsSubmitting(true);

    try {
      const answersArray = Object.entries(customAnswers).map(([qId, ans]) => ({
        questionId: qId,
        answerText: ans,
      }));

      const newApp = BazarnaStore.submitApplication({
        brand: brandData,
        event: event,
        packageId: selectedPackageId,
        prParticipation: prParticipation,
        notes: notes,
        paymentMethod: paymentMethod,
        receiptFileUrl: receiptFile?.url,
        receiptFileName: receiptFile?.name,
        answers: answersArray,
        tcAccepted: true,
        tcVersion: event.tcVersion,
      });

      addToast("success", "Application Submitted", `Application ${newApp.applicationCode} submitted!`);
      router.push(`/events/${event.slug}/apply/success?appId=${newApp.id}`);
    } catch (err) {
      console.error(err);
      addToast("error", "Submission Error", "An error occurred submitting your application.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Wizard Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to {event.name.split("|")[0]}
          </Link>
          <span className="text-xs font-bold text-bazarna-red bg-red-50 border border-red-200 px-3 py-1 rounded-full">
            Step {currentStep} of {STEPS.length}
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 font-display">
            Event Registration
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Applying for: <strong className="text-zinc-900">{event.name}</strong>
          </p>
        </div>

        {/* Step Progress Stepper */}
        <div className="pt-2">
          <div className="grid grid-cols-8 gap-1">
            {STEPS.map((step) => {
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;

              return (
                <div key={step.id} className="flex flex-col gap-1.5">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isCompleted
                        ? "bg-bazarna-red"
                        : isCurrent
                        ? "bg-zinc-950"
                        : "bg-zinc-200"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-semibold truncate hidden sm:block ${
                      isCurrent ? "text-zinc-950 font-bold" : "text-zinc-400"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* STEP 1: BRAND INFORMATION */}
      {currentStep === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-md space-y-6 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-kiwi-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-bazarna-red">
              <Sparkles className="w-4 h-4 text-bazarna-red" />
              Auto-Loaded from Your Permanent Brand Profile
            </div>
            <p>
              Your saved profile data has been loaded below. Any adjustments made here will automatically update your permanent record.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">
                Brand Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={brandData.brandName}
                onChange={(e) => setBrandData({ ...brandData, brandName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">
                Category <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={brandData.category}
                onChange={(e) => setBrandData({ ...brandData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-800">
              About Brand <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={brandData.aboutBrand || ""}
              onChange={(e) => setBrandData({ ...brandData, aboutBrand: e.target.value })}
              placeholder="Describe your brand identity, aesthetics, and story..."
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-800">
              Products Being Displayed <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={brandData.products || ""}
              onChange={(e) => setBrandData({ ...brandData, products: e.target.value })}
              placeholder="e.g. Linen shirts, summer dresses, jewelry..."
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">
                Instagram Handle / URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={brandData.instagram || ""}
                onChange={(e) => setBrandData({ ...brandData, instagram: e.target.value })}
                placeholder="https://instagram.com/yourbrand"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">
                Website URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={brandData.website || ""}
                onChange={(e) => setBrandData({ ...brandData, website: e.target.value })}
                placeholder="https://yourbrand.com or social link"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: CONTACT & LEGAL */}
      {currentStep === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-md space-y-6 animate-in fade-in">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-800">
              Contact Person Name (اسم الشخص ثلاثي) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={brandData.contactName}
              onChange={(e) => setBrandData({ ...brandData, contactName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={brandData.contactEmail}
                onChange={(e) => setBrandData({ ...brandData, contactEmail: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">
                Mobile Number (رقم التليفون) <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={brandData.contactPhone}
                onChange={(e) => setBrandData({ ...brandData, contactPhone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">
                TAX ID Number (الرقم الضريبي)
              </label>
              <input
                type="text"
                value={brandData.taxId || ""}
                onChange={(e) => setBrandData({ ...brandData, taxId: e.target.value })}
                placeholder="e.g. 492-819-204"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800">
                National ID Number (رقم القومي)
              </label>
              <input
                type="text"
                value={brandData.nationalId || ""}
                onChange={(e) => setBrandData({ ...brandData, nationalId: e.target.value })}
                placeholder="14-digit Egyptian National ID"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-bazarna-red/30"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: DOCUMENTS */}
      {currentStep === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-md space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-zinc-950">Official Identification Documents</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Supported formats: JPG, PNG, PDF (Max 10MB). Saved files carry over across all Bazarna events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tax ID Card */}
            {(() => {
              const doc = brandData.documents?.find((d) => d.documentType === "TAX_ID_CARD");
              return (
                <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900">Tax ID Card (صورة البطاقة الضريبيه)</span>
                    {doc ? (
                      <span className="text-[10px] font-bold text-bazarna-red bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        Attached
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-zinc-400">Not Uploaded</span>
                    )}
                  </div>

                  {doc && (
                    <div className="p-2.5 bg-white rounded-xl border border-zinc-200 text-xs flex items-center justify-between">
                      <span className="truncate max-w-[170px] font-medium text-zinc-700">
                        {doc.fileName}
                      </span>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-bazarna-red font-bold text-[11px] hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </a>
                    </div>
                  )}

                  <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 transition">
                    <Upload className="w-3.5 h-3.5 text-zinc-500" />
                    {doc ? "Replace Document" : "Upload Tax Card"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(e) => handleDocumentUpload("TAX_ID_CARD", e)}
                      className="hidden"
                    />
                  </label>
                </div>
              );
            })()}

            {/* National ID */}
            {(() => {
              const doc = brandData.documents?.find((d) => d.documentType === "NATIONAL_ID");
              return (
                <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900">National ID (صورة البطاقة الشخصية)</span>
                    {doc ? (
                      <span className="text-[10px] font-bold text-bazarna-red bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        Attached
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-zinc-400">Not Uploaded</span>
                    )}
                  </div>

                  {doc && (
                    <div className="p-2.5 bg-white rounded-xl border border-zinc-200 text-xs flex items-center justify-between">
                      <span className="truncate max-w-[170px] font-medium text-zinc-700">
                        {doc.fileName}
                      </span>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-bazarna-red font-bold text-[11px] hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </a>
                    </div>
                  )}

                  <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 transition">
                    <Upload className="w-3.5 h-3.5 text-zinc-500" />
                    {doc ? "Replace Document" : "Upload National ID"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(e) => handleDocumentUpload("NATIONAL_ID", e)}
                      className="hidden"
                    />
                  </label>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* STEP 4: PR CAMPAIGN */}
      {currentStep === 4 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-md space-y-6 animate-in fade-in">
          <div className="space-y-2">
            <span className="text-xs font-bold text-blush-600 bg-blush-100 px-3 py-1 rounded-full uppercase">
              Influencer & Media Exposure
            </span>
            <h3 className="text-lg font-bold text-zinc-950">
              PR — Would you like your brand to be featured in our PR campaigns with pieces from your collection?
            </h3>
            <p className="text-xs text-zinc-500">هل تحب الاشتراك في الحملات الدعائية للمعرض وتوزيع هدايا على المؤثرين؟</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPrParticipation(true)}
              className={`p-5 rounded-2xl border-2 text-left transition flex items-start gap-4 ${
                prParticipation
                  ? "border-bazarna-red bg-red-50/40 shadow-soft-sm"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  prParticipation ? "bg-bazarna-red text-white" : "border border-zinc-300"
                }`}
              >
                {prParticipation && <Check className="w-4 h-4" />}
              </div>
              <div className="space-y-1">
                <span className="text-sm font-bold text-zinc-900 block">Yes please</span>
                <span className="text-xs text-zinc-600 leading-relaxed block">
                  Include our brand pieces in the official Bazarna VIP & Influencer gifting lounge.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPrParticipation(false)}
              className={`p-5 rounded-2xl border-2 text-left transition flex items-start gap-4 ${
                !prParticipation
                  ? "border-zinc-950 bg-zinc-50 shadow-soft-sm"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  !prParticipation ? "bg-zinc-950 text-white" : "border border-zinc-300"
                }`}
              >
                {!prParticipation && <Check className="w-4 h-4" />}
              </div>
              <div className="space-y-1">
                <span className="text-sm font-bold text-zinc-900 block">Maybe next time</span>
                <span className="text-xs text-zinc-600 leading-relaxed block">
                  Opt out of gifting pieces for this specific event edition.
                </span>
              </div>
            </button>
          </div>

          {prParticipation && (
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-2 animate-in fade-in">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                PR Campaign Terms & Commitment
              </div>
              <p>
                By selecting “Yes,” you confirm your participation in the PR campaign and agree to provide gifted items to the selected bloggers without any fees. Please note that approval implies full commitment to the collaboration, regardless of the blogger list provided. This decision is final and serves as confirmation of your full commitment to the campaign under these terms.
              </p>
              <p className="text-amber-800 font-arabic text-[11px]">
                بمجرد اختيارك «نعم»، فإنك تؤكد مشاركتك في حملة العلاقات العامة، وتوافق على تقديم منتجات إهداء للمدونين المختارين دون أي رسوم. يُرجى ملاحظة أن الموافقة تعني التزامًا كاملًا بالتعاون بغض النظر عن قائمة المدونين المقدّمة.
              </p>
            </div>
          )}
        </div>
      )}

      {/* STEP 5: CHOOSE YOUR PACKAGE */}
      {currentStep === 5 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-md space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-zinc-950">Select Your Exhibiting Package</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Select your space requirements. Inventory updates in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.packages.map((pkg) => {
              const isSelected = selectedPackageId === pkg.id;
              const isSoldOut = pkg.remainingQty <= 0;

              return (
                <div
                  key={pkg.id}
                  onClick={() => !isSoldOut && setSelectedPackageId(pkg.id)}
                  className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                    isSoldOut
                      ? "opacity-50 border-zinc-200 cursor-not-allowed bg-zinc-50"
                      : isSelected
                      ? "border-bazarna-red bg-red-50/40 shadow-soft-md"
                      : "border-zinc-200 hover:border-zinc-300 bg-white"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-extrabold text-zinc-950">{pkg.name}</h4>
                        <div className="text-lg font-black text-zinc-950">
                          {pkg.price.toLocaleString()}{" "}
                          <span className="text-xs font-medium text-zinc-500">EGP</span>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-bazarna-red text-white"
                            : "border border-zinc-300"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed">{pkg.description}</p>

                    <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-[11px] text-zinc-700">
                      <strong>Includes:</strong> {pkg.includedItems}
                    </div>
                  </div>

                  <div className="pt-3 mt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                    {isSoldOut ? (
                      <span className="font-bold text-rose-600">SOLD OUT</span>
                    ) : (
                      <span className="text-zinc-500 font-medium">
                        {pkg.remainingQty} spots remaining
                      </span>
                    )}
                    {isSelected && (
                      <span className="text-xs font-bold text-bazarna-red">Selected</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Booking Summary Box */}
          {selectedPackage && (
            <div className="p-4 rounded-2xl bg-zinc-950 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] text-zinc-400 block uppercase">Selected Package</span>
                <span className="text-sm font-bold text-white">{selectedPackage.name}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-zinc-400 block uppercase">Total Due</span>
                <span className="text-xl font-black text-butter-300">
                  {selectedPackage.price.toLocaleString()} EGP
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 6: PAYMENT */}
      {currentStep === 6 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-md space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-zinc-950">Payment Method & Transfer Details</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Booking is not confirmed until full payment transfer is uploaded and verified by Bazarna finance.
            </p>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPaymentMethod("BANK_TRANSFER")}
              className={`p-4 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                paymentMethod === "BANK_TRANSFER"
                  ? "border-bazarna-red bg-red-50/40"
                  : "border-zinc-200"
              }`}
            >
              <Building2 className="w-5 h-5 text-bazarna-red" />
              <div>
                <span className="text-xs font-bold text-zinc-900 block">Bank Transfer (CIB)</span>
                <span className="text-[11px] text-zinc-500">Corporate Account</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("INSTAPAY")}
              className={`p-4 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                paymentMethod === "INSTAPAY"
                  ? "border-bazarna-red bg-red-50/40"
                  : "border-zinc-200"
              }`}
            >
              <CreditCard className="w-5 h-5 text-butter-600" />
              <div>
                <span className="text-xs font-bold text-zinc-900 block">Instapay</span>
                <span className="text-[11px] text-zinc-500">Instant Transfer</span>
              </div>
            </button>
          </div>

          {/* Bank Account Info Card */}
          <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
            <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider block">
              Official Bazarna Account Details:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-zinc-500 block">Bank:</span>
                <strong className="text-zinc-900">{event.bankName}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block">Account Name:</span>
                <strong className="text-zinc-900">{event.accountName}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block">Account Number:</span>
                <strong className="font-mono text-zinc-900 text-sm">{event.accountNumber}</strong>
              </div>
              {event.instapayHandle && (
                <div>
                  <span className="text-zinc-500 block">Instapay Handle:</span>
                  <strong className="font-mono text-bazarna-red text-sm">{event.instapayHandle}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Upload Receipt */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-800">
                Upload Full Payment Receipt (صورة إيصال التحويل)
              </label>
              <span className="text-[11px] text-zinc-400">JPG, PNG, PDF (Max 10MB)</span>
            </div>

            {receiptFile ? (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-bazarna-red" />
                  <span className="text-xs font-bold text-zinc-900 truncate max-w-[240px]">
                    {receiptFile.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={receiptFile.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-bazarna-red hover:underline"
                  >
                    View Receipt
                  </a>
                  <button
                    type="button"
                    onClick={() => setReceiptFile(null)}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer border-2 border-dashed border-zinc-300 hover:border-bazarna-red/60 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 text-center transition bg-zinc-50/50 hover:bg-white">
                <Upload className="w-6 h-6 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-800">
                  Click to choose or drag and drop your payment receipt
                </span>
                <span className="text-[11px] text-zinc-500">
                  You can also upload your receipt later from your Brand Dashboard.
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      )}

      {/* STEP 7: NOTES & SPECIAL REQUESTS */}
      {currentStep === 7 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-md space-y-4 animate-in fade-in">
          <h3 className="text-base font-bold text-zinc-950 font-display">
            Notes & Special Requests
          </h3>

          <div className="space-y-2">
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special requests such as electricity requirements, neighbor booth preference,.. etc )"
              className="w-full px-4 py-3.5 rounded-2xl border border-zinc-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 transition text-zinc-900 shadow-soft-xs"
            />
            <p className="text-xs text-zinc-600">
              All special requests are subject to availability or extra fees
            </p>
          </div>
        </div>
      )}

      {/* STEP 8: TERMS & CONDITIONS */}
      {currentStep === 8 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-soft-md space-y-6 animate-in fade-in">
          <div>
            <span className="text-xs font-bold text-bazarna-red bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase">
              Final Step | Read & Accept
            </span>
            <h3 className="text-lg font-bold text-zinc-950 mt-2">
              Event Terms & Conditions (Version {event.tcVersion})
            </h3>
            <p className="text-xs text-zinc-500">
              Please review the operational and safety regulations for {event.name}.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto pr-2">
            {event.termsAndConditions}
          </div>

          <label className="flex items-start gap-3 p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 cursor-pointer hover:bg-zinc-100/50 transition">
            <input
              type="checkbox"
              checked={tcAccepted}
              onChange={(e) => setTcAccepted(e.target.checked)}
              className="w-5 h-5 rounded text-bazarna-red focus:ring-bazarna-red/30 mt-0.5"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-zinc-900 block">
                I have read, understood, and agree to the Terms & Conditions.
              </span>
              <span className="text-[11px] text-zinc-500 block">
                Your acceptance, user ID, event, version, and submission timestamp will be logged.
              </span>
            </div>
          </label>
        </div>
      )}

      {/* Wizard Footer Navigation Controls */}
      <div className="flex items-center justify-between pt-4">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => prev - 1)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 shadow-soft-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
        ) : (
          <div />
        )}

        {currentStep < STEPS.length ? (
          <button
            type="button"
            onClick={() => {
              if (canProceed()) {
                setCurrentStep((prev) => prev + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                addToast(
                  "error",
                  "All Fields Required",
                  "Please fill in all required inputs before proceeding to the next step."
                );
              }
            }}
            disabled={!canProceed()}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-soft-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next Step
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={!tcAccepted || isSubmitting}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-bazarna-red hover:bg-bazarna-darkred text-white font-black text-sm shadow-bazarna-glow transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-butter-200" />
            {isSubmitting ? "Submitting..." : "Complete Booking"}
          </button>
        )}
      </div>
    </div>
  );
}
