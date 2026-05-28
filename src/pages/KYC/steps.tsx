import { useEffect, useRef, useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Upload,
  Building2,
  User,
  Handshake,
  Landmark,
  UploadCloud,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  KycData,
  emptyBeneficialOwner,
  emptyDirector,
  emptyRelatedEntity,
  type BeneficialOwner,
  type DirectorOfficer,
  type RelatedEntity,
} from "./data";
import type { ClientClassification } from "@/lib/profile";
import { DocumentAttachment, uploadDocument } from "./onboardingApi";

// ─────────────────────────────────────────────────────────────
// SHARED TYPES
// ─────────────────────────────────────────────────────────────

export type StepProps = {
  classification: ClientClassification;
  data: KycData;
  update: <K extends keyof KycData>(key: K, value: KycData[K]) => void;
  onUpload?: (doc: Omit<DocumentAttachment, "uploadedAt">) => Promise<void>;
  onRemoveDoc?: (url: string) => Promise<void>;
  existingDocs?: DocumentAttachment[];
};

type ToggleKey =
  | "sourceOfFunds"
  | "highRiskIndicators"
  | "transactionData"
  | "primarySourceOfFunds";

// ─────────────────────────────────────────────────────────────
// SHARED UI PRIMITIVES
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// REQUIRED DOCS per classification — used for submit validation
// ─────────────────────────────────────────────────────────────

const REQUIRED_DOCS: Record<ClientClassification, string[]> = {
  individual: ["Passport / National ID *", "Proof of Address *"],
  corporate: [
    "Certificate of Incorporation *",
    "Register of Directors & Shareholders *",
    "Proof of Business Address *",
    "Passport / National ID *",
  ],
  partnership: [
    "Partnership Agreement / Deed *",
    "Register of Partners *",
    "Proof of Business Address *",
    "Authorized Representative ID *",
  ],
  trust: [
    "Trust Deed *",
    "Settlor ID *",
    "Trustee IDs *",
    "Proof of Trust Address *",
  ],
};

const DOC_CATEGORY: Record<string, string> = {
  "Passport / National ID *": "identity",
  "Proof of Address *": "address_proof",
  "Certificate of Incorporation *": "corporate_doc",
  "Register of Directors & Shareholders *": "corporate_doc",
  "Proof of Business Address *": "address_proof",
  "Partnership Agreement / Deed *": "corporate_doc",
  "Certificate of Registration": "corporate_doc",
  "Register of Partners *": "corporate_doc",
  "Authorized Representative ID *": "identity",
  "Trust Deed *": "corporate_doc",
  "Letter of Wishes (if any)": "corporate_doc",
  "Settlor ID *": "identity",
  "Trustee IDs *": "identity",
  "Proof of Trust Address *": "address_proof",
};

// Exported — used in KycOnboarding.tsx to gate the submit button
export function allRequiredDocsUploaded(
  classification: ClientClassification,
  existingDocs: DocumentAttachment[],
): boolean {
  const required = REQUIRED_DOCS[classification] ?? [];
  const uploadedNames = new Set(existingDocs.map((d) => d.name));
  return required.every((r) => uploadedNames.has(r));
}

// ─────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────

export function Field({
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

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = "Select",
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-1.5">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function YesNoChecks({
  value,
  onChange,
}: {
  value: "yes" | "no" | "";
  onChange: (v: "yes" | "no") => void;
}) {
  return (
    <div className="flex gap-3">
      <Label className="flex items-center gap-2 border rounded-md px-4 py-2 cursor-pointer hover:border-primary/40">
        <Checkbox
          checked={value === "yes"}
          onCheckedChange={() => onChange("yes")}
        />
        <span className="text-sm">Yes</span>
      </Label>
      <Label className="flex items-center gap-2 border rounded-md px-4 py-2 cursor-pointer hover:border-primary/40">
        <Checkbox
          checked={value === "no"}
          onCheckedChange={() => onChange("no")}
        />
        <span className="text-sm">No</span>
      </Label>
    </div>
  );
}

export function RepeaterCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">{title}</h4>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" /> Remove
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FILE FIELD — uploads to server, shows status
// ─────────────────────────────────────────────────────────────

