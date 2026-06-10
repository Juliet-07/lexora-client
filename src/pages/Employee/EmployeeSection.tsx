import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  description?: string;
}

export default function EmployeeSection({ title, subtitle, description }: Props) {
  return (
    <PortalLayout title={title} subtitle={subtitle}>
      <Card className="animate-fade-in">
        <CardContent className="py-16 flex flex-col items-center text-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Construction className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-lg font-heading font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            {description ?? "This section is being prepared for you. Functionality will be available shortly."}
          </p>
        </CardContent>
      </Card>
    </PortalLayout>
  );
}
