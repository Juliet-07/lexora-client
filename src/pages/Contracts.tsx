import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FileSignature,
  PenLine,
  Eye,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
  Loader2,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchMyContracts,
  fetchMyContract,
  submitContractComment,
  signContract,
  declineContract,
  type Contract,
} from "@/lib/contract-api";

type DisplayStatus = "awaiting_signature" | "signed" | "declined";

const statusMeta: Record<
  DisplayStatus,
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
  declined: {
    label: "Declined",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

const displayStatusOf = (c: Contract): DisplayStatus => {
  if (c.signatureStatus === "declined") return "declined";
  if (c.signatureStatus === "signed" || c.signatureStatus === "countersigned")
    return "signed";
  return "awaiting_signature";
};

export default function Contracts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["my-contracts"],
    queryFn: fetchMyContracts,
  });

  const [viewingId, setViewingId] = useState<string | null>(null);
  const [signing, setSigning] = useState<Contract | null>(null);
  const [declining, setDeclining] = useState<Contract | null>(null);
  const [fullName, setFullName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signDone, setSignDone] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [commentText, setCommentText] = useState("");

  const { data: viewing } = useQuery({
    queryKey: ["my-contract", viewingId],
    queryFn: () => fetchMyContract(viewingId!),
    enabled: !!viewingId,
  });

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: ["my-contracts"] });

  const commentMutation = useMutation({
    mutationFn: (message: string) => submitContractComment(viewingId!, message),
    onSuccess: (updated) => {
      queryClient.setQueryData(["my-contract", viewingId], updated);
      setCommentText("");
      toast({ title: "Comment sent" });
    },
    onError: (err: any) =>
      toast({
        title: "Failed to send comment",
        description: err?.response?.data?.message,
        variant: "destructive",
      }),
  });

  const signMutation = useMutation({
    mutationFn: () => signContract(signing!._id, { signerName: fullName }),
    onSuccess: () => {
      invalidateList();
      setSignDone(true);
    },
    onError: (err: any) =>
      toast({
        title: "Failed to sign",
        description: err?.response?.data?.message,
        variant: "destructive",
      }),
  });

  const declineMutation = useMutation({
    mutationFn: () =>
      declineContract(declining!._id, declineReason || undefined),
    onSuccess: () => {
      invalidateList();
      setDeclining(null);
      setDeclineReason("");
      toast({ title: "Response recorded" });
    },
    onError: (err: any) =>
      toast({
        title: "Failed to decline",
        description: err?.response?.data?.message,
        variant: "destructive",
      }),
  });

  const openSign = (c: Contract) => {
    setSigning(c);
    setFullName("");
    setAgreed(false);
    setSignDone(false);
  };

  const pending = contracts.filter(
    (c) => displayStatusOf(c) === "awaiting_signature",
  );
  const signed = contracts.filter((c) => displayStatusOf(c) === "signed");

  const renderList = (list: Contract[]) => (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Loading…
          </p>
        ) : list.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No contracts here yet.
          </p>
        ) : (
          <div className="divide-y">
            {list.map((c) => {
              const status = displayStatusOf(c);
              const meta = statusMeta[status];
              const sentInteraction = [...c.interactions]
                .reverse()
                .find((i) => i.type === "sent" || i.type === "resent");
              return (
                <div
                  key={c._id}
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
                      {sentInteraction && (
                        <>
                          <span>•</span>
                          <span>
                            Sent{" "}
                            {new Date(
                              sentInteraction.occurredAt,
                            ).toLocaleDateString()}
                          </span>
                        </>
                      )}
                      {status === "signed" && c.signature && (
                        <>
                          <span>•</span>
                          <span>
                            Signed{" "}
                            {new Date(
                              c.signature.signedAt,
                            ).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`gap-1 ${meta.className}`}
                  >
                    {meta.icon}
                    {meta.label}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      aria-label={`View ${c.title}`}
                      onClick={() => setViewingId(c._id)}
                    >
                      <Eye className="h-4 w-4" />
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
      subtitle="Review, sign, and leave feedback on contracts sent to you"
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

      {/* Viewer — includes real discussion/comments */}
      <Dialog open={!!viewingId} onOpenChange={(o) => !o && setViewingId(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">{viewing?.title}</DialogTitle>
          </DialogHeader>
          {viewing ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{viewing.ref}</Badge>
                <span>{viewing.type}</span>
              </div>

              {viewing.signatureStatus === "declined" && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
                  <XCircle className="h-4 w-4 text-destructive shrink-0" />
                  <p>
                    You declined this document.
                    {viewing.declineReason &&
                      ` Reason: ${viewing.declineReason}`}
                  </p>
                </div>
              )}
              {(viewing.signatureStatus === "signed" ||
                viewing.signatureStatus === "countersigned") && (
                <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/5 p-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  <p>
                    Signed on{" "}
                    {new Date(viewing.signature!.signedAt).toLocaleString()}.{" "}
                    {viewing.signatureStatus === "countersigned"
                      ? "Fully executed."
                      : "Waiting on the firm's countersignature."}
                  </p>
                </div>
              )}

              <div
                className="max-h-[40vh] space-y-4 overflow-y-auto rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: viewing.renderedBody }}
              />

              {viewing.interactions.some(
                (i) => i.type === "comment" || i.type === "tenant_response",
              ) && (
                <div className="space-y-3 rounded-lg border p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Discussion
                  </p>
                  {viewing.interactions
                    .filter(
                      (i) =>
                        i.type === "comment" || i.type === "tenant_response",
                    )
                    .map((i, idx) => (
                      <div key={idx} className="flex gap-2">
                        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium">
                            {i.actor === "signer" ? "You" : "Firm"} ·{" "}
                            <span className="text-muted-foreground">
                              {new Date(i.occurredAt).toLocaleDateString()}
                            </span>
                          </p>
                          <p className="text-sm">{i.message}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {viewing.signatureStatus === "sent" && (
                <div className="space-y-2">
                  <Label className="text-xs">
                    Have a question or want to suggest a change?
                  </Label>
                  <Textarea
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Leave a comment…"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!commentText.trim() || commentMutation.isPending}
                    onClick={() => commentMutation.mutate(commentText)}
                  >
                    {commentMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Send comment"
                    )}
                  </Button>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setViewingId(null)}>
                  Close
                </Button>
                {viewing.signatureStatus === "sent" && (
                  <>
                    <Button
                      variant="outline"
                      className="text-destructive"
                      onClick={() => {
                        setDeclining(viewing);
                        setViewingId(null);
                      }}
                    >
                      Decline
                    </Button>
                    <Button
                      className="gradient-primary text-primary-foreground"
                      onClick={() => {
                        const c = viewing;
                        setViewingId(null);
                        openSign(c);
                      }}
                    >
                      <PenLine className="mr-2 h-4 w-4" /> Sign Contract
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
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
          {signing && !signDone ? (
            <div className="space-y-6">
              <div className="rounded-lg border bg-muted/50 p-6 text-center">
                <FileSignature className="mx-auto mb-3 h-12 w-12 text-primary" />
                <p className="font-medium text-foreground">{signing.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {signing.ref}
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
                disabled={
                  fullName.trim().length < 3 ||
                  !agreed ||
                  signMutation.isPending
                }
                onClick={() => signMutation.mutate()}
              >
                {signMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PenLine className="mr-2 h-4 w-4" />
                )}
                Sign Contract
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
                {signing?.title} has been signed.
              </p>
              <Button variant="outline" onClick={() => setSigning(null)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Decline dialog */}
      <Dialog open={!!declining} onOpenChange={(o) => !o && setDeclining(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              Decline this contract?
            </DialogTitle>
            <DialogDescription>The firm will be notified.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            <Label>Reason (optional)</Label>
            <Textarea
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclining(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={declineMutation.isPending}
              onClick={() => declineMutation.mutate()}
            >
              {declineMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Decline"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
