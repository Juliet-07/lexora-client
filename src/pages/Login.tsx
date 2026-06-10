import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <span className="text-xl font-bold text-primary-foreground">
              CP
            </span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your client portal
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-xl">
          <CardContent className="pt-6 pb-8 px-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {errorMessage && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
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
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    name="password"
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Don't have an account?{" "}
          <span className="text-primary font-medium">
            Contact your administrator
          </span>
        </p>
      </div>
    </div>
  );
}
