import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Couldn't load this data",
  description = "Something went wrong while loading data. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-red-200 bg-red-50/50 py-16 text-center dark:border-red-500/20 dark:bg-red-500/5">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-red-100 ring-1 ring-red-200/60 dark:bg-red-500/10 dark:ring-red-500/20">
        <AlertTriangle className="size-6 text-red-600 dark:text-red-400" strokeWidth={1.75} />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="mt-2">
          <RotateCw data-icon="inline-start" />
          Try again
        </Button>
      )}
    </div>
  );
}
