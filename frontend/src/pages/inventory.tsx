import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { getChemicalStatus, formatDate } from "@/lib/status";
import { getCategoryMeta } from "@/lib/category-meta";
import { CATEGORIES, HAZARD_LEVELS } from "@/lib/mock-data";
import type { Chemical, ChemicalStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: { value: ChemicalStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "usable", label: "Usable" },
  { value: "low-stock", label: "Low Stock" },
  { value: "expiring-soon", label: "Expiring Soon" },
  { value: "expired", label: "Expired" },
];

type SortKey = "name" | "quantity" | "expiry_date" | "hazard_level";
const PAGE_SIZE = 10;

export function InventoryPage() {
  const { chemicals, deleteChemical } = useInventory();
  const { data, isLoading, error, retry } = useMockAsync(() => chemicals, {
    delayMs: 500,
    deps: [chemicals],
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [hazard, setHazard] = useState<string>("all");
  const [status, setStatus] = useState<ChemicalStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingChemical, setEditingChemical] = useState<Chemical | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Chemical | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.filter((chem) => {
      const matchesSearch =
        !q || chem.name.toLowerCase().includes(q) || chem.cas_number.toLowerCase().includes(q);
      const matchesCategory = category === "all" || chem.category === category;
      const matchesHazard = hazard === "all" || chem.hazard_level === hazard;
      const matchesStatus = status === "all" || getChemicalStatus(chem) === status;
      return matchesSearch && matchesCategory && matchesHazard && matchesStatus;
    });
  }, [data, search, category, hazard, status]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "quantity":
          cmp = a.quantity - b.quantity;
          break;
        case "hazard_level": {
          const order = ["low", "medium", "high", "extreme"];
          cmp = order.indexOf(a.hazard_level) - order.indexOf(b.hazard_level);
          break;
        }
        case "expiry_date":
          cmp = (a.expiry_date ?? "9999-99-99").localeCompare(b.expiry_date ?? "9999-99-99");
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const activeFilterCount = [category, hazard, status].filter((v) => v !== "all").length + (search ? 1 : 0);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <ArrowUpDown className="size-3.5 text-muted-foreground/50" />;
    return sortDir === "asc" ? (
      <ArrowUp className="size-3.5 text-primary" />
    ) : (
      <ArrowDown className="size-3.5 text-primary" />
    );
  }

  function resetFilters() {
    setSearch("");
    setCategory("all");
    setHazard("all");
    setStatus("all");
  }

  function pageNumbers() {
    const nums: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = Math.max(1, end - 4); i <= end; i++) nums.push(i);
    return nums;
  }

  if (error) return <ErrorState description={error} onRetry={retry} />;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FlaskConical}
        title="Chemical Inventory"
        description={
          isLoading ? "Loading chemicals…" : `${sorted.length} of ${data?.length ?? 0} chemicals shown`
        }
        actions={
          <Button
            onClick={() => {
              setEditingChemical(undefined);
              setFormOpen(true);
            }}
          >
            <Plus data-icon="inline-start" />
            Add Chemical
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <SlidersHorizontal className="size-4" />
            <span className="hidden sm:inline">Filters</span>
          </div>
          <div className="relative flex-1 sm:min-w-56">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or CAS number…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8"
            />
          </div>
          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={hazard}
            onValueChange={(v) => {
              setHazard(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Hazard Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hazard Levels</SelectItem>
              {HAZARD_LEVELS.map((h) => (
                <SelectItem key={h} value={h} className="capitalize">
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as ChemicalStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Clear filters
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardContent className="px-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No chemicals match your filters"
                description="Try adjusting your search term or clearing filters to see more results."
                actionLabel="Clear filters"
                onAction={resetFilters}
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={() => toggleSort("name")}
                      >
                        Name <SortIcon column="name" />
                      </button>
                    </TableHead>
                    <TableHead>CAS Number</TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={() => toggleSort("hazard_level")}
                      >
                        Hazard <SortIcon column="hazard_level" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={() => toggleSort("quantity")}
                      >
                        Quantity <SortIcon column="quantity" />
                      </button>
                    </TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={() => toggleSort("expiry_date")}
                      >
                        Expiry <SortIcon column="expiry_date" />
                      </button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((chem) => {
                    const meta = getCategoryMeta(chem.category);
                    const Icon = meta.icon;
                    return (
                      <TableRow key={chem.id} className="group">
                        <TableCell className="font-medium">
                          <Link to={`/inventory/${chem.id}`} className="flex items-center gap-3">
                            <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", meta.className)}>
                              <Icon className="size-4" strokeWidth={1.9} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-foreground group-hover:underline">{chem.name}</p>
                              <p className="truncate text-xs font-normal text-muted-foreground">{chem.category}</p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{chem.cas_number}</TableCell>
                        <TableCell>
                          <HazardBadge level={chem.hazard_level} />
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {chem.quantity.toLocaleString()} {chem.unit}
                        </TableCell>
                        <TableCell className="max-w-48 truncate text-muted-foreground">
                          {chem.location}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(chem.expiry_date)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={getChemicalStatus(chem)} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Actions for ${chem.name}`}
                                className="opacity-60 transition-opacity group-hover:opacity-100"
                              >
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/inventory/${chem.id}`}>
                                  <Eye data-icon="inline-start" /> View details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  setEditingChemical(chem);
                                  setFormOpen(true);
                                }}
                              >
                                <Pencil data-icon="inline-start" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => setDeleteTarget(chem)}
                              >
                                <Trash2 data-icon="inline-start" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex flex-col items-center justify-between gap-3 border-t p-3 sm:flex-row">
                <p className="text-xs text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{(currentPage - 1) * PAGE_SIZE + 1}</span>
                  {"–"}
                  <span className="font-medium text-foreground">{Math.min(currentPage * PAGE_SIZE, sorted.length)}</span> of{" "}
                  <span className="font-medium text-foreground">{sorted.length}</span>
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    <ChevronLeft />
                  </Button>
                  {pageNumbers().map((n) => (
                    <Button
                      key={n}
                      variant={n === currentPage ? "default" : "outline"}
                      size="icon-sm"
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Next page"
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ChemicalFormDialog open={formOpen} onOpenChange={setFormOpen} chemical={editingChemical} />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the chemical from the mock inventory for this session. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) deleteChemical(deleteTarget.id);
                setDeleteTarget(null);
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
