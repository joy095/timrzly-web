// components/auth/reset-password-form.tsx
"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[a-z]/, "Must contain lowercase")
      .regex(/[0-9]/, "Must contain number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const PasswordToggle = memo(function PasswordToggle({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onToggle}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text"
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
});

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!token) {
      setTokenError("Invalid or expired reset link. Please request a new one.");
      toast.error("Invalid reset link", {
        description: "Please request a new password reset link.",
      });
    }
  }, [token]);

  const togglePassword = useCallback(() => setShowPassword((p) => !p), []);
  const toggleConfirm = useCallback(() => setShowConfirm((p) => !p), []);

  async function onSubmit(data: ResetPasswordValues) {
    if (!token) return;
    setIsLoading(true);

    const result = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });

    if (result.error) {
      setIsLoading(false);
      toast.error(result.error.message || "Failed to reset password", {
        description: "Please try again or request a new reset link.",
      });
    } else {
      setIsSuccess(true);
      toast.success("Password updated successfully", {
        description: "Redirecting you to sign in...",
      });
      setTimeout(() => router.push("/auth/sign-in"), 3000);
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6 text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-text">
            Password updated
          </h2>
          <p className="text-[15px] leading-relaxed text-text-secondary">
            Your password has been reset successfully. Redirecting you to sign
            in...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-[28px] font-semibold tracking-tight text-text">
          Create new password
        </h1>
        <p className="text-[15px] leading-relaxed text-text-secondary">
          Your new password must be different from your previous passwords.
        </p>
      </div>

      {tokenError && (
        <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm font-medium text-error">
          {tokenError}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[13px] font-semibold uppercase tracking-wider text-text-muted">
                  New Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      disabled={isLoading || !token}
                      className="h-12 rounded-xl border-input bg-surface-variant/50 px-4 pr-12 text-[15px] text-text placeholder:text-text-muted/60 transition-all hover:border-border-strong focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
                      {...field}
                    />
                    <PasswordToggle
                      show={showPassword}
                      onToggle={togglePassword}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[13px] font-semibold uppercase tracking-wider text-text-muted">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      disabled={isLoading || !token}
                      className="h-12 rounded-xl border-input bg-surface-variant/50 px-4 pr-12 text-[15px] text-text placeholder:text-text-muted/60 transition-all hover:border-border-strong focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
                      {...field}
                    />
                    <PasswordToggle
                      show={showConfirm}
                      onToggle={toggleConfirm}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading || !token}
            className="h-12 w-full rounded-xl bg-primary text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </span>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
