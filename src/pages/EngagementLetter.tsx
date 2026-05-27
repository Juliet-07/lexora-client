import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
} from "lucide-react";
import axios from "axios";

const apiURL = import.meta.env.VITE_REACT_APP_BASE_URL;

// ─────────────────────────────────────────────────────────────
// API — no auth header needed, these are public endpoints
// ─────────────────────────────────────────────────────────────

const fetchLetterByToken = async (token: string) => {
  const res = await axios.get(`${apiURL}/tenant/engagement/sign/${token}`);
  return res.data?.data ?? res.data;
};

const submitSigning = async ({
  token,
  confirmedName,
}: {
  token: string;
  confirmedName: string;
}) => {
  const res = await axios.post(`${apiURL}/tenant/engagement/sign/${token}`, {
    confirmedName,
  });
  return res.data?.data ?? res.data;
};

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function EngagementLetter() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [accepted, setAccepted] = useState(false);
  const [confirmedName, setConfirmedName] = useState("");
  const [signed, setSigned] = useState(false);

  // ── Fetch letter content ──────────────────────────────────
  const {
    data: letter,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["engagement-letter", token],
    queryFn: () => fetchLetterByToken(token!),
    enabled: !!token,
    retry: false,
  });

  // ── Sign mutation ─────────────────────────────────────────
  const signMutation = useMutation({
    mutationFn: submitSigning,
    onSuccess: () => {
      setSigned(true);
    },
  });

  const handleSign = () => {
    if (!confirmedName.trim() || !accepted || !token) return;
    signMutation.mutate({ token, confirmedName });
  };

  // ── Derive error type from response ──────────────────────
  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as any)?.message ?? null;

  const isAlreadySigned = errorMessage
    ?.toLowerCase()
    .includes("already been signed");
  const isExpired =
    errorMessage?.toLowerCase().includes("expired") ||
    errorMessage?.toLowerCase().includes("invalid");

  // ─────────────────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────────────────

  // No token in URL
  if (!token) {
    return <ErrorScreen type="invalid" />;
  }

  // Loading
  if (isLoading) {
    return (
      <FullPageCenter>
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">
          Verifying your invitation…
        </p>
      </FullPageCenter>
    );
  }

  // Already signed
  if (isAlreadySigned) {
    return <ErrorScreen type="already-signed" />;
  }

  // Expired or invalid
  if (error || isExpired) {
    return (
      <ErrorScreen type="expired" tenantName={letter?.tenantBusinessName} />
    );
  }

  // ── SUCCESS — signed ──────────────────────────────────────
  if (signed) {
    return (
      <FullPageCenter>
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold">Thank you!</h2>
          <p className="text-muted-foreground">
            Your engagement letter has been signed. A signed copy has been sent
            to your email.
          </p>
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-sm text-left space-y-1">
            <p className="font-medium">What happens next:</p>
            <ul className="text-muted-foreground space-y-1 list-disc pl-4">
              <li>
                You will receive your login credentials in a separate email
                shortly
              </li>
              <li>
                Use those credentials to log in and complete your onboarding
              </li>
            </ul>
          </div>
          <Button
            className="w-full gradient-primary"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </Button>
        </div>
      </FullPageCenter>
    );
  }

  // ── MAIN — document view + signing form ───────────────────
  const docTypeLabel =
    letter?.document?.documentType === "engagement_letter"
      ? "Engagement Letter"
      : "Terms & Agreement";

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Private & Confidential
              </p>
              <h1 className="text-xl md:text-2xl font-bold">
                {letter?.document?.title ?? docTypeLabel}
              </h1>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p className="font-medium">{letter?.tenantBusinessName}</p>
            <p className="flex items-center gap-1 justify-end">
              <Clock className="h-3 w-3" />
              Expires{" "}
              {letter?.expiresAt
                ? new Date(letter.expiresAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>

        {/* Welcome note */}
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-sm">
          <p>
            Hello <strong>{letter?.clientName}</strong>,{" "}
            <strong>{letter?.tenantBusinessName}</strong> has invited you to
            review and sign your {docTypeLabel.toLowerCase()} before getting
            started.{" "}
            <span className="text-muted-foreground">
              You will receive your login credentials once you sign.
            </span>
          </p>
        </div>

        {/* Document card */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-0">
            {/* PDF viewer — render in iframe */}
            <div className="relative w-full" style={{ height: "60vh" }}>
              {letter?.document?.pdfUrl ? (
                <iframe
                  src={letter.document.pdfUrl}
                  className="w-full h-full rounded-t-xl border-b"
                  title={letter.document.title}
                />
              ) : (
                // Fallback if PDF URL not available
                <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30 rounded-t-xl border-b gap-3">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Document preview unavailable.
                  </p>
                  {letter?.document?.pdfUrl && (
                    <a
                      href={letter.document.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary underline"
                    >
                      Open document in new tab →
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Signing form */}
            <div className="border-t p-6 space-y-5 bg-muted/30">
              {/* Consent checkbox */}
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={accepted}
                  onCheckedChange={(v) => setAccepted(v === true)}
                  className="mt-0.5"
                />
                <span className="text-sm text-foreground">
                  I confirm I have read and understood this{" "}
                  <strong>{docTypeLabel}</strong> and I accept its terms on
                  behalf of myself or the entity I represent.
                </span>
              </label>

              {/* Full name input */}
              <div className="space-y-2">
                <Label htmlFor="confirmedName">
                  Type your full name to confirm your signature
                </Label>
                <Input
                  id="confirmedName"
                  value={confirmedName}
                  onChange={(e) => setConfirmedName(e.target.value)}
                  placeholder={letter?.clientName ?? "Your full name"}
                  disabled={!accepted}
                  className="max-w-sm"
                />
                {accepted && confirmedName.trim() && (
                  <p className="text-xs text-muted-foreground italic">
                    Signing as: "{confirmedName.trim()}"
                  </p>
                )}
              </div>

              {/* Error from mutation */}
              {signMutation.isError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    {(signMutation.error as any)?.response?.data?.message ??
                      "Something went wrong. Please try again."}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <p className="text-xs text-muted-foreground">
                  By signing, you acknowledge that this constitutes a valid
                  electronic signature and a signed copy will be emailed to you.
                </p>
                <Button
                  className="gradient-primary shrink-0"
                  disabled={
                    !accepted || !confirmedName.trim() || signMutation.isPending
                  }
                  onClick={handleSign}
                >
                  {signMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Sign Engagement Letter
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Powered by Lexora · Acceptance is recorded with timestamp and IP
          address for compliance purposes.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function FullPageCenter({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="text-center">{children}</div>
    </div>
  );
}

function ErrorScreen({
  type,
  tenantName,
}: {
  type: "invalid" | "expired" | "already-signed";
  tenantName?: string;
}) {
  const configs = {
    invalid: {
      icon: AlertTriangle,
      iconClass: "text-destructive",
      bgClass: "bg-destructive/10",
      title: "Invalid Link",
      message:
        "This invitation link is invalid or could not be found. Please contact your advisor for a new link.",
    },
    expired: {
      icon: Clock,
      iconClass: "text-amber-600",
      bgClass: "bg-amber-100",
      title: "Link Expired",
      message: `This invitation link has expired. Please contact ${tenantName ?? "your advisor"} to request a new signing link.`,
    },
    "already-signed": {
      icon: CheckCircle2,
      iconClass: "text-emerald-600",
      bgClass: "bg-emerald-100",
      title: "Already Signed",
      message:
        "You have already signed this engagement letter. Check your email for your signed copy and login credentials.",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <FullPageCenter>
      <div className="w-full max-w-sm space-y-4">
        <div
          className={`mx-auto h-16 w-16 rounded-full ${config.bgClass} flex items-center justify-center`}
        >
          <Icon className={`h-8 w-8 ${config.iconClass}`} />
        </div>
        <h2 className="text-xl font-bold">{config.title}</h2>
        <p className="text-sm text-muted-foreground">{config.message}</p>
      </div>
    </FullPageCenter>
  );
}
