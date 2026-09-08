import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getProfile, type ClientClassification } from "@/lib/profile";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  RefreshCw,
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
  Inbox,
} from "lucide-react";
import { KycData, initialData } from "./data";
import type { DocumentAttachment } from "@/lib/onboarding-api";
import {
  getKycUpdate,
  saveKycUpdateDraft,
  submitKycUpdate,
  addKycUpdateDocument,
  removeKycUpdateDocument,
  type KycUpdateRecord,
} from "@/lib/kyc-update-api";
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
// Real, separate page for a periodic KYC refresh — reuses the same
// step field components as initial onboarding (the actual bulk of
// the complexity) but keeps its own page-level state and API calls,
// so the proven, working onboarding flow above is never touched.
// ─────────────────────────────────────────────────────────────

const classificationMeta = {
  individual: { label: "Individual", icon: User },
  corporate: { label: "Corporate Entity", icon: Building2 },
  partnership: { label: "Partnership", icon: Handshake },
  trust: { label: "Trust", icon: Landmark },
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
    { id: "details", title: "Details", icon: FileText },
    { id: "address", title: "Address & Contact", icon: Building2 },
    { id: "identification", title: "Identification", icon: Upload },
    { id: "ownership", title: "Ownership & Control", icon: Users },
    { id: "aml", title: "AML Risk", icon: AlertTriangle },
    { id: "declaration", title: "Declaration", icon: PenLine },
  ];
}

export default function KycUpdate() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [classification, setClassification] =
    useState<ClientClassification | null>(null);
  const [data, setData] = useState<KycData>(initialData);
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [noOpenRequest, setNoOpenRequest] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [status, setStatus] = useState<KycUpdateRecord["status"]>("requested");
  const [existingDocs, setExistingDocs] = useState<DocumentAttachment[]>([]);

  const steps = useMemo(() => buildSteps(classification), [classification]);
  const progress = useMemo(
    () => Math.round(((step - 1) / Math.max(1, steps.length - 1)) * 100),
    [step, steps.length],
  );

  useEffect(() => {
    if (step > steps.length) setStep(steps.length);
  }, [steps.length, step]);

  // ── Load classification + the open update request ──────────
  useEffect(() => {
    const p = getProfile();
    setClassification(p.classifications);

    getKycUpdate()
      .then((record: KycUpdateRecord) => {
        if (record.formData) setData((d) => ({ ...d, ...record.formData }));
        if (record.documents?.length) setExistingDocs(record.documents);
        if (record.status) setStatus(record.status);
        if (record.message) setRequestMessage(record.message);
      })
      .catch(() => setNoOpenRequest(true))
      .finally(() => setIsLoading(false));
  }, []);

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

  const handleDocumentUploaded = async (
    doc: Omit<DocumentAttachment, "uploadedAt">,
  ) => {
    try {
      const updated = await addKycUpdateDocument(doc);
      setExistingDocs(updated.documents ?? []);
    } catch {
      toast({ title: "Failed to attach document", variant: "destructive" });
      throw new Error("attach failed");
    }
  };

  const handleDocumentRemoved = async (url: string) => {
    try {
      const updated = await removeKycUpdateDocument(url);
      setExistingDocs(updated.documents ?? []);
    } catch {
      toast({ title: "Failed to remove document", variant: "destructive" });
    }
  };

  const saveDraftFn = async (silent = false) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await saveKycUpdateDraft({
        formData: data as unknown as Record<string, any>,
      });
      if (!silent)
        toast({
          title: "Progress saved",
          description: "You can resume anytime.",
        });
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

  const goToStep = async (targetStep: number) => {
    await saveDraftFn(true);
    setStep(targetStep);
  };

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
      await submitKycUpdate({
        formData: data as unknown as Record<string, any>,
      });
      setStatus("submitted");
      toast({
        title: "Update submitted",
        description: "Thanks — your advisor will review it shortly.",
      });
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

  // ── Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <PortalLayout title="KYC Update" subtitle="Periodic Compliance Review">
        <div className="max-w-xl mx-auto mt-20 text-center text-muted-foreground">
          Loading…
        </div>
      </PortalLayout>
    );
  }

  // ── No open request ──────────────────────────────────────
  if (noOpenRequest) {
    return (
      <PortalLayout title="KYC Update" subtitle="Periodic Compliance Review">
        <div className="max-w-xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <Inbox className="h-10 w-10 mx-auto text-muted-foreground" />
              <h2 className="text-lg font-heading font-semibold">
                No update requested right now
              </h2>
              <p className="text-sm text-muted-foreground">
                Your advisor hasn't requested a KYC review at the moment. We'll
                email you when it's time for one.
              </p>
              <Button
                className="gradient-primary text-primary-foreground"
                onClick={() => navigate("/dashboard")}
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    );
  }

  const meta = classification ? classificationMeta[classification] : null;
  const ClassIcon = meta?.icon ?? User;

  // ── Already submitted ────────────────────────────────────
  if (status === "submitted") {
    return (
      <PortalLayout title="KYC Update" subtitle="Periodic Compliance Review">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="gradient-primary p-8 text-primary-foreground text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-white/15 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h2 className="text-2xl font-heading font-bold mb-1">
                Update Submitted
              </h2>
              <p className="text-sm opacity-90">
                Thank you — your refreshed details are with your advisor for
                review.
              </p>
            </div>
            <CardContent className="p-8 space-y-5 text-center">
              <Badge
                variant="outline"
                className="bg-info/10 text-info border-info/20"
              >
                Awaiting Review
              </Badge>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Your account remains fully active in the meantime. We'll let you
                know once it's been reviewed.
              </p>
              <Button
                className="gradient-primary text-primary-foreground"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    );
  }

  const currentStepId = steps[step - 1].id;
  const isLastStep = step === steps.length;
  const submitDisabled = isSubmitting || !docsReady;

  return (
    <PortalLayout title="KYC Update" subtitle="Periodic Compliance Review">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="gradient-primary p-6 text-primary-foreground">
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw className="h-6 w-6" />
              <h2 className="text-xl font-heading font-bold">
                Periodic KYC Review
              </h2>
              {meta && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-white/15 text-primary-foreground border-0 gap-1"
                >
                  <ClassIcon className="h-3 w-3" /> {meta.label}
                </Badge>
              )}
            </div>
            {requestMessage && (
              <p className="text-sm opacity-90 max-w-2xl">{requestMessage}</p>
            )}
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
                const current = step === idx + 1;
                const done = step > idx + 1;
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
              {isSaving ? "Saving…" : "Save Progress"}
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
                {isSubmitting ? "Submitting…" : "Submit Update"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
