import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONE_STYLES: Record<string, { icon: string; bar: string }> = {
  default: { icon: "bg-primary/10 text-primary", bar: "bg-primary" },
  emerald: { icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" },
  amber: { icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400", bar: "bg-amber-500" },
  orange: { icon: "bg-orange-500/10 text-orange-600 dark:text-orange-400", bar: "bg-orange-500" },
  red: { icon: "bg-red-500/10 text-red-600 dark:text-red-400", bar: "bg-red-500" },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
  className,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "amber" | "orange" | "red" | "emerald";
  className?: string;
}) {
  const styles = TONE_STYLES[tone];

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:shadow-lg",
        className,
      )}
    >
      <span className={cn("absolute inset-x-0 top-0 h-1", styles.bar)} />
      <div className="flex items-start justify-between">
        <div className={cn("flex size-10 items-center justify-center rounded-xl", styles.icon)}>
          <Icon className="size-5" strokeWidth={1.9} />
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
        <p className="mt-1 truncate text-sm font-medium text-muted-foreground">{label}</p>
        {hint && <p className="mt-0.5 truncate text-xs text-muted-foreground/80">{hint}</p>}
      </div>
    </div>
  );
}
