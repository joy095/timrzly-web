"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── shadcn/ui components ────────────────────────────────────
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ─── Icons ───────────────────────────────────────────────────
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  ArrowRight,
  Lock,
  Smartphone,
  AlertTriangle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
interface TwoFactorStatusCardProps {
  initialEnabled?: boolean;
}

export default function TwoFactorStatusCard({
  initialEnabled = false,
}: TwoFactorStatusCardProps) {
  // In real app, derive this from session/user data
  const [isEnabled, setIsEnabled] = useState(initialEnabled);

  return (
    <Card className="border-border shadow-sm overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                isEnabled ? "bg-primary/10" : "bg-warning/10",
              )}
            >
              {isEnabled ? (
                <ShieldCheck className="w-6 h-6 text-primary" />
              ) : (
                <ShieldOff className="w-6 h-6 text-warning" />
              )}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base sm:text-lg">
                Two-Factor Authentication
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm max-w-md">
                {isEnabled
                  ? "Your account is protected with an additional verification step."
                  : "Add an extra layer of security by requiring a code from your authenticator app."}
              </CardDescription>
            </div>
          </div>

          <Badge
            variant={isEnabled ? "default" : "secondary"}
            className={cn(
              "shrink-0",
              isEnabled &&
                "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20",
              !isEnabled &&
                "bg-warning/10 text-warning hover:bg-warning/20 border-warning/20",
            )}
          >
            {isEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-5 pb-6">
        {/* Status Details */}
        <div
          className={cn(
            "flex items-start gap-3 p-4 rounded-xl border mb-5",
            isEnabled
              ? "bg-primary/5 border-primary/10"
              : "bg-warning/5 border-warning/10",
          )}
        >
          {isEnabled ? (
            <Smartphone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
          )}
          <div className="space-y-1">
            <p
              className={cn(
                "text-sm font-medium",
                isEnabled ? "text-primary" : "text-warning",
              )}
            >
              {isEnabled
                ? "Authenticator app active"
                : "Account vulnerable to password-only attacks"}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isEnabled
                ? "You will be prompted for a 6-digit code each time you sign in on an untrusted device."
                : "Without 2FA, anyone with your password can access your account. Enable it to protect sensitive patient data."}
            </p>
          </div>
        </div>

        {/* Conditional Action */}
        {isEnabled ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-muted border space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Lock className="w-4 h-4 text-primary" />
                  <span>Security method</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  TOTP via authenticator app
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted border space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Recovery codes</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  10 backup codes generated
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="outline" className="flex-1 h-11 gap-2" asChild>
                <Link href="/settings/security/2fa/recovery">
                  Generate Recovery Codes
                </Link>
              </Button>
              <Button
                variant="destructive"
                className="flex-1 h-11 gap-2 shadow-sm shadow-destructive/10"
                asChild
              >
                <Link href="/settings/security/2fa/disable">
                  <ShieldOff className="w-4 h-4" />
                  Disable 2FA
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
              {[
                {
                  icon: Lock,
                  title: "Block hackers",
                  desc: "Even if password is stolen",
                },
                {
                  icon: Smartphone,
                  title: "App-based",
                  desc: "Google Authenticator, Authy, etc.",
                },
                {
                  icon: Shield,
                  title: "HIPAA aligned",
                  desc: "Recommended for healthcare",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-3 rounded-lg bg-muted border text-center sm:text-left space-y-1"
                >
                  <item.icon className="w-4 h-4 text-primary mx-auto sm:mx-0" />
                  <p className="text-xs font-medium">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <Button
              className="w-full h-11 sm:h-12 gap-2 shadow-lg shadow-primary/20"
              asChild
            >
              <Link href="/settings/security/2fa/enable">
                Enable Two-Factor Auth
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
