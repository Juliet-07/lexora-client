import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Eye,
  PenLine,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  File,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const documents = [
  {
    name: "Tax Return Draft",
    type: "Report",
    status: "Under Review",
    date: "Apr 3, 2026",
    size: "1.2 MB",
  },
  {
    name: "ID Verification",
    type: "KYC",
    status: "Approved",
    date: "Mar 28, 2026",
    size: "890 KB",
  },
  {
    name: "Financial Statements",
    type: "Report",
    status: "Approved",
    date: "Mar 20, 2026",
    size: "3.4 MB",
  },
  {
    name: "Power of Attorney",
    type: "Contract",
    status: "Awaiting Signature",
    date: "Apr 7, 2026",
    size: "178 KB",
  },
  {
    name: "Business License Copy",
    type: "KYC",
    status: "Uploaded",
    date: "Mar 15, 2026",
    size: "560 KB",
  },
];

const statusIcons: Record<string, React.ReactNode> = {
  "Awaiting Signature": <PenLine className="h-3.5 w-3.5" />,
  "Under Review": <Clock className="h-3.5 w-3.5" />,
  Approved: <CheckCircle2 className="h-3.5 w-3.5" />,
  Uploaded: <Upload className="h-3.5 w-3.5" />,
};

const statusStyles: Record<string, string> = {
  "Awaiting Signature": "bg-warning/10 text-warning border-warning/20",
  "Under Review": "bg-info/10 text-info border-info/20",
  Approved: "bg-success/10 text-success border-success/20",
  Uploaded: "bg-muted text-muted-foreground border-border",
};

export default function Documents() {
  const [signOpen, setSignOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [signed, setSigned] = useState(false);

  const handleSign = (docName: string) => {
    setSelectedDoc(docName);
    setSigned(false);
    setSignOpen(true);
  };

  return (
    <PortalLayout
      title="Documents"
      subtitle="View, upload, and sign your documents"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-warning/10 text-warning border-warning/20"
            >
              2 awaiting signature
            </Badge>
            <Badge
              variant="outline"
              className="bg-info/10 text-info border-info/20"
            >
              1 under review
            </Badge>
          </div>
          <Button className="gradient-primary text-primary-foreground">
            <Upload className="h-4 w-4 mr-2" /> Upload Document
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="kyc">KYC</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {documents.map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <File className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {doc.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {doc.type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {doc.size}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {doc.date}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${statusStyles[doc.status]} gap-1 shrink-0`}
                      >
                        {statusIcons[doc.status]}
                        <span className="hidden sm:inline">{doc.status}</span>
                      </Badge>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {doc.status === "Awaiting Signature" && (
                          <Button
                            size="sm"
                            className="gradient-primary text-primary-foreground text-xs h-8"
                            onClick={() => handleSign(doc.name)}
                          >
                            <PenLine className="h-3 w-3 mr-1" /> Sign
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {["contracts", "reports", "kyc"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {documents
                      .filter(
                        (d) =>
                          d.type.toLowerCase() ===
                          tab
                            .replace("contracts", "contract")
                            .replace("reports", "report"),
                      )
                      .map((doc) => (
                        <div
                          key={doc.name}
                          className="flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors"
                        >
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <File className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {doc.name}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {doc.date} • {doc.size}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${statusStyles[doc.status]} gap-1`}
                          >
                            {statusIcons[doc.status]}
                            <span className="hidden sm:inline">
                              {doc.status}
                            </span>
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* E-Sign Dialog */}
      <Dialog open={signOpen} onOpenChange={setSignOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Sign Document</DialogTitle>
          </DialogHeader>
          {!signed ? (
            <div className="space-y-6">
              <div className="rounded-lg border bg-muted/50 p-6 text-center">
                <FileText className="h-12 w-12 text-primary mx-auto mb-3" />
                <p className="font-medium text-foreground">{selectedDoc}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please review the document before signing
                </p>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Type your full name to sign
                </label>
                <Input
                  placeholder="John Doe"
                  className="text-center text-lg font-heading italic"
                />
              </div>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="agree"
                  className="mt-1 accent-primary"
                />
                <label
                  htmlFor="agree"
                  className="text-xs text-muted-foreground"
                >
                  I agree that this electronic signature is the legal equivalent
                  of my manual signature.
                </label>
              </div>
              <Button
                className="w-full gradient-primary text-primary-foreground"
                onClick={() => setSigned(true)}
              >
                <PenLine className="h-4 w-4 mr-2" /> Sign Document
              </Button>
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <p className="font-heading font-bold text-lg text-foreground">
                Document Signed!
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedDoc} has been successfully signed.
              </p>
              <Button variant="outline" onClick={() => setSignOpen(false)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
