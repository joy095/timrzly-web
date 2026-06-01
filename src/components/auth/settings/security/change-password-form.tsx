// components/auth/change-password-form.tsx
"use client";

import { useState, useCallback, memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Check, X, ShieldCheck } from "lucide-react";
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

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

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

export function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const newPassword = form.watch("newPassword");

  const requirements = [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(newPassword) },
    { label: "One lowercase letter", met: /[a-z]/.test(newPassword) },
    { label: "One number", met: /[0-9]/.test(newPassword) },
  ];

  const toggleCurrent = useCallback(() => setShowCurrent((p) => !p), []);
  const toggleNew = useCallback(() => setShowNew((p) => !p), []);
  const toggleConfirm = useCallback(() => setShowConfirm((p) => !p), []);

  async function onSubmit(data: ChangePasswordValues) {
    setIsLoading(true);

    const result = await authClient.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      revokeOtherSessions: true,
    });

    if (result.error) {
      setIsLoading(false);
      toast.error(result.error.message || "Failed to change password", {
        description: "Please check your current password and try again.",
      });
    } else {
      setIsLoading(false);
      form.reset();
      toast.success("Password updated successfully", {
        description:
          "Your password has been changed. Please sign in again on other devices.",
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      <div className="absolute -inset-1 rounded-[calc(var(--radius-2xl)+4px)] bg-primary/5 blur-xl" />
      <div className="relative rounded-2xl border border-border bg-card p-8 shadow-[0_8px_40px_-12px_var(--color-shadow)/8%]">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-text">
              Change Password
            </h2>
            <p className="text-[13px] text-text-muted">
              Update your password to keep your account secure
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[13px] font-semibold uppercase tracking-wider text-text-muted">
                    Current Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Enter current password"
                        type={showCurrent ? "text" : "password"}
                        autoComplete="current-password"
                        disabled={isLoading}
                        className="h-12 rounded-xl border-input bg-surface-variant/50 px-4 pr-12 text-[15px] text-text placeholder:text-text-muted/60 transition-all hover:border-border-strong focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
                        {...field}
                      />
                      <PasswordToggle
                        show={showCurrent}
                        onToggle={toggleCurrent}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="h-px w-full bg-divider" />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[13px] font-semibold uppercase tracking-wider text-text-muted">
                    New Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Create a strong password"
                        type={showNew ? "text" : "password"}
                        autoComplete="new-password"
                        disabled={isLoading}
                        className="h-12 rounded-xl border-input bg-surface-variant/50 px-4 pr-12 text-[15px] text-text placeholder:text-text-muted/60 transition-all hover:border-border-strong focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
                        {...field}
                      />
                      <PasswordToggle show={showNew} onToggle={toggleNew} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Requirements */}
            <div className="space-y-2 rounded-xl bg-surface-variant/50 p-4">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-text-muted">
                Password Requirements
              </p>
              <div className="grid grid-cols-2 gap-2">
                {requirements.map((req) => (
                  <div
                    key={req.label}
                    className={`flex items-center gap-2 text-[13px] transition-colors ${
                      req.met ? "text-success" : "text-text-muted"
                    }`}
                  >
                    {req.met ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    {req.label}
                  </div>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[13px] font-semibold uppercase tracking-wider text-text-muted">
                    Confirm New Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Re-enter new password"
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        disabled={isLoading}
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

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => form.reset()}
                className="h-11 rounded-xl border-border bg-card px-6 text-[14px] font-medium text-text-secondary transition-all hover:bg-surface-variant"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 rounded-xl bg-primary px-6 text-[14px] font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </span>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </motion.div>
  );
}
