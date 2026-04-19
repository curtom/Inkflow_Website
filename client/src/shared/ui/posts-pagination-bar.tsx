import { getPaginationItems } from "@/shared/lib/pagination-items";
import { cn } from "@/shared/lib/cn";

type PostsPaginationBarProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

const btnBase =
  "inline-flex min-w-[2.25rem] items-center justify-center rounded-xl border px-2.5 py-1.5 text-sm font-medium transition";

export default function PostsPaginationBar({
  page,
  totalPages,
  onPageChange,
  className,
}: PostsPaginationBarProps) {
  if (totalPages < 1) {
    return null;
  }

  const items = getPaginationItems(page, totalPages);

  return (
    <nav
      className={cn("flex flex-wrap items-center justify-center gap-2", className)}
      aria-label="分页"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={cn(
          btnBase,
          page <= 1
            ? "cursor-not-allowed border-border-cream text-stone"
            : "border-border-cream bg-ivory text-charcoal shadow-[0_0_0_1px_#f0eee6] hover:bg-parchment"
        )}
      >
        上一页
      </button>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`e-${index}`}
            className="inline-flex min-w-[2.25rem] items-center justify-center px-1 text-sm text-stone"
          >
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={cn(
              btnBase,
              item === page
                ? "border-terracotta bg-terracotta text-ivory shadow-[0_0_0_1px_#c96442]"
                : "border-border-cream bg-ivory text-ink shadow-[0_0_0_1px_#f0eee6] hover:bg-parchment"
            )}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={cn(
          btnBase,
          page >= totalPages
            ? "cursor-not-allowed border-border-cream text-stone"
            : "border-border-cream bg-ivory text-charcoal shadow-[0_0_0_1px_#f0eee6] hover:bg-parchment"
        )}
      >
        下一页
      </button>
    </nav>
  );
}
