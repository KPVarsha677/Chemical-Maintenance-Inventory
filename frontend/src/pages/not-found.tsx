import { Link } from "react-router-dom";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <FlaskConical className="size-7" strokeWidth={1.75} />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">404</p>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you're looking for doesn't exist or may have been moved.
        </p>
      </div>
      <Button asChild className="mt-2">
        <Link to="/">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
