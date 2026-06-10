import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase,
  GraduationCap,
  FileCheck2,
  AlertCircle,
  Loader2,
  Upload,
  User,
  Phone,
  MapPin,
  Shield,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────

interface EmployeeProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  jobTitle: string;
  department: string | null;
  employeeNumber: string;
  employmentType: string;
  employmentStatus: string;
  startDate: string;
  probationEndDate: string | null;
  reportsTo: string | null;
  nationality: string | null;
  nationalId: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  } | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  taxId: string | null;
  annualLeaveBalance: number;
  annualLeaveUsed: number;
  sickLeaveBalance: number;
  sickLeaveUsed: number;
  salary: number | null;
  salaryCurrency: string;
}

interface EditForm {
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  bankName: string;
  bankAccountNumber: string;
  nationality: string;
}

// ─── Component ────────────────────────────────────────────────

export default function MyProfile() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm>({
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    bankName: "",
    bankAccountNumber: "",
    nationality: "",
  });

  // ── Fetch profile ─────────────────────────────────────────
  const { data: profile, isLoading } = useQuery<EmployeeProfile>({
    queryKey: ["employee-me"],
    queryFn: async () => {
      const res = await api.get("/employee/me");
      return res.data?.data ?? res.data;
    },
    staleTime: 2 * 60_000,
  });

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        phone: profile.phone ?? "",
        street: profile.address?.street ?? "",
        city: profile.address?.city ?? "",
        state: profile.address?.state ?? "",
        country: profile.address?.country ?? "",
        emergencyContactName: profile.emergencyContactName ?? "",
        emergencyContactPhone: profile.emergencyContactPhone ?? "",
        bankName: profile.bankName ?? "",
        bankAccountNumber: profile.bankAccountNumber ?? "",
        nationality: profile.nationality ?? "",
      });
    }
  }, [profile]);

  // ── Save mutation ─────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: () =>
      api.patch("/employee/me", {
        phone: form.phone || undefined,
        address: {
          street: form.street || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          country: form.country || undefined,
        },
        emergencyContactName: form.emergencyContactName || undefined,
        emergencyContactPhone: form.emergencyContactPhone || undefined,
        bankName: form.bankName || undefined,
        bankAccountNumber: form.bankAccountNumber || undefined,
        nationality: form.nationality || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-me"] });
      setEditing(false);
      toast.success("Profile updated successfully.");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed to update profile"),
  });

  const setF = (key: keyof EditForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  if (isLoading) {
    return (
      <PortalLayout
        title="My Profile"
        subtitle="Personal details, employment history & qualifications"
      >
        <div className="flex items-center justify-center h-48 gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading profile…</span>
        </div>
      </PortalLayout>
    );
  }

  // ─────────────────────────────────────────────────────────
  return (
    <PortalLayout
      title="My Profile"
      subtitle="Personal details, employment history & qualifications"
    >
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Details</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="documents">Qualifications</TabsTrigger>
        </TabsList>

        {/* ── Personal Details ── */}
        <TabsContent value="personal">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Personal Details</CardTitle>
              {editing ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(false)}
                    disabled={saveMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={saveMutation.isPending}
                    onClick={() => saveMutation.mutate()}
                  >
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />{" "}
                        Saving…
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Identity — read only */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Identity</h3>
                  <Badge variant="outline" className="text-[10px]">
                    Read only
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>First name</Label>
                    <Input
                      value={profile?.firstName ?? ""}
                      disabled
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Last name</Label>
                    <Input
                      value={profile?.lastName ?? ""}
                      disabled
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={profile?.email ?? ""}
                      disabled
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Employee Number</Label>
                    <Input
                      value={profile?.employeeNumber ?? ""}
                      disabled
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <Input
                      value={
                        profile?.dateOfBirth
                          ? new Date(profile.dateOfBirth).toLocaleDateString(
                              "en-GB",
                            )
                          : "—"
                      }
                      disabled
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Nationality</Label>
                    <Input
                      value={
                        editing
                          ? form.nationality
                          : (profile?.nationality ?? "—")
                      }
                      disabled={!editing}
                      onChange={(e) => setF("nationality", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Contact</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={editing ? form.phone : (profile?.phone ?? "—")}
                      disabled={!editing}
                      onChange={(e) => setF("phone", e.target.value)}
                      placeholder="+250700000000"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Address */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Address</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Street</Label>
                    <Input
                      value={
                        editing
                          ? form.street
                          : (profile?.address?.street ?? "—")
                      }
                      disabled={!editing}
                      onChange={(e) => setF("street", e.target.value)}
                      placeholder="123 Main Street"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input
                      value={
                        editing ? form.city : (profile?.address?.city ?? "—")
                      }
                      disabled={!editing}
                      onChange={(e) => setF("city", e.target.value)}
                      placeholder="Kigali"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input
                      value={
                        editing
                          ? form.country
                          : (profile?.address?.country ?? "—")
                      }
                      disabled={!editing}
                      onChange={(e) => setF("country", e.target.value)}
                      placeholder="Rwanda"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Emergency contact */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Emergency Contact</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={
                        editing
                          ? form.emergencyContactName
                          : (profile?.emergencyContactName ?? "—")
                      }
                      disabled={!editing}
                      onChange={(e) =>
                        setF("emergencyContactName", e.target.value)
                      }
                      placeholder="Jane Doe"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={
                        editing
                          ? form.emergencyContactPhone
                          : (profile?.emergencyContactPhone ?? "—")
                      }
                      disabled={!editing}
                      onChange={(e) =>
                        setF("emergencyContactPhone", e.target.value)
                      }
                      placeholder="+250788000000"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Bank details */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Bank Details</h3>
                  <Badge variant="outline" className="text-[10px]">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Changes require HR approval
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Bank name</Label>
                    <Input
                      value={
                        editing ? form.bankName : (profile?.bankName ?? "—")
                      }
                      disabled={!editing}
                      onChange={(e) => setF("bankName", e.target.value)}
                      placeholder="Bank of Kigali"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Account number</Label>
                    <Input
                      value={
                        editing
                          ? form.bankAccountNumber
                          : (profile?.bankAccountNumber ?? "—")
                      }
                      disabled={!editing}
                      onChange={(e) =>
                        setF("bankAccountNumber", e.target.value)
                      }
                      placeholder="00123456789"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Employment ── */}
        <TabsContent value="employment">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile ? (
                <>
                  {/* Current position */}
                  <div className="flex items-start gap-3 p-4 rounded-lg border">
                    <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">
                          {profile.jobTitle}
                        </p>
                        <Badge className="text-[10px]">Current</Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${
                            profile.employmentStatus === "active"
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-warning/10 text-warning border-warning/20"
                          }`}
                        >
                          {profile.employmentStatus}
                        </Badge>
                      </div>
                      {profile.department && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {profile.department}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Started{" "}
                        {new Date(profile.startDate).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Employment meta */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    {[
                      { label: "Employee No.", value: profile.employeeNumber },
                      {
                        label: "Employment Type",
                        value: profile.employmentType?.replace(/_/g, " "),
                      },
                      { label: "Reports To", value: profile.reportsTo ?? "—" },
                      {
                        label: "Probation Ends",
                        value: profile.probationEndDate
                          ? new Date(
                              profile.probationEndDate,
                            ).toLocaleDateString("en-GB")
                          : "—",
                      },
                      { label: "Tax ID", value: profile.taxId ?? "—" },
                    ].map((f) => (
                      <div key={f.label} className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">
                          {f.label}
                        </p>
                        <p className="font-medium capitalize mt-0.5">
                          {f.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Leave summary */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Leave Entitlements
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          name: "Annual Leave",
                          balance:
                            profile.annualLeaveBalance -
                            profile.annualLeaveUsed,
                          total: profile.annualLeaveBalance,
                        },
                        {
                          name: "Sick Leave",
                          balance:
                            profile.sickLeaveBalance - profile.sickLeaveUsed,
                          total: profile.sickLeaveBalance,
                        },
                      ].map((l) => (
                        <div key={l.name} className="p-3 rounded-lg border">
                          <p className="text-xs text-muted-foreground">
                            {l.name}
                          </p>
                          <p className="text-lg font-bold mt-0.5">
                            {l.balance}
                            <span className="text-xs font-normal text-muted-foreground ml-1">
                              / {l.total} days
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Employment details not available.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Qualifications (static for now — Learning module will wire this) ── */}
        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                Qualifications & Certificates
              </CardTitle>
              <Button size="sm" asChild>
                <label className="cursor-pointer">
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload
                  <input type="file" className="hidden" onChange={() => {}} />
                </label>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Document management will be available when the Learning module
                is active.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PortalLayout>
  );
}
