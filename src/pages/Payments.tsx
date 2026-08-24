import { PortalLayout } from "@/components/PortalLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DollarSign,
  Clock,
  CheckCircle2,
  Download,
  FileText,
  AlertCircle,
  Landmark,
  ThumbsUp,
  Flag,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMyInvoices,
  fetchMyInvoice,
  downloadMyInvoicePdf,
  markInvoiceStatus,
  balanceOwed,
  daysOverdue,
  type ClientInvoice,
  type ClientInvoiceStage,
  type ClientInvoiceAction,
} from "@/lib/invoices-api";
import { useToast } from "@/hooks/use-toast";

const money = (n: number, c = "USD") =>
  n.toLocaleString(undefined, {
    style: "currency",
    currency: c,
    maximumFractionDigits: 2,
  });

const invoiceStatusStyles: Record<ClientInvoiceStage, string> = {
  Sent: "bg-warning/10 text-warning border-warning/20",
  "Part Paid": "bg-info/10 text-info border-info/20",
  Paid: "bg-success/10 text-success border-success/20",
  Overdue: "bg-destructive/10 text-destructive border-destructive/20",
  "Written Off": "bg-muted text-muted-foreground border-border",
};

export default function Payments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["myInvoices"],
    queryFn: fetchMyInvoices,
  });

  const [detailId, setDetailId] = useState<string | null>(null);
  const { data: detail } = useQuery({
    queryKey: ["myInvoice", detailId],
    queryFn: () => fetchMyInvoice(detailId!),
    enabled: !!detailId,
  });

  const downloadMut = useMutation({
    mutationFn: ({ id, ref }: { id: string; ref: string }) =>
      downloadMyInvoicePdf(id, ref),
    onError: () =>
      toast({ title: "Failed to download", variant: "destructive" }),
  });

  // ── Client claim — "I've paid" / "there's an issue" ──────────
  const [claimTarget, setClaimTarget] = useState<{
    action: ClientInvoiceAction;
  } | null>(null);
  const [claimNote, setClaimNote] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const claimMut = useMutation({
    mutationFn: () =>
      markInvoiceStatus(
        detail!._id,
        claimTarget!.action,
        claimNote || undefined,
        claimTarget?.action === "Paid" ? (proofFile ?? undefined) : undefined,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myInvoice", detailId] });
      queryClient.invalidateQueries({ queryKey: ["myInvoices"] });
      setClaimTarget(null);
      setClaimNote("");
      setProofFile(null);
      toast({
        title:
          claimTarget?.action === "Paid" ? "Marked as paid" : "Issue reported",
        description:
          "The firm has been notified and will confirm on their end.",
      });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  // Real totals computed from real invoice data — no separate
  // number the firm's own books could ever disagree with. "Paid
  // this month" isn't shown since that needs real payment
  // timestamps this view doesn't have; totals here stay honest
  // about what's actually knowable from the invoice list alone.
  const totalDue = invoices
    .filter((i) => i.stage !== "Paid" && i.stage !== "Written Off")
    .reduce((s, i) => s + balanceOwed(i), 0);
  const overdueAmount = invoices
    .filter((i) => i.stage === "Overdue")
    .reduce((s, i) => s + balanceOwed(i), 0);
  const overdueCount = invoices.filter((i) => i.stage === "Overdue").length;
  const totalPaid = invoices.reduce((s, i) => s + i.paidAmount, 0);
  const dueCount = invoices.filter(
    (i) => i.stage !== "Paid" && i.stage !== "Written Off",
  ).length;

  const currency = invoices[0]?.currency ?? "USD";
  const canClaim =
    detail && detail.stage !== "Paid" && detail.stage !== "Written Off";

  return (
    <PortalLayout
      title="Billing & Invoices"
      subtitle="View invoices issued to you and update their status"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Due"
            value={money(totalDue, currency)}
            subtitle={`${dueCount} invoice${dueCount === 1 ? "" : "s"}`}
            icon={DollarSign}
            variant="warning"
          />
          <StatCard
            title="Overdue"
            value={money(overdueAmount, currency)}
            subtitle={`${overdueCount} invoice${overdueCount === 1 ? "" : "s"}`}
            icon={Clock}
            variant="primary"
          />
          <StatCard
            title="Total Paid"
            value={money(totalPaid, currency)}
            subtitle="All time"
            icon={CheckCircle2}
            variant="success"
          />
          <StatCard
            title="Total Invoices"
            value={`${invoices.length}`}
            subtitle="Issued to you"
            icon={FileText}
          />
        </div>

        {overdueCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            You have {overdueCount} overdue invoice
            {overdueCount === 1 ? "" : "s"} totalling{" "}
            {money(overdueAmount, currency)}.
          </div>
        )}

        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading">Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading && (
              <p className="p-6 text-center text-sm text-muted-foreground">
                Loading...
              </p>
            )}
            {!isLoading && !invoices.length && (
              <p className="p-6 text-center text-sm text-muted-foreground">
                No invoices have been issued to you yet.
              </p>
            )}
            <div className="divide-y">
              {invoices.map((inv) => (
                <button
                  key={inv._id}
                  className="w-full flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors text-left"
                  onClick={() => setDetailId(inv._id)}
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {inv.ref}
                      </p>
                      <Badge
                        variant="outline"
                        className={invoiceStatusStyles[inv.stage]}
                      >
                        {inv.stage}
                      </Badge>
                      {!inv.openedByClient && (
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/20"
                        >
                          New
                        </Badge>
                      )}
                      {inv.clientAction && (
                        <Badge
                          variant="outline"
                          className={
                            inv.clientAction === "Paid"
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-warning/10 text-warning border-warning/20"
                          }
                        >
                          {inv.clientAction === "Paid"
                            ? "You marked paid"
                            : "Issue reported"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {inv.mandateName} • Due{" "}
                      {new Date(inv.dueOn).toLocaleDateString()}
                      {inv.stage === "Overdue" &&
                        ` • ${daysOverdue(inv.dueOn)} days overdue`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-heading font-bold text-foreground">
                      {money(inv.payable, inv.currency)}
                    </p>
                    {balanceOwed(inv) > 0 && balanceOwed(inv) < inv.payable && (
                      <p className="text-xs text-muted-foreground">
                        {money(balanceOwed(inv), inv.currency)} owing
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadMut.mutate({ id: inv._id, ref: inv.ref });
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice detail */}
      <Dialog open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">{detail?.ref}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={invoiceStatusStyles[detail.stage]}
                >
                  {detail.stage}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Due {new Date(detail.dueOn).toLocaleDateString()}
                </p>
              </div>

              <div className="rounded-lg border divide-y">
                {detail.lines.map((l) => (
                  <div
                    key={l._id}
                    className="flex items-center justify-between p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{l.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.qty} × {money(l.unit, detail.currency)}
                      </p>
                    </div>
                    <p className="font-medium">
                      {money(l.qty * l.unit, detail.currency)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Net</span>
                  <span>{money(detail.net, detail.currency)}</span>
                </div>
                {detail.vat > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      VAT ({detail.vatRate}%)
                    </span>
                    <span>{money(detail.vat, detail.currency)}</span>
                  </div>
                )}
                {detail.wht > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      WHT ({detail.whtRate}%)
                    </span>
                    <span>-{money(detail.wht, detail.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-1 font-semibold">
                  <span>Total payable</span>
                  <span>{money(detail.payable, detail.currency)}</span>
                </div>
                {detail.paidAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Paid</span>
                    <span>{money(detail.paidAmount, detail.currency)}</span>
                  </div>
                )}
                {balanceOwed(detail) > 0 && (
                  <div className="flex justify-between font-semibold text-warning">
                    <span>Balance owing</span>
                    <span>{money(balanceOwed(detail), detail.currency)}</span>
                  </div>
                )}
              </div>

              {/* How to pay — the firm's own real bank details, not a Pay Now button */}
              {balanceOwed(detail) > 0 &&
                detail.remittanceAccounts &&
                detail.remittanceAccounts.length > 0 && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Landmark className="h-3.5 w-3.5" /> How to pay
                    </p>
                    {detail.remittanceAccounts.map((a) => (
                      <div key={a._id} className="text-sm">
                        <p className="font-medium">{a.accountName}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.bankName} · {a.accountNumber} · {a.currency}
                          {a.branchCode && ` · Branch ${a.branchCode}`}
                          {a.swiftCode && ` · SWIFT ${a.swiftCode}`}
                        </p>
                      </div>
                    ))}
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Pay by bank transfer or mobile money to the account above,
                      then mark this invoice as paid below so the firm can
                      confirm receipt.
                    </p>
                  </div>
                )}

              {detail.clientAction && (
                <div
                  className={`rounded-lg border p-3 text-sm ${detail.clientAction === "Paid" ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"}`}
                >
                  <p className="font-medium">
                    {detail.clientAction === "Paid"
                      ? "You marked this as paid"
                      : "You reported an issue"}
                  </p>
                  {detail.clientActionNote && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      "{detail.clientActionNote}"
                    </p>
                  )}
                  {detail.proofOfPaymentUrl && (
                    <a
                      href={detail.proofOfPaymentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-primary underline"
                    >
                      <FileText className="h-3 w-3" />
                      {detail.proofOfPaymentFileName || "View proof of payment"}
                    </a>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {detail.clientActionAt &&
                      new Date(detail.clientActionAt).toLocaleString()}{" "}
                    — waiting for the firm to confirm
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    downloadMut.mutate({ id: detail._id, ref: detail.ref })
                  }
                >
                  <Download className="mr-2 h-4 w-4" /> PDF
                </Button>
                {canClaim && (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 text-success"
                      onClick={() => {
                        setClaimTarget({ action: "Paid" });
                        setClaimNote("");
                        setProofFile(null);
                      }}
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" /> Mark as paid
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-warning"
                      onClick={() => {
                        setClaimTarget({ action: "Cancelled" });
                        setClaimNote("");
                        setProofFile(null);
                      }}
                    >
                      <Flag className="mr-2 h-4 w-4" /> Report an issue
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm claim */}
      <Dialog
        open={!!claimTarget}
        onOpenChange={(o) => !o && setClaimTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {claimTarget?.action === "Paid"
                ? "Mark as paid?"
                : "Report an issue"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {claimTarget?.action === "Paid"
                ? "This tells the firm you've sent payment. They'll confirm receipt on their end once it's verified."
                : "Let the firm know what's wrong with this invoice — they'll follow up with you."}
            </p>
            <Textarea
              placeholder={
                claimTarget?.action === "Paid"
                  ? "Optional note, e.g. payment reference"
                  : "What's the issue?"
              }
              value={claimNote}
              onChange={(e) => setClaimNote(e.target.value)}
              rows={3}
            />
            {claimTarget?.action === "Paid" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Proof of payment (optional)
                </label>
                <Input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                />
                <p className="text-[11px] text-muted-foreground">
                  A receipt or transfer confirmation helps the firm verify
                  faster. PDF or image, up to 10MB.
                </p>
                {proofFile && (
                  <p className="text-xs text-muted-foreground">
                    {proofFile.name} ·{" "}
                    {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClaimTarget(null)}>
              Cancel
            </Button>
            <Button
              disabled={claimMut.isPending}
              onClick={() => claimMut.mutate()}
            >
              {claimTarget?.action === "Paid" ? "Confirm paid" : "Send report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
