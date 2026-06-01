"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { z } from "zod";
import { cn } from "@/lib/utils";

// ─── shadcn/ui components ────────────────────────────────────
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// ─── Icons ───────────────────────────────────────────────────
import {
  ShieldAlert,
  ShieldOff,
  ArrowLeft,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  RotateCcw,
} from "lucide-react";

// ─── Zod Schema ──────────────────────────────────────────────
const disableSchema = z.object({
  password: z.string().min(1, "Password is required"),
  confirmed: z.boolean().refine((value) => value === true, {
    message: "You must confirm to proceed",
  }),
});

export default function Disable2FA() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [zodError, setZodError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const handleDisable = async () => {
    const result = disableSchema.safeParse({ password, confirmed });

    if (!result.success) {
      const firstError = result.error.issues[0]?.message ?? "Invalid input";
      setZodError(firstError);
      setApiError(null);
      triggerShake();
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const { error: disableError } = await authClient.twoFactor.disable({
        password: result.data.password,
      });

      if (disableError) {
        setApiError(
          disableError.message || "Failed to disable 2FA. Check your password.",
        );
        setIsLoading(false);
        triggerShake();
        return;
      }

      setIsSuccess(true);
      router.refresh();
    } catch (err) {
      console.error("Disable 2FA exception:", err);
      setApiError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
      triggerShake();
    }
  };

  const errorMessage = zodError || apiError;

  // ─── Success State ─────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-success/5 blur-[120px]" />
        </div>

        <div className="w-full max-w-md relative z-10 space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="gap-1 text-muted-foreground hover:text-foreground -ml-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Button>

          <Card className="border-border shadow-xl text-center">
            <CardHeader className="pt-8 pb-4">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-success" />
              </div>
              <CardTitle className="text-2xl">2FA Disabled</CardTitle>
              <CardDescription className="max-w-sm mx-auto">
                Two-factor authentication has been removed from your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-2">
              <Alert className="bg-warning/5 border-warning/20 text-warning">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-xs text-warning/90">
                  Your account is now less secure. We strongly recommend
                  re-enabling 2FA from your security settings.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="justify-center pb-8">
              <Button
                size="lg"
                onClick={() => router.push("/settings/security")}
                className="gap-2 cursor-pointer"
              >
                Go to Security Settings
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Disable Form ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-error/5 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-warning/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-lg relative z-10 space-y-6">
        {/* Back navigation */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1 text-muted-foreground hover:text-foreground -ml-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Card
          className={cn(
            "border-border shadow-xl overflow-hidden",
            shake && "animate-shake",
          )}
        >
          <CardHeader className="text-center pb-2 pt-8">
            <div className="relative w-fit mx-auto mb-4">
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <ShieldOff className="w-8 h-8 text-destructive" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border-2 border-border flex items-center justify-center">
                <AlertTriangle className="w-3 h-3 text-warning" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl text-destructive">
              Disable Two-Factor Auth
            </CardTitle>
            <CardDescription className="max-w-sm mx-auto">
              This will remove the extra security layer from your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Warning alert */}
            <Alert variant="destructive" className="border-destructive/20">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle className="text-sm font-semibold">
                Security Warning
              </AlertTitle>
              <AlertDescription className="text-xs">
                Disabling 2FA makes your account vulnerable to password-only
                attacks. Only proceed if you have lost access to your
                authenticator device.
              </AlertDescription>
            </Alert>

            {/* Impact cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-muted border space-y-1">
                <div className="flex items-center gap-2 text-destructive">
                  <Lock className="w-4 h-4" />
                  <p className="text-xs font-semibold">Password-only login</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  No second factor required
                </p>
              </div>
              <div className="p-3 rounded-xl bg-muted border space-y-1">
                <div className="flex items-center gap-2 text-warning">
                  <KeyRound className="w-4 h-4" />
                  <p className="text-xs font-semibold">Backup codes void</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Existing codes will no longer work
                </p>
              </div>
            </div>

            <Separator />

            {/* Password input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Confirm your password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setZodError(null);
                    setApiError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleDisable()}
                  placeholder="Enter current password"
                  autoFocus
                  disabled={isLoading}
                  className={cn(
                    "h-12 pr-10",
                    errorMessage &&
                      "border-destructive/50 focus-visible:ring-destructive/20",
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Consent checkbox */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
              <Checkbox
                id="confirm"
                checked={confirmed}
                onCheckedChange={(checked) => {
                  setConfirmed(checked === true);
                  setZodError(null);
                }}
                disabled={isLoading}
                className="mt-0.5 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive cursor-pointer"
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="confirm"
                  className="text-sm font-medium text-destructive cursor-pointer"
                >
                  I understand the risks
                </Label>
                <p className="text-xs text-muted-foreground">
                  I confirm that I want to disable two-factor authentication and
                  accept the reduced account security.
                </p>
              </div>
            </div>

            {/* Error message */}
            {errorMessage && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="flex-col gap-3 pb-8">
            <Button
              variant="destructive"
              className="w-full h-11 sm:h-12 gap-2 shadow-lg shadow-destructive/20 cursor-pointer"
              onClick={handleDisable}
              disabled={isLoading || !confirmed || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Disabling...
                </>
              ) : (
                <>
                  <ShieldOff className="w-4 h-4" />
                  Disable 2FA
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-2 cursor-pointer"
              onClick={() => router.push("/settings/security/2fa/recovery")}
            >
              <RotateCcw className="w-4 h-4" />
              Try recovery code instead
            </Button>
          </CardFooter>
        </Card>

        {/* Help text */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground/60">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="text-xs">
            Changed your mind? You can close this page safely.
          </span>
        </div>
      </div>

      {/* Shake keyframes */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}
