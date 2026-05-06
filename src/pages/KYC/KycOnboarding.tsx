import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  KYC_DRAFT_KEY,
  setProfile,
  getProfile,
  type ClientClassification,
} from "@/lib/profile";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Save,
  ShieldCheck,
  Upload,
  FileText,
  Users,
  Building2,
  AlertTriangle,
  PenLine,
  User,
  Handshake,
  Landmark,
} from "lucide-react";
import { KycData, initialData } from "./data";

const transactionPatterns = [
  "Domestic transfers",
  "International transfers",
  "Large transactions (>$10,000)",
  "Cryptocurrency-related transactions",
  "Cash-intensive business",
  "Other",
];

const sourceOfFundsOptions = [
  "Business Revenue",
  "Investment Income",
  "Loans/Financing",
  "Shareholder Capital",
  // "Salary/Employment",
  // "Inheritance",
  "Other",
];

const highRiskOptions = [
  "High-value goods dealer (art, jewelry,luxury goods)",
  "Money Service Business or Payment Processor",
  "Cryptocurrency or Virtual Asset Service Provider",
  "Gambling or Gaming Business",
  "Mining or Commodities Trading Business",
  "Primarily cash-based business",
  "Significant offshore operations or complex structure",
  "Business owned or controlled by a Politically Exposed Person",
  "None of the above",
];

const classificationMeta: Record<
  ClientClassification,
  {
    label: string;
    icon: typeof User;
    sectionTitle: string;
    addressTitle: string;
  }
