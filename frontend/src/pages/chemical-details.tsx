import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  Package,
  Building2,
  Boxes,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge, HazardBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { ChemicalFormDialog } from "@/components/chemical-form-dialog";
import { useInventory } from "@/context/inventory-context";
import { useMockAsync } from "@/lib/use-mock-async";
import { formatDate, getChemicalStatus, getContainerStatus } from "@/lib/status";
import { getCategoryMeta } from "@/lib/category-meta";
import { cn } from "@/lib/utils";

export function ChemicalDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getChemical, getContainersForChemical, deleteChemical } = useInventory();

  const { data, isLoading, error, retry } = useMockAsync(
    () => {
      const chemical = id ? getChemical(id) : undefined;
      const containers = id ? getContainersForChemical(id) : [];
      return { chemical, containers };
    },
    { delayMs: 450, deps: [id] },
  );

  const [formOpen, setFormOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const containerTotal = useMemo(
    () => data?.containers.reduce((sum, c) => sum + c.quantity, 0) ?? 0,
    [data],
  );

  if (error) return <ErrorState description={error} onRetry={retry} />;

  if (isLoading || !data) return <DetailsSkeleton />;

  const { chemical, containers } = data;

  if (!chemical) {
    return (
      <div className="space-y-4">
        <BackLink />
        <EmptyState
          title="Chemical not found"
          description="It may have been deleted, or the link is out of date."
        />
      </div>
    );
  }

  const status = getChemicalStatus(chemical);
  const meta = getCategoryMeta(chemical.category);
  const CategoryIcon = meta.icon;

  return (
    <div className="space-y-6">
      <BackLink />

      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/10 sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-start gap-4">
          <div className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl", meta.className)}>
            <CategoryIcon className="size-7" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{chemical.name}</h1>
              <StatusBadge status={status} />
              <HazardBadge level={chemical.hazard_level} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              CAS {chemical.cas_number} · {chemical.category} · {chemical.safety_classification}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" onClick={() => setFormOpen(true)}>
            <Pencil data-icon="inline-start" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 data-icon="inline-start" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Chemical Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              <Field label="Total Quantity" value={`${chemical.quantity.toLocaleString()} ${chemical.unit}`} icon={Package} />
              <Field label="Primary Location" value={chemical.location} icon={MapPin} />
              <Field label="Expiry Date" value={formatDate(chemical.expiry_date)} icon={Calendar} />
              <Field label="Low Stock Threshold" value={`${chemical.low_stock_threshold} ${chemical.unit}`} icon={Package} />
              <Field label="Manufacturer" value={chemical.manufacturer || "—"} icon={Building2} />
              <Field label="Last Updated" value={formatDate(chemical.updated_at)} icon={Calendar} />
            </dl>
            {chemical.notes && (
              <div className="mt-5 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
                {chemical.notes}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-center">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="size-4 text-muted-foreground" />
              Container Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">{containers.length}</p>
              <p className="text-xs text-muted-foreground">containers across all locations</p>
            </div>
            <div className="h-px w-full bg-border" />
            <div>
              <p className="text-lg font-semibold text-foreground tabular-nums">
                {containerTotal.toLocaleString()} {chemical.unit}
              </p>
              <p className="text-xs text-muted-foreground">combined quantity in containers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>Containers &amp; Locations</CardTitle>
        </CardHeader>
        <CardContent className="px-0 py-0">
          {containers.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No containers recorded" description="This chemical has no container breakdown yet." />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Container</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {containers.map((container) => (
                  <TableRow key={container.id}>
                    <TableCell className="font-medium">{container.container_label}</TableCell>
                    <TableCell className="text-muted-foreground">{container.location}</TableCell>
                    <TableCell className="tabular-nums">
                      {container.quantity.toLocaleString()} {container.unit}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(container.expiry_date)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={getContainerStatus(container, chemical.low_stock_threshold)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ChemicalFormDialog open={formOpen} onOpenChange={setFormOpen} chemical={chemical} />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {chemical.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the chemical from the mock inventory for this session. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteChemical(chemical.id);
                navigate("/inventory");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/inventory"
      className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-3.5" />
      Back to inventory
    </Link>
  );
}

function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="truncate text-sm font-medium text-foreground">{value}</dd>
      </div>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-3 pt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 pt-6">
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-6 w-24" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="space-y-2 pt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
