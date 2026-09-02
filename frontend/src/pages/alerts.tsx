import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Ban, CalendarClock, PackageMinus, MapPin, ChevronRight, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { HazardBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { useInventory } from "@/context/inventory-context";
import { useMockAsync } from "@/lib/use-mock-async";
import { formatDate, getChemicalStatus } from "@/lib/status";
import type { Chemical, ChemicalStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type Severity = "expired" | "expiring-soon" | "low-stock";

const SEVERITY_META: Record<
  Severity,
  { label: string; icon: typeof Ban; barClass: string; iconClass: string }
> = {
  expired: {
    label: "Expired",
    icon: Ban,
    barClass: "bg-red-500",
    iconClass: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  "expiring-soon": {
    label: "Expiring Soon",
    icon: CalendarClock,
    barClass: "bg-orange-500",
    iconClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  "low-stock": {
    label: "Low Stock",
    icon: PackageMinus,
    barClass: "bg-amber-500",
    iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
};

const SEVERITY_ORDER: Severity[] = ["expired", "expiring-soon", "low-stock"];

export function AlertsPage() {
  const { chemicals } = useInventory();
  const { data, isLoading, error, retry } = useMockAsync(() => chemicals, {
    delayMs: 500,
    deps: [chemicals],
  });

  const [tab, setTab] = useState<"all" | Severity>("all");

  const grouped = useMemo(() => {
    const groups: Record<Severity, Chemical[]> = {
      expired: [],
      "expiring-soon": [],
      "low-stock": [],
    };
    if (!data) return groups;
    for (const chem of data) {
      const status = getChemicalStatus(chem) as ChemicalStatus;
      if (status === "expired" || status === "expiring-soon" || status === "low-stock") {
        groups[status].push(chem);
      }
    }
    return groups;
  }, [data]);

  const totalAlerts = SEVERITY_ORDER.reduce((sum, s) => sum + grouped[s].length, 0);
  const visibleSeverities = tab === "all" ? SEVERITY_ORDER : [tab];

  if (error) return <ErrorState description={error} onRetry={retry} />;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Bell}
        title="Alerts"
        description={isLoading ? "Checking inventory…" : `${totalAlerts} chemicals need attention`}
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | Severity)}>
        <TabsList className="h-9 bg-muted/60 p-1">
          <TabsTrigger value="all" className="gap-1.5">
            All <span className="text-muted-foreground">({isLoading ? "…" : totalAlerts})</span>
          </TabsTrigger>
          {SEVERITY_ORDER.map((s) => (
            <TabsTrigger key={s} value={s} className="gap-1.5">
              {SEVERITY_META[s].label}{" "}
              <span className="text-muted-foreground">({isLoading ? "…" : grouped[s].length})</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : totalAlerts === 0 ? (
        <EmptyState
          icon={Ban}
          title="No active alerts"
          description="All chemicals are within safe stock levels and expiry windows."
        />
      ) : (
        <div className="space-y-7">
          {visibleSeverities.map((severity) => {
            const items = grouped[severity];
            if (items.length === 0) return null;
            const meta = SEVERITY_META[severity];
            return (
              <div key={severity} className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <meta.icon className="size-4" />
                  {meta.label}
                  <span className="font-normal text-muted-foreground">({items.length})</span>
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((chem) => (
                    <Link
                      to={`/inventory/${chem.id}`}
                      key={chem.id}
                      className="group relative flex items-start gap-3 overflow-hidden rounded-xl bg-card p-4 pl-5 shadow-sm ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <span className={cn("absolute inset-y-0 left-0 w-1", meta.barClass)} />
                      <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", meta.iconClass)}>
                        <meta.icon className="size-4.5" strokeWidth={1.9} />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-medium text-foreground group-hover:underline">
                            {chem.name}
                          </span>
                          <HazardBadge level={chem.hazard_level} />
                        </div>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" />
                          {chem.location}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            Qty: {chem.quantity.toLocaleString()} {chem.unit} (min{" "}
                            {chem.low_stock_threshold})
                          </span>
                          <span>Expiry: {formatDate(chem.expiry_date)}</span>
                        </div>
                      </div>
                      <ChevronRight className="mt-1 size-4 shrink-0 self-center text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && totalAlerts > 0 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/inventory">Go to full inventory</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
