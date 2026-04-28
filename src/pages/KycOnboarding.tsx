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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { KYC_DRAFT_KEY, setProfile } from "@/lib/profile";
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
} from "lucide-react";

type ClientType = "individual" | "corporate" | "partnership" | "trust";

interface KycData {
  clientType: ClientType | "";
  // Individual
  fullName: string;
  dob: string;
  placeOfBirth: string;
  nationality: string;
  taxResidency: string;
  taxId: string;
  // Address
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  // Contact
  primaryPhone: string;
  secondaryPhone: string;
  email: string;
  // ID
  idNumber: string;
  idIssueDate: string;
  idExpiryDate: string;
  idIssuingCountry: string;
  // Employment / wealth
  occupation: string;
  employer: string;
  sourceOfWealth: string;
  netWorth: string;
  annualIncome: string;
  // Corporate
  legalEntityName: string;
  tradingName: string;
  registrationNumber: string;
  incorporationCountry: string;
  incorporationDate: string;
  businessType: string;
  website: string;
  // Beneficial ownership
  beneficialOwners: string;
  // Directors
  directors: string;
  // AML
  purpose: string;
  sourceOfFunds: string[];
  expectedVolume: string;
  expectedValue: string;
  expectedCountries: string;
  highRiskIndicators: string[];
  isPep: "yes" | "no" | "";
  // Declaration
  signature: string;
  signatureDate: string;
  agreeTrue: boolean;
  agreeUpdate: boolean;
  agreeConsent: boolean;
}

const initialData: KycData = {
  clientType: "",
  fullName: "", dob: "", placeOfBirth: "", nationality: "", taxResidency: "", taxId: "",
  street: "", city: "", state: "", postalCode: "", country: "",
  primaryPhone: "", secondaryPhone: "", email: "",
  idNumber: "", idIssueDate: "", idExpiryDate: "", idIssuingCountry: "",
  occupation: "", employer: "", sourceOfWealth: "", netWorth: "", annualIncome: "",
  legalEntityName: "", tradingName: "", registrationNumber: "", incorporationCountry: "",
  incorporationDate: "", businessType: "", website: "",
  beneficialOwners: "", directors: "",
  purpose: "", sourceOfFunds: [], expectedVolume: "", expectedValue: "", expectedCountries: "",
  highRiskIndicators: [], isPep: "",
  signature: "", signatureDate: "", agreeTrue: false, agreeUpdate: false, agreeConsent: false,
};

const sourceOfFundsOptions = [
  "Business Revenue", "Investment Income", "Loans/Financing", "Shareholder Capital", "Salary/Employment", "Inheritance", "Other",
];

const highRiskOptions = [
  "Money Service Business or Payment Processor",
  "Cryptocurrency or Virtual Asset Service Provider",
  "Gambling or Gaming Business",
  "Mining or Commodities Trading Business",
  "Primarily cash-based business",
  "None of the above",
];

const steps = [
  { id: 1, title: "Client Type", icon: ShieldCheck },
  { id: 2, title: "Personal / Entity", icon: FileText },
  { id: 3, title: "Address & Contact", icon: Building2 },
  { id: 4, title: "Identification", icon: Upload },
  { id: 5, title: "Ownership & Directors", icon: Users },
  { id: 6, title: "AML Risk", icon: AlertTriangle },
  { id: 7, title: "Declaration", icon: PenLine },
];

