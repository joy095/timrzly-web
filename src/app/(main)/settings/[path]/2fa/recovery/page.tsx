"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ─── Icons ───────────────────────────────────────────────────
import {
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  KeyRound,
  Shield,
  Copy,
  Download,
  Check,
  AlertTriangle,
  AlertCircle,
  Lock,
  RotateCcw,
  Fingerprint,
  Sparkles,
} from "lucide-react";

// ─── Zod Schema ──────────────────────────────────────────────
const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(6, "Password must be at least 6 characters");

export default function GenerateBackupCodesPage() {
  const router = useRouter();
  const [step, setStep] = useState<"verify" | "codes">("verify");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shake, setShake] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  // ─── Password Gate ─────────────────────────────────────────
  const verifyAndGenerate = async () => {
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid password");
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: apiError } =
      await authClient.twoFactor.generateBackupCodes({
        password: parsed.data,
      });

    if (apiError) {
      setError(apiError.message || "Incorrect password. Please try again.");
      setIsLoading(false);
      triggerShake();
      return;
    }

    if (data?.backupCodes && data.backupCodes.length > 0) {
      setBackupCodes(data.backupCodes);
      setStep("codes");
    } else {
      setError("Failed to generate codes. Please try again.");
      triggerShake();
    }

    setIsLoading(false);
  };

  // ─── Clipboard Actions ─────────────────────────────────────
  const copyCodes = async () => {
    if (!backupCodes.length) return;
    await navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCodes = () => {
    if (!backupCodes.length) return;
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "2fa-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-warning/5 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
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
          {/* ─── PASSWORD GATE ─────────────────────────────── */}
          {step === "verify" && (
            <>
              <CardHeader className="text-center pb-2 pt-8">
                <div className="relative w-fit mx-auto mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-warning" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border-2 border-border flex items-center justify-center">
                    <Fingerprint className="w-3 h-3 text-warning" />
                  </div>
                </div>
                <CardTitle className="text-xl sm:text-2xl">
                  Generate Backup Codes
                </CardTitle>
                <CardDescription className="max-w-sm mx-auto">
                  Enter your password to generate a fresh set of recovery codes.
                  This will invalidate all previously generated codes.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 max-w-sm mx-auto">
                <Alert className="bg-destructive/5 border-destructive/10 text-destructive">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <AlertTitle className="text-sm font-semibold">
                    Invalidates old codes
                  </AlertTitle>
                  <AlertDescription className="text-xs text-destructive/90">
                    Generating new codes will immediately void any existing
                    backup codes. Save these new ones securely.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" && verifyAndGenerate()
                      }
                      placeholder="Enter your password"
                      autoFocus
                      disabled={isLoading}
                      className={cn(
                        "h-12 pr-10",
                        error &&
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

                {error && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  className="w-full h-11 gap-2 shadow-lg shadow-primary/20"
                  onClick={verifyAndGenerate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate New Codes
                    </>
                  )}
                </Button>
              </CardContent>

              <CardFooter className="justify-center pb-8">
                <p className="text-xs text-muted-foreground text-center">
                  Forgot your password?{" "}
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs cursor-pointer"
                    onClick={() =>
                      router.push("/settings/security/2fa/disable")
                    }
                  >
                    Disable 2FA
                  </Button>
                </p>
              </CardFooter>
            </>
          )}

          {/* ─── CODES DISPLAY ─────────────────────────────── */}
          {step === "codes" && (
            <>
              <CardHeader className="text-center pb-2 pt-8">
                <div className="relative w-fit mx-auto mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <KeyRound className="w-8 h-8 text-primary" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="absolute -bottom-1 -right-1 bg-card border text-xs font-bold px-2 py-0.5"
                  >
                    {backupCodes.length}
                  </Badge>
                </div>
                <CardTitle className="text-xl sm:text-2xl">
                  New Backup Codes
                </CardTitle>
                <CardDescription className="max-w-sm mx-auto">
                  These are your only recovery method. Copy or download them
                  before leaving this page.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Warning */}
                <Alert className="bg-warning/5 border-warning/20 text-warning">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <AlertTitle className="text-sm font-semibold">
                    Save immediately
                  </AlertTitle>
                  <AlertDescription className="text-xs text-warning/90">
                    These codes will not be shown again. If you lose them, you
                    must generate a new set or disable 2FA entirely.
                  </AlertDescription>
                </Alert>

                {/* Codes Grid */}
                <div className="p-4 sm:p-5 rounded-xl bg-muted border space-y-4">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {backupCodes.map((code, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 font-mono text-sm bg-background border rounded-lg px-3 py-2.5"
                      >
                        <span className="text-muted-foreground text-xs w-5 shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 truncate tracking-wider">
                          {code}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 gap-1.5 text-xs"
                      onClick={copyCodes}
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copied ? "Copied" : "Copy All"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 gap-1.5 text-xs"
                      onClick={downloadCodes}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Regenerate hint */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                  <RotateCcw className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium">Need another set?</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      You can generate new codes anytime, but doing so will
                      permanently invalidate the codes shown above.
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex-col gap-3 pb-8">
                <Button
                  className="w-full h-11 gap-2"
                  onClick={() => router.push("/dashboard")}
                >
                  <Shield className="w-4 h-4" />
                  Done — Go to Dashboard
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setStep("verify");
                    setPassword("");
                    setBackupCodes([]);
                  }}
                >
                  <Lock className="w-4 h-4" />
                  Lock & Generate Again
                </Button>
              </CardFooter>
            </>
          )}
        </Card>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground/60">
          <Shield className="w-3.5 h-3.5" />
          <span className="text-xs">
            Client-side encrypted • Codes generated on request
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
