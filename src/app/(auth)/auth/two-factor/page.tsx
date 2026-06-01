"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ─── Icons ───────────────────────────────────────────────────
import {
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Smartphone,
  Fingerprint,
  AlertCircle,
  KeyRound,
} from "lucide-react";

// ─── Zod Schema ──────────────────────────────────────────────
const totpSchema = z.object({
  code: z
    .string()
    .length(6, "Code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Code must contain only numbers"),
  trustDevice: z.boolean().default(false),
});

type TotpFormData = z.infer<typeof totpSchema>;

export default function TwoFactor() {
  const [code, setCode] = useState<string[]>(new Array(6).fill(""));
  const [zodError, setZodError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  const [shake, setShake] = useState(false);
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fullCode = code.join("");

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  // ─── Validation Helper ─────────────────────────────────────
  const validate = (): TotpFormData | null => {
    const result = totpSchema.safeParse({
      code: fullCode,
      trustDevice,
    });

    if (!result.success) {
      const firstError = result.error.issues[0]?.message ?? "Invalid input";
      setZodError(firstError);
      setApiError(null);
      triggerShake();
      return null;
    }

    setZodError(null);
    return result.data;
  };

  // ─── Input Handlers ────────────────────────────────────────
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setZodError(null);
    setApiError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const newCode = [...code];
    pasted.split("").forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });
    setCode(newCode);
    setZodError(null);
    setApiError(null);

    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  // ─── Submit Handler ──────────────────────────────────────
  const verify = async () => {
    const validated = validate();
    if (!validated) return;

    setIsLoading(true);
    setApiError(null);

    const { data, error: verifyError } = await authClient.twoFactor.verifyTotp({
      code: validated.code,
      trustDevice: validated.trustDevice,
    });

    if (verifyError) {
      setApiError(verifyError.message || "Invalid code. Please try again.");
      setIsLoading(false);
      setCode(new Array(6).fill(""));
      inputRefs.current[0]?.focus();
      triggerShake();
      return;
    }

    router.push("/dashboard");
  };

  // Auto-submit when all digits entered & valid
  useEffect(() => {
    if (code.every((c) => c !== "") && !isLoading && !zodError) {
      const timer = setTimeout(() => verify(), 150);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, zodError, isLoading, trustDevice]);

  const errorMessage = zodError || apiError;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary/5 blur-[120px]" />
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
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border-2 border-border flex items-center justify-center">
                <Fingerprint className="w-3 h-3 text-primary" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl">
              Two-Factor Authentication
            </CardTitle>
            <CardDescription className="max-w-[280px] mx-auto">
              Enter the 6-digit verification code from your authenticator app
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* OTP Inputs — RESPONSIVE */}
            <div className="flex justify-center gap-2 sm:gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isLoading}
                  aria-label={`Digit ${index + 1}`}
                  className={cn(
                    "flex-1 min-w-0 h-12 sm:h-14 text-center text-lg sm:text-xl font-semibold rounded-lg border-2 bg-muted text-foreground placeholder:text-muted-foreground outline-none transition-all disabled:opacity-50",
                    errorMessage
                      ? "border-destructive/50 focus:border-destructive focus:ring-4 focus:ring-destructive/10"
                      : digit
                        ? "border-primary/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
                        : "border-input focus:border-primary focus:ring-4 focus:ring-primary/10",
                  )}
                />
              ))}
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

            {/* Trust device toggle */}
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-muted border">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    Trust this device
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Skip 2FA for 30 days
                  </p>
                </div>
              </div>
              <Switch
                checked={trustDevice}
                onCheckedChange={(checked) => {
                  setTrustDevice(checked);
                  setZodError(null);
                }}
                aria-label="Trust this device for 30 days"
              />
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4 pb-8">
            <Button
              className="w-full h-11 sm:h-12 gap-2 shadow-lg shadow-primary/20 cursor-pointer"
              onClick={verify}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Continue"
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Lost access to your authenticator?{" "}
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs font-medium cursor-pointer"
                onClick={() => router.push("/auth/recovery-code")}
              >
                Use recovery code
              </Button>
            </p>
          </CardFooter>
        </Card>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground/60">
          <KeyRound className="w-3.5 h-3.5" />
          <span className="text-xs">End-to-end encrypted verification</span>
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
