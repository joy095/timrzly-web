"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { z } from "zod";
import QRCode from "react-qr-code";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// ─── Icons ───────────────────────────────────────────────────
import {
  ShieldCheck,
  Shield,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Copy,
  Download,
  Check,
  AlertCircle,
  Lock,
  Smartphone,
  KeyRound,
  Eye,
  EyeOff,
  Fingerprint,
} from "lucide-react";
import { APP_NAME } from "@/const";

// ─── Zod Schemas ─────────────────────────────────────────────
const totpSchema = z.object({
  code: z
    .string()
    .length(6, "Enter all 6 digits")
    .regex(/^\d{6}$/, "Numbers only"),
});

const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(6, "Password must be at least 6 characters");

// ─── Helpers ─────────────────────────────────────────────────
const getSecretFromURI = (uri: string) => {
  try {
    const url = new URL(uri);
    return url.searchParams.get("secret");
  } catch {
    return null;
  }
};

export default function Enable2FA({ session }: any) {
  const user = session?.user ?? session?.data?.user;
  const router = useRouter();

  const [step, setStep] = useState<"idle" | "password" | "qr" | "success">(
    "idle",
  );
  const [totpURI, setTotpURI] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState<string[]>(new Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shake, setShake] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const fullCode = code.join("");

  const secretKey = useMemo(() => getSecretFromURI(totpURI), [totpURI]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  // ─── Password Step ─────────────────────────────────────────
  const submitPassword = async () => {
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid password");
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: enableError } = await authClient.twoFactor.enable({
      password,
      issuer: APP_NAME,
    });

    if (enableError) {
      setError(
        enableError.message || "Failed to enable 2FA. Check your password.",
      );
      setIsLoading(false);
      triggerShake();
      return;
    }

    if (data?.totpURI) {
      setStep("qr");
      setTotpURI(data.totpURI);
      setBackupCodes(data.backupCodes || []);
    }
    setIsLoading(false);
  };

  // ─── OTP Handlers ──────────────────────────────────────────
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    setError(null);

    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const next = [...code];
    text.split("").forEach((c, i) => {
      if (i < 6) next[i] = c;
    });
    setCode(next);
    setError(null);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  };

  // ─── Verify Step ───────────────────────────────────────────
  const verifyInitialCode = async () => {
    const parsed = totpSchema.safeParse({ code: fullCode });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid code");
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: verifyError } = await authClient.twoFactor.verifyTotp({
        code: fullCode,
      });

      if (verifyError) {
        setError(verifyError.message || "Invalid code. Please try again.");
        setCode(new Array(6).fill(""));
        inputRefs.current[0]?.focus();
        triggerShake();
        setIsLoading(false);
        return;
      }

      setStep("success");
      setCode(new Array(6).fill(""));
      router.refresh();
    } catch (err) {
      console.error("Verification exception:", err);
      setError("An unexpected server error occurred. Please try again.");
      triggerShake();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (step === "qr" && code.every((c) => c !== "") && !isLoading && !error) {
      const t = setTimeout(() => verifyInitialCode(), 150);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, step, isLoading, error]);

  // ─── Clipboard ─────────────────────────────────────────────
  const copyCodes = async () => {
    await navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCodes = () => {
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "2fa-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Render: Already Enabled ───────────────────────────────
  if (user?.twoFactorEnabled) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center border-border shadow-xl">
          <CardHeader className="pb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">2FA is Active</CardTitle>
            <CardDescription>
              Your account is protected with an additional layer of security.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge
              variant="secondary"
              className="bg-success/10 text-success hover:bg-success/20 border-success/20"
            >
              <Check className="w-3 h-3 mr-1" />
              Two-factor authentication enabled
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Render: Wizard ────────────────────────────────────────
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-2xl relative z-10 space-y-6">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2">
          {[
            { id: "idle" as const, label: "Start" },
            { id: "password" as const, label: "Confirm" },
            { id: "qr" as const, label: "Setup" },
          ].map((s, i, arr) => {
            const isDone =
              step === "qr" || (step === "success" && s.id !== "qr");
            const isCurrent = step === s.id;
            const isPast =
              (step === "password" && s.id === "idle") ||
              (step === "qr" && (s.id === "idle" || s.id === "password")) ||
              (step === "success" && s.id !== "qr");

            return (
              <div key={s.id} className="flex items-center gap-2">
                <Badge
                  variant={
                    isCurrent ? "default" : isPast ? "secondary" : "outline"
                  }
                  className={cn(
                    "h-8 px-3 gap-1.5 font-medium",
                    isCurrent && "bg-primary text-primary-foreground",
                    isPast && "bg-primary/10 text-primary border-primary/20",
                  )}
                >
                  <span
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                      isCurrent
                        ? "bg-white/20"
                        : isPast
                          ? "bg-primary/20"
                          : "bg-muted",
                    )}
                  >
                    {isPast && !isCurrent ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      i + 1
                    )}
                  </span>
                  {s.label}
                </Badge>
              </div>
            );
          })}
        </div>

        <Card
          className={cn(
            "border-border shadow-xl overflow-hidden",
            shake && "animate-shake",
          )}
        >
          {/* ─── IDLE STEP ───────────────────────────────────── */}
          {step === "idle" && (
            <>
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">
                  Secure Your Account
                </CardTitle>
                <CardDescription className="max-w-sm mx-auto">
                  Add an extra layer of protection by requiring a verification
                  code from your authenticator app every time you sign in.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      icon: Lock,
                      title: "Block hackers",
                      desc: "Even if your password is stolen",
                    },
                    {
                      icon: Smartphone,
                      title: "Phone-based",
                      desc: "Use any authenticator app",
                    },
                    {
                      icon: KeyRound,
                      title: "Backup codes",
                      desc: "Recovery access if you lose your device",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="p-4 rounded-xl bg-muted/50 border text-left"
                    >
                      <item.icon className="w-5 h-5 text-primary mb-2" />
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-center pb-8">
                <Button
                  size="lg"
                  onClick={() => {
                    setStep("password");
                    setError(null);
                  }}
                  className="gap-2 shadow-lg shadow-primary/20 cursor-pointer"
                >
                  Enable 2FA
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </>
          )}

          {/* ─── PASSWORD STEP ───────────────────────────────── */}
          {step === "password" && (
            <>
              <CardHeader className="pb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-fit -ml-2 text-muted-foreground hover:text-foreground gap-1"
                  onClick={() => setStep("idle")}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Confirm your password</CardTitle>
                  <CardDescription>
                    Please re-enter your password to continue
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 max-w-sm mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && submitPassword()}
                      placeholder="Enter your password"
                      autoFocus
                      className={cn(
                        "h-12 pr-10",
                        error &&
                          "border-destructive focus-visible:ring-destructive/20",
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
                  className="w-full h-11 gap-2 cursor-pointer"
                  onClick={submitPassword}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </>
          )}

          {/* ─── QR STEP ─────────────────────────────────────── */}
          {step === "qr" && (
            <>
              <CardHeader className="pb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-fit -ml-2 text-muted-foreground hover:text-foreground gap-1"
                  onClick={() => setStep("password")}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Fingerprint className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Scan & Verify</CardTitle>
                  <CardDescription>
                    Scan the QR code with your authenticator app, save your
                    backup codes, then enter the 6-digit code to confirm.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* QR + Secret */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-white p-4 rounded-2xl border shadow-sm">
                      <QRCode value={totpURI || ""} size={160} />
                    </div>

                    {secretKey && (
                      <div className="w-full space-y-1.5">
                        <Label className="text-xs text-muted-foreground text-center block">
                          Can&apos;t scan? Enter manually
                        </Label>
                        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 border">
                          <code className="flex-1 text-xs font-mono truncate">
                            {secretKey}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => {
                              navigator.clipboard.writeText(secretKey);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                          >
                            {copied ? (
                              <Check className="w-3.5 h-3.5 text-success" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Backup + Verify */}
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Backup Codes
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Store these safely. Each code can only be used once.
                      </p>

                      <div className="bg-muted rounded-xl p-4 border space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          {backupCodes.map((c, i) => (
                            <div
                              key={i}
                              className="font-mono text-sm bg-background border rounded-md px-2 py-1.5 text-center"
                            >
                              {c}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs gap-1"
                            onClick={copyCodes}
                          >
                            {copied ? (
                              <Check className="w-3 h-3 text-success" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            {copied ? "Copied" : "Copy"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs gap-1"
                            onClick={downloadCodes}
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Verify setup
                      </Label>
                      <div className="flex justify-center gap-2 sm:gap-3">
                        {code.map((digit, i) => (
                          <input
                            key={i}
                            ref={(el) => {
                              inputRefs.current[i] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            onPaste={handlePaste}
                            disabled={isLoading}
                            aria-label={`Digit ${i + 1}`}
                            className={cn(
                              "flex-1 min-w-0 h-12 sm:h-14 text-center text-lg sm:text-xl font-semibold rounded-lg border-2 bg-muted text-foreground placeholder:text-muted-foreground outline-none transition-all",
                              error
                                ? "border-destructive/50 focus:border-destructive focus:ring-4 focus:ring-destructive/10"
                                : digit
                                  ? "border-primary/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                  : "border-input focus:border-primary focus:ring-4 focus:ring-primary/10",
                              "disabled:opacity-50",
                            )}
                          />
                        ))}
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
                        className="w-full h-11 gap-2"
                        onClick={verifyInitialCode}
                        disabled={isLoading || code.some((c) => !c)}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify & Finish"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* ─── SUCCESS STEP ────────────────────────────────── */}
          {step === "success" && (
            <>
              <CardHeader className="text-center pt-8 pb-2">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
                  <ShieldCheck className="w-10 h-10 text-success" />
                </div>
                <CardTitle className="text-2xl">2FA Enabled!</CardTitle>
                <CardDescription className="max-w-sm mx-auto">
                  Your account is now protected. You will be asked for a
                  verification code each time you sign in.
                </CardDescription>
              </CardHeader>
              <CardFooter className="justify-center pb-8">
                <Button
                  size="lg"
                  onClick={() => router.push("/dashboard")}
                  className="gap-2 cursor-pointer"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
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
