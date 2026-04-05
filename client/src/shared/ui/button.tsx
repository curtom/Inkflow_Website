import type{ ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children : ReactNode;
    loading ?: boolean;
    fullWidth?: boolean;
}

export default function Button({
      children,
      className,
      loading,
      fullWidth,
      disabled,
      ...props
} : ButtonProps) {
    return (
        <button
           className={cn("inline-flex items-center justify-center rounded-lg " +
               "bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 " +
               "disabled:cursor-not-allowed disabled:opacity-60", fullWidth && "w-full", className)}
           disabled={disabled || loading}
            {...props}
        >
            {loading ? "...loading" : children}
        </button>
    );
}