import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";
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
  type OnboardingRecord,
} from "./onboardingApi";
import {
  DetailsStep,
  EmploymentStep,
  WealthStep,
  IdentificationStep,
  OwnershipStep,
  AmlStep,
  DeclarationStep,
} from "./steps";

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

  // ── Derive steps from classification ─────────────────────
  const steps = useMemo(() => buildSteps(classification), [classification]);

  // ── Clamp step if steps shrink ────────────────────────────
  useEffect(() => {
    if (step > steps.length) setStep(steps.length);
  }, [steps.length, step]);

  const progress = useMemo(
    () => Math.round(((step - 1) / Math.max(1, steps.length - 1)) * 100),
    [step, steps.length],
  );

  // ── Section completion map ────────────────────────────────
  const [sectionCompletion, setSectionCompletion] = useState<
    Record<string, boolean>
  >({});

  const markSectionDone = useCallback((stepId: string) => {
    setSectionCompletion((prev) => ({ ...prev, [stepId]: true }));
  }, []);

  // ── Load classification + draft on mount ──────────────────
  useEffect(() => {
    const p = getProfile();
    setClassification(p.classifications);

    getOnboarding()
      .then((record: OnboardingRecord) => {
        if (record.formData && Object.keys(record.formData).length > 0) {
          // Merge saved fields onto initialData to pre-populate form
          setData((d) => ({ ...d, ...record.formData }));
        }
        if (record.sectionCompletion) {
          setSectionCompletion(record.sectionCompletion);
        }
      })
      .catch(() => {
        // Network error or not logged in — form still works with initialData
      })
      .finally(() => setIsLoadingDraft(false));
  }, []);

  // ── Field update helpers (same as original) ───────────────
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
      if (!silent) {
        toast({ title: "Draft saved", description: "You can resume anytime." });
      }
    } catch {
      if (!silent) {
        toast({
          title: "Save failed",
          description: "Check your connection and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // ── Navigate steps — auto-save on step change ─────────────
  const goToStep = async (targetStep: number) => {
    markSectionDone(steps[step - 1].id);
    await saveDraftFn(true); // silent save — no toast on every step
    setStep(targetStep);
  };

  const handleBack = () => goToStep(Math.max(1, step - 1));

  const handleNext = () => goToStep(Math.min(steps.length, step + 1));

  // ── Final submit ──────────────────────────────────────────
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
      const message =
        err?.response?.data?.message || "Submission failed. Please try again.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────
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
  const currentStepId = steps[step - 1].id;

  return (
    <PortalLayout
      title="Client Onboarding"
      subtitle="KYC / AML Compliance Form"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header / progress card */}
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
              <DeclarationStep
                classification={classification}
                data={data}
                update={update}
              />
            )}
          </CardContent>
        </Card>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky bottom-0 bg-background/80 backdrop-blur py-3">
          <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
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
            {step < steps.length ? (
              <Button
                className="gradient-primary text-primary-foreground"
                onClick={handleNext}
                disabled={isSaving}
              >
                Save & Continue <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                className="gradient-primary text-primary-foreground"
                onClick={handleSubmit}
                disabled={isSubmitting}
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
