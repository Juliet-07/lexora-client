import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
} from "lucide-react";
import advisoryImage from "@/assets/lexora-client-advisory.jpg";
import advisoryWideImage from "@/assets/lexora-client-advisory-wide.jpg";
import { useForm } from "react-hook-form";
import axios from "axios";
import { getPostLoginRoute, setProfile, type ClientClassification } from "@/lib/profile";

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

      const kycStatus: string = payload.kycContext?.kycStatus ?? user?.clientProfile?.kycStatus ?? "not_started";
      const classification: ClientClassification | null =
        user?.clientProfile?.classifications ?? null;

      setProfile({
        classifications: classification,
        kycStatus,
        isOnboarded: kycStatus === "approved" || kycStatus === "completed",
      });

      setIsLoading(false);
      navigate(getPostLoginRoute(kycStatus));
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Login failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-screen relative isolate grid bg-background">
      <section
        className="login-image-panel relative isolate flex min-h-0 flex-col justify-end overflow-hidden bg-background md:absolute md:inset-0 md:-z-10"
        aria-label="Lexora Africa"
      >
        <picture>
        <source media="(min-width: 768px)" srcSet={advisoryWideImage} />
        <img
          src={advisoryImage}
          alt="African business professionals collaborating on documents in a bright office"
          width={1024}
          height={1536}
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_35%] md:opacity-60 md:object-left lg:object-center"
          fetchPriority="high"
        />
        </picture>
        <div className="login-image-scrim absolute inset-0 -z-10 md:hidden" />
        <div className="login-image-copy px-7 pb-5 pt-5 sm:px-12 md:hidden">
          <p className="login-eyebrow mb-3 flex items-center gap-3 text-xs font-semibold uppercase text-primary-foreground/85">
            <span className="h-px w-8 bg-primary-foreground/65" /> Your partner
            in progress
          </p>
          <h2 className="text-3xl font-bold leading-tight text-primary-foreground">
            Lexora Africa
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
            Governance. Risk. Compliance. Beyond.
          </p>
          <div className="login-image-description mt-4 border-t border-primary-foreground/25 pt-3">
            <p className="max-w-md text-sm leading-relaxed text-primary-foreground/80">
              Your engagements, documents and conversations. Connected in one
              place.
            </p>
          </div>
        </div>
      </section>

      <main className="login-main relative flex min-w-0 flex-col items-center justify-center px-5 py-3 md:p-8">
        <div className="login-form-panel w-full max-w-md rounded-2xl border border-border/70 bg-card p-5 shadow-xl shadow-primary/10 md:max-w-sm md:p-8 lg:max-w-md">
        <header className="mb-3 flex items-center justify-center md:mb-5">
          <img
            src="/lexora-logo.png"
            alt="Lexora Africa — Governance, Risk, Compliance, Beyond"
            width={1142}
            height={400}
            className="h-auto w-28 md:w-40"
          />
        </header>

            <p className="mb-2 text-xs font-semibold uppercase text-secondary text-center">
              Client portal
            </p>
            <h1 className="text-2xl font-heading font-bold text-foreground md:text-4xl text-center">
              Welcome back.
            </h1>
            <p className="login-form-description my-3 text-xs md:text-sm leading-relaxed text-muted-foreground text-center">
              Sign in to stay connected with your team and keep your engagements
              moving forward.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
              {errorMessage && (
                <div
                  role="alert"
                  className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3"
                >
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
                     className="h-11 rounded-md bg-background/50 pl-10 md:h-12"
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
                    className="h-11 rounded-md bg-background/50 pl-10 pr-12 md:h-12"
                    required
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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
                className="h-11 w-full rounded-md text-sm font-semibold md:h-12"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" /> Signing in...
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight />
                  </>
                )}
              </Button>
            </form>
        </div>
      </main>
    </div>
  );
}
