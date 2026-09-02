import { useMemo, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Bell, ChevronRight, Menu } from "lucide-react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ErrorBoundary } from "@/components/error-boundary";
import { useInventory } from "@/context/inventory-context";
import { getChemicalStatus } from "@/lib/status";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { chemicals } = useInventory();

  const alertCount = useMemo(
    () =>
      chemicals.filter((c) => getChemicalStatus(c) !== "usable").length,
    [chemicals],
  );

  const currentItem = useMemo(
    () =>
      NAV_ITEMS.find((item) =>
        item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
      ),
    [location.pathname],
  );
  const currentTitle = currentItem?.label ?? "Chemical Inventory";

  return (
    <div className="min-h-svh bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-200 md:block",
          collapsed ? "w-[4.5rem]" : "w-64",
        )}
      >
        <SidebarNav
          alertCount={alertCount}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
        />
      </aside>

      {/* Mobile sidebar drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-72 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground sm:max-w-72 [&_button]:text-sidebar-foreground [&_button:hover]:bg-sidebar-accent [&_button:hover]:text-sidebar-accent-foreground"
        >
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <SidebarNav alertCount={alertCount} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className={cn("flex min-h-svh flex-col transition-[padding] duration-200", collapsed ? "md:pl-18" : "md:pl-64")}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/85 px-4 backdrop-blur-md sm:px-6">
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
              <Link to="/" className="transition-colors hover:text-foreground">
                Chemical Inventory
              </Link>
              <ChevronRight className="size-3.5" />
              <span className="font-medium text-foreground/70">{currentTitle}</span>
            </div>
            <h2 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {currentTitle}
            </h2>
          </div>

          <Button variant="ghost" size="icon-sm" className="relative" aria-label="Alerts" asChild>
            <Link to="/alerts">
              <Bell className="size-4.5" strokeWidth={1.9} />
              {alertCount > 0 && (
                <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[0.6rem] font-semibold text-white ring-2 ring-card">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </Link>
          </Button>

          <Avatar size="sm" className="hidden sm:flex">
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">LS</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
