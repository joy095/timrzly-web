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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// ─── Icons ───────────────────────────────────────────────────
import {
  ShieldAlert,
  ArrowLeft,
  Loader2,
  AlertCircle,
  KeyRound,
  RotateCcw,
  LifeBuoy,
} from "lucide-react";

// ─── Zod Schema ──────────────────────────────────────────────
const recoverySchema = z.object({
  code: z
    .string()
    .min(6, "Recovery code is too short")
    .max(32, "Recovery code is too long")
    .regex(/^[a-zA-Z0-9-]+$/, "Invalid recovery code format"),
});

export default function RecoveryCode() {
  const [code, setCode] = useState("");
  const [zodError, setZodError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const router = useRouter();

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const handleChange = (value: string) => {
    // Allow alphanumeric and hyphens
    const sanitized = value.replace(/[^a-zA-Z0-9-]/g, "");
    setCode(sanitized);
    setZodError(null);
    setApiError(null);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    handleChange(pasted);
  };

  const verify = async () => {
    const result = recoverySchema.safeParse({ code });

    if (!result.success) {
      const firstError = result.error.issues[0]?.message ?? "Invalid code";
      setZodError(firstError);
      setApiError(null);
      triggerShake();
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      // Better Auth recovery verification
      const { error: verifyError } =
        await authClient.twoFactor.verifyBackupCode({
          code: result.data.code,
        });

      if (verifyError) {
        setApiError(
          verifyError.message || "Invalid recovery code. Please try again.",
        );
        setIsLoading(false);
        triggerShake();
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Recovery verification exception:", err);
      setApiError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
      triggerShake();
    }
  };

  const errorMessage = zodError || apiError;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-warning/5 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-error/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Back navigation */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/login")}
          className="gap-1 text-muted-foreground hover:text-foreground -ml-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Button>

        <Card
          className={cn(
            "border-border shadow-xl overflow-hidden",
            shake && "animate-shake",
          )}
        >
          <CardHeader className="text-center pb-2 pt-8">
            <div className="relative w-fit mx-auto mb-4">
              <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center">
                <LifeBuoy className="w-8 h-8 text-warning" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border-2 border-border flex items-center justify-center">
                <KeyRound className="w-3 h-3 text-warning" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl">
              Use Recovery Code
            </CardTitle>
            <CardDescription className="max-w-[300px] mx-auto">
              Enter one of your saved backup codes to regain access to your
              account. Each code can only be used once.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Info alert */}
            <Alert className="bg-warning/5 border-warning/20 text-warning">
              <ShieldAlert className="h-4 w-4 text-warning" />
              <AlertDescription className="text-xs text-warning/90">
                Recovery codes were provided when you enabled 2FA. Using a
                recovery code will disable 2FA — you&apos;ll need to set it up
                again.
              </AlertDescription>
            </Alert>

            {/* Recovery code input */}
            <div className="space-y-2">
              <Label htmlFor="recovery-code" className="text-sm font-medium">
                Recovery Code
              </Label>
              <div className="relative">
                <Input
                  id="recovery-code"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="XXXX-XXXX"
                  value={code}
                  onChange={(e) => handleChange(e.target.value)}
                  onPaste={handlePaste}
                  onKeyDown={(e) => e.key === "Enter" && verify()}
                  disabled={isLoading}
                  className={cn(
                    "h-14 text-center text-lg sm:text-xl font-mono tracking-widest bg-muted border-2 transition-all",
                    errorMessage
                      ? "border-destructive/50 focus-visible:ring-destructive/20"
                      : "border-input focus-visible:border-primary focus-visible:ring-primary/20",
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                You can copy and paste the full code from your backup file
              </p>
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

          <CardFooter className="flex-col gap-4 pb-8">
            <Button
              className="w-full h-11 sm:h-12 gap-2 shadow-lg shadow-primary/20 cursor-pointer"
              onClick={verify}
              disabled={isLoading || code.length < 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Verify & Sign In
                </>
              )}
            </Button>

            <Separator className="w-full" />

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-2 cursor-pointer"
              onClick={() => router.push("/2fa")}
            >
              <RotateCcw className="w-4 h-4" />
              Try authenticator code instead
            </Button>
          </CardFooter>
        </Card>

        {/* Help text */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground/60">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="text-xs">
            Lost your recovery codes? Contact your administrator.
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
