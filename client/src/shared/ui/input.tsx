import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label className="text-sm font-medium text-olive">{label}</label>
      ) : null}
      <input
        className={cn(
          "w-full rounded-xl border border-border-cream bg-ivory px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-stone",
          "focus:border-focus focus:ring-2 focus:ring-focus/25",
          error && "border-error focus:border-error focus:ring-error/20",
          className
        )}
        {...props}
      />
      {error ? <span className="text-sm text-error">{error}</span> : null}
    </div>
  );
}
