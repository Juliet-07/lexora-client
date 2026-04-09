import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Upload, User, FileText, Shield } from "lucide-react";

const steps = [
  { title: "Personal Information", icon: User, complete: true },
  { title: "Upload Documents", icon: Upload, complete: false, current: true },
  { title: "KYC Verification", icon: Shield, complete: false },
  { title: "Sign Agreement", icon: FileText, complete: false },
];

export default function Onboarding() {
  const completedSteps = steps.filter((s) => s.complete).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <PortalLayout title="Onboarding" subtitle="Complete your profile setup">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">Onboarding Progress</p>
              <span className="text-sm font-heading font-bold text-primary">{completedSteps}/{steps.length} complete</span>
            </div>
            <Progress value={progress} className="h-2 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {steps.map((step) => (
                <div
                  key={step.title}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-center transition-colors ${
                    step.current ? "border-primary bg-primary/5" : step.complete ? "border-success/30 bg-success/5" : "border-border"
                  }`}
                >
                  {step.complete ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : step.current ? (
                    <step.icon className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-[11px] font-medium text-foreground">{step.title}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Step: Upload Documents */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Upload Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Drop files here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Government-issued ID</Label>
                <Input type="file" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Proof of Address</Label>
                <Input type="file" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Business Registration Certificate</Label>
                <Input type="file" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline">Save Draft</Button>
              <Button className="gradient-primary text-primary-foreground">Submit & Continue</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
