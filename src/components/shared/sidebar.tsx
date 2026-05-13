"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  House as Home,
  Package,
  Workflow,
  PanelsTopLeft,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/lib/stores/user-store";
import { useSidebar } from "./sidebar-context";
import { ThemeToggle } from "./theme-toggle";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  match?: (path: string) => boolean;
}

const clientNav: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  {
    label: "Produtos",
    href: "/produtos",
    icon: Package,
    match: (p) => p.startsWith("/produtos"),
  },
  {
    label: "Leads",
    href: "/leads",
    icon: Sparkles,
    match: (p) => p.startsWith("/leads"),
  },
  { label: "Meu Perfil", href: "/perfil", icon: User },
];

const adminNav: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  {
    label: "Clientes",
    href: "/admin/clientes",
    icon: Users,
    match: (p) => p.startsWith("/admin/clientes"),
  },
  {
    label: "Leads",
    href: "/admin/leads",
    icon: Sparkles,
    match: (p) => p.startsWith("/admin/leads"),
  },
  {
    label: "Produtos",
    href: "/admin/produtos",
    icon: Package,
    match: (p) => p.startsWith("/admin/produtos"),
  },
  {
    label: "Workflows",
    href: "/admin/workflow",
    icon: Workflow,
    match: (p) => p.startsWith("/admin/workflow"),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const role = useUserStore((s) => s.payload?.user_role);
  const { collapsed, toggle } = useSidebar();

  const items = role === "admin" ? adminNav : clientNav;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 px-4 h-16 border-b border-sidebar-border",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 font-semibold tracking-tight",
            collapsed && "justify-center"
          )}
        >
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
            <PanelsTopLeft className="h-4 w-4" />
          </div>
          {!collapsed && <span>CMeloFlow</span>}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={toggle}
            className="rounded-md p-1 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label="Recolher menu"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={toggle}
          className="mt-2 mx-2 grid place-items-center rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label="Expandir menu"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.match
              ? item.match(pathname)
              : pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    active &&
                      "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <ThemeToggle collapsed={collapsed} />
      </div>
    </aside>
  );
}

export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <div
      className={cn(
        "transition-[margin] duration-200",
        collapsed ? "ml-[68px]" : "ml-64"
      )}
    >
      {children}
    </div>
  );
}
