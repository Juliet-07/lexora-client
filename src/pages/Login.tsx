import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import advisoryImage from "@/assets/lexora-client-advisory.jpg";
import { useForm } from "react-hook-form";
import axios from "axios";
import { setProfile, type ClientClassification } from "@/lib/profile";

function getPostLoginRoute(user: any, kycStatus: string): string {
  const roles: string[] = user?.roles ?? [];

  if (
    roles.includes("client_employee") ||
    roles.includes("client_board") ||
    roles.includes("client_client")
  ) {
    return "/dashboard";
  }

  return kycStatus === "not_started" ? "/onboarding" : "/dashboard";
}

export default function Login() {
  const apiURL = import.meta.env.VITE_REACT_APP_BASE_URL;
  const { handleSubmit } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [loginDetails, setLoginDetails] = useState({ email: "", password: "" });
  const { email, password } = loginDetails;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginDetails({ ...loginDetails, [name]: value });
  };

  const onSubmit = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await axios.post(`${apiURL}/auth/login`, loginDetails);
      const payload = response.data.data;
      const token = payload.tokens.accessToken;
      const user = payload.user;

      localStorage.setItem("userToken", token);

      const roles: string[] = user?.roles ?? [];

      const isOthers =
        roles.includes("client_employee") ||
        roles.includes("client_board") ||
        roles.includes("client_client");

      if (isOthers) {
        setIsLoading(false);
        navigate("/dashboard");
        return;
      }

      // ── Client user — existing KYC routing flow ───────────
      const kycStatus: string = payload.kycContext?.kycStatus ?? "not_started";
      const classification: ClientClassification | null =
        user?.clientProfile?.classifications ?? null;

      setProfile({
        classifications: classification,
        kycStatus,
        isOnboarded: kycStatus === "approved" || kycStatus === "completed",
      });

      setTimeout(() => {
        setIsLoading(false);
        navigate(kycStatus === "not_started" ? "/onboarding" : "/dashboard");
      }, 600);
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Login failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid bg-background lg:grid-cols-[1.05fr_1fr]">
      <section className="relative isolate flex min-h-[380px] flex-col justify-end overflow-hidden bg-sidebar lg:min-h-screen" aria-label="Lexora Africa">
        <img src={advisoryImage} alt="African business professionals collaborating on documents in a bright office" width={1024} height={1536} className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_35%]" fetchPriority="high" />
        <div className="login-image-scrim absolute inset-0 -z-10" />
        <div className="px-7 pb-8 pt-32 sm:px-12 lg:px-14 lg:pb-14">
          <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/85"><span className="h-px w-8 bg-primary-foreground/65" /> Your partner in progress</p>
          <h2 className="max-w-lg text-3xl font-bold leading-tight text-primary-foreground sm:text-4xl lg:text-5xl">Lexora Africa</h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-primary-foreground/85">Governance. Risk. Compliance. Beyond.</p>
          <div className="mt-8 border-t border-primary-foreground/25 pt-6">
            <p className="max-w-md text-sm leading-relaxed text-primary-foreground/80">Your engagements, documents and conversations. Connected in one place.</p>
          </div>
        </div>
      </section>

      <main className="flex min-w-0 flex-col px-7 py-8 sm:px-12 lg:px-14 lg:py-10">
        <header className="flex items-center">
          <img src="/lexora-logo.png" alt="Lexora Africa — Governance, Risk, Compliance, Beyond" width={1142} height={400} className="h-auto w-40 sm:w-44" />
        </header>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-14 lg:py-16">
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xl shadow-primary/10 sm:p-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Client portal</p>
          <h1 className="text-3xl font-heading font-bold text-foreground sm:text-4xl">Welcome back.</h1>
          <p className="mt-3 mb-8 text-sm leading-relaxed text-muted-foreground">Sign in to stay connected with your Lexora team and keep your engagements moving forward.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errorMessage && (
                <div role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    name="email"
                     autoComplete="username"
                    onChange={handleChange}
                    className="h-12 rounded-md bg-background/50 pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    variant="link"
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="h-auto p-0 text-xs text-primary"
                  >
                    Forgot password?
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    name="password"
                    autoComplete="current-password"
                    onChange={handleChange}
                    className="h-12 rounded-md bg-background/50 pl-10 pr-12"
                    required
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-md text-sm font-semibold"
                disabled={isLoading}
              >
                {isLoading ? <><Loader2 className="animate-spin" /> Signing in...</> : <>Sign in <ArrowRight /></>}
              </Button>
            </form>
          <p className="mt-7 text-center text-xs leading-relaxed text-muted-foreground">Need access to your account?<br /><span className="font-medium text-foreground">Contact your administrator</span></p>
          </div>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-[11px] text-muted-foreground">
          <span>Lexora Africa · Client portal</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-secondary" /> Private & confidential</span>
        </footer>
      </main>
    </div>
  );
}
