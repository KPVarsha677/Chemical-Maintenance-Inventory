import { NavLink } from "react-router-dom";
import { FlaskConical, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NAV_GROUPS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function SidebarNav({
  alertCount,
  onNavigate,
  collapsed = false,
  onToggleCollapsed,
}: {
  alertCount: number;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className={cn("flex items-center gap-2.5 px-5 py-5", collapsed && "justify-center px-3")}>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <FlaskConical className="size-4.5" strokeWidth={2} />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-white">ChemInventory</p>
            <p className="truncate text-xs text-sidebar-foreground/55">Lab Chemical Tracker</p>
          </div>
        )}
      </div>

      <nav className={cn("flex-1 space-y-5 overflow-y-auto px-3 pt-2", collapsed && "px-2")}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            {!collapsed && (
              <p className="px-2.5 pb-1.5 text-[0.65rem] font-semibold tracking-wider text-sidebar-foreground/35 uppercase">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const badge = item.to === "/alerts" && alertCount > 0 ? alertCount : null;
              const link = (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                      collapsed && "justify-center px-0 py-2.5",
                      isActive
                        ? "bg-sidebar-primary text-white shadow-sm"
                        : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={cn(
                          "size-4.5 shrink-0",
                          isActive ? "text-white" : "text-sidebar-foreground/45 group-hover:text-sidebar-accent-foreground",
                        )}
                        strokeWidth={1.9}
                      />
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {badge !== null && !collapsed && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/90 px-1.5 text-[0.68rem] font-semibold text-white">
                          {badge}
                        </span>
                      )}
                      {badge !== null && collapsed && (
                        <span className="absolute top-1 right-1.5 size-2 rounded-full bg-red-500 ring-2 ring-sidebar" />
                      )}
                    </>
                  )}
                </NavLink>
              );

              if (!collapsed) return link;
              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={cn("border-t border-sidebar-border px-4 py-3.5", collapsed && "px-2")}>
        <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
          <Avatar size="sm" className="shrink-0 ring-1 ring-sidebar-border">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground">LS</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-xs font-medium text-white">Lab Staff</p>
              <p className="truncate text-[0.7rem] text-sidebar-foreground/50">Inventory Technician</p>
            </div>
          )}
        </div>
        {onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={cn(
              "mt-3 hidden w-full items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-medium text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:flex",
            )}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            {!collapsed && "Collapse"}
          </button>
        )}
      </div>
    </div>
  );
}
