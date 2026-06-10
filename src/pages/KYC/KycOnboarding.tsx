import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  getProfile,
  setProfile,
  type ClientClassification,
} from "@/lib/profile";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  ShieldCheck,
  User,
  Building2,
  FileText,
  Upload,
  AlertTriangle,
  PenLine,
  Users,
  Handshake,
  Landmark,
  CheckCircle2,
} from "lucide-react";
import { KycData, initialData } from "./data";
import {
  getOnboarding,
  saveDraft,
  submitOnboarding,
  addDocument,
  removeDocument,
  type OnboardingRecord,
  type DocumentAttachment,
} from "./onboardingApi";
import {
  DetailsStep,
  EmploymentStep,
  WealthStep,
  IdentificationStep,
  OwnershipStep,
  AmlStep,
  DeclarationStep,
  allRequiredDocsUploaded,
} from "./steps";

// ─────────────────────────────────────────────────────────────

const classificationMeta = {
  individual: {
    label: "Individual",
    icon: User,
    sectionTitle: "Personal Details",
    addressTitle: "Residential Address",
  },
  corporate: {
    label: "Corporate Entity",
    icon: Building2,
    sectionTitle: "Entity Details",
    addressTitle: "Registered Address",
  },
  partnership: {
    label: "Partnership",
    icon: Handshake,
    sectionTitle: "Partnership Details",
    addressTitle: "Principal Place of Business",
  },
  trust: {
    label: "Trust",
    icon: Landmark,
    sectionTitle: "Trust Details",
    addressTitle: "Trust Administrative Address",
  },
};

function buildSteps(classification: ClientClassification | null) {
  if (classification === "individual") {
    return [
      { id: "details", title: "Personal Details", icon: User },
      { id: "employment", title: "Employment Details", icon: Building2 },
      { id: "wealth", title: "Source of Wealth", icon: FileText },
      { id: "identification", title: "Identification", icon: Upload },
      { id: "declaration", title: "Declaration", icon: PenLine },
    ];
  }
  if (classification === "corporate") {
    return [
      { id: "details", title: "Entity Details", icon: Building2 },
      { id: "ownership", title: "Ownership & Control", icon: Users },
      { id: "aml", title: "AML Risk", icon: AlertTriangle },
      { id: "identification", title: "Identification", icon: Upload },
      { id: "declaration", title: "Declaration", icon: PenLine },
    ];
  }
  return [
    {
      id: "details",
      title: classification
        ? classificationMeta[classification].sectionTitle
        : "Details",
      icon: FileText,
    },
    { id: "address", title: "Address & Contact", icon: Building2 },
    { id: "identification", title: "Identification", icon: Upload },
    { id: "ownership", title: "Ownership & Control", icon: Users },
    { id: "aml", title: "AML Risk", icon: AlertTriangle },
    { id: "declaration", title: "Declaration", icon: PenLine },
  ];
}

// ─────────────────────────────────────────────────────────────

