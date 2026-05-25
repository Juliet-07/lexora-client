import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, FileText } from "lucide-react";

export default function EngagementLetter() {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  const handleContinue = () => {
    localStorage.setItem("engagementAcceptedAt", new Date().toISOString());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Private & Confidential</p>
            <h1 className="text-xl md:text-2xl font-heading font-bold">Terms of Engagement & Client Authorization</h1>
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-0">
            <ScrollArea className="h-[60vh] p-6 md:p-8">
              <article className="prose prose-sm max-w-none text-foreground space-y-6">
                <header className="border-b pb-4">
                  <p className="font-semibold">Upendo Tech Limited</p>
                  <p className="text-sm text-muted-foreground">
                    #37, KG 414 St, Gacuriro, Kigali, Rwanda<br />
                    rudobarbra@upendotech.com · +250 794 105 780 · www.upendotech.com
                  </p>
                </header>

                <section>
                  <h2 className="font-heading text-lg font-semibold">1. About Upendo Tech</h2>
                  <p>
                    Upendo Tech Limited ("Upendo Tech") is a Trust and Corporate Service Provider incorporated in
                    Rwanda and licensed by the National Bank of Rwanda under Law No. 063/2021 Governing Trust and
                    Corporate Service Providers. We provide integrated corporate, legal, fiduciary, and advisory
                    services to individuals, corporates, family offices, and institutional clients across Africa.
                  </p>
                </section>

                <section>
                  <h2 className="font-heading text-lg font-semibold">2. Scope of Engagement</h2>
                  <p>
                    The Client engages Upendo Tech to provide the Services as set out in the applicable Mandate. No
                    Services shall be undertaken, and no fees shall accrue, other than those confirmed in a Mandate
                    agreed in writing between the Parties. Our Solution Suite includes Corporate & Secretarial
                    Support, Trust & Fiduciary Services, Corporate Structuring & Advisory, Commercial Contracts,
                    AML/CFT & Regulatory Compliance, Transaction Advisory, Fund Administration, Business Development
                    & Investor Advisory, and Accounting, Payroll & HR Administration.
                  </p>
                </section>

                <section>
                  <h2 className="font-heading text-lg font-semibold">3. Fee Arrangements</h2>
                  <p>
                    Fees may be structured as Fixed Fee, Time-Based, Retainer, or Success/Contingency, as confirmed
                    in the applicable Mandate. All fees are indicative and exclusive of Value Added Tax. Final
                    quotations depend on the scope, complexity, and regulatory requirements of each engagement.
                  </p>
                </section>

                <section>
                  <h2 className="font-heading text-lg font-semibold">4. KYC and AML/CFT Obligations</h2>
                  <p>
                    As a licensed Trust and Corporate Service Provider, Upendo Tech is required to perform customer
                    due diligence prior to onboarding and throughout the engagement.
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <strong>Individual Clients:</strong> certified passport or national ID, proof of residential
                      address (not older than three months), source of funds and source of wealth declaration, and
                      tax identification number (where applicable).
                    </li>
                    <li>
                      <strong>Corporate Clients:</strong> certificate of incorporation, constitutional documents,
                      proof of registered office, register of directors and shareholders, ID and proof of address
                      for directors and beneficial owners holding 25% or more, board resolution authorising the
                      engagement, tax registration, and ultimate beneficial ownership declaration.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-heading text-lg font-semibold">5. Privacy & Data Protection</h2>
                  <p>
                    All information shared with us is treated in the strictest confidence and handled in accordance
                    with Applicable Laws and our internal privacy protocols. We do not sell client information, nor
                    share it with organisations outside the professional relationship for their own marketing.
                  </p>
                </section>

                <section>
                  <h2 className="font-heading text-lg font-semibold">6. Confidentiality & Conflicts</h2>
                  <p>
                    Both Parties shall keep confidential all information exchanged in connection with the Services.
                    Upendo Tech maintains conflict-checking procedures and will disclose any material conflicts in
                    accordance with Applicable Laws.
                  </p>
                </section>

                <section>
                  <h2 className="font-heading text-lg font-semibold">7. Termination</h2>
                  <p>
                    Either Party may terminate this Agreement by giving thirty (30) days' written notice. The Client
                    shall remain liable for all fees, disbursements, and costs incurred up to the effective date of
                    termination.
                  </p>
                </section>

                <section>
                  <h2 className="font-heading text-lg font-semibold">8. Governing Law</h2>
                  <p>
                    This Agreement shall be governed by, and construed in accordance with, the laws of the Republic
                    of Rwanda. Any dispute shall first be referred to good-faith negotiation and, failing
                    resolution, to arbitration in Kigali.
                  </p>
                </section>

                <footer className="pt-4 border-t text-xs text-muted-foreground">
                  Upendo Tech Limited · Licensed Trust and Corporate Service Provider
                </footer>
              </article>
            </ScrollArea>

            <div className="border-t p-6 space-y-4 bg-muted/30">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={accepted}
                  onCheckedChange={(v) => setAccepted(v === true)}
                  className="mt-0.5"
                />
                <span className="text-sm text-foreground">
                  I have read and understood the <strong>Terms of Engagement & Client Authorization</strong> and I
                  accept them on behalf of myself or the entity I represent.
                </span>
              </label>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button variant="outline" asChild>
                  <a href="#" onClick={(e) => { e.preventDefault(); window.print(); }}>
                    <FileText className="h-4 w-4" /> Download / Print
                  </a>
                </Button>
                <Button
                  className="gradient-primary"
                  disabled={!accepted}
                  onClick={handleContinue}
                >
                  Accept & Continue to Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By continuing you acknowledge that acceptance is recorded with a timestamp for compliance purposes.
        </p>
      </div>
    </div>
  );
}
