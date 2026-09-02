import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle, RefreshCcw, Trash, Search, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { useInventory } from "@/context/inventory-context";
import { useMockAsync } from "@/lib/use-mock-async";
import { formatDate } from "@/lib/status";
import type { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_META: Record<
  TransactionType,
  { label: string; icon: typeof ArrowDownCircle; iconClass: string; textClass: string }
> = {
  received: {
    label: "Received",
    icon: ArrowDownCircle,
    iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
  used: {
    label: "Used",
    icon: ArrowUpCircle,
    iconClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    textClass: "text-sky-600 dark:text-sky-400",
  },
  disposed: {
    label: "Disposed",
    icon: Trash,
    iconClass: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    textClass: "text-slate-600 dark:text-slate-300",
  },
  adjusted: {
    label: "Adjusted",
    icon: RefreshCcw,
    iconClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    textClass: "text-violet-600 dark:text-violet-400",
  },
};

export function TransactionsPage() {
  const { transactions } = useInventory();
  const { data, isLoading, error, retry } = useMockAsync(() => transactions, {
    delayMs: 500,
    deps: [transactions],
  });

  const [search, setSearch] = useState("");
  const [type, setType] = useState<TransactionType | "all">("all");

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.filter((t) => {
      const matchesSearch =
        !q || t.chemical_name.toLowerCase().includes(q) || t.user.toLowerCase().includes(q);
      const matchesType = type === "all" || t.type === type;
      return matchesSearch && matchesType;
    });
  }, [data, search, type]);

  if (error) return <ErrorState description={error} onRetry={retry} />;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={History}
        title="Transaction History"
        description={
          isLoading
            ? "Loading transactions…"
            : `${filtered.length} of ${data?.length ?? 0} transactions, newest first`
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by chemical or user…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={type} onValueChange={(v) => setType(v as TransactionType | "all")}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {(Object.keys(TYPE_META) as TransactionType[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {TYPE_META[t].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          ) : filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No transactions match your filters"
                description="Try a different search term or transaction type."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Chemical</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity Change</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => {
                  const meta = TYPE_META[t.type];
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="text-muted-foreground">{formatDate(t.date)}</TableCell>
                      <TableCell className="font-medium">
                        <Link to={`/inventory/${t.chemical_id}`} className="hover:underline">
                          {t.chemical_name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2">
                          <span className={cn("flex size-6 items-center justify-center rounded-md", meta.iconClass)}>
                            <meta.icon className="size-3.5" strokeWidth={2} />
                          </span>
                          <span className={cn("text-sm font-medium", meta.textClass)}>{meta.label}</span>
                        </span>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "font-semibold tabular-nums",
                          t.quantity_delta > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : t.quantity_delta < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-muted-foreground",
                        )}
                      >
                        {t.quantity_delta > 0 ? "+" : ""}
                        {t.quantity_delta.toLocaleString()} {t.unit}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{t.user}</TableCell>
                      <TableCell className="max-w-64 truncate text-muted-foreground">
                        {t.notes}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
