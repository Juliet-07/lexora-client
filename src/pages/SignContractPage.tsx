import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Loader2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchContractByToken,
  submitContractComment,
  signContract,
  declineContract,
} from "@/lib/public-contract-api";

// ─────────────────────────────────────────────────────────────
// Public, unauthenticated page — reached via the contract email
// sent as part of KYC onboarding, before the person has any real
// login credentials. No dashboard shell wraps this. Registered at
// /sign-contract/:token.
// ─────────────────────────────────────────────────────────────

export default function SignContractPage() {
  const { token } = useParams<{ token: string }>();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState("");
  const [signOpen, setSignOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [declineReason, setDeclineReason] = useState("");

  const {
    data: contract,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["public-contract-by-token", token],
    queryFn: () => fetchContractByToken(token!),
    enabled: !!token,
    retry: false,
  });

  const commentMutation = useMutation({
    mutationFn: (message: string) => submitContractComment(token!, message),
    onSuccess: (updated) => {
      queryClient.setQueryData(["public-contract-by-token", token], updated);
      setCommentText("");
      toast.success("Your comment has been sent.");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed to send comment"),
  });

  const signMutation = useMutation({
    mutationFn: () => signContract(token!, signerName),
    onSuccess: (updated) => {
      queryClient.setQueryData(["public-contract-by-token", token], updated);
      setSignOpen(false);
      toast.success("Signed successfully.");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed to sign"),
  });

  const declineMutation = useMutation({
    mutationFn: () => declineContract(token!, declineReason || undefined),
    onSuccess: (updated) => {
      queryClient.setQueryData(["public-contract-by-token", token], updated);
      setDeclineOpen(false);
      toast.success("Response recorded.");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed to decline"),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <Card className="max-w-md w-full border-0 shadow-xl">
          <CardContent className="p-8 text-center space-y-3">
            <AlertTriangle className="h-8 w-8 text-warning mx-auto" />
            <h2 className="font-semibold">This link isn't valid</h2>
            <p className="text-sm text-muted-foreground">
              {(error as any)?.response?.data?.message ??
                "This signing link may have expired or already been used. Contact the firm that sent it for a new link."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isFinalized =
    contract.signatureStatus === "signed" ||
    contract.signatureStatus === "countersigned" ||
    contract.signatureStatus === "declined";

  const discussion = contract.interactions.filter(
    (i) => i.type === "comment" || i.type === "tenant_response",
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <FileSignature className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">{contract.title}</h1>
          <p className="text-sm text-muted-foreground">
            For {contract.counterparty}
          </p>
        </div>

        {(contract.signatureStatus === "signed" ||
          contract.signatureStatus === "countersigned") && (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
              <p className="text-sm">
                Signed on{" "}
                {new Date(contract.signature!.signedAt).toLocaleString()}.{" "}
                {contract.signatureStatus === "countersigned"
                  ? "Fully executed — you'll receive your login details and onboarding link by email shortly."
                  : "Waiting on the firm's countersignature. You'll receive your login details and onboarding link automatically once that's done."}
              </p>
            </CardContent>
          </Card>
        )}

        {contract.signatureStatus === "declined" && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 flex items-center gap-3">
              <XCircle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-sm">
                You declined this document. The firm has been notified.
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div
              className="text-sm leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: contract.renderedBody }}
            />
          </CardContent>
        </Card>

        {discussion.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Discussion
              </p>
              {discussion.map((i, idx) => (
                <div key={idx} className="flex gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium">
                      {i.actor === "signer" ? "You" : "The firm"} ·{" "}
                      <span className="text-muted-foreground">
                        {new Date(i.occurredAt).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="text-sm">{i.message}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {!isFinalized && (
          <>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-2">
                <Label className="text-xs">
                  Have a question or want to suggest a change?
                </Label>
                <Textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Leave a comment before signing…"
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
                    "Send Comment"
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                className="flex-1 gradient-primary"
                onClick={() => setSignOpen(true)}
              >
                <FileSignature className="h-4 w-4 mr-2" /> Review &amp; Sign
              </Button>
              <Button variant="outline" onClick={() => setDeclineOpen(true)}>
                Decline
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Sign dialog */}
      <Dialog open={signOpen} onOpenChange={setSignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your signature</DialogTitle>
            <DialogDescription>
              Typing your full name below constitutes your electronic signature
              on this document.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            <Label>Full legal name</Label>
            <Input
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder={contract.counterparty}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!signerName.trim() || signMutation.isPending}
              onClick={() => signMutation.mutate()}
              className="gradient-primary"
            >
              {signMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign Document"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline dialog */}
      <Dialog open={declineOpen} onOpenChange={setDeclineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline this document?</DialogTitle>
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
            <Button variant="outline" onClick={() => setDeclineOpen(false)}>
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
    </div>
  );
}
