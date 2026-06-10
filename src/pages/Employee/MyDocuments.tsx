import { useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Download, FileSignature, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Policy {
  id: string;
  title: string;
  version: string;
  updated: string;
  acknowledged: boolean;
}

const contracts = [
  { id: "C1", name: "Employment Contract", date: "2024-03-01", file: "contract.pdf" },
  { id: "C2", name: "NDA & IP Agreement", date: "2024-03-01", file: "nda.pdf" },
];

const initialPolicies: Policy[] = [
  { id: "P1", title: "Code of Conduct", version: "v3.1", updated: "2026-05-01", acknowledged: false },
  { id: "P2", title: "Information Security Policy", version: "v2.4", updated: "2026-04-15", acknowledged: true },
  { id: "P3", title: "Remote Work Policy", version: "v1.2", updated: "2026-03-20", acknowledged: true },
  { id: "P4", title: "Anti-Harassment Policy", version: "v2.0", updated: "2026-02-10", acknowledged: false },
];

const letters = [
  { id: "L1", name: "Employment Confirmation Letter", date: "2025-04-01", file: "confirmation.pdf" },
  { id: "L2", name: "Promotion Letter — Senior Analyst", date: "2024-09-15", file: "promotion.pdf" },
  { id: "L3", name: "2026 Salary Review", date: "2026-01-15", file: "salary-review.pdf" },
];

export default function MyDocuments() {
  const [policies, setPolicies] = useState(initialPolicies);
  const [signing, setSigning] = useState<Policy | null>(null);
  const [agree, setAgree] = useState(false);
  const [signature, setSignature] = useState("");

  const acknowledge = () => {
    if (!signing || !agree || !signature.trim()) return;
    setPolicies(policies.map((p) => (p.id === signing.id ? { ...p, acknowledged: true } : p)));
    setSigning(null);
    setAgree(false);
    setSignature("");
    toast({ title: "Policy acknowledged", description: "E-signature recorded." });
  };

  return (
    <PortalLayout title="My Documents" subtitle="Contracts, policies & letters">
      <Tabs defaultValue="policies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="letters">Letters</TabsTrigger>
        </TabsList>

        <TabsContent value="policies">
          <Card>
            <CardHeader><CardTitle className="text-base">Company Policies & Handbook</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {policies.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center"><FileText className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.version} • Updated {p.updated}</p>
                  </div>
                  {p.acknowledged ? (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20"><CheckCircle2 className="h-3 w-3 mr-1" />Acknowledged</Badge>
                  ) : (
                    <Button size="sm" onClick={() => setSigning(p)}><FileSignature className="h-3.5 w-3.5 mr-1.5" />Acknowledge</Button>
                  )}
                  <Button size="sm" variant="ghost"><Download className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts">
          <Card>
            <CardContent className="p-4 space-y-2">
              {contracts.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="h-9 w-9 rounded-md bg-secondary/10 text-secondary flex items-center justify-center"><FileText className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.date}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => toast({ title: "Downloading", description: c.file })}>
                    <Download className="h-3.5 w-3.5 mr-1.5" />Download
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="letters">
          <Card>
            <CardContent className="p-4 space-y-2">
              {letters.map((l) => (
                <div key={l.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center"><FileText className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{l.name}</p>
                    <p className="text-xs text-muted-foreground">{l.date}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => toast({ title: "Downloading", description: l.file })}>
                    <Download className="h-3.5 w-3.5 mr-1.5" />Download
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!signing} onOpenChange={(o) => !o && setSigning(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Acknowledge {signing?.title}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-md bg-muted/40 text-xs text-muted-foreground max-h-40 overflow-auto">
              I confirm I have read, understood and agree to comply with the {signing?.title} ({signing?.version}).
              I understand that breach of this policy may result in disciplinary action.
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="agree" checked={agree} onCheckedChange={(c) => setAgree(c === true)} />
              <Label htmlFor="agree" className="text-sm leading-tight">I have read and agree to this policy.</Label>
            </div>
            <div>
              <Label>Type your full name as e-signature</Label>
              <Input value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Full legal name" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSigning(null)}>Cancel</Button>
            <Button onClick={acknowledge} disabled={!agree || !signature.trim()}>Sign & Acknowledge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