export default function KycOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [data, setData] = useState<KycData>(initialData);
  const [classification, setClassification] =
    useState<ClientClassification | null>(null);
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const [sectionCompletion, setSectionCompletion] = useState<
    Record<string, boolean>
  >({});
  const [submissionStatus, setSubmissionStatus] = useState<
    OnboardingRecord["status"]
  >("draft");
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  // ── Documents state — loaded from draft, updated on every upload/remove ──
  const [existingDocs, setExistingDocs] = useState<DocumentAttachment[]>([]);

  const steps = useMemo(() => buildSteps(classification), [classification]);
  const progress = useMemo(
    () => Math.round(((step - 1) / Math.max(1, steps.length - 1)) * 100),
    [step, steps.length],
  );

  useEffect(() => {
    if (step > steps.length) setStep(steps.length);
  }, [steps.length, step]);

  const markSectionDone = useCallback((stepId: string) => {
    setSectionCompletion((prev) => ({ ...prev, [stepId]: true }));
  }, []);

  // ── Load classification + draft ───────────────────────────
  useEffect(() => {
    const p = getProfile();
    setClassification(p.classifications);

    getOnboarding()
      .then((record: OnboardingRecord) => {
        if (record.formData && Object.keys(record.formData).length > 0) {
          setData((d) => ({ ...d, ...record.formData }));
        }
        if (record.sectionCompletion) {
          setSectionCompletion(record.sectionCompletion);
        }
        if (record.documents?.length) {
          setExistingDocs(record.documents); // ← restore uploaded docs on resume
        }
        if (record.status) setSubmissionStatus(record.status);
        if (record.submittedAt) setSubmittedAt(record.submittedAt);
      })
      .catch(() => {})
      .finally(() => setIsLoadingDraft(false));
  }, []);

  // ── Field helpers ─────────────────────────────────────────
  const update = <K extends keyof KycData>(key: K, value: KycData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const toggleArray = (
    key:
      | "sourceOfFunds"
      | "highRiskIndicators"
      | "transactionData"
      | "primarySourceOfFunds",
    value: string,
  ) => {
    setData((d) => {
      const arr = (d[key] as string[]) || [];
      return {
        ...d,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  // ── Document handlers ─────────────────────────────────────
  // Called by FileField after uploading — attaches URL to the onboarding record
  const handleDocumentUploaded = async (
    doc: Omit<DocumentAttachment, "uploadedAt">,
  ) => {
    try {
      const updated = await addDocument(doc);
      setExistingDocs(updated.documents ?? []);
    } catch {
      toast({ title: "Failed to attach document", variant: "destructive" });
      throw new Error("attach failed"); // re-throw so FileField shows error state
    }
  };

  const handleDocumentRemoved = async (url: string) => {
    try {
      const updated = await removeDocument(url);
      setExistingDocs(updated.documents ?? []);
    } catch {
      toast({ title: "Failed to remove document", variant: "destructive" });
    }
  };

  // ── Save draft ────────────────────────────────────────────
  const saveDraftFn = async (silent = false) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await saveDraft({
        formData: data as unknown as Record<string, any>,
        sectionCompletion,
        completionPercent: progress,
      });
      if (!silent)
        toast({ title: "Draft saved", description: "You can resume anytime." });
    } catch {
      if (!silent)
        toast({
          title: "Save failed",
          description: "Check your connection and try again.",
          variant: "destructive",
        });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Step navigation ───────────────────────────────────────
  const goToStep = async (targetStep: number) => {
    markSectionDone(steps[step - 1].id);
    await saveDraftFn(true);
    setStep(targetStep);
  };

  // ── Submit validation ─────────────────────────────────────
  // Check required docs before allowing submit
  const docsReady = classification
    ? allRequiredDocsUploaded(classification, existingDocs)
    : false;

  const handleSubmit = async () => {
    if (
      !data.agreeTrue ||
      !data.agreeUpdate ||
      !data.agreeConsent ||
      !data.signature
    ) {
      toast({
        title: "Missing acknowledgements",
        description: "Please complete all declarations before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Block submit if required documents are missing
    if (!docsReady) {
      toast({
        title: "Documents required",
        description:
          "Please upload all required documents in the Identification step before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitOnboarding({
        formData: data as unknown as Record<string, any>,
        agreeTrue: data.agreeTrue,
        agreeUpdate: data.agreeUpdate,
        agreeConsent: data.agreeConsent,
        signature: data.signature,
        signatoryTitle: data.signatoryTitle,
      });

      setProfile({ isOnboarded: true, kycStatus: "submitted" });

      toast({
        title: "Onboarding submitted!",
        description: "Welcome aboard. Redirecting to your dashboard.",
      });

      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          "Submission failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading / no classification ───────────────────────────
  if (isLoadingDraft) {
    return (
      <PortalLayout
        title="Client Onboarding"
        subtitle="KYC / AML Compliance Form"
      >
        <div className="max-w-xl mx-auto mt-20 text-center text-muted-foreground">
          Loading your form…
        </div>
      </PortalLayout>
    );
  }

  if (!classification) {
    return (
      <PortalLayout
        title="Client Onboarding"
        subtitle="KYC / AML Compliance Form"
      >
        <div className="max-w-xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <ShieldCheck className="h-10 w-10 mx-auto text-primary" />
              <h2 className="text-lg font-heading font-semibold">
                We can't determine your client type
              </h2>
              <p className="text-sm text-muted-foreground">
                Please sign in again so we can load the correct onboarding form.
              </p>
              <Button
                className="gradient-primary text-primary-foreground"
                onClick={() => navigate("/")}
              >
                Back to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    );
  }

  const meta = classificationMeta[classification];
  const ClassIcon = meta.icon;

  // ── Already submitted — show closed/completed view ────────
  if (submissionStatus && submissionStatus !== "draft") {
    const statusLabel: Record<string, string> = {
      submitted: "Submitted",
      under_review: "Under Review",
      approved: "Approved",
      rejected: "Needs Attention",
    };
    const statusTone: Record<string, string> = {
      submitted: "bg-info/10 text-info border-info/20",
      under_review: "bg-warning/10 text-warning border-warning/20",
      approved: "bg-success/10 text-success border-success/20",
      rejected: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return (
      <PortalLayout
        title="Client Onboarding"
        subtitle="KYC / AML Compliance Form"
      >
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="gradient-primary p-8 text-primary-foreground text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-white/15 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h2 className="text-2xl font-heading font-bold mb-1">
                Onboarding Completed
              </h2>
              <p className="text-sm opacity-90">
                Thank you — your KYC / AML form has been submitted.
              </p>
            </div>
            <CardContent className="p-8 space-y-5 text-center">
              <Badge
                variant="outline"
                className={statusTone[submissionStatus] ?? ""}
              >
                {statusLabel[submissionStatus] ?? submissionStatus}
              </Badge>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Client type:{" "}
                  <span className="font-medium text-foreground">
                    {meta.label}
                  </span>
                </p>
                {submittedAt && (
                  <p>
                    Submitted on{" "}
                    <span className="font-medium text-foreground">
                      {new Date(submittedAt).toLocaleString()}
                    </span>
                  </p>
                )}
              </div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Your submission is now closed. Our compliance team will be in
                touch if anything else is required. You can monitor progress and
                notifications from your dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <Button
                  className="gradient-primary text-primary-foreground"
                  onClick={() => navigate("/dashboard")}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/notifications")}
                >
                  View Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    );
  }

  const currentStepId = steps[step - 1].id;
  const isLastStep = step === steps.length;

  // On last step: disable submit if docs not ready
  const submitDisabled = isSubmitting || !docsReady;

  return (
    <PortalLayout
      title="Client Onboarding"
      subtitle="KYC / AML Compliance Form"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress card */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="gradient-primary p-6 text-primary-foreground">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-6 w-6" />
              <h2 className="text-xl font-heading font-bold">
                KYC / AML Onboarding
              </h2>
              <Badge
                variant="secondary"
                className="ml-2 bg-white/15 text-primary-foreground border-0 gap-1"
              >
                <ClassIcon className="h-3 w-3" /> {meta.label}
              </Badge>
            </div>
            <p className="text-sm opacity-90 max-w-2xl">
              Tailored for {meta.label.toLowerCase()} clients. Your progress is
              saved automatically. Estimated time: 5–7 minutes.
            </p>
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">
                Step {step} of {steps.length} · {steps[step - 1].title}
              </p>
              <span className="text-sm font-heading font-bold text-primary">
                {progress}%
              </span>
            </div>
            <Progress value={progress} className="h-2 mb-5" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                const done = sectionCompletion[s.id] || step > idx + 1;
                const current = step === idx + 1;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStep(idx + 1)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-all ${
                      current
                        ? "border-primary bg-primary/5"
                        : done
                          ? "border-success/30 bg-success/5"
                          : "border-border hover:border-primary/40"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Icon
                        className={`h-4 w-4 ${current ? "text-primary" : "text-muted-foreground"}`}
                      />
                    )}
                    <span className="text-[10px] font-medium leading-tight">
                      {s.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Form body */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-heading">
              {steps[step - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {currentStepId === "details" && (
              <DetailsStep
                classification={classification}
                data={data}
                update={update}
              />
            )}
            {currentStepId === "employment" && (
              <EmploymentStep data={data} update={update} />
            )}
            {currentStepId === "wealth" && (
              <WealthStep
                data={data}
                update={update}
                toggleArray={toggleArray}
              />
            )}
            {currentStepId === "address" && (
              <DetailsStep
                classification={classification}
                data={data}
                update={update}
              />
            )}
            {currentStepId === "identification" && (
              <IdentificationStep
                classification={classification}
                data={data}
                update={update}
                onUpload={handleDocumentUploaded}
                onRemoveDoc={handleDocumentRemoved}
                existingDocs={existingDocs}
              />
            )}
            {currentStepId === "ownership" && (
              <OwnershipStep
                classification={classification}
                data={data}
                update={update}
              />
            )}
            {currentStepId === "aml" && (
              <AmlStep data={data} update={update} toggleArray={toggleArray} />
            )}
            {currentStepId === "declaration" && (
              <div className="space-y-4">
                <DeclarationStep
                  classification={classification}
                  data={data}
                  update={update}
                />
                {/* Warn if documents are still missing when on declaration step */}
                {!docsReady && (
                  <div className="rounded-lg border border-warning/40 bg-warning/5 p-3 text-sm text-warning flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      Required documents are missing. Go back to the{" "}
                      <strong>Identification</strong> step and upload all
                      required files before submitting.
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky bottom-0 bg-background/80 backdrop-blur py-3">
          <Button
            variant="ghost"
            onClick={() => goToStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => saveDraftFn(false)}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? "Saving…" : "Save Draft"}
            </Button>
            {!isLastStep ? (
              <Button
                className="gradient-primary text-primary-foreground"
                onClick={() => goToStep(Math.min(steps.length, step + 1))}
                disabled={isSaving}
              >
                Save & Continue <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                className="gradient-primary text-primary-foreground"
                onClick={handleSubmit}
                disabled={submitDisabled}
                title={
                  !docsReady
                    ? "Upload all required documents before submitting"
                    : undefined
                }
              >
                {isSubmitting ? "Submitting…" : "Submit Onboarding"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
