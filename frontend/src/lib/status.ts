/**
 * Shared status-derivation logic. A chemical (or container) is:
 *  - "expired"        if it has an expiry date in the past
 *  - "expiring-soon"  if it expires within the next EXPIRING_SOON_DAYS days
 *  - "low-stock"      if its quantity is at or below its low-stock threshold
 *  - "usable"         otherwise
 *
 * Priority order (worst wins) when multiple conditions apply:
 *   expired > expiring-soon > low-stock > usable
 */
import type { ChemicalStatus } from "@/lib/types";

export const EXPIRING_SOON_DAYS = 30;

export const STATUS_LABEL: Record<ChemicalStatus, string> = {
  usable: "Usable",
  "low-stock": "Low Stock",
  "expiring-soon": "Expiring Soon",
  expired: "Expired",
};

/** Tailwind color tokens for each status, used by the StatusBadge component. */
export const STATUS_STYLES: Record<
  ChemicalStatus,
  { bg: string; text: string; border: string; dot: string }
> = {
  usable: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  "low-stock": {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-500/20",
    dot: "bg-amber-500",
  },
  "expiring-soon": {
    bg: "bg-orange-50 dark:bg-orange-500/10",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-500/20",
    dot: "bg-orange-500",
  },
  expired: {
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-500/20",
    dot: "bg-red-500",
  },
};

/** Days from now until `dateStr` (negative if in the past). Null if no date. */
export function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function deriveStatus(params: {
  quantity: number;
  lowStockThreshold: number;
  expiryDate: string | null | undefined;
}): ChemicalStatus {
  const { quantity, lowStockThreshold, expiryDate } = params;
  const remaining = daysUntil(expiryDate);

  if (remaining !== null && remaining < 0) return "expired";
  if (remaining !== null && remaining <= EXPIRING_SOON_DAYS) return "expiring-soon";
  if (quantity <= lowStockThreshold) return "low-stock";
  return "usable";
}

export function getChemicalStatus(chemical: {
  quantity: number;
  low_stock_threshold: number;
  expiry_date: string | null;
}): ChemicalStatus {
  return deriveStatus({
    quantity: chemical.quantity,
    lowStockThreshold: chemical.low_stock_threshold,
    expiryDate: chemical.expiry_date,
  });
}

export function getContainerStatus(
  container: { quantity: number; expiry_date: string | null },
  lowStockThreshold: number,
): ChemicalStatus {
  return deriveStatus({
    quantity: container.quantity,
    lowStockThreshold,
    expiryDate: container.expiry_date,
  });
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "No expiry";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
