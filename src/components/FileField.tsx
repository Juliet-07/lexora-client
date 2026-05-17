/**
 * FileField.tsx
 *
 * Reusable document upload component used in IdentificationStep
 * and anywhere else a file upload is needed in the onboarding form.
 *
 * Flow:
 *  1. User picks a file
 *  2. Component calls POST /client/onboarding/upload (multipart)
 *  3. Server saves file to ./uploads/onboarding/ and returns a URL
 *  4. Component calls onUploaded({ name, category, url, mimeType, size })
 *  5. Parent attaches it to the onboarding record via addDocument()
 */

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle, UploadCloud } from "lucide-react";
import { uploadDocument } from "@/pages/KYC/onboardingApi";
import type { DocumentAttachment } from "@/pages/KYC/onboardingApi";

interface Props {
  label: string;
  category: string; // identity | address_proof | corporate_doc | financial | beneficial_owner | other
  onUploaded: (doc: Omit<DocumentAttachment, "uploadedAt">) => void;
  onRemoved?: (url: string) => void;
  existingUrl?: string; // if a file was already uploaded (restoring from draft)
}

export function FileField({
  label,
  category,
  onUploaded,
  onRemoved,
  existingUrl,
}: Props) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">(
    existingUrl ? "done" : "idle",
  );
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(
    existingUrl ?? null,
  );
  const [errorMsg, setErrorMsg] = useState<string>("");
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

      // Notify parent — parent will call addDocument() to attach to the record
      onUploaded({
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
      // Reset input so they can try again
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    if (uploadedUrl && onRemoved) {
      onRemoved(uploadedUrl);
    }
    setUploadedUrl(null);
    setStatus("idle");
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>

      {status === "done" && uploadedUrl ? (
        // Uploaded — show filename + remove option
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
              className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        // Not uploaded yet
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
