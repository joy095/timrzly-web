// components/auth/forgot-password-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
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

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  async function onSubmit(data: ForgotPasswordValues) {
    setIsLoading(true);

    const result = await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: "/auth/reset-password",
    });

    if (result.error) {
      setIsLoading(false);
      toast.error(result.error.message || "Failed to send reset link", {
        description: "Please check your email address and try again.",
      });
    } else {
      setIsSuccess(true);
      setIsLoading(false);
      toast.success("Reset link sent", {
        description: "Check your inbox for the password reset link.",
      });
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
            Check your email
          </h2>
          <p className="text-[15px] leading-relaxed text-text-secondary">
            We've sent a password reset link to{" "}
            <span className="font-semibold text-text">
              {form.getValues("email")}
            </span>
          </p>
        </div>
        <p className="text-sm text-text-muted">
          Didn't receive it?{" "}
          <button
            onClick={() => {
              setIsSuccess(false);
              form.reset();
            }}
            className="font-semibold text-primary hover:underline"
          >
            Try again
          </button>
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link
          href="/auth/sign-in"
          className="mb-6 inline-flex items-center gap-2 text-[13px] font-medium text-text-muted transition-colors hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
        <h1 className="text-[28px] font-semibold tracking-tight text-text">
          Reset your password
        </h1>
        <p className="text-[15px] leading-relaxed text-text-secondary">
          Enter your email and we'll send you a link to create a new password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[13px] font-semibold uppercase tracking-wider text-text-muted">
                  Email Address
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <Input
                      placeholder="you@healthcare.com"
                      type="email"
                      autoComplete="email"
                      disabled={isLoading}
                      className="h-12 rounded-xl border-input bg-surface-variant/50 pl-11 pr-4 text-[15px] text-text placeholder:text-text-muted/60 transition-all hover:border-border-strong focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-xl bg-primary text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending link...
              </span>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
