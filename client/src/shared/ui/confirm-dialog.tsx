import { useEffect } from "react";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  variant?: "danger" | "default";
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "确认",
  cancelLabel = "取消",
  loading = false,
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/35 p-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={() => !loading && onCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-2xl border border-border-cream bg-ivory p-6 shadow-whisper"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-dialog-title"
          className="font-editorial text-xl font-medium text-ink"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-olive">{description}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-xl border border-border-cream bg-white px-4 py-2 text-sm font-medium text-charcoal transition hover:bg-parchment disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <Button
            type="button"
            variant={variant === "danger" ? "danger" : "primary"}
            loading={loading}
            onClick={() => {
              void onConfirm();
            }}
            className={cn(variant === "default" && "")}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
