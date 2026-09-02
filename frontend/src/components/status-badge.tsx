import { CircleCheck, PackageMinus, CalendarClock, Ban, ShieldCheck, ShieldAlert, TriangleAlert, Flame } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_STYLES } from "@/lib/status";
import type { ChemicalStatus, HazardLevel } from "@/lib/types";

const STATUS_ICON: Record<ChemicalStatus, LucideIcon> = {
  usable: CircleCheck,
  "low-stock": PackageMinus,
  "expiring-soon": CalendarClock,
  expired: Ban,
};

export function StatusBadge({
  status,
  className,
}: {
  status: ChemicalStatus;
  className?: string;
}) {
  const styles = STATUS_STYLES[status];
  const Icon = STATUS_ICON[status];
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold whitespace-nowrap",
        styles.bg,
        styles.text,
        styles.border,
        className,
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.25} />
      {STATUS_LABEL[status]}
    </span>
  );
}

const HAZARD_META: Record<
  HazardLevel,
  { icon: LucideIcon; className: string }
> = {
  low: {
    icon: ShieldCheck,
    className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20",
  },
  medium: {
    icon: ShieldAlert,
    className: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20",
  },
  high: {
    icon: TriangleAlert,
    className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  },
  extreme: {
    icon: Flame,
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  },
};

export function HazardBadge({ level, className }: { level: string; className?: string }) {
  const meta = HAZARD_META[level as HazardLevel] ?? HAZARD_META.low;
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold capitalize whitespace-nowrap",
        meta.className,
        className,
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.25} />
      {level}
    </span>
  );
}