> = {
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

export default function KycOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<KycData>(initialData);
  const [classification, setClassification] =
    useState<ClientClassification | null>(null);
  const [step, setStep] = useState(1);

  // Read classification from profile (set at login)
  useEffect(() => {
    const p = getProfile();
    setClassification(p.classifications);
  }, []);

  // Load draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KYC_DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setData({ ...initialData, ...parsed.data });
        if (typeof parsed.step === "number") setStep(parsed.step);
      }
    } catch {}
  }, []);

  const update = <K extends keyof KycData>(key: K, value: KycData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const toggleArray = (
    key: "sourceOfFunds" | "highRiskIndicators" | "transactionData" | "primarySourceOfFunds",
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

  // Conditional steps depending on classification
  const steps = useMemo(() => {
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
    // Partnership / Trust — keep prior arrangement
    const base = [
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
    return base;
  }, [classification]);

  // Clamp step if it falls outside the new range
  useEffect(() => {
    if (step > steps.length) setStep(steps.length);
  }, [steps.length, step]);

  const progress = useMemo(
    () => Math.round(((step - 1) / Math.max(1, steps.length - 1)) * 100),
    [step, steps.length],
  );

  const saveDraft = () => {
    localStorage.setItem(
      KYC_DRAFT_KEY,
      JSON.stringify({ data, step, savedAt: new Date().toISOString() }),
    );
    toast({ title: "Draft saved", description: "You can resume anytime." });
  };

  const handleSubmit = () => {
    if (
      !data.agreeTrue ||
      !data.agreeUpdate ||
      !data.agreeConsent ||
      !data.signature
    ) {
      toast({
        title: "Missing acknowledgements",
        description: "Please complete all declarations to submit.",
        variant: "destructive",
      });
      return;
    }
    localStorage.removeItem(KYC_DRAFT_KEY);
    setProfile({ isOnboarded: true, kycStatus: "submitted" });
    toast({
      title: "Onboarding submitted",
      description: "Welcome aboard! Redirecting to your dashboard.",
    });
    setTimeout(() => navigate("/dashboard"), 800);
  };

  // If classification is missing (e.g. direct visit without login), gently guide back
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
                Please sign in again so we can load the correct onboarding form
                for you.
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
        {/* Header card */}
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
              Welcome! We've tailored this form for {meta.label.toLowerCase()}{" "}
              clients. You can save your progress and return at any time.
              Estimated time: 15–20 minutes.
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
                const done = step > idx + 1;
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
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold mb-3">
                    {meta.addressTitle}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Field
                        label="Street Address *"
                        value={data.street}
                        onChange={(v) => update("street", v)}
                      />
                    </div>
                    <Field
                      label="City / Town *"
                      value={data.city}
                      onChange={(v) => update("city", v)}
                    />
                    <Field
                      label="State / Province"
                      value={data.state}
                      onChange={(v) => update("state", v)}
                    />
                    <Field
                      label="Postal Code *"
                      value={data.postalCode}
                      onChange={(v) => update("postalCode", v)}
                    />
                    <Field
                      label="Country *"
                      value={data.country}
                      onChange={(v) => update("country", v)}
                    />
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-3">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Primary Phone *"
                      value={data.primaryPhone}
                      onChange={(v) => update("primaryPhone", v)}
                    />
                    <Field
                      label="Secondary Phone"
                      value={data.secondaryPhone}
                      onChange={(v) => update("secondaryPhone", v)}
                    />
                    <div className="sm:col-span-2">
                      <Field
                        label="Email Address *"
                        type="email"
                        value={data.email}
                        onChange={(v) => update("email", v)}
                      />
                    </div>
                  </div>
                </div>
              </div>
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
              <div className="space-y-5">
                <div>
                  <Label>Purpose of Business Relationship *</Label>
                  <Textarea
                    rows={3}
                    className="mt-1.5"
                    placeholder="Describe the purpose and intended nature of the relationship"
                    value={data.purpose}
                    onChange={(e) => update("purpose", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">
                    Expected Transaction Patterns *
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {transactionPatterns.map((opt) => (
                      <Label
                        key={opt}
                        className="flex items-center gap-2 border rounded-md p-2.5 cursor-pointer hover:border-primary/40"
                      >
                        <Checkbox
                          checked={data.transactionData.includes(opt)}
                          onCheckedChange={() =>
                            toggleArray("sourceOfFunds", opt)
                          }
                        />
                        <span className="text-sm">{opt}</span>
                      </Label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">
                    Primary Source of Funds *
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sourceOfFundsOptions.map((opt) => (
                      <Label
                        key={opt}
                        className="flex items-center gap-2 border rounded-md p-2.5 cursor-pointer hover:border-primary/40"
                      >
                        <Checkbox
                          checked={data.sourceOfFunds.includes(opt)}
                          onCheckedChange={() =>
                            toggleArray("sourceOfFunds", opt)
                          }
                        />
                        <span className="text-sm">{opt}</span>
                      </Label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Expected Number of Transactions Monthly"
                    value={data.expectedVolume}
                    onChange={(v) => update("expectedVolume", v)}
                  />
                  <Field
                    label="Expected Total Value Monthly"
                    value={data.expectedValue}
                    onChange={(v) => update("expectedValue", v)}
                  />
                  <div className="sm:col-span-2">
                    <Field
                      label="Expected Countries of Transaction"
                      value={data.expectedCountries}
                      onChange={(v) => update("expectedCountries", v)}
                      placeholder="e.g. UK, US, UAE"
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">
                    High-Risk Indicators{" "}
                    <span className="italic text-red-300 text-xs mx-2">
                      Please indicate if any of the following apply to your
                      business
                    </span>
                  </Label>
                  <div className="space-y-2">
                    {highRiskOptions.map((opt) => (
                      <Label
                        key={opt}
                        className="flex items-center gap-2 border rounded-md p-2.5 cursor-pointer hover:border-primary/40"
                      >
                        <Checkbox
                          checked={data.highRiskIndicators.includes(opt)}
                          onCheckedChange={() =>
                            toggleArray("highRiskIndicators", opt)
                          }
                        />
                        <span className="text-sm">{opt}</span>
                      </Label>
                    ))}
                  </div>
                </div>
                {/* <div>
                  <Label className="mb-2 block">
                    {classification === "individual"
                      ? "Are you a Politically Exposed Person (PEP)? *"
                      : "Is any beneficial owner, director, partner, trustee, or settlor a Politically Exposed Person (PEP)? *"}
                  </Label>
                  <RadioGroup
                    value={data.isPep}
                    onValueChange={(v) => update("isPep", v as "yes" | "no")}
                    className="flex gap-4"
                  >
                    <Label className="flex items-center gap-2 border rounded-md px-4 py-2 cursor-pointer">
                      <RadioGroupItem value="yes" /> Yes
                    </Label>
                    <Label className="flex items-center gap-2 border rounded-md px-4 py-2 cursor-pointer">
                      <RadioGroupItem value="no" /> No
                    </Label>
                  </RadioGroup>
                </div> */}
              </div>
            )}

            {currentStepId === "declaration" && (
              <div className="space-y-5">
                <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
                  <p className="font-semibold">Declaration</p>
                  <p>I/We hereby declare that:</p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>
                      All information provided is true, accurate, and complete
                      to the best of my/our knowledge.
                    </li>
                    <li>
                      I/We understand that providing false or misleading
                      information is a serious offense and may result in legal
                      consequences.
                    </li>
                    <li>
                      I/We will notify the institution immediately of any
                      material changes to the information provided.
                    </li>
                    <li>
                      I/We authorize the institution to verify the information
                      provided through appropriate channels.
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <Label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={data.agreeTrue}
                      onCheckedChange={(v) => update("agreeTrue", !!v)}
                      className="mt-0.5"
                    />
                    <span className="text-sm">
                      I/We consent to the collection, processing, and storage of personalz.
                    </span>
                  </Label>
                  <Label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={data.agreeUpdate}
                      onCheckedChange={(v) => update("agreeUpdate", !!v)}
                      className="mt-0.5"
                    />
                    <span className="text-sm">
                      I agree to update you of any material changes within 30
                      days.
                    </span>
                  </Label>
                  <Label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={data.agreeConsent}
                      onCheckedChange={(v) => update("agreeConsent", !!v)}
                      className="mt-0.5"
                    />
                    <span className="text-sm">
                      I consent to the processing of my personal data for
                      KYC/AML compliance purposes.
                    </span>
                  </Label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Signature (type full name) *"
                    value={data.signature}
                    onChange={(v) => update("signature", v)}
                  />
                  <Field
                    label="Date *"
                    type="date"
                    value={data.signatureDate}
                    onChange={(v) => update("signatureDate", v)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky bottom-0 bg-background/80 backdrop-blur py-3">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={saveDraft}>
              <Save className="h-4 w-4 mr-1" /> Save Draft
            </Button>
            {step < steps.length ? (
              <Button
                className="gradient-primary text-primary-foreground"
                onClick={() => setStep((s) => Math.min(steps.length, s + 1))}
              >
                Save & Continue <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                className="gradient-primary text-primary-foreground"
                onClick={handleSubmit}
              >
                Submit Onboarding
              </Button>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

/* ----------------------------- Step components ---------------------------- */

type StepProps = {
  classification: ClientClassification;
  data: KycData;
  update: <K extends keyof KycData>(key: K, value: KycData[K]) => void;
};

function DetailsStep({ classification, data, update }: StepProps) {
  if (classification === "individual") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Full Legal Name *"
          value={data.fullName}
          onChange={(v) => update("fullName", v)}
        />
        <Field
          label="Date of Birth *"
          type="date"
          value={data.dob}
          onChange={(v) => update("dob", v)}
        />
        <Field
          label="Place of Birth"
          value={data.placeOfBirth}
          onChange={(v) => update("placeOfBirth", v)}
        />
        <Field
          label="Nationality *"
          value={data.nationality}
          onChange={(v) => update("nationality", v)}
        />
        <Field
          label="Tax Residency Country *"
          value={data.taxResidency}
          onChange={(v) => update("taxResidency", v)}
        />
        <Field
          label="Tax ID / TIN *"
          value={data.taxId}
          onChange={(v) => update("taxId", v)}
        />
        <Field
          label="Occupation"
          value={data.occupation}
          onChange={(v) => update("occupation", v)}
        />
        <Field
          label="Employer"
          value={data.employer}
          onChange={(v) => update("employer", v)}
        />
        <Field
          label="Source of Wealth"
          value={data.sourceOfWealth}
          onChange={(v) => update("sourceOfWealth", v)}
        />
        <Field
          label="Estimated Net Worth"
          value={data.netWorth}
          onChange={(v) => update("netWorth", v)}
          placeholder="e.g. $50,000 - $250,000"
        />
        <Field
          label="Annual Income Range"
          value={data.annualIncome}
          onChange={(v) => update("annualIncome", v)}
          placeholder="e.g. $25,000 - $75,000"
        />
      </div>
    );
  }

  if (classification === "corporate") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Legal Entity Name *"
          value={data.legalEntityName}
          onChange={(v) => update("legalEntityName", v)}
        />
        <Field
          label="Trading / Commercial Name"
          value={data.tradingName}
          onChange={(v) => update("tradingName", v)}
        />
        <Field
          label="Registration Number *"
          value={data.registrationNumber}
          onChange={(v) => update("registrationNumber", v)}
        />
        <Field
          label="Country of Incorporation *"
          value={data.incorporationCountry}
          onChange={(v) => update("incorporationCountry", v)}
        />
        <Field
          label="Date of Incorporation *"
          type="date"
          value={data.incorporationDate}
          onChange={(v) => update("incorporationDate", v)}
        />
        <Field
          label="Business Type / Industry *"
          value={data.businessType}
          onChange={(v) => update("businessType", v)}
        />
        <Field
          label="Tax ID *"
          value={data.taxId}
          onChange={(v) => update("taxId", v)}
        />
        <Field
          label="Company Website"
          value={data.website}
          onChange={(v) => update("website", v)}
          placeholder="https://"
        />
      </div>
    );
  }

  if (classification === "partnership") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Partnership Name *"
          value={data.partnershipName}
          onChange={(v) => update("partnershipName", v)}
        />
        <Field
          label="Partnership Type *"
          value={data.partnershipType}
          onChange={(v) => update("partnershipType", v)}
          placeholder="General, Limited, LLP"
        />
        <Field
          label="Registration Number"
          value={data.partnershipRegNumber}
          onChange={(v) => update("partnershipRegNumber", v)}
        />
        <Field
          label="Jurisdiction *"
          value={data.partnershipJurisdiction}
          onChange={(v) => update("partnershipJurisdiction", v)}
        />
        <Field
          label="Date of Formation *"
          type="date"
          value={data.partnershipFormationDate}
          onChange={(v) => update("partnershipFormationDate", v)}
        />
        <Field
          label="Tax ID *"
          value={data.taxId}
          onChange={(v) => update("taxId", v)}
        />
        <div className="sm:col-span-2">
          <Field
            label="Principal Business Activity *"
            value={data.partnershipBusinessActivity}
            onChange={(v) => update("partnershipBusinessActivity", v)}
          />
        </div>
      </div>
    );
  }

  // Trust
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field
        label="Name of Trust *"
        value={data.trustName}
        onChange={(v) => update("trustName", v)}
      />
      <Field
        label="Type of Trust *"
        value={data.trustType}
        onChange={(v) => update("trustType", v)}
        placeholder="Discretionary, Fixed, Charitable…"
      />
      <Field
        label="Date of Trust Deed *"
        type="date"
        value={data.trustDeedDate}
        onChange={(v) => update("trustDeedDate", v)}
      />
      <Field
        label="Governing Jurisdiction *"
        value={data.trustJurisdiction}
        onChange={(v) => update("trustJurisdiction", v)}
      />
      <Field
        label="Tax ID *"
        value={data.taxId}
        onChange={(v) => update("taxId", v)}
      />
      <div className="sm:col-span-2">
        <Label className="text-xs">Purpose of Trust *</Label>
        <Textarea
          rows={3}
          className="mt-1.5"
          value={data.trustPurpose}
          onChange={(e) => update("trustPurpose", e.target.value)}
        />
      </div>
    </div>
  );
}

function IdentificationStep({ classification, data, update }: StepProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label={
            classification === "individual"
              ? "Passport / National ID Number *"
              : "Authorized Representative ID Number *"
          }
          value={data.idNumber}
          onChange={(v) => update("idNumber", v)}
        />
        <Field
          label="Issuing Country *"
          value={data.idIssuingCountry}
          onChange={(v) => update("idIssuingCountry", v)}
        />
        <Field
          label="Issue Date *"
          type="date"
          value={data.idIssueDate}
          onChange={(v) => update("idIssueDate", v)}
        />
        <Field
          label="Expiry Date *"
          type="date"
          value={data.idExpiryDate}
          onChange={(v) => update("idExpiryDate", v)}
        />
      </div>
      <Separator />
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Upload Supporting Documents</h3>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium">
            Drop files here or click to upload
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, JPG, PNG up to 5MB each
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {classification === "individual" && (
            <>
              <FileField label="Government-issued ID *" />
              <FileField label="Proof of Address *" />
            </>
          )}
          {classification === "corporate" && (
            <>
              <FileField label="Certificate of Incorporation *" />
              <FileField label="Memorandum & Articles of Association *" />
              <FileField label="Register of Directors *" />
              <FileField label="Register of Shareholders *" />
              <FileField label="Proof of Registered Address *" />
              <FileField label="Authorized Representative ID *" />
            </>
          )}
          {classification === "partnership" && (
            <>
              <FileField label="Partnership Agreement / Deed *" />
              <FileField label="Certificate of Registration" />
              <FileField label="Register of Partners *" />
              <FileField label="Proof of Business Address *" />
              <FileField label="Authorized Representative ID *" />
            </>
          )}
          {classification === "trust" && (
            <>
              <FileField label="Trust Deed *" />
              <FileField label="Letter of Wishes (if any)" />
              <FileField label="Settlor ID *" />
              <FileField label="Trustee IDs *" />
              <FileField label="Proof of Trust Address *" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function OwnershipStep({ classification, data, update }: StepProps) {
  if (classification === "corporate") {
    return (
      <div className="space-y-5">
        <div>
          <Label>Beneficial Owners (≥ 25% ownership)</Label>
          <p className="text-xs text-muted-foreground mb-2">
            List full name, DOB, nationality, ownership % and nature of control
            for each.
          </p>
          <Textarea
            rows={5}
            placeholder="e.g. Jane Doe — DOB 1980-05-12 — British — 40% — Direct Shareholding"
            value={data.beneficialOwners}
            onChange={(e) => update("beneficialOwners", e.target.value)}
          />
        </div>
        <Separator />
        <div>
          <Label>Directors, Officers & Authorized Signatories</Label>
          <p className="text-xs text-muted-foreground mb-2">
            List full name, position, nationality, and PEP status if applicable.
          </p>
          <Textarea
            rows={5}
            placeholder="e.g. John Smith — Director — American — Not a PEP"
            value={data.directors}
            onChange={(e) => update("directors", e.target.value)}
          />
        </div>
      </div>
    );
  }

  if (classification === "partnership") {
    return (
      <div className="space-y-5">
        <div>
          <Label>Partners</Label>
          <p className="text-xs text-muted-foreground mb-2">
            List each partner: full name, DOB, nationality, type
            (general/limited), and ownership %.
          </p>
          <Textarea
            rows={6}
            placeholder="e.g. Alex Stone — DOB 1975-04-02 — British — General Partner — 60%"
            value={data.partners}
            onChange={(e) => update("partners", e.target.value)}
          />
        </div>
        <Separator />
        <div>
          <Label>Beneficial Owners (≥ 25% ownership or control)</Label>
          <Textarea
            rows={4}
            className="mt-1.5"
            placeholder="Full name — DOB — nationality — % ownership — nature of control"
            value={data.beneficialOwners}
            onChange={(e) => update("beneficialOwners", e.target.value)}
          />
        </div>
      </div>
    );
  }

  // Trust
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label>Settlor(s) *</Label>
          <Textarea
            rows={3}
            className="mt-1.5"
            placeholder="Full name — DOB — nationality — relationship to trust"
            value={data.settlor}
            onChange={(e) => update("settlor", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Trustee(s) *</Label>
          <Textarea
            rows={3}
            className="mt-1.5"
            placeholder="Full name — DOB / entity — nationality / jurisdiction"
            value={data.trustees}
            onChange={(e) => update("trustees", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Beneficiaries *</Label>
          <Textarea
            rows={3}
            className="mt-1.5"
            placeholder="Full name — DOB — nationality — class/share of benefit"
            value={data.beneficiaries}
            onChange={(e) => update("beneficiaries", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Protector (if applicable)</Label>
          <Textarea
            rows={2}
            className="mt-1.5"
            placeholder="Full name — nationality — powers"
            value={data.protector}
            onChange={(e) => update("protector", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function FileField({ label }: { label: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input type="file" />
    </div>
  );
}
