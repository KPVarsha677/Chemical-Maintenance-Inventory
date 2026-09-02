import {
  LayoutDashboard,
  FlaskConical,
  History,
  Bell,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, end: true }],
  },
  {
    label: "Inventory Management",
    items: [
      { to: "/inventory", label: "Inventory", icon: FlaskConical },
      { to: "/transactions", label: "Transactions", icon: History },
      { to: "/alerts", label: "Alerts", icon: Bell },
    ],
  },
  {
    label: "Tools",
    items: [{ to: "/assistant", label: "AI Assistant", icon: Sparkles }],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
