import { useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Upload, Briefcase, GraduationCap, FileCheck2, AlertCircle } from "lucide-react";

interface EmploymentRecord {
  id: string;
  role: string;
  department: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
}

interface Qualification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  fileName?: string;
}

const employmentHistory: EmploymentRecord[] = [
  { id: "1", role: "Senior Analyst", department: "Advisory", startDate: "2024-03-01", current: true },
  { id: "2", role: "Analyst", department: "Advisory", startDate: "2022-06-01", endDate: "2024-02-29" },
];

const initialQualifications: Qualification[] = [
  { id: "1", name: "ACCA", issuer: "ACCA Global", year: "2023", fileName: "acca-cert.pdf" },
  { id: "2", name: "BSc Accounting", issuer: "University of Lagos", year: "2020", fileName: "degree.pdf" },
];

export default function MyProfile() {
  const { data: user } = useCurrentUser();
  const [editing, setEditing] = useState(false);
  const [qualifications, setQualifications] = useState(initialQualifications);
  const [form, setForm] = useState({
    address: "12 Marina Street, Lagos",
    phone: user?.phone ?? "",
    emergencyName: "Jane Doe",
    emergencyPhone: "+234 802 000 0000",
    bankName: "GTBank",
    accountNumber: "0123456789",
  });

  const handleSave = () => {
    setEditing(false);
    toast({
      title: "Profile updated",
      description: "Bank details changes are pending HR approval.",
    });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQualifications((q) => [
      ...q,
      { id: Date.now().toString(), name: file.name, issuer: "Uploaded", year: new Date().getFullYear().toString(), fileName: file.name },
    ]);
    toast({ title: "Document uploaded", description: file.name });
  };

  return (
    <PortalLayout title="My Profile" subtitle="Personal details, employment history & qualifications">
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Details</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="documents">Qualifications</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Personal Details</CardTitle>
              {editing ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSave}>Save</Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit</Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>First name</Label><Input value={user?.firstName ?? ""} disabled /></div>
                <div><Label>Last name</Label><Input value={user?.lastName ?? ""} disabled /></div>
                <div><Label>Email</Label><Input value={user?.email ?? ""} disabled /></div>
                <div><Label>Phone</Label><Input value={form.phone} disabled={!editing} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="md:col-span-2"><Label>Address</Label><Input value={form.address} disabled={!editing} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              </div>

              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-3">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Name</Label><Input value={form.emergencyName} disabled={!editing} onChange={(e) => setForm({ ...form, emergencyName: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input value={form.emergencyPhone} disabled={!editing} onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })} /></div>
                </div>
              </div>

              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold">Bank Details</h3>
                  <Badge variant="outline" className="text-[10px]"><AlertCircle className="h-3 w-3 mr-1" />Changes require HR approval</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Bank name</Label><Input value={form.bankName} disabled={!editing} onChange={(e) => setForm({ ...form, bankName: e.target.value })} /></div>
                  <div><Label>Account number</Label><Input value={form.accountNumber} disabled={!editing} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} /></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employment">
          <Card>
            <CardHeader><CardTitle className="text-base">Employment History</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {employmentHistory.map((r) => (
                <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center"><Briefcase className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{r.role}</p>
                      {r.current && <Badge className="text-[10px]">Current</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{r.department}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {r.startDate} — {r.current ? "Present" : r.endDate}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Qualifications & Certificates</CardTitle>
              <Button size="sm" asChild>
                <label className="cursor-pointer">
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload
                  <input type="file" className="hidden" onChange={handleUpload} />
                </label>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {qualifications.map((q) => (
                <div key={q.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="h-9 w-9 rounded-md bg-success/10 text-success flex items-center justify-center"><GraduationCap className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{q.name}</p>
                    <p className="text-xs text-muted-foreground">{q.issuer} • {q.year}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]"><FileCheck2 className="h-3 w-3 mr-1" />Verified</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PortalLayout>
  );
}
