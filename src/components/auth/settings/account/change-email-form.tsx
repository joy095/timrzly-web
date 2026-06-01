// components/auth/change-email-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { authClient } from "../../../../lib/auth-client";
import { toast } from "sonner";

import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../ui/form";

const changeEmailSchema = z
  .object({
    newEmail: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    confirmEmail: z.string().min(1, "Please confirm your email"),
  })
  .refine((data) => data.newEmail === data.confirmEmail, {
    message: "Email addresses do not match",
    path: ["confirmEmail"],
  });

type ChangeEmailValues = z.infer<typeof changeEmailSchema>;

export function ChangeEmailForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: "",
      confirmEmail: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  async function onSubmit(data: ChangeEmailValues) {
    setIsLoading(true);

    const result = await authClient.changeEmail({
      newEmail: data.newEmail,
      callbackURL: "/dashboard",
    });

    if (result.error) {
      setIsLoading(false);
      toast.error(result.error.message || "Failed to change email", {
        description: "Please check the email address and try again.",
      });
    } else {
      setIsSuccess(true);
      setIsLoading(false);
      toast.success("Verification email sent", {
        description: `A verification link has been sent to ${data.newEmail}. Please check your inbox.`,
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
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-text">
              Change Email
            </h2>
            <p className="text-[13px] text-text-muted">
              Update your email address. You'll need to verify the new one.
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6 py-4 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-text">
                  Verify your new email
                </h3>
                <p className="text-[15px] leading-relaxed text-text-secondary">
                  We've sent a verification link to{" "}
                  <span className="font-semibold text-text">
                    {form.getValues("newEmail")}
                  </span>
                  . Click the link to complete the change.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSuccess(false);
                  form.reset();
                }}
                className="h-11 rounded-xl border-border bg-card px-6 text-[14px] font-medium text-text-secondary transition-all hover:bg-surface-variant"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Change different email
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="newEmail"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[13px] font-semibold uppercase tracking-wider text-text-muted">
                          New Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                            <Input
                              placeholder="newemail@healthcare.com"
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

                  <FormField
                    control={form.control}
                    name="confirmEmail"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[13px] font-semibold uppercase tracking-wider text-text-muted">
                          Confirm Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                            <Input
                              placeholder="Re-enter new email"
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
                          Sending...
                        </span>
                      ) : (
                        "Change Email"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
