/** Page numbers and ellipsis for compact pagination bars (e.g. 1 … 5 6 7 … 29). */
export function getPaginationItems(
  current: number,
  total: number
): (number | "ellipsis")[] {
  if (total <= 0) {
    return [];
  }
  if (total === 1) {
    return [1];
  }
  if (total <= 9) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const showEllipsisLeft = current > 4;
  const showEllipsisRight = current < total - 3;

  let left = Math.max(2, current - 2);
  let right = Math.min(total - 1, current + 2);

  if (!showEllipsisLeft) {
    left = 2;
    right = Math.min(7, total - 1);
  }
  if (!showEllipsisRight) {
    right = total - 1;
    left = Math.max(2, total - 6);
  }

  const items: (number | "ellipsis")[] = [1];

  if (showEllipsisLeft && left > 2) {
    items.push("ellipsis");
  }

  for (let i = left; i <= right; i++) {
    if (i !== 1 && i !== total) {
      items.push(i);
    }
  }

  if (showEllipsisRight && right < total - 1) {
    items.push("ellipsis");
  }

  items.push(total);
  return items;
}
