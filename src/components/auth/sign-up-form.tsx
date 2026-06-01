// components/auth/sign-up-form.tsx
"use client";

import { useState, useCallback, memo, useRef } from "react";
import { useForm, useWatch, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ProviderButtons } from "./provider-buttons";

const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

/* ------------------------------------------------------------------ */
/*  Isolated password-strength block — ONLY this component re-renders */
/*  when the password changes. The parent form stays completely idle.   */
/* ------------------------------------------------------------------ */
const PasswordStrength = memo(function PasswordStrength({
  control,
}: {
  control: Control<SignUpValues>;
}) {
  const password = useWatch({ control, name: "password", defaultValue: "" });

  const reqs = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
  ];

  return (
    <div className="space-y-2 rounded-xl bg-surface-variant/50 p-4">
      <p className="text-[12px] font-semibold uppercase tracking-wider text-text-muted">
        Password Requirements
      </p>
      <div className="grid grid-cols-2 gap-2">
        {reqs.map((req) => (
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
  );
});

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

export function SignUpForm() {
  const router = useRouter();

  /* ---------------------------------------------------------------- */
  /*  Explicit useRef for the <form> element                          */
  /* ---------------------------------------------------------------- */
  const formRef = useRef<HTMLFormElement>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  /* ---------------------------------------------------------------- */
  /*  register() returns { ref, onChange, onBlur, name }.              */
  /*  We destructure the ref and forward it to the <Input> component. */
  /*  The input is now an uncontrolled DOM node — no React state      */
  /*  updates or re-renders happen on every keystroke.               */
  /* ---------------------------------------------------------------- */
  const { ref: nameRef, ...nameReg } = register("name");
  const { ref: emailRef, ...emailReg } = register("email");
  const { ref: passRef, ...passReg } = register("password");
  const { ref: confirmRef, ...confirmReg } = register("confirmPassword");

  const togglePassword = useCallback(() => setShowPassword((p) => !p), []);
  const toggleConfirm = useCallback(() => setShowConfirm((p) => !p), []);

  async function onSubmit(data: SignUpValues) {
    setIsLoading(true);

    try {
      const result = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: "/auth/verify-email",
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to create account", {
          description: "Please check your information and try again.",
        });
        setIsLoading(false);
        return;
      }

      /* -------------------------------------------------------------- */
      /*  FIX: Navigate on success.                                   */
      /* -------------------------------------------------------------- */
      router.push("/auth/verify-email");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-[28px] font-semibold tracking-tight text-text">
          Create your account
        </h1>
        <p className="text-[15px] leading-relaxed text-text-secondary">
          Join thousands of patients managing their health with confidence.
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        {/* ---------- Full Name (uncontrolled) ---------- */}
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-[13px] font-semibold uppercase tracking-wider text-text-muted"
          >
            Full Name
          </Label>
          <Input
            id="name"
            placeholder="Sarah paul"
            autoComplete="name"
            disabled={isLoading}
            className="h-12 rounded-xl border-input bg-surface-variant/50 px-4 text-[15px] text-text placeholder:text-text-muted/60 transition-all hover:border-border-strong focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
            ref={nameRef}
            {...nameReg}
          />
          {errors.name && (
            <p className="text-xs font-medium text-error">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* ---------- Email (uncontrolled) ---------- */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-[13px] font-semibold uppercase tracking-wider text-text-muted"
          >
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
            disabled={isLoading}
            className="h-12 rounded-xl border-input bg-surface-variant/50 px-4 text-[15px] text-text placeholder:text-text-muted/60 transition-all hover:border-border-strong focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
            ref={emailRef}
            {...emailReg}
          />
          {errors.email && (
            <p className="text-xs font-medium text-error">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* ---------- Password (uncontrolled) ---------- */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-[13px] font-semibold uppercase tracking-wider text-text-muted"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              autoComplete="new-password"
              disabled={isLoading}
              className="h-12 rounded-xl border-input bg-surface-variant/50 px-4 pr-12 text-[15px] text-text placeholder:text-text-muted/60 transition-all hover:border-border-strong focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
              ref={passRef}
              {...passReg}
            />
            <PasswordToggle show={showPassword} onToggle={togglePassword} />
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-error">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* ---------- Password Strength (isolated re-renders) ---------- */}
        <PasswordStrength control={control} />

        {/* ---------- Confirm Password (uncontrolled) ---------- */}
        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-[13px] font-semibold uppercase tracking-wider text-text-muted"
          >
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••••••"
              autoComplete="new-password"
              disabled={isLoading}
              className="h-12 rounded-xl border-input bg-surface-variant/50 px-4 pr-12 text-[15px] text-text placeholder:text-text-muted/60 transition-all hover:border-border-strong focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
              ref={confirmRef}
              {...confirmReg}
            />
            <PasswordToggle show={showConfirm} onToggle={toggleConfirm} />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs font-medium text-error">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* ---------- Terms (uncontrolled native checkbox) ---------- */}
        <div className="flex flex-row items-start space-x-3 space-y-0">
          {/* Hidden native checkbox registered with RHF */}
          <input
            type="checkbox"
            id="terms-native"
            className="sr-only"
            {...register("terms")}
          />
          <Checkbox
            id="terms"
            disabled={isLoading}
            className="mt-0.5 h-5 w-5 rounded-md border-border-strong data-[state=checked]:border-primary data-[state=checked]:bg-primary"
            onCheckedChange={(checked) => {
              setValue("terms", checked === true, { shouldValidate: true });
            }}
          />
          <div className="space-y-1 leading-none">
            <Label
              htmlFor="terms"
              className="cursor-pointer text-[13px] font-medium leading-relaxed text-text-secondary"
            >
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
            {errors.terms && (
              <p className="text-xs font-medium text-error">
                {errors.terms.message}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-xl bg-primary text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-70"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

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
        Already have an account?{" "}
        <Link
          href="/auth/sign-in"
          className="font-semibold text-text underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
