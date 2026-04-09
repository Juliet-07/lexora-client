import { PortalLayout } from "@/components/PortalLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle2,
  Download,
  ArrowRight,
  Smartphone,
  Building,
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const invoices = [
  { id: "INV-1042", description: "Tax Filing Service", amount: "$2,500.00", status: "Pending", date: "Apr 5, 2026" },
  { id: "INV-1041", description: "Company Registration", amount: "$1,800.00", status: "Paid", date: "Mar 28, 2026" },
  { id: "INV-1040", description: "Compliance Review", amount: "$950.00", status: "Paid", date: "Mar 15, 2026" },
  { id: "INV-1039", description: "Legal Consultation", amount: "$600.00", status: "Overdue", date: "Feb 28, 2026" },
];

const invoiceStatusStyles: Record<string, string> = {
  Pending: "bg-warning/10 text-warning border-warning/20",
  Paid: "bg-success/10 text-success border-success/20",
  Overdue: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Payments() {
  const [payOpen, setPayOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<typeof invoices[0] | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);

  const handlePay = (invoice: typeof invoices[0]) => {
    setSelectedInvoice(invoice);
    setPaymentDone(false);
    setPayOpen(true);
  };

  return (
    <PortalLayout title="Billing & Payments" subtitle="Manage invoices and make payments">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Due" value="$3,100" subtitle="2 invoices" icon={DollarSign} variant="warning" />
          <StatCard title="Paid This Month" value="$2,750" subtitle="2 invoices" icon={CheckCircle2} variant="success" />
          <StatCard title="Overdue" value="$600" subtitle="1 invoice" icon={Clock} variant="primary" />
          <StatCard title="Total Paid" value="$12,450" subtitle="All time" icon={CreditCard} />
        </div>

        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading">Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{inv.id}</p>
                      <Badge variant="outline" className={invoiceStatusStyles[inv.status]}>
                        {inv.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{inv.description} • {inv.date}</p>
                  </div>
                  <p className="text-sm font-heading font-bold text-foreground shrink-0">{inv.amount}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <Download className="h-4 w-4" />
                    </Button>
                    {inv.status !== "Paid" && (
                      <Button
                        size="sm"
                        className="gradient-primary text-primary-foreground text-xs h-8"
                        onClick={() => handlePay(inv)}
                      >
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {paymentDone ? "Payment Successful" : `Pay ${selectedInvoice?.id}`}
            </DialogTitle>
          </DialogHeader>
          {!paymentDone ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedInvoice?.description}</p>
                  <p className="text-xs text-muted-foreground">{selectedInvoice?.id}</p>
                </div>
                <p className="text-xl font-heading font-bold text-foreground">{selectedInvoice?.amount}</p>
              </div>
              <Tabs defaultValue="card">
                <TabsList className="w-full">
                  <TabsTrigger value="card" className="flex-1 gap-1">
                    <CreditCard className="h-3 w-3" /> Card
                  </TabsTrigger>
                  <TabsTrigger value="bank" className="flex-1 gap-1">
                    <Building className="h-3 w-3" /> Bank
                  </TabsTrigger>
                  <TabsTrigger value="mobile" className="flex-1 gap-1">
                    <Smartphone className="h-3 w-3" /> Mobile
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="card" className="space-y-3 mt-4">
                  <div>
                    <Label className="text-xs">Card Number</Label>
                    <Input placeholder="4242 4242 4242 4242" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Expiry</Label>
                      <Input placeholder="MM/YY" />
                    </div>
                    <div>
                      <Label className="text-xs">CVC</Label>
                      <Input placeholder="123" />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="bank" className="space-y-3 mt-4">
                  <div>
                    <Label className="text-xs">Account Number</Label>
                    <Input placeholder="Enter account number" />
                  </div>
                  <div>
                    <Label className="text-xs">Routing Number</Label>
                    <Input placeholder="Enter routing number" />
                  </div>
                </TabsContent>
                <TabsContent value="mobile" className="space-y-3 mt-4">
                  <div>
                    <Label className="text-xs">Mobile Money Number</Label>
                    <Input placeholder="+1 234 567 8900" />
                  </div>
                  <div>
                    <Label className="text-xs">Provider</Label>
                    <Input placeholder="Select provider" />
                  </div>
                </TabsContent>
              </Tabs>
              <Button
                className="w-full gradient-primary text-primary-foreground"
                onClick={() => setPaymentDone(true)}
              >
                Pay {selectedInvoice?.amount}
              </Button>
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <p className="font-heading font-bold text-lg text-foreground">Payment Complete!</p>
              <p className="text-sm text-muted-foreground">
                {selectedInvoice?.amount} paid for {selectedInvoice?.description}
              </p>
              <Button variant="outline" onClick={() => setPayOpen(false)}>Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
