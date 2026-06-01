// components/auth/sign-in-form.tsx
"use client";

import { useState, useCallback, memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ProviderButtons } from "./provider-button";
import { useRouter } from "next/navigation";

const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

type SignInValues = z.input<typeof signInSchema>;

// Memoized password toggle to prevent re-renders
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
      aria-label={show ? "Hide password" : "Show password"} // Added this
      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text"
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
});

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onBlur", // Validate on blur for minimal re-renders
    reValidateMode: "onChange",
  });

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  async function onSubmit(data: SignInValues) {
    setIsLoading(true);
    let isSuccess = false; // Tracks if we are successfully navigating away

    try {
      const { data: sessionData, error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      // 1. Handle authentication errors safely
      if (error) {
        toast.error(error.message || "Invalid email or password", {
          description: "Please check your credentials and try again.",
        });
        return; // Exits to the finally block
      }

      // 2. Safely check for 2FA without using 'any'
      const requires2FA = (sessionData as { twoFactorRedirect?: boolean })
        ?.twoFactorRedirect;

      // 3. Determine the destination and navigate
      if (requires2FA) {
        isSuccess = true;
        router.push("/auth/two-factor");
        router.refresh();
        return;
      }

      // 4. Navigate to dashboard for users WITHOUT 2FA
      isSuccess = true;
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      // 5. Catch unexpected network crashes
      console.error("Sign-in error:", err);
      toast.error("Connection error", {
        description: "An unexpected network error occurred. Please try again.",
      });
    } finally {
      // 6. Smart Loading Reset
      // Only turn off the loading spinner if the login FAILED.
      // If it succeeded, leaving it 'true' keeps the button in a loading state
      // while the Next.js router takes a millisecond to switch pages.
      if (!isSuccess) {
        setIsLoading(false);
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-[28px] font-semibold tracking-tight text-text">
          Welcome back
        </h1>
        <p className="text-[15px] leading-relaxed text-text-secondary">
          Sign in to access your patient portal and appointments.
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
                  <Input
                    placeholder="you@healthcare.com"
                    type="email"
                    autoComplete="email"
                    disabled={isLoading}
                    className="h-12 rounded-xl border-input bg-surface-variant/50 px-4 text-[15px] text-text placeholder:text-text-muted/60 transition-all hover:border-border-strong focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-[13px] font-semibold uppercase tracking-wider text-text-muted">
                    Password
                  </FormLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[13px] font-medium text-text-secondary underline-offset-4 transition-colors hover:text-text hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="••••••••••••"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      disabled={isLoading}
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
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                    className="mt-0.5 h-5 w-5 rounded-md border-border-strong data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="cursor-pointer text-[14px] font-medium text-text-secondary">
                    Keep me signed in for 30 days
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 h-12 w-full rounded-xl bg-primary text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Authenticating...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>

      <div className="relative flex items-center py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-divider" />
        </div>
        <span className="relative mx-auto bg-card px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
          Or
        </span>
      </div>

      <ProviderButtons disabled={isLoading} />

      <p className="text-center text-[15px] text-text-secondary">
        No account?{" "}
        <Link
          href="/auth/sign-up"
          className="font-semibold text-text underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
