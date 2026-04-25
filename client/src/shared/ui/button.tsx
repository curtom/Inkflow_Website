import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  variant?: ButtonVariant;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-terracotta text-ivory shadow-[0_0_0_1px_#c96442] hover:brightness-[0.95] active:brightness-[0.9]",
  secondary:
    "bg-warm-sand text-charcoal shadow-[0_0_0_1px_#d1cfc5] hover:brightness-[0.97]",
  outline:
    "bg-white text-ink shadow-[0_0_0_1px_var(--color-border-cream)] hover:bg-ivory",
  ghost:
    "bg-transparent text-olive shadow-none hover:bg-warm-sand/50 hover:text-ink",
  danger:
    "bg-error text-ivory shadow-[0_0_0_1px_#b53333] hover:brightness-95",
};

export default function Button({
  children,
  className,
  loading,
  fullWidth,
  disabled,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-55 cursor-pointer",
        variantClass[variant],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "…" : children}
    </button>
  );
}