export default function KycOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<KycData>(initialData);

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

  const toggleArray = (key: "sourceOfFunds" | "highRiskIndicators", value: string) => {
    setData((d) => {
      const arr = d[key];
      return { ...d, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };

  const progress = useMemo(() => Math.round(((step - 1) / (steps.length - 1)) * 100), [step]);

  const saveDraft = () => {
    localStorage.setItem(KYC_DRAFT_KEY, JSON.stringify({ data, step, savedAt: new Date().toISOString() }));
    toast({ title: "Draft saved", description: "You can resume anytime." });
  };

  const handleSubmit = () => {
    if (!data.agreeTrue || !data.agreeUpdate || !data.agreeConsent || !data.signature) {
      toast({ title: "Missing acknowledgements", description: "Please complete all declarations to submit.", variant: "destructive" });
      return;
    }
    localStorage.removeItem(KYC_DRAFT_KEY);
    setProfile({ isOnboarded: true });
    toast({ title: "Onboarding submitted", description: "Welcome aboard! Redirecting to your dashboard." });
    setTimeout(() => navigate("/dashboard"), 800);
  };

  const isCorporate = data.clientType && data.clientType !== "individual";

  return (
    <PortalLayout title="Client Onboarding" subtitle="KYC / AML Compliance Form">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header card */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="gradient-primary p-6 text-primary-foreground">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-6 w-6" />
              <h2 className="text-xl font-heading font-bold">KYC / AML Onboarding</h2>
            </div>
            <p className="text-sm opacity-90 max-w-2xl">
              Welcome! Please complete this confidential compliance form so we can tailor our services to you.
              You can save your progress and return at any time. Estimated time: 15–20 minutes.
            </p>
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Step {step} of {steps.length} · {steps[step - 1].title}</p>
              <span className="text-sm font-heading font-bold text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 mb-5" />
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {steps.map((s) => {
                const Icon = s.icon;
                const done = step > s.id;
                const current = step === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStep(s.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-all ${
                      current ? "border-primary bg-primary/5"
                        : done ? "border-success/30 bg-success/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Icon className={`h-4 w-4 ${current ? "text-primary" : "text-muted-foreground"}`} />}
                    <span className="text-[10px] font-medium leading-tight">{s.title}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Form body */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-heading">{steps[step - 1].title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {step === 1 && (
              <div className="space-y-4">
                <Label>Client Type *</Label>
                <RadioGroup
                  value={data.clientType}
                  onValueChange={(v) => update("clientType", v as ClientType)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {[
                    { v: "individual", l: "Individual" },
                    { v: "corporate", l: "Corporate Entity" },
                    { v: "partnership", l: "Partnership" },
                    { v: "trust", l: "Trust" },
                  ].map((o) => (
                    <Label
                      key={o.v}
                      className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                        data.clientType === o.v ? "border-primary bg-primary/5" : "hover:border-primary/40"
                      }`}
                    >
                      <RadioGroupItem value={o.v} />
                      <span className="text-sm font-medium">{o.l}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                {!isCorporate ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Full Legal Name *" value={data.fullName} onChange={(v) => update("fullName", v)} />
                    <Field label="Date of Birth *" type="date" value={data.dob} onChange={(v) => update("dob", v)} />
                    <Field label="Place of Birth" value={data.placeOfBirth} onChange={(v) => update("placeOfBirth", v)} />
                    <Field label="Nationality *" value={data.nationality} onChange={(v) => update("nationality", v)} />
                    <Field label="Tax Residency Country *" value={data.taxResidency} onChange={(v) => update("taxResidency", v)} />
                    <Field label="Tax ID / TIN *" value={data.taxId} onChange={(v) => update("taxId", v)} />
                    <Field label="Occupation" value={data.occupation} onChange={(v) => update("occupation", v)} />
                    <Field label="Employer" value={data.employer} onChange={(v) => update("employer", v)} />
                    <Field label="Source of Wealth" value={data.sourceOfWealth} onChange={(v) => update("sourceOfWealth", v)} />
                    <Field label="Estimated Net Worth" value={data.netWorth} onChange={(v) => update("netWorth", v)} placeholder="e.g. $50,000 - $250,000" />
                    <Field label="Annual Income Range" value={data.annualIncome} onChange={(v) => update("annualIncome", v)} placeholder="e.g. $25,000 - $75,000" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Legal Entity Name *" value={data.legalEntityName} onChange={(v) => update("legalEntityName", v)} />
                    <Field label="Trading / Commercial Name" value={data.tradingName} onChange={(v) => update("tradingName", v)} />
                    <Field label="Registration Number *" value={data.registrationNumber} onChange={(v) => update("registrationNumber", v)} />
                    <Field label="Country of Incorporation *" value={data.incorporationCountry} onChange={(v) => update("incorporationCountry", v)} />
                    <Field label="Date of Incorporation *" type="date" value={data.incorporationDate} onChange={(v) => update("incorporationDate", v)} />
                    <Field label="Business Type / Industry *" value={data.businessType} onChange={(v) => update("businessType", v)} />
                    <Field label="Tax ID *" value={data.taxId} onChange={(v) => update("taxId", v)} />
                    <Field label="Company Website" value={data.website} onChange={(v) => update("website", v)} placeholder="https://" />
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold mb-3">{isCorporate ? "Registered Address" : "Residential Address"}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Field label="Street Address *" value={data.street} onChange={(v) => update("street", v)} />
                    </div>
                    <Field label="City / Town *" value={data.city} onChange={(v) => update("city", v)} />
                    <Field label="State / Province" value={data.state} onChange={(v) => update("state", v)} />
                    <Field label="Postal Code *" value={data.postalCode} onChange={(v) => update("postalCode", v)} />
                    <Field label="Country *" value={data.country} onChange={(v) => update("country", v)} />
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Primary Phone *" value={data.primaryPhone} onChange={(v) => update("primaryPhone", v)} />
                    <Field label="Secondary Phone" value={data.secondaryPhone} onChange={(v) => update("secondaryPhone", v)} />
                    <div className="sm:col-span-2">
                      <Field label="Email Address *" type="email" value={data.email} onChange={(v) => update("email", v)} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Passport / National ID Number *" value={data.idNumber} onChange={(v) => update("idNumber", v)} />
                  <Field label="Issuing Country *" value={data.idIssuingCountry} onChange={(v) => update("idIssuingCountry", v)} />
                  <Field label="Issue Date *" type="date" value={data.idIssueDate} onChange={(v) => update("idIssueDate", v)} />
                  <Field label="Expiry Date *" type="date" value={data.idExpiryDate} onChange={(v) => update("idExpiryDate", v)} />
                </div>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Upload Identification Documents</h3>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">Drop files here or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 5MB each</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FileField label="Government-issued ID *" />
                    <FileField label="Proof of Address *" />
                    {isCorporate && <FileField label="Certificate of Incorporation *" />}
                    {isCorporate && <FileField label="Memorandum & Articles of Association" />}
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <Label>Beneficial Owners (≥ 25% ownership)</Label>
                  <p className="text-xs text-muted-foreground mb-2">List full name, DOB, nationality, ownership % and nature of control for each.</p>
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
                  <p className="text-xs text-muted-foreground mb-2">List full name, position, nationality, and PEP status if applicable.</p>
                  <Textarea
                    rows={5}
                    placeholder="e.g. John Smith — Director — American — Not a PEP"
                    value={data.directors}
                    onChange={(e) => update("directors", e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 6 && (
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
                  <Label className="mb-2 block">Primary Source of Funds *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sourceOfFundsOptions.map((opt) => (
                      <Label key={opt} className="flex items-center gap-2 border rounded-md p-2.5 cursor-pointer hover:border-primary/40">
                        <Checkbox
                          checked={data.sourceOfFunds.includes(opt)}
                          onCheckedChange={() => toggleArray("sourceOfFunds", opt)}
                        />
                        <span className="text-sm">{opt}</span>
                      </Label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Expected # of Monthly Transactions" value={data.expectedVolume} onChange={(v) => update("expectedVolume", v)} />
                  <Field label="Expected Total Monthly Value" value={data.expectedValue} onChange={(v) => update("expectedValue", v)} />
                  <div className="sm:col-span-2">
                    <Field label="Expected Countries of Transaction" value={data.expectedCountries} onChange={(v) => update("expectedCountries", v)} placeholder="e.g. UK, US, UAE" />
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">High-Risk Indicators</Label>
                  <div className="space-y-2">
                    {highRiskOptions.map((opt) => (
                      <Label key={opt} className="flex items-center gap-2 border rounded-md p-2.5 cursor-pointer hover:border-primary/40">
                        <Checkbox
                          checked={data.highRiskIndicators.includes(opt)}
                          onCheckedChange={() => toggleArray("highRiskIndicators", opt)}
                        />
                        <span className="text-sm">{opt}</span>
                      </Label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Is any beneficial owner, director, or officer a Politically Exposed Person (PEP)? *</Label>
                  <RadioGroup value={data.isPep} onValueChange={(v) => update("isPep", v as "yes" | "no")} className="flex gap-4">
                    <Label className="flex items-center gap-2 border rounded-md px-4 py-2 cursor-pointer">
                      <RadioGroupItem value="yes" /> Yes
                    </Label>
                    <Label className="flex items-center gap-2 border rounded-md px-4 py-2 cursor-pointer">
                      <RadioGroupItem value="no" /> No
                    </Label>
                  </RadioGroup>
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-5">
                <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
                  <p className="font-semibold">Declaration</p>
                  <p>I/We hereby declare that:</p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>All information provided is true, accurate, and complete to the best of my/our knowledge.</li>
                    <li>I/We understand that providing false or misleading information is a serious offense.</li>
                    <li>I/We will promptly notify you of any material changes to this information.</li>
                    <li>I/We consent to the processing of personal data for compliance purposes.</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <Label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox checked={data.agreeTrue} onCheckedChange={(v) => update("agreeTrue", !!v)} className="mt-0.5" />
                    <span className="text-sm">I confirm all information provided is true and accurate.</span>
                  </Label>
                  <Label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox checked={data.agreeUpdate} onCheckedChange={(v) => update("agreeUpdate", !!v)} className="mt-0.5" />
                    <span className="text-sm">I agree to update you of any material changes within 30 days.</span>
                  </Label>
                  <Label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox checked={data.agreeConsent} onCheckedChange={(v) => update("agreeConsent", !!v)} className="mt-0.5" />
                    <span className="text-sm">I consent to the processing of my personal data for KYC/AML compliance purposes.</span>
                  </Label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Signature (type full name) *" value={data.signature} onChange={(v) => update("signature", v)} />
                  <Field label="Date *" type="date" value={data.signatureDate} onChange={(v) => update("signatureDate", v)} />
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
              <Button className="gradient-primary text-primary-foreground" onClick={handleSubmit}>
                Submit Onboarding
              </Button>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
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
