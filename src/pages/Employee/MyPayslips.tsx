import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileLock2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Payslip {
  id: string;
  period: string;
  payDate: string;
  gross: number;
  net: number;
  status: "paid" | "pending";
}

const payslips: Payslip[] = [
  { id: "1", period: "May 2026", payDate: "2026-05-28", gross: 850000, net: 612000, status: "paid" },
  { id: "2", period: "April 2026", payDate: "2026-04-28", gross: 850000, net: 612000, status: "paid" },
  { id: "3", period: "March 2026", payDate: "2026-03-28", gross: 850000, net: 612000, status: "paid" },
  { id: "4", period: "February 2026", payDate: "2026-02-28", gross: 850000, net: 612000, status: "paid" },
  { id: "5", period: "January 2026", payDate: "2026-01-28", gross: 800000, net: 580000, status: "paid" },
];

const ytdSummary = {
  grossEarnings: 4200000,
  taxDeducted: 840000,
  pension: 336000,
  otherDeductions: 56000,
  netPay: 2968000,
};

const fmt = (n: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export default function MyPayslips() {
  const handleDownload = (p: Payslip) => {
    toast({ title: "Downloading payslip", description: `${p.period} (password-protected PDF)` });
  };

  return (
    <PortalLayout title="My Payslips" subtitle="Current and historical pay information">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp className="h-3 w-3" />YTD Gross</div><p className="text-xl font-heading font-bold mt-1">{fmt(ytdSummary.grossEarnings)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingDown className="h-3 w-3" />Tax</div><p className="text-xl font-heading font-bold mt-1">{fmt(ytdSummary.taxDeducted)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingDown className="h-3 w-3" />Pension</div><p className="text-xl font-heading font-bold mt-1">{fmt(ytdSummary.pension)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingDown className="h-3 w-3" />Other</div><p className="text-xl font-heading font-bold mt-1">{fmt(ytdSummary.otherDeductions)}</p></CardContent></Card>
          <Card className="bg-primary/5 border-primary/20"><CardContent className="p-4"><div className="flex items-center gap-2 text-xs text-primary"><Wallet className="h-3 w-3" />YTD Net</div><p className="text-xl font-heading font-bold mt-1 text-primary">{fmt(ytdSummary.netPay)}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Payslip History</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {payslips.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center"><FileLock2 className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{p.period}</p>
                  <p className="text-xs text-muted-foreground">Paid {p.payDate} • Net {fmt(p.net)}</p>
                </div>
                <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">{p.status}</Badge>
                <Button size="sm" variant="outline" onClick={() => handleDownload(p)}>
                  <Download className="h-3.5 w-3.5 mr-1.5" />PDF
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
