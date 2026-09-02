import { useState, useEffect } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/lib/api";
import { User, Mail, Phone, Shield, Save, Loader2, Lock, KeyRound, Eye, EyeOff } from "lucide-react";

export default function Profile() {
  const { data: user, isLoading, refetch } = useCurrentUser();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const initials = `${(user?.firstName ?? "?")[0] ?? ""}${
    (user?.lastName ?? "")[0] ?? ""
  }`.toUpperCase();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.patch("/auth/me", { firstName, lastName, phone });
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
      refetch();
    } catch (err: any) {
      toast({
        title: "Could not save",
        description:
          err?.response?.data?.message ?? "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PortalLayout
      title="My Profile"
      subtitle="Manage your personal information and account settings"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Identity header */}
        <Card>
          <CardContent className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="gradient-primary text-primary-foreground text-xl font-heading font-bold">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h2 className="text-xl font-heading font-bold text-foreground">
                {isLoading
                  ? "Loading…"
                  : `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
                    "Unnamed user"}
              </h2>
              <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                <Mail className="h-3.5 w-3.5" /> {user?.email ?? "—"}
              </p>
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                {user?.roles?.map((r) => (
                  <Badge key={r} variant="secondary" className="text-[10px]">
                    {r.replace(/_/g, " ")}
                  </Badge>
                ))}
                {user?.status && (
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {user.status}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <User className="h-4 w-4" /> Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email ?? ""} disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving || isLoading}
                className="gradient-primary text-primary-foreground"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                {isSaving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Shield className="h-4 w-4" /> Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Client type</span>
              <span className="font-medium capitalize">
                {user?.clientProfile?.classifications ?? "—"}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">KYC status</span>
              <span className="font-medium capitalize">
                {(user?.clientProfile?.kycStatus ?? "not started").replace(
                  /_/g,
                  " ",
                )}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">User type</span>
              <span className="font-medium capitalize">
                {user?.userType ?? "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last login</span>
              <span className="font-medium">
                {user?.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString()
                  : "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