export function FileField({
  label,
  category,
  onUploaded,
  onRemoved,
  existingUrl,
}: {
  label: string;
  category: string;
  onUploaded: (doc: Omit<DocumentAttachment, "uploadedAt">) => Promise<void>;
  onRemoved?: (url: string) => Promise<void>;
  existingUrl?: string;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">(
    existingUrl ? "done" : "idle",
  );
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(
    existingUrl ?? null,
  );
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    setErrorMsg("");
    try {
      const result = await uploadDocument(file);
      setUploadedUrl(result.fileUrl);
      setStatus("done");
      await onUploaded({
        name: label,
        category,
        url: result.fileUrl,
        mimeType: result.mimeType,
        size: result.size,
      });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(
        err?.response?.data?.message ?? "Upload failed. Please try again.",
      );
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (uploadedUrl && onRemoved) await onRemoved(uploadedUrl);
    setUploadedUrl(null);
    setStatus("idle");
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {status === "done" && uploadedUrl ? (
        <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-success/5 border-success/20">
          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-success truncate flex-1 hover:underline"
          >
            {uploadedUrl.split("/").pop()}
          </a>
          {onRemoved && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-muted-foreground hover:text-destructive shrink-0"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <Input
            ref={inputRef}
            type="file"
            onChange={handleChange}
            disabled={status === "uploading"}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
          {status === "uploading" && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}
      {status === "uploading" && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <UploadCloud className="h-3 w-3" /> Uploading…
        </p>
      )}
      {status === "error" && (
        <p className="text-xs text-destructive">{errorMsg}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STEP: DETAILS
// Handles individual, corporate, partnership, trust
// ─────────────────────────────────────────────────────────────

export function DetailsStep({ classification, data, update }: StepProps) {
  if (classification === "individual") {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-3">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Full Legal Name *"
              value={data.fullName}
              onChange={(v) => update("fullName", v)}
            />
            <Field
              label="Date of Birth *"
              value={data.dob}
              onChange={(v) => update("dob", v)}
              type="date"
            />
            <Field
              label="Place of Birth *"
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
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="text-sm font-semibold mb-3">Residential Address</h3>
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
          <h3 className="text-sm font-semibold mb-3">Contact Information</h3>
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
                value={data.email}
                onChange={(v) => update("email", v)}
                type="email"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (classification === "corporate") {
    return <CorporateDetailsStep data={data} update={update} />;
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
          value={data.partnershipFormationDate}
          onChange={(v) => update("partnershipFormationDate", v)}
          type="date"
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
        value={data.trustDeedDate}
        onChange={(v) => update("trustDeedDate", v)}
        type="date"
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

// ─────────────────────────────────────────────────────────────
// STEP: EMPLOYMENT (individual only)
// ─────────────────────────────────────────────────────────────

const employmentStatusOptions = [
  "Employed",
  "Self Employed",
  "Unemployed",
  "Retired",
  "Student",
  "Other",
];

export function EmploymentStep({
  data,
  update,
}: {
  data: KycData;
  update: <K extends keyof KycData>(key: K, value: KycData[K]) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <Label className="text-xs">Employment Status *</Label>
        <Select
          value={data.employmentStatus}
          onValueChange={(v) => update("employmentStatus", v)}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {employmentStatusOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Field
        label="Employer Name"
        value={data.employer}
        onChange={(v) => update("employer", v)}
      />
      <Field
        label="Occupation / Job Title"
        value={data.occupation}
        onChange={(v) => update("occupation", v)}
      />
      <Field
        label="Industry Sector"
        value={data.industrySector}
        onChange={(v) => update("industrySector", v)}
      />
      <div className="sm:col-span-2">
        <Field
          label="Employer Address"
          value={data.employerAddress}
          onChange={(v) => update("employerAddress", v)}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STEP: WEALTH / SOURCE OF FUNDS (individual only)
// ─────────────────────────────────────────────────────────────

const primaryFundsOptions = [
  "Employment Income",
  "Business Income",
  "Savings",
  "Investments",
  "Inheritance",
  "Gift",
  "Other",
];

const netWorthOptions = [
  "Less than $50,000",
  "$50,000 - $250,000",
  "$250,000 - $1,000,000",
  "Over $1,000,000",
];

const annualIncomeOptions = [
  "Less than $25,000",
  "$25,000 - $75,000",
  "$75,000 - $150,000",
  "Over $150,000",
];

export function WealthStep({
  data,
  update,
  toggleArray,
}: {
  data: KycData;
  update: <K extends keyof KycData>(key: K, value: KycData[K]) => void;
  toggleArray: (key: ToggleKey, value: string) => void;
}) {
  const otherChecked = data.primarySourceOfFunds.includes("Other");

  return (
    <div className="space-y-5">
      <div>
        <Label className="mb-2 block">Primary Source of Funds *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {primaryFundsOptions.map((opt) => (
            <Label
              key={opt}
              className="flex items-center gap-2 border rounded-md p-2.5 cursor-pointer hover:border-primary/40"
            >
              <Checkbox
                checked={data.primarySourceOfFunds.includes(opt)}
                onCheckedChange={() => toggleArray("primarySourceOfFunds", opt)}
              />
              <span className="text-sm">{opt}</span>
            </Label>
          ))}
        </div>
        {otherChecked && (
          <div className="mt-3">
            <Field
              label="Please specify other source of funds *"
              value={data.primarySourceOfFundsOther}
              onChange={(v) => update("primarySourceOfFundsOther", v)}
            />
          </div>
        )}
      </div>

      <div>
        <Label className="text-xs">Source of Wealth</Label>
        <Textarea
          rows={3}
          className="mt-1.5"
          placeholder="Describe how your overall wealth was accumulated"
          value={data.sourceOfWealth}
          onChange={(e) => update("sourceOfWealth", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">Estimated Net Worth *</Label>
          <Select
            value={data.netWorth}
            onValueChange={(v) => update("netWorth", v)}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {netWorthOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Annual Income Range *</Label>
          <Select
            value={data.annualIncome}
            onValueChange={(v) => update("annualIncome", v)}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {annualIncomeOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STEP: IDENTIFICATION
// ─────────────────────────────────────────────────────────────
const ALL_DOCS: Record<
  ClientClassification,
  { label: string; required: boolean }[]
> = {
  individual: [
    { label: "Passport / National ID *", required: true },
    { label: "Proof of Address *", required: true },
  ],
  corporate: [
    { label: "Certificate of Incorporation *", required: true },
    { label: "Register of Directors & Shareholders *", required: true },
    { label: "Proof of Business Address *", required: true },
  ],
  partnership: [
    { label: "Partnership Agreement / Deed *", required: true },
    { label: "Certificate of Registration", required: false },
    { label: "Register of Partners *", required: true },
    { label: "Proof of Business Address *", required: true },
    { label: "Authorized Representative ID *", required: true },
  ],
  trust: [
    { label: "Trust Deed *", required: true },
    { label: "Letter of Wishes (if any)", required: false },
    { label: "Settlor ID *", required: true },
    { label: "Trustee IDs *", required: true },
    { label: "Proof of Trust Address *", required: true },
  ],
};

export function IdentificationStep({
  classification,
  data,
  update,
  onUpload,
  onRemoveDoc,
  existingDocs = [],
}: StepProps) {
  const existingUrl = (label: string) =>
    existingDocs.find((d) => d.name === label)?.url;
  const requiredDocs = REQUIRED_DOCS[classification] ?? [];
  const uploadedNames = new Set(existingDocs.map((d) => d.name));
  const missingCount = requiredDocs.filter((r) => !uploadedNames.has(r)).length;
  const docs = ALL_DOCS[classification] ?? [];

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
          value={data.idIssueDate}
          onChange={(v) => update("idIssueDate", v)}
          type="date"
        />
        <Field
          label="Expiry Date *"
          value={data.idExpiryDate}
          onChange={(v) => update("idExpiryDate", v)}
          type="date"
        />
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Upload Supporting Documents</h3>
          {missingCount > 0 ? (
            <span className="text-xs text-destructive font-medium">
              {missingCount} required document{missingCount > 1 ? "s" : ""}{" "}
              missing
            </span>
          ) : (
            <span className="text-xs text-success font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> All required documents
              uploaded
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Accepted: PDF, JPG, PNG, DOC, DOCX · Max 10MB per file
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {docs.map(({ label }) => (
            <FileField
              key={label}
              label={label}
              category={DOC_CATEGORY[label] ?? "other"}
              onUploaded={onUpload!}
              onRemoved={onRemoveDoc}
              existingUrl={existingUrl(label)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STEP: OWNERSHIP & CONTROL
// ─────────────────────────────────────────────────────────────

export function OwnershipStep({ classification, data, update }: StepProps) {
  if (classification === "corporate") {
    return <CorporateOwnershipStep data={data} update={update} />;
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

// ─────────────────────────────────────────────────────────────
// STEP: AML RISK
// ─────────────────────────────────────────────────────────────

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
  "Other",
];

const highRiskOptions = [
  "High-value goods dealer (art, jewelry, luxury goods)",
  "Money Service Business or Payment Processor",
  "Cryptocurrency or Virtual Asset Service Provider",
  "Gambling or Gaming Business",
  "Mining or Commodities Trading Business",
  "Primarily cash-based business",
  "Significant offshore operations or complex structure",
  "Business owned or controlled by a Politically Exposed Person",
  "None of the above",
];

export function AmlStep({
  data,
  update,
  toggleArray,
}: {
  data: KycData;
  update: <K extends keyof KycData>(key: K, value: KycData[K]) => void;
  toggleArray: (key: ToggleKey, value: string) => void;
}) {
  return (
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
        <Label className="mb-2 block">Expected Transaction Patterns *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {transactionPatterns.map((opt) => (
            <Label
              key={opt}
              className="flex items-center gap-2 border rounded-md p-2.5 cursor-pointer hover:border-primary/40"
            >
              <Checkbox
                checked={data.transactionData.includes(opt)}
                onCheckedChange={() => toggleArray("transactionData", opt)}
              />
              <span className="text-sm">{opt}</span>
            </Label>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Primary Source of Funds *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sourceOfFundsOptions.map((opt) => (
            <Label
              key={opt}
              className="flex items-center gap-2 border rounded-md p-2.5 cursor-pointer hover:border-primary/40"
            >
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
          High-Risk Indicators
          <span className="italic text-red-400 text-xs ml-2">
            Please indicate if any of the following apply
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
                onCheckedChange={() => toggleArray("highRiskIndicators", opt)}
              />
              <span className="text-sm">{opt}</span>
            </Label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STEP: DECLARATION
// ─────────────────────────────────────────────────────────────

export function DeclarationStep({ classification, data, update }: StepProps) {
  const isIndividual = classification === "individual";

  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
        <p className="font-semibold">Declaration</p>
        {isIndividual ? (
          <>
            <p>I hereby declare that:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                All information provided is true, accurate, and complete to the
                best of my knowledge.
              </li>
              <li>
                I understand that providing false information is a serious
                offense and may lead to rejection or termination of the
                relationship.
              </li>
              <li>
                I will notify the institution within 30 days of any material
                change to the information provided.
              </li>
              <li>
                I authorize the institution to verify the information through
                appropriate channels.
              </li>
              <li>
                I consent to the collection, processing, and storage of my
                personal data for KYC/AML compliance purposes.
              </li>
            </ul>
          </>
        ) : (
          <>
            <p>I/We hereby declare on behalf of the entity that:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                All information provided is true, accurate, and complete to the
                best of our knowledge.
              </li>
              <li>
                I/We understand that providing false information is a serious
                offense and may result in legal consequences.
              </li>
              <li>
                I/We will notify the institution immediately of any material
                changes to the information provided.
              </li>
              <li>
                I/We authorize the institution to verify the information
                provided through appropriate channels.
              </li>
            </ul>
          </>
        )}
      </div>

      <div className="space-y-3">
        <Label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={data.agreeTrue}
            onCheckedChange={(v) => update("agreeTrue", !!v)}
            className="mt-0.5"
          />
          <span className="text-sm">
            {isIndividual
              ? "I confirm that all information provided is true and accurate."
              : "I/We consent to the collection, processing, and storage of personal data for compliance and regulatory purposes."}
          </span>
        </Label>
        <Label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={data.agreeUpdate}
            onCheckedChange={(v) => update("agreeUpdate", !!v)}
            className="mt-0.5"
          />
          <span className="text-sm">
            {isIndividual
              ? "I agree to notify the institution of any material changes within 30 days."
              : "I/We consent to verification checks against sanctions lists, PEP databases, and other compliance databases."}
          </span>
        </Label>
        <Label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={data.agreeConsent}
            onCheckedChange={(v) => update("agreeConsent", !!v)}
            className="mt-0.5"
          />
          <span className="text-sm">
            {isIndividual
              ? "I consent to the processing of my personal data for KYC/AML compliance purposes."
              : "I/We understand that ongoing transaction monitoring will be conducted as part of regulatory requirements."}
          </span>
        </Label>
      </div>

      {isIndividual ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Signature (type full legal name) *"
            value={data.signature}
            onChange={(v) => update("signature", v)}
          />
          <Field
            label="Date *"
            value={data.signatureDate}
            onChange={(v) => update("signatureDate", v)}
            type="date"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Authorized Signatory</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Full Name of Signatory *"
              value={data.signatoryFullName}
              onChange={(v) => update("signatoryFullName", v)}
            />
            <Field
              label="Title / Position *"
              value={data.signatoryTitle}
              onChange={(v) => update("signatoryTitle", v)}
            />
            <Field
              label="Signature (type full name) *"
              value={data.signature}
              onChange={(v) => update("signature", v)}
            />
            <Field
              label="Date *"
              value={data.signatureDate}
              onChange={(v) => update("signatureDate", v)}
              type="date"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CORPORATE SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

const entityTypeOptions = [
  "Private Limited Company",
  "Public Limited Company",
  "Partnership",
  "Trust",
  "Foundation",
  "Other",
];
const annualRevenueOptions = [
  "Less than $100,000",
  "$100,000 - $500,000",
  "$500,000 - $5,000,000",
  "Over $5,000,000",
];
const numberOfEmployeesOptions = ["1-10", "11-50", "51-200", "Over 200"];

function CorporateDetailsStep({
  data,
  update,
}: {
  data: KycData;
  update: <K extends keyof KycData>(key: K, value: KycData[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">
          Section A — Entity Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Legal Entity Name *"
            value={data.legalEntityName}
            onChange={(v) => update("legalEntityName", v)}
          />
          <SelectField
            label="Entity Type *"
            value={data.entityType}
            options={entityTypeOptions}
            onChange={(v) => update("entityType", v)}
            placeholder="Select entity type"
          />
          {data.entityType === "Other" && (
            <div className="sm:col-span-2">
              <Field
                label="Please specify entity type *"
                value={data.entityTypeOther}
                onChange={(v) => update("entityTypeOther", v)}
              />
            </div>
          )}
          <Field
            label="Registration / Company Number *"
            value={data.registrationNumber}
            onChange={(v) => update("registrationNumber", v)}
          />
          <Field
            label="Tax Jurisdiction *"
            value={data.taxJurisdiction}
            onChange={(v) => update("taxJurisdiction", v)}
          />
          <Field
            label="Date Established *"
            value={data.dateEstablished}
            onChange={(v) => update("dateEstablished", v)}
            type="date"
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold mb-3">
          Registered Business Address
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field
              label="Street *"
              value={data.regStreet}
              onChange={(v) => update("regStreet", v)}
            />
          </div>
          <Field
            label="City *"
            value={data.regCity}
            onChange={(v) => update("regCity", v)}
          />
          <Field
            label="State / Province"
            value={data.regState}
            onChange={(v) => update("regState", v)}
          />
          <Field
            label="Postal Code *"
            value={data.regPostalCode}
            onChange={(v) => update("regPostalCode", v)}
          />
          <Field
            label="Country *"
            value={data.regCountry}
            onChange={(v) => update("regCountry", v)}
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold mb-3">
          Business Activity Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field
              label="Primary Business Activity *"
              value={data.primaryBusinessActivity}
              onChange={(v) => update("primaryBusinessActivity", v)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">Detailed Business Description *</Label>
            <Textarea
              rows={4}
              className="mt-1.5"
              value={data.businessDescription}
              onChange={(e) => update("businessDescription", e.target.value)}
            />
          </div>
          <SelectField
            label="Estimated Annual Revenue *"
            value={data.annualRevenue}
            options={annualRevenueOptions}
            onChange={(v) => update("annualRevenue", v)}
            placeholder="Select range"
          />
          <SelectField
            label="Number of Employees *"
            value={data.numberOfEmployees}
            options={numberOfEmployeesOptions}
            onChange={(v) => update("numberOfEmployees", v)}
            placeholder="Select range"
          />
          <Field
            label="Countries of Operation *"
            value={data.countriesOfOperation}
            onChange={(v) => update("countriesOfOperation", v)}
            placeholder="e.g. UK, US, UAE"
          />
          <Field
            label="Company Website"
            value={data.website}
            onChange={(v) => update("website", v)}
            placeholder="https://"
          />
        </div>
      </div>
    </div>
  );
}

const natureOfControlOptions = [
  "Direct Shareholding",
  "Indirect Shareholding",
  "Voting Rights",
  "Other Control Mechanisms",
];
const pepStatusOptions = [
  "Not a PEP",
  "This person is a Politically Exposed Person (PEP)",
  "Has close association with a PEP",
];
const natureOfRelationshipOptions = [
  "Subsidiary",
  "Affiliate",
  "Parent Company",
  "Joint Venture",
  "Other",
];

function CorporateOwnershipStep({
  data,
  update,
}: {
  data: KycData;
  update: <K extends keyof KycData>(key: K, value: KycData[K]) => void;
}) {
  // ── Beneficial owners ──────────────────────────────────────
  const updateOwner = (i: number, patch: Partial<BeneficialOwner>) => {
    const list = [...data.beneficialOwnersList];
    list[i] = { ...list[i], ...patch };
    update("beneficialOwnersList", list);
  };
  const addOwner = () =>
    update("beneficialOwnersList", [
      ...data.beneficialOwnersList,
      { ...emptyBeneficialOwner },
    ]);
  const removeOwner = (i: number) =>
    update(
      "beneficialOwnersList",
      data.beneficialOwnersList.filter((_, idx) => idx !== i),
    );

  // ── Directors ──────────────────────────────────────────────
  const updateDirector = (i: number, patch: Partial<DirectorOfficer>) => {
    const list = [...data.directorsList];
    list[i] = { ...list[i], ...patch };
    update("directorsList", list);
  };
  const addDirector = () =>
    update("directorsList", [...data.directorsList, { ...emptyDirector }]);
  const removeDirector = (i: number) =>
    update(
      "directorsList",
      data.directorsList.filter((_, idx) => idx !== i),
    );

  // ── Related entities ───────────────────────────────────────
  const updateRelated = (i: number, patch: Partial<RelatedEntity>) => {
    const list = [...data.relatedEntitiesList];
    list[i] = { ...list[i], ...patch };
    update("relatedEntitiesList", list);
  };
  const addRelated = () =>
    update("relatedEntitiesList", [
      ...data.relatedEntitiesList,
      { ...emptyRelatedEntity },
    ]);
  const removeRelated = (i: number) =>
    update(
      "relatedEntitiesList",
      data.relatedEntitiesList.filter((_, idx) => idx !== i),
    );

  // Auto-init first row when "yes" selected
  useEffect(() => {
    if (
      data.hasBeneficialOwner === "yes" &&
      data.beneficialOwnersList.length === 0
    )
      addOwner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.hasBeneficialOwner]);

  useEffect(() => {
    if (
      data.hasRelatedEntity === "yes" &&
      data.relatedEntitiesList.length === 0
    )
      addRelated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.hasRelatedEntity]);

  return (
    <div className="space-y-8">
      {/* ── Beneficial Ownership ── */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">
          Beneficial Ownership Structure
        </h3>
        <p className="text-xs text-muted-foreground">
          A beneficial owner is any individual who ultimately owns or controls
          25% or more of the entity. Please list all individuals meeting this
          threshold.
        </p>
        <div>
          <Label className="text-xs mb-2 block">
            Does any individual own 25% or more of the entity? *
          </Label>
          <YesNoChecks
            value={data.hasBeneficialOwner}
            onChange={(v) => update("hasBeneficialOwner", v)}
          />
        </div>

        {data.hasBeneficialOwner === "yes" && (
          <div className="space-y-4 pt-2">
            {data.beneficialOwnersList.map((owner, i) => (
              <RepeaterCard
                key={i}
                title={`Beneficial Owner ${i + 1}`}
                onRemove={
                  data.beneficialOwnersList.length > 1
                    ? () => removeOwner(i)
                    : undefined
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="First Name *"
                    value={owner.firstName}
                    onChange={(v) => updateOwner(i, { firstName: v })}
                  />
                  <Field
                    label="Last Name *"
                    value={owner.lastName}
                    onChange={(v) => updateOwner(i, { lastName: v })}
                  />
                  <Field
                    label="Date of Birth *"
                    value={owner.dob}
                    onChange={(v) => updateOwner(i, { dob: v })}
                    type="date"
                  />
                  <Field
                    label="Nationality *"
                    value={owner.nationality}
                    onChange={(v) => updateOwner(i, { nationality: v })}
                  />
                  <div className="sm:col-span-2">
                    <Field
                      label="Residential Address *"
                      value={owner.residentialAddress}
                      onChange={(v) =>
                        updateOwner(i, { residentialAddress: v })
                      }
                    />
                  </div>
                  <Field
                    label="Ownership Percentage *"
                    value={owner.ownershipPercentage}
                    onChange={(v) => updateOwner(i, { ownershipPercentage: v })}
                    placeholder="e.g. 30%"
                  />
                  <SelectField
                    label="Nature of Control *"
                    value={owner.natureOfControl}
                    options={natureOfControlOptions}
                    onChange={(v) => updateOwner(i, { natureOfControl: v })}
                  />
                </div>
              </RepeaterCard>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOwner}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Beneficial Owner
            </Button>
          </div>
        )}
      </section>

      <Separator />

      {/* ── Directors & Officers ── */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">
          Directors & Officers Information
        </h3>
        <p className="text-xs text-muted-foreground">
          List all directors, officers, and authorized signatories of the
          entity.
        </p>
        <div className="space-y-4">
          {data.directorsList.map((d, i) => (
            <RepeaterCard
              key={i}
              title={`Director / Officer ${i + 1}`}
              onRemove={() => removeDirector(i)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="First Name *"
                  value={d.firstName}
                  onChange={(v) => updateDirector(i, { firstName: v })}
                />
                <Field
                  label="Last Name *"
                  value={d.lastName}
                  onChange={(v) => updateDirector(i, { lastName: v })}
                />
                <Field
                  label="Title / Position *"
                  value={d.title}
                  onChange={(v) => updateDirector(i, { title: v })}
                />
                <Field
                  label="Date of Birth *"
                  value={d.dob}
                  onChange={(v) => updateDirector(i, { dob: v })}
                  type="date"
                />
                <Field
                  label="Nationality *"
                  value={d.nationality}
                  onChange={(v) => updateDirector(i, { nationality: v })}
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Residential Address *"
                    value={d.residentialAddress}
                    onChange={(v) =>
                      updateDirector(i, { residentialAddress: v })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <SelectField
                    label="PEP Status *"
                    value={d.pepStatus}
                    options={pepStatusOptions}
                    onChange={(v) => updateDirector(i, { pepStatus: v })}
                  />
                </div>
              </div>
            </RepeaterCard>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDirector}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Director / Officer
          </Button>
        </div>
      </section>

      <Separator />

      {/* ── Related Entities ── */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Related Entities Declaration</h3>
        <p className="text-xs text-muted-foreground">
          Disclose all entities where any shareholder owns 20% or more or
          exercises significant control.
        </p>
        <div>
          <Label className="text-xs mb-2 block">
            Does the entity have related entities to declare? *
          </Label>
          <YesNoChecks
            value={data.hasRelatedEntity}
            onChange={(v) => update("hasRelatedEntity", v)}
          />
        </div>

        {data.hasRelatedEntity === "yes" && (
          <div className="space-y-4 pt-2">
            {data.relatedEntitiesList.map((r, i) => (
              <RepeaterCard
                key={i}
                title={`Related Entity ${i + 1}`}
                onRemove={
                  data.relatedEntitiesList.length > 1
                    ? () => removeRelated(i)
                    : undefined
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Related Entity Name *"
                    value={r.entityName}
                    onChange={(v) => updateRelated(i, { entityName: v })}
                  />
                  <Field
                    label="Registration Number *"
                    value={r.registrationNumber}
                    onChange={(v) =>
                      updateRelated(i, { registrationNumber: v })
                    }
                  />
                  <Field
                    label="Jurisdiction of Incorporation *"
                    value={r.jurisdiction}
                    onChange={(v) => updateRelated(i, { jurisdiction: v })}
                  />
                  <Field
                    label="Business Activity *"
                    value={r.businessActivity}
                    onChange={(v) => updateRelated(i, { businessActivity: v })}
                  />
                  <Field
                    label="Name of Shareholder *"
                    value={r.shareholderName}
                    onChange={(v) => updateRelated(i, { shareholderName: v })}
                  />
                  <Field
                    label="Ownership Percentage *"
                    value={r.ownershipPercentage}
                    onChange={(v) =>
                      updateRelated(i, { ownershipPercentage: v })
                    }
                    placeholder="e.g. 25%"
                  />
                  <div className="sm:col-span-2">
                    <SelectField
                      label="Nature of Relationship *"
                      value={r.natureOfRelationship}
                      options={natureOfRelationshipOptions}
                      onChange={(v) =>
                        updateRelated(i, { natureOfRelationship: v })
                      }
                    />
                  </div>
                </div>
              </RepeaterCard>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRelated}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Related Entity
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
