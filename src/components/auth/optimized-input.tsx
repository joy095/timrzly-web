// components/auth/optimized-input.tsx
"use client";

import * as React from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptimizedInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name"> {
  name: TName;
  control: Control<TFieldValues>;
  label: string;
  rightElement?: React.ReactNode;
  helperText?: string;
}

// Memoized to prevent parent re-renders
const OptimizedInputBase = React.memo(function OptimizedInputBase<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  rightElement,
  helperText,
  className,
  ...props
}: OptimizedInputProps<TFieldValues, TName>) {
  const {
    field,
    fieldState: { error, isDirty, isTouched },
  } = useController({
    name,
    control,
    rules: props.required ? { required: `${label} is required` } : undefined,
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const inputType =
    props.type === "password" && showPassword ? "text" : props.type;

  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className={cn(
          "block text-[13px] font-semibold uppercase tracking-wider transition-colors",
          error ? "text-error" : "text-text-muted",
        )}
      >
        {label}
      </label>
      <div className="relative">
        <input
          {...field}
          {...props}
          id={name}
          type={inputType}
          value={field.value || ""}
          className={cn(
            "h-12 w-full rounded-xl border bg-surface-variant/50 px-4 text-[15px] text-text placeholder:text-text-muted/60 transition-all outline-none",
            "hover:border-border-strong",
            "focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10",
            error
              ? "border-error/50 focus:border-error focus:ring-error/10"
              : isDirty && isTouched && !error
                ? "border-success/50 focus:border-success focus:ring-success/10"
                : "border-input",
            props.type === "password" && "pr-12",
            rightElement && "pr-12",
            className,
          )}
        />
        {props.type === "password" && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
        {rightElement && !props.type?.includes("password") && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
            {rightElement}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs font-medium text-error animate-in slide-in-from-top-1">
          {error.message}
        </p>
      ) : helperText ? (
        <p className="text-xs text-text-muted">{helperText}</p>
      ) : null}
    </div>
  );
}) as <T extends FieldValues, N extends FieldPath<T>>(
  props: OptimizedInputProps<T, N>,
) => React.ReactElement;

export { OptimizedInputBase as OptimizedInput };
