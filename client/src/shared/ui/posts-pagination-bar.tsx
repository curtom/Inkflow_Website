import { getPaginationItems } from "@/shared/lib/pagination-items";
import { cn } from "@/shared/lib/cn";

type PostsPaginationBarProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

const btnBase =
  "inline-flex min-w-[2.25rem] items-center justify-center rounded-lg border px-2.5 py-1.5 text-sm font-medium transition";

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
            ? "cursor-not-allowed border-gray-100 text-gray-300"
            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        )}
      >
        上一页
      </button>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`e-${index}`}
            className="inline-flex min-w-[2.25rem] items-center justify-center px-1 text-sm text-gray-500"
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
                ? "border-pink-500 bg-pink-500 text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
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
            ? "cursor-not-allowed border-gray-100 text-gray-300"
            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        )}
      >
        下一页
      </button>
    </nav>
  );
}
