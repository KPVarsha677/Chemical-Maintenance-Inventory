import { Link } from "react-router-dom";
import {
  FlaskConical,
  Boxes,
  PackageMinus,
  CalendarClock,
  Ban,
  ArrowRight,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { StatusDonut } from "@/components/status-donut";
import { PageHeader } from "@/components/page-header";
import { ErrorState } from "@/components/error-state";
import { useInventory } from "@/context/inventory-context";
import { useMockAsync } from "@/lib/use-mock-async";
import { getChemicalStatus } from "@/lib/status";
import { getCategoryMeta } from "@/lib/category-meta";
import type { ChemicalCategory, ChemicalStatus } from "@/lib/types";

const STATUS_ORDER: ChemicalStatus[] = ["usable", "low-stock", "expiring-soon", "expired"];

const STATUS_DONUT_COLOR: Record<ChemicalStatus, string> = {
  usable: "text-emerald-500",
  "low-stock": "text-amber-500",
  "expiring-soon": "text-orange-500",
  expired: "text-red-500",
};

function computeDashboardData(
  chemicals: ReturnType<typeof useInventory>["chemicals"],
  containers: ReturnType<typeof useInventory>["containers"],
) {
  const statusCounts: Record<ChemicalStatus, number> = {
    usable: 0,
    "low-stock": 0,
    "expiring-soon": 0,
    expired: 0,
  };
  const categoryCounts = new Map<ChemicalCategory, number>();

  for (const chem of chemicals) {
    const status = getChemicalStatus(chem);
    statusCounts[status]++;
    categoryCounts.set(chem.category, (categoryCounts.get(chem.category) ?? 0) + 1);
  }

  const categoryBreakdown = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const attentionNeeded = chemicals
    .filter((c) => getChemicalStatus(c) !== "usable")
    .sort((a, b) => {
      const order: ChemicalStatus[] = ["expired", "expiring-soon", "low-stock"];
      return order.indexOf(getChemicalStatus(a)) - order.indexOf(getChemicalStatus(b));
    })
    .slice(0, 6);

  return {
    totalChemicals: chemicals.length,
    totalContainers: containers.length,
    statusCounts,
    categoryBreakdown,
    attentionNeeded,
  };
}

export function DashboardPage() {
  const { chemicals, containers } = useInventory();
  const { data, isLoading, error, retry } = useMockAsync(
    () => computeDashboardData(chemicals, containers),
    { delayMs: 550, deps: [chemicals, containers] },
  );

  if (error) {
    return <ErrorState description={error} onRetry={retry} />;
  }

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  const total = data.totalChemicals || 1;
  const maxCategory = data.categoryBreakdown[0]?.count || 1;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description="A live overview of your lab's chemical inventory and stock health."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Chemicals" value={data.totalChemicals} icon={FlaskConical} />
        <StatCard label="Total Containers" value={data.totalContainers} icon={Boxes} />
        <StatCard
          label="Low Stock"
          value={data.statusCounts["low-stock"]}
          icon={PackageMinus}
          tone="amber"
        />
        <StatCard
          label="Expiring Soon"
          value={data.statusCounts["expiring-soon"]}
          icon={CalendarClock}
          tone="orange"
        />
        <StatCard
          label="Expired"
          value={data.statusCounts.expired}
          icon={Ban}
          tone="red"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <StatusDonut
              centerValue={data.totalChemicals}
              centerLabel="Chemicals"
              segments={STATUS_ORDER.map((status) => ({
                value: data.statusCounts[status],
                colorClass: STATUS_DONUT_COLOR[status],
              }))}
            />
            <ul className="w-full flex-1 space-y-3">
              {STATUS_ORDER.map((status) => (
                <li key={status} className="flex items-center justify-between gap-3 text-sm">
                  <StatusBadge status={status} />
                  <span className="font-semibold text-foreground tabular-nums">
                    {data.statusCounts[status]}
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      {Math.round((data.statusCounts[status] / total) * 100)}%
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Chemicals by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
              {data.categoryBreakdown.map((row) => {
                const meta = getCategoryMeta(row.category);
                const Icon = meta.icon;
                return (
                  <div key={row.category} className="flex items-center gap-3">
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${meta.className}`}>
                      <Icon className="size-4" strokeWidth={1.9} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate font-medium text-foreground">{row.category}</span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">{row.count}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${meta.dot}`}
                          style={{ width: `${(row.count / maxCategory) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="py-0">
        <CardHeader className="flex-row items-center justify-between space-y-0 border-b py-4">
          <CardTitle>Needs Attention</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/alerts">
              View all alerts
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="px-0 py-0">
          {data.attentionNeeded.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Everything looks good — no chemicals currently need attention.
            </p>
          ) : (
            <ul className="divide-y">
              {data.attentionNeeded.map((chem) => {
                const meta = getCategoryMeta(chem.category);
                const Icon = meta.icon;
                return (
                  <li key={chem.id}>
                    <Link
                      to={`/inventory/${chem.id}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 sm:px-6"
                    >
                      <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${meta.className}`}>
                        <Icon className="size-4.5" strokeWidth={1.9} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{chem.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{chem.location}</p>
                      </div>
                      <StatusBadge status={getChemicalStatus(chem)} className="shrink-0" />
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3.5">
        <Skeleton className="hidden size-12 rounded-2xl sm:block" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-64 w-full rounded-2xl lg:col-span-2" />
        <Skeleton className="h-64 w-full rounded-2xl lg:col-span-3" />
      </div>
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  );
}
