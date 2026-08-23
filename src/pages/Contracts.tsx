import { useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileSignature,
  PenLine,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

type ContractStatus = "awaiting_signature" | "signed" | "expired";

interface Contract {
  id: string;
  ref: string;
  title: string;
  type: string;
  sentBy: string;
  sentOn: string;
  expiresOn: string;
  status: ContractStatus;
  signedOn?: string;
  summary: string;
  clauses: { heading: string; body: string }[];
}

const contracts: Contract[] = [
  {
    id: "c1",
    ref: "CTR-2026-014",
    title: "Engagement Letter — FY2026 Audit",
    type: "Engagement Letter",
    sentBy: "Amara Okonkwo",
    sentOn: "Aug 18, 2026",
    expiresOn: "Sep 1, 2026",
    status: "awaiting_signature",
    summary:
      "Terms of engagement for the statutory audit of the financial statements for the year ending 31 December 2026.",
    clauses: [
      {
        heading: "1. Scope of Services",
        body: "We will audit the financial statements in accordance with International Standards on Auditing and report our opinion to the members.",
      },
      {
        heading: "2. Responsibilities",
        body: "Management is responsible for the preparation of the financial statements and for maintaining adequate internal controls.",
      },
      {
        heading: "3. Fees",
        body: "Professional fees are based on time spent at our standard hourly rates, invoiced monthly as work progresses.",
      },
      {
        heading: "4. Confidentiality",
        body: "All information obtained in the course of the engagement will be treated as confidential and used solely for the purpose of the engagement.",
      },
    ],
  },
  {
    id: "c2",
    ref: "CTR-2026-011",
    title: "Tax Advisory Retainer Agreement",
    type: "Retainer",
    sentBy: "Daniel Mugisha",
    sentOn: "Aug 4, 2026",
    expiresOn: "Aug 25, 2026",
    status: "awaiting_signature",
    summary:
      "Twelve-month retainer covering corporate tax compliance, filings and ad-hoc advisory support.",
    clauses: [
      {
        heading: "1. Retainer Period",
        body: "This agreement runs for twelve months from the date of signature and renews by mutual written consent.",
      },
      {
        heading: "2. Included Services",
        body: "Preparation and submission of statutory tax returns, correspondence with the revenue authority and quarterly advisory calls.",
      },
      {
        heading: "3. Termination",
        body: "Either party may terminate with thirty days written notice. Fees for work performed remain payable.",
      },
    ],
  },
  {
    id: "c3",
    ref: "CTR-2026-006",
    title: "Non-Disclosure Agreement",
    type: "NDA",
    sentBy: "Amara Okonkwo",
    sentOn: "Jun 12, 2026",
    expiresOn: "Jun 30, 2026",
    status: "signed",
    signedOn: "Jun 14, 2026",
    summary:
      "Mutual non-disclosure covering information exchanged during the advisory relationship.",
    clauses: [
      {
        heading: "1. Confidential Information",
        body: "Any non-public information disclosed by either party, in any form, is treated as confidential.",
      },
      {
        heading: "2. Duration",
        body: "Obligations survive for three years following the conclusion of the engagement.",
      },
    ],
  },
  {
    id: "c4",
    ref: "CTR-2025-042",
    title: "Payroll Outsourcing Addendum",
    type: "Addendum",
    sentBy: "Grace Uwase",
    sentOn: "Nov 2, 2025",
    expiresOn: "Nov 20, 2025",
    status: "expired",
    summary:
      "Addendum extending the scope of services to monthly payroll processing and filings.",
    clauses: [
      {
        heading: "1. Additional Services",
        body: "Monthly payroll computation, payslip issuance and statutory deduction filings.",
      },
    ],
  },
];

const statusMeta: Record<
  ContractStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  awaiting_signature: {
    label: "Awaiting Signature",
    className: "bg-warning/10 text-warning border-warning/20",
    icon: <PenLine className="h-3.5 w-3.5" />,
  },
  signed: {
    label: "Signed",
    className: "bg-success/10 text-success border-success/20",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  expired: {
    label: "Expired",
    className: "bg-muted text-muted-foreground border-border",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
};

export default function Contracts() {
  const [signedIds, setSignedIds] = useState<string[]>([]);
  const [viewing, setViewing] = useState<Contract | null>(null);
  const [signing, setSigning] = useState<Contract | null>(null);
  const [fullName, setFullName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [done, setDone] = useState(false);

  const statusOf = (c: Contract): ContractStatus =>
    signedIds.includes(c.id) ? "signed" : c.status;

  const openSign = (c: Contract) => {
    setSigning(c);
    setFullName("");
    setAgreed(false);
    setDone(false);
  };

  const confirmSign = () => {
    if (!signing) return;
    setSignedIds((prev) => [...prev, signing.id]);
    setDone(true);
  };

  const pending = contracts.filter((c) => statusOf(c) === "awaiting_signature");
  const signed = contracts.filter((c) => statusOf(c) === "signed");

  const renderList = (list: Contract[]) => (
    <Card>
      <CardContent className="p-0">
        {list.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No contracts here yet.
          </p>
        ) : (
          <div className="divide-y">
            {list.map((c) => {
              const status = statusOf(c);
              const meta = statusMeta[status];
              return (
                <div
                  key={c.id}
                  className="flex flex-col gap-3 p-4 transition-colors hover:bg-accent/30 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileSignature className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {c.title}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{c.ref}</span>
                      <span>•</span>
                      <span>{c.type}</span>
                      <span>•</span>
                      <span>Sent {c.sentOn}</span>
                      {status === "signed" && c.signedOn && (
                        <>
                          <span>•</span>
                          <span>Signed {c.signedOn}</span>
                        </>
                      )}
                      {status === "awaiting_signature" && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-warning">
                            <CalendarDays className="h-3 w-3" /> Expires{" "}
                            {c.expiresOn}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${meta.className} shrink-0 gap-1`}
                  >
                    {meta.icon}
                    <span>{meta.label}</span>
                  </Badge>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => setViewing(c)}
                      aria-label={`View ${c.title}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      aria-label={`Download ${c.title}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {status === "awaiting_signature" && (
                      <Button
                        size="sm"
                        className="h-8 gradient-primary text-xs text-primary-foreground"
                        onClick={() => openSign(c)}
                      >
                        <PenLine className="mr-1 h-3 w-3" /> Sign
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <PortalLayout
      title="Contracts"
      subtitle="Review and electronically sign contracts sent to you"
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Awaiting your signature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-2xl font-bold text-warning">
                {pending.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Signed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-2xl font-bold text-success">
                {signed.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total contracts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-2xl font-bold text-foreground">
                {contracts.length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Awaiting Signature</TabsTrigger>
            <TabsTrigger value="signed">Signed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4">
            {renderList(pending)}
          </TabsContent>
          <TabsContent value="signed" className="mt-4">
            {renderList(signed)}
          </TabsContent>
          <TabsContent value="all" className="mt-4">
            {renderList(contracts)}
          </TabsContent>
        </Tabs>
      </div>

      {/* Viewer */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">{viewing?.title}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{viewing.ref}</Badge>
                <span>Sent by {viewing.sentBy}</span>
                <span>•</span>
                <span>{viewing.sentOn}</span>
              </div>
              <p className="text-sm text-muted-foreground">{viewing.summary}</p>
              <div className="max-h-[45vh] space-y-4 overflow-y-auto rounded-lg border bg-muted/40 p-4">
                {viewing.clauses.map((cl) => (
                  <div key={cl.heading} className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {cl.heading}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {cl.body}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setViewing(null)}>
                  Close
                </Button>
                {statusOf(viewing) === "awaiting_signature" && (
                  <Button
                    className="gradient-primary text-primary-foreground"
                    onClick={() => {
                      const c = viewing;
                      setViewing(null);
                      openSign(c);
                    }}
                  >
                    <PenLine className="mr-2 h-4 w-4" /> Sign Contract
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sign dialog */}
      <Dialog open={!!signing} onOpenChange={(o) => !o && setSigning(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Sign Contract</DialogTitle>
          </DialogHeader>
          {signing && !done ? (
            <div className="space-y-6">
              <div className="rounded-lg border bg-muted/50 p-6 text-center">
                <FileSignature className="mx-auto mb-3 h-12 w-12 text-primary" />
                <p className="font-medium text-foreground">{signing.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {signing.ref} • Expires {signing.expiresOn}
                </p>
              </div>
              <div className="space-y-3">
                <label
                  htmlFor="signature"
                  className="text-sm font-medium text-foreground"
                >
                  Type your full name to sign
                </label>
                <Input
                  id="signature"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="text-center font-heading text-lg italic"
                />
              </div>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="contract-agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 accent-primary"
                />
                <label
                  htmlFor="contract-agree"
                  className="text-xs text-muted-foreground"
                >
                  I have read and agree to the terms of this contract, and
                  accept that this electronic signature is the legal equivalent
                  of my manual signature.
                </label>
              </div>
              <Button
                className="w-full gradient-primary text-primary-foreground"
                disabled={fullName.trim().length < 3 || !agreed}
                onClick={confirmSign}
              >
                <PenLine className="mr-2 h-4 w-4" /> Sign Contract
              </Button>
              <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3" /> Signature timestamped and
                recorded in the audit trail
              </p>
            </div>
          ) : (
            <div className="space-y-3 py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <p className="font-heading text-lg font-bold text-foreground">
                Contract Signed
              </p>
              <p className="text-sm text-muted-foreground">
                {signing?.title} has been signed and a copy is available for
                download.
              </p>
              <Button variant="outline" onClick={() => setSigning(null)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
